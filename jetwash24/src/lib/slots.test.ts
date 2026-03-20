import { describe, it, expect } from 'vitest';
import { computeAvailableSlots, SlotEngineInput } from './slots';

// 2026-01-15 is a Thursday in winter; Europe/Lisbon is UTC+0 (no DST)
const WINTER_DATE = '2026-01-15';

// 2026-06-15 is a Monday in summer; Europe/Lisbon is UTC+1 (DST active)
const SUMMER_DATE = '2026-06-15';

/**
 * Build an ISO 8601 datetime string for the given date, hour, and minute.
 * In winter (UTC+0) the offset is +00:00; in summer (UTC+1) the offset is +01:00.
 */
function isoAt(
  date: string,
  hour: number,
  minute: number,
  isSummer = false,
): string {
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  const offset = isSummer ? '+01:00' : '+00:00';
  return `${date}T${hh}:${mm}:00${offset}`;
}

/**
 * Create a booking-shaped object for the given hours/minutes on WINTER_DATE.
 */
function makeBooking(
  startHour: number,
  startMin: number,
  endHour: number,
  endMin: number,
  status: 'confirmed' | 'cancelled' = 'confirmed',
  isSummer = false,
) {
  const date = isSummer ? SUMMER_DATE : WINTER_DATE;
  return {
    start_time: isoAt(date, startHour, startMin, isSummer),
    end_time: isoAt(date, endHour, endMin, isSummer),
    status,
  };
}

/** Extract just the HH:MM portion from an ISO string (for readable assertions). */
function hhmm(iso: string): string {
  // Works for both +00:00 and +01:00 offsets — we just grab chars 11-16
  return iso.slice(11, 16);
}

