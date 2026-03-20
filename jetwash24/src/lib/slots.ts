// Slot engine — pure function, no database or HTTP dependencies.
// Computes available booking start times for a given date and service duration,
// accounting for existing bookings, 15-minute buffers, and business hour boundaries.

export const BUSINESS_START_HOUR = 9;
export const BUSINESS_END_HOUR = 18;
export const SLOT_INTERVAL_MIN = 30;
export const BUFFER_MIN = 15;
export const TIMEZONE = 'Europe/Lisbon';

// Internal candidate generation uses 15-minute intervals so that edge slots
// like 17:15 (the last valid 30-min slot: 17:15 + 30 + 15 = 18:00) are reachable.
// Slots at 15-minute offsets that don't fit a 30-min service are naturally
// excluded by the business-hours filter.
const CANDIDATE_INTERVAL_MIN = 15;

export interface SlotEngineInput {
  date: string; // YYYY-MM-DD (treated as local date in Europe/Lisbon)
  durationMin: number; // service.duration_min
  existingBookings: Array<{
    start_time: string; // ISO 8601
    end_time: string; // ISO 8601
    status: 'confirmed' | 'cancelled';
  }>;
}

/**
 * Determine whether a given YYYY-MM-DD date falls within Portuguese DST (UTC+1).
 *
 * Portugal follows EU DST rules:
 *   - DST starts: last Sunday of March at 01:00 UTC
 *   - DST ends:   last Sunday of October at 01:00 UTC
 *
 * Returns true if UTC+1 (summer), false if UTC+0 (winter).
 */
function isPortugalSummerTime(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);

  const lastSundayMarch = lastSundayOf(year, 3);
  const lastSundayOctober = lastSundayOf(year, 10);

  const dateMmdd = month * 100 + day;
  const marchMmdd = 3 * 100 + lastSundayMarch;
  const octoberMmdd = 10 * 100 + lastSundayOctober;

  return dateMmdd >= marchMmdd && dateMmdd < octoberMmdd;
}

/** Return the day-of-month of the last Sunday in the given month (1-12). */
function lastSundayOf(year: number, month: number): number {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let d = lastDay; d >= 1; d--) {
    const dow = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
    if (dow === 0) return d; // Sunday
  }
  return 1;
}

/**
 * Build an ISO 8601 string for the given date, hour, and minute in Europe/Lisbon time.
 * In winter (UTC+0) → `YYYY-MM-DDTHH:MM:00+00:00`
 * In summer (UTC+1) → `YYYY-MM-DDTHH:MM:00+01:00`
 */
function toLisbonISO(
  dateStr: string,
  hourLocal: number,
  minuteLocal: number,
  isSummer: boolean,
): string {
  const hh = String(hourLocal).padStart(2, '0');
  const mm = String(minuteLocal).padStart(2, '0');
  const offset = isSummer ? '+01:00' : '+00:00';
  return `${dateStr}T${hh}:${mm}:00${offset}`;
}

/**
 * Parse an ISO 8601 string and return its UTC epoch (milliseconds).
 * Works for strings with explicit offsets (+00:00, +01:00, Z, etc.).
 */
function isoToEpoch(iso: string): number {
  return new Date(iso).getTime();
}

/**
 * Compute available booking start times for a given date and service duration.
 *
 * Rules:
 * - Business hours: 09:00–18:00 Europe/Lisbon
 * - Candidates generated on a 15-min grid (to capture edge slots like 17:15, 16:15, etc.)
 * - A candidate slot is valid only if: candidateStart + durationMin + BUFFER_MIN <= 18:00
 * - Only 'confirmed' bookings create occupied windows
 * - Occupied window for a booking: [bookingStart, bookingEnd + 15 min)
 * - A candidate is blocked if [candidateStart, candidateStart + durationMin)
 *   overlaps any occupied window (candidateStart < occupiedEnd AND candidateEnd > occupiedStart)
 */
export function computeAvailableSlots(input: SlotEngineInput): string[] {
  const { date, durationMin, existingBookings } = input;
  const isSummer = isPortugalSummerTime(date);

  // Epoch values for business boundaries on this date in Lisbon local time
  const businessStartEpoch = isoToEpoch(
    toLisbonISO(date, BUSINESS_START_HOUR, 0, isSummer),
  );
  const businessEndEpoch = isoToEpoch(
    toLisbonISO(date, BUSINESS_END_HOUR, 0, isSummer),
  );

  const candidateIntervalMs = CANDIDATE_INTERVAL_MIN * 60 * 1000;
  const durationMs = durationMin * 60 * 1000;
  const bufferMs = BUFFER_MIN * 60 * 1000;

  // 1. Generate all candidate start times on the 15-min grid within business hours
  const candidates: number[] = [];
  for (
    let t = businessStartEpoch;
    t < businessEndEpoch;
    t += candidateIntervalMs
  ) {
    candidates.push(t);
  }

  // 2. Filter: candidateStart + durationMin + BUFFER_MIN must NOT exceed businessEnd
  const feasible = candidates.filter(
    (t) => t + durationMs + bufferMs <= businessEndEpoch,
  );

  // 3. Build occupied windows from confirmed bookings only
  const occupiedWindows = existingBookings
    .filter((b) => b.status === 'confirmed')
    .map((b) => ({
      start: isoToEpoch(b.start_time),
      end: isoToEpoch(b.end_time) + bufferMs, // end + 15-min buffer
    }));

  // 4. Filter out candidates that overlap any occupied window.
  // Overlap condition: candidateStart < occupiedEnd AND candidateEnd > occupiedStart
  // where candidateEnd = candidateStart + durationMin (service end, buffer not included here)
  const available = feasible.filter((candidateStart) => {
    const candidateEnd = candidateStart + durationMs;
    return !occupiedWindows.some(
      (w) => candidateStart < w.end && candidateEnd > w.start,
    );
  });

  // 5. Convert to ISO 8601 strings in Lisbon local time and return sorted
  return available
    .map((epochMs) => {
      const offsetMs = isSummer ? 60 * 60 * 1000 : 0;
      const localMs = epochMs + offsetMs;
      const localDate = new Date(localMs);
      const localHour = localDate.getUTCHours();
      const localMinute = localDate.getUTCMinutes();
      return toLisbonISO(date, localHour, localMinute, isSummer);
    })
    .sort();
}
