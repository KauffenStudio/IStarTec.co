// Database types — mirrors supabase/migrations/001_initial_schema.sql
// Update this file when the schema changes.

export type BookingStatus = 'confirmed' | 'cancelled';

export type VehicleType = 'citadino' | 'berlina' | 'suv' | 'carrinha';

export interface Service {
  id: string;
  slug: string;
  name_pt: string;
  name_en: string;
  desc_pt: string | null;
  desc_en: string | null;
  duration_min: number;
  base_price: number;
  is_active: boolean;
  sort_order: number;
}

export interface VehicleSurcharge {
  vehicle_type: VehicleType;
  surcharge: number;
}

export interface Booking {
  id: string;
  service_id: string;
  vehicle_type: VehicleType;
  start_time: string;   // ISO 8601 timestamptz
  end_time: string;      // ISO 8601 timestamptz
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: BookingStatus;
  cancel_token: string;
  created_at: string;    // ISO 8601 timestamptz
}

// Insert types (omit server-generated fields)
export type ServiceInsert = Omit<Service, 'id'>;

export type BookingInsert = Omit<Booking, 'id' | 'cancel_token' | 'created_at' | 'status'> & {
  status?: BookingStatus;
};
