import {NextRequest} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase';
import {VehicleType} from '@/types/database';

const VALID_VEHICLE_TYPES: VehicleType[] = [
  'citadino',
  'berlina',
  'suv',
  'carrinha',
];

/**
 * POST /api/bookings
 *
 * Creates a booking atomically. The Postgres exclusion constraint prevents
 * double-booking at the database level (error code 23P01).
 *
 * Request body:
 *   { service_id, vehicle_type, start_time, customer_name, customer_email, customer_phone? }
 *
 * Response 200: { id: string, cancel_token: string }
 * Response 409: { error: 'slot_conflict', message: string }   — exclusion constraint fired
 * Response 422: { error: 'validation_error', message: string }
 * Response 404: service not found
 * Response 500: unexpected DB error
 */
export async function POST(request: NextRequest) {
  // Parse request body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {error: 'validation_error', message: 'Invalid JSON body'},
      {status: 422},
    );
  }

  const {
    service_id,
    vehicle_type,
    start_time,
    customer_name,
    customer_email,
    customer_phone,
  } = body;

  // Validate required fields
  const missingFields: string[] = [];
  if (!service_id) missingFields.push('service_id');
  if (!vehicle_type) missingFields.push('vehicle_type');
  if (!start_time) missingFields.push('start_time');
  if (!customer_name) missingFields.push('customer_name');
  if (!customer_email) missingFields.push('customer_email');

  if (missingFields.length > 0) {
    return Response.json(
      {
        error: 'validation_error',
        message: `Missing required fields: ${missingFields.join(', ')}`,
      },
      {status: 422},
    );
  }

  // Validate vehicle_type
  if (!VALID_VEHICLE_TYPES.includes(vehicle_type as VehicleType)) {
    return Response.json(
      {
        error: 'validation_error',
        message: `vehicle_type must be one of: ${VALID_VEHICLE_TYPES.join(', ')}`,
      },
      {status: 422},
    );
  }

  // Validate customer_email (basic check)
  if (typeof customer_email !== 'string' || !customer_email.includes('@')) {
    return Response.json(
      {error: 'validation_error', message: 'customer_email is invalid'},
      {status: 422},
    );
  }

  const supabase = await createSupabaseServerClient();

  // Fetch service to get duration_min
  const {data: service, error: serviceError} = await supabase
    .from('services')
    .select('duration_min')
    .eq('id', service_id as string)
    .eq('is_active', true)
    .single();

  if (serviceError || !service) {
    return Response.json(
      {error: 'not_found', message: 'Service not found'},
      {status: 404},
    );
  }

  // Compute end_time
  const startMs = new Date(start_time as string).getTime();
  if (isNaN(startMs)) {
    return Response.json(
      {error: 'validation_error', message: 'start_time is not a valid datetime'},
      {status: 422},
    );
  }
  const endTime = new Date(startMs + service.duration_min * 60 * 1000).toISOString();

  // Insert booking — Postgres exclusion constraint prevents double-booking atomically
  const {data, error} = await supabase
    .from('bookings')
    .insert({
      service_id: service_id as string,
      vehicle_type: vehicle_type as VehicleType,
      start_time: start_time as string,
      end_time: endTime,
      customer_name: customer_name as string,
      customer_email: customer_email as string,
      customer_phone: (customer_phone as string | undefined) || null,
    })
    .select('id, cancel_token')
    .single();

  if (error) {
    // Postgres exclusion constraint violation: no two confirmed bookings may overlap
    if (error.code === '23P01') {
      return Response.json(
        {error: 'slot_conflict', message: 'This slot is no longer available'},
        {status: 409},
      );
    }
    return Response.json(
      {error: 'internal_error', message: 'Booking failed'},
      {status: 500},
    );
  }

  return Response.json({id: data.id, cancel_token: data.cancel_token});
}
