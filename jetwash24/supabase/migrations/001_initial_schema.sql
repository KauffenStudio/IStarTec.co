-- Enable btree_gist extension (MUST be first — required for exclusion constraint)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- Services catalog
-- ============================================================
CREATE TABLE services (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  name_pt      text NOT NULL,
  name_en      text NOT NULL,
  desc_pt      text,
  desc_en      text,
  duration_min int NOT NULL,
  base_price   numeric(6,2) NOT NULL,
  is_active    boolean DEFAULT true,
  sort_order   int DEFAULT 0
);

-- ============================================================
-- Vehicle type surcharges
-- ============================================================
CREATE TABLE vehicle_surcharges (
  vehicle_type text PRIMARY KEY,   -- 'citadino' | 'berlina' | 'suv' | 'carrinha'
  surcharge    numeric(6,2) NOT NULL DEFAULT 0
);

-- ============================================================
-- Bookings
-- ============================================================
CREATE TABLE bookings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id       uuid REFERENCES services(id),
  vehicle_type     text NOT NULL,
  start_time       timestamptz NOT NULL,
  end_time         timestamptz NOT NULL,
  customer_name    text NOT NULL,
  customer_email   text NOT NULL,
  customer_phone   text,
  status           text NOT NULL DEFAULT 'confirmed',
  cancel_token     uuid UNIQUE DEFAULT gen_random_uuid(),
  created_at       timestamptz DEFAULT now(),
  CONSTRAINT status_values CHECK (status IN ('confirmed', 'cancelled'))
);

-- ============================================================
-- Atomic double-booking prevention (TECH-01)
-- Exclusion constraint: no two 'confirmed' bookings may overlap in time
-- This is the ONLY correct solution — JS-level checks have race conditions
-- ============================================================
ALTER TABLE bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (tstzrange(start_time, end_time) WITH &&)
  WHERE (status = 'confirmed');

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_bookings_time_status ON bookings (start_time, end_time, status);
CREATE INDEX idx_bookings_cancel_token ON bookings (cancel_token) WHERE cancel_token IS NOT NULL;
CREATE INDEX idx_services_active ON services (sort_order) WHERE is_active = true;

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_surcharges ENABLE ROW LEVEL SECURITY;

-- Services and vehicle_surcharges: public read, no client-side write
CREATE POLICY "services_public_read" ON services FOR SELECT USING (true);
CREATE POLICY "vehicle_surcharges_public_read" ON vehicle_surcharges FOR SELECT USING (true);

-- Bookings: allow INSERT for anon users (booking creation); no client-side SELECT/UPDATE/DELETE
CREATE POLICY "bookings_insert_anon" ON bookings FOR INSERT WITH CHECK (true);
