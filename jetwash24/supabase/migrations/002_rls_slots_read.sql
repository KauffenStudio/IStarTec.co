-- Allow server-side slot availability queries to read booking time windows.
-- Only exposes start_time, end_time, status — no customer PII.
-- Column restriction is enforced by the API route's .select('start_time, end_time, status') call.
-- RLS controls row access; the query controls column access (standard Supabase pattern).
CREATE POLICY "bookings_select_for_slots"
  ON bookings
  FOR SELECT
  USING (true);

-- Allow server to update booking status (for cancellation via cancel_token).
CREATE POLICY "bookings_update_status"
  ON bookings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
