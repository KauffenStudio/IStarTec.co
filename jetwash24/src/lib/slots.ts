// Slot engine — pure function, no database or HTTP dependencies

export interface SlotEngineInput {
  date: string; // YYYY-MM-DD (treated as local date in Europe/Lisbon)
  durationMin: number; // service.duration_min
  existingBookings: Array<{
    start_time: string; // ISO 8601
    end_time: string; // ISO 8601
    status: 'confirmed' | 'cancelled';
  }>;
}

// Stub — returns empty array so tests compile but fail (RED phase)
export function computeAvailableSlots(_input: SlotEngineInput): string[] {
  return [];
}