describe('computeAvailableSlots', () => {
  // ---------------------------------------------------------------------------
  // slot grid generation
  // ---------------------------------------------------------------------------

  describe('slot grid generation', () => {
    it('returns all 30-min grid slots for a 30-min service with no bookings', () => {
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [],
      };
      const slots = computeAvailableSlots(input);

      // First slot must be 09:00
      expect(hhmm(slots[0])).toBe('09:00');

      // Last valid slot: 17:15 (17:15 + 30 + 15 = 18:00 exactly)
      const times = slots.map(hhmm);
      expect(times).toContain('17:15');

      // 17:30 must NOT be present (17:30 + 30 + 15 = 18:15 > 18:00)
      expect(times).not.toContain('17:30');
    });

    it('returns slots on the 30-minute grid (09:00, 09:30, 10:00, ...)', () => {
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [],
      };
      const slots = computeAvailableSlots(input);
      const times = slots.map(hhmm);

      expect(times).toContain('09:00');
      expect(times).toContain('09:30');
      expect(times).toContain('10:00');
      expect(times).toContain('12:30');
      expect(times).toContain('17:00');
      expect(times).toContain('17:15');
    });

    it('returns slots for a 45-min service — last slot 17:00 (17:00+45+15=18:00)', () => {
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 45,
        existingBookings: [],
      };
      const slots = computeAvailableSlots(input);
      const times = slots.map(hhmm);

      expect(times).toContain('17:00');
      expect(times).not.toContain('17:15'); // 17:15 + 45 + 15 = 18:15 > 18:00
      expect(times).not.toContain('17:30');
    });

    it('returns slots for a 90-min service — last slot 16:15', () => {
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 90,
        existingBookings: [],
      };
      const slots = computeAvailableSlots(input);
      const times = slots.map(hhmm);

      // 16:15 + 90 + 15 = 18:00 exactly — valid
      expect(times).toContain('16:15');

      // 16:30 + 90 + 15 = 18:15 — invalid
      expect(times).not.toContain('16:30');
    });

    it('returns slots for a 150-min service — last slot 15:15', () => {
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 150,
        existingBookings: [],
      };
      const slots = computeAvailableSlots(input);
      const times = slots.map(hhmm);

      // 15:15 + 150 + 15 = 18:00 — valid
      expect(times).toContain('09:00');
      expect(times).toContain('15:00');
      expect(times).toContain('15:15');

      // 15:30 + 150 + 15 = 18:15 — invalid
      expect(times).not.toContain('15:30');
    });
  });

  // ---------------------------------------------------------------------------
  // end-time constraint
  // ---------------------------------------------------------------------------

  describe('end-time constraint', () => {
    it('excludes any slot where start + duration + 15-min buffer > 18:00', () => {
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 120,
        existingBookings: [],
      };
      const slots = computeAvailableSlots(input);
      const times = slots.map(hhmm);

      // 15:45 + 120 + 15 = 18:00 — valid
      expect(times).toContain('15:45');

      // 16:00 + 120 + 15 = 18:15 — invalid
      expect(times).not.toContain('16:00');
    });
  });

  // ---------------------------------------------------------------------------
  // overlap detection — confirmed bookings block slots
  // ---------------------------------------------------------------------------

  describe('overlap detection', () => {
    it('blocks slots that overlap with a confirmed booking (10:00-11:00)', () => {
      // Occupied window = [10:00, 11:15) after 15-min buffer
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [makeBooking(10, 0, 11, 0)],
      };
      const slots = computeAvailableSlots(input);
      const times = slots.map(hhmm);

      // [09:30, 10:00) does not overlap [10:00, 11:15) — should be available
      expect(times).toContain('09:30');

      // [10:00, 10:30) overlaps [10:00, 11:15) — blocked
      expect(times).not.toContain('10:00');

      // [10:30, 11:00) overlaps [10:00, 11:15) — blocked
      expect(times).not.toContain('10:30');

      // [11:00, 11:30) overlaps [10:00, 11:15) — blocked (11:00 < 11:15)
      expect(times).not.toContain('11:00');

      // [11:30, 12:00) does not overlap [10:00, 11:15) — should be available
      expect(times).toContain('11:30');
    });

    it('handles two adjacent confirmed bookings correctly', () => {
      // Booking 1: 09:00-10:00, occupied [09:00, 10:15)
      // Booking 2: 11:15-12:15, occupied [11:15, 12:30)
      // Gap: 10:15 to 11:15 = 60 min
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [
          makeBooking(9, 0, 10, 0),
          makeBooking(11, 15, 12, 15),
        ],
      };
      const slots = computeAvailableSlots(input);
      const times = slots.map(hhmm);

      // 09:00 is in booking 1 occupied window — blocked
      expect(times).not.toContain('09:00');

      // 10:00 + 30 = 10:30 < 11:15 — NOT blocked
      expect(times).toContain('10:00');

      // 10:30 + 30 = 11:00 < 11:15 — NOT blocked
      expect(times).toContain('10:30');

      // 11:00 + 30 = 11:30 > 11:15 — overlaps booking 2, blocked
      expect(times).not.toContain('11:00');

      // 12:30 is after occupied [11:15, 12:30) — should be available
      expect(times).toContain('12:30');
    });

    it('handles a booking near end of day (17:00-17:30 confirmed, 30-min service)', () => {
      // Occupied window = [17:00, 17:45)
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [makeBooking(17, 0, 17, 30)],
      };
      const slots = computeAvailableSlots(input);
      const times = slots.map(hhmm);

      // [16:30, 17:00) does not overlap [17:00, 17:45) — valid and within business hours
      expect(times).toContain('16:30');

      // [17:00, 17:30) overlaps [17:00, 17:45) — blocked
      expect(times).not.toContain('17:00');

      // 17:30 + 30 + 15 = 18:15 > 18:00 — already excluded by end-time constraint
      expect(times).not.toContain('17:30');
    });
  });

  // ---------------------------------------------------------------------------
  // buffer application
  // ---------------------------------------------------------------------------

  describe('buffer application', () => {
    it('extends occupied window by 15 min after booking end', () => {
      // Booking ends at 11:00; occupied window ends at 11:15
      // A 30-min slot starting at 11:00 ends at 11:30 and overlaps [10:00, 11:15)
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [makeBooking(10, 0, 11, 0)],
      };
      const slots = computeAvailableSlots(input);
      const times = slots.map(hhmm);

      // 11:00 start overlaps occupied [10:00, 11:15) — blocked by buffer
      expect(times).not.toContain('11:00');

      // 11:15 start: [11:15, 11:45) vs [10:00, 11:15) — 11:15 is NOT < 11:15 (no overlap)
      expect(times).toContain('11:15');
    });
  });

  // ---------------------------------------------------------------------------
  // cancelled bookings
  // ---------------------------------------------------------------------------

  describe('cancelled bookings', () => {
    it('ignores cancelled bookings entirely', () => {
      const inputCancelled: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [makeBooking(10, 0, 11, 0, 'cancelled')],
      };
      const inputEmpty: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [],
      };

      const slotsCancelled = computeAvailableSlots(inputCancelled);
      const slotsEmpty = computeAvailableSlots(inputEmpty);

      // Both should produce the same slots
      expect(slotsCancelled.map(hhmm)).toEqual(slotsEmpty.map(hhmm));
    });

    it('respects confirmed bookings while ignoring cancelled ones', () => {
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [
          makeBooking(10, 0, 11, 0, 'cancelled'), // should be ignored
          makeBooking(12, 0, 13, 0, 'confirmed'), // should block [12:00, 13:15)
        ],
      };
      const slots = computeAvailableSlots(input);
      const times = slots.map(hhmm);

      // Cancelled booking at 10:00 should NOT block anything
      expect(times).toContain('10:00');

      // Confirmed booking at 12:00 should block 12:00-13:00
      expect(times).not.toContain('12:00');
      expect(times).not.toContain('12:30');

      // 13:00 + 30 = 13:30 which overlaps [12:00, 13:15) — blocked
      expect(times).not.toContain('13:00');

      // 13:15 is free
      expect(times).toContain('13:15');
    });
  });

  // ---------------------------------------------------------------------------
  // edge cases
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('returns ISO 8601 strings as an array', () => {
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [],
      };
      const slots = computeAvailableSlots(input);

      expect(Array.isArray(slots)).toBe(true);
      // Each slot should be a non-empty string
      slots.forEach((s) => {
        expect(typeof s).toBe('string');
        expect(s.length).toBeGreaterThan(0);
        // Should contain the date
        expect(s).toContain('2026-01-15');
      });
    });

    it('returns sorted slots in ascending order', () => {
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [],
      };
      const slots = computeAvailableSlots(input);

      for (let i = 1; i < slots.length; i++) {
        expect(slots[i] > slots[i - 1]).toBe(true);
      }
    });

    it('handles a fully booked day (single booking covering entire business hours)', () => {
      // Booking 09:00-18:00 occupies everything
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 30,
        existingBookings: [makeBooking(9, 0, 18, 0)],
      };
      const slots = computeAvailableSlots(input);
      expect(slots).toHaveLength(0);
    });

    it('handles summer date (UTC+1, DST active) correctly for 30-min service', () => {
      const input: SlotEngineInput = {
        date: SUMMER_DATE,
        durationMin: 30,
        existingBookings: [],
      };
      const slots = computeAvailableSlots(input);
      const times = slots.map(hhmm);

      // Same local time rules: 09:00-17:15 in Lisbon (just UTC+1 instead of UTC+0)
      expect(times[0]).toBe('09:00');
      expect(times).toContain('17:15');
      expect(times).not.toContain('17:30');

      // Slots should contain summer date
      slots.forEach((s) => {
        expect(s).toContain(SUMMER_DATE);
      });
    });

    it('returns empty array when no slots fit the duration within business hours', () => {
      // Duration longer than entire business window (540 min = 9 hours)
      const input: SlotEngineInput = {
        date: WINTER_DATE,
        durationMin: 540,
        existingBookings: [],
      };
      const slots = computeAvailableSlots(input);
      expect(slots).toHaveLength(0);
    });
  });
});
