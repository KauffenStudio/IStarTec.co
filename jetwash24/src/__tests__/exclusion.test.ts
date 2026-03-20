import { describe, it } from 'vitest';

describe('TECH-01: booking exclusion constraint', () => {
  it.todo('migration enables btree_gist extension before creating tables');
  it.todo('exclusion constraint uses tstzrange on start_time and end_time');
  it.todo('exclusion constraint only applies to confirmed bookings');
  it.todo('overlapping confirmed bookings are rejected by the constraint');
  it.todo('cancelled bookings do not trigger the exclusion constraint');
});
