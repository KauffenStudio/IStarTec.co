import { describe, it } from 'vitest';

describe('database schema validation', () => {
  it.todo('services table has required columns: id, slug, name_pt, name_en, duration_min, base_price');
  it.todo('vehicle_surcharges table has required columns: vehicle_type, surcharge');
  it.todo('bookings table has required columns: id, service_id, vehicle_type, start_time, end_time, status');
  it.todo('bookings status constraint allows only confirmed and cancelled');
  it.todo('seed data contains 6 services matching PROJECT.md catalog');
  it.todo('seed data contains 4 vehicle surcharge rows');
});
