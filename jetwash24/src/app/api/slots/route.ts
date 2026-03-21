import {NextRequest} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase';
import {computeAvailableSlots} from '@/lib/slots';

/**
 * GET /api/slots?date=YYYY-MM-DD&service_id=<uuid>
 *
 * Returns available booking start times for the given date and service.
 * Date must be tomorrow or later, and within 7 days from today (Europe/Lisbon).
 *
 * Response 200: { slots: string[] }   — ISO 8601 datetime strings
 * Response 404: service not found or inactive
 * Response 422: missing params, invalid date format, or out-of-range date
 */
export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const dateParam = searchParams.get('date');
  const serviceId = searchParams.get('service_id');

  // Validate required params
  if (!dateParam || !serviceId) {
    return Response.json(
      {error: 'validation_error', message: 'date and service_id are required'},
      {status: 422},
    );
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return Response.json(
      {
        error: 'validation_error',
        message: 'date must be in YYYY-MM-DD format',
      },
      {status: 422},
    );
  }

  // Validate date range in Europe/Lisbon timezone.
  // We compute "today in Lisbon" as a YYYY-MM-DD string by formatting the
  // current UTC instant with the Europe/Lisbon locale offset applied.
  const nowUtcMs = Date.now();
  const lisbonFormatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Lisbon',
  });
  const todayLisbon = lisbonFormatter.format(new Date(nowUtcMs)); // "YYYY-MM-DD"

  // Compute tomorrow and maxDate (today + 7 days) as YYYY-MM-DD strings.
  const todayDate = new Date(todayLisbon + 'T00:00:00Z');
  const tomorrowDate = new Date(todayDate.getTime() + 24 * 60 * 60 * 1000);
  const maxDate = new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);
  const maxDateStr = maxDate.toISOString().slice(0, 10);

  if (dateParam < tomorrowStr || dateParam > maxDateStr) {
    return Response.json(
      {
        error: 'validation_error',
        message:
          'Bookings must be at least 1 day in advance and at most 7 days ahead',
      },
      {status: 422},
    );
  }

  const supabase = await createSupabaseServerClient();

  // Fetch service duration
  const {data: service, error: serviceError} = await supabase
    .from('services')
    .select('duration_min')
    .eq('id', serviceId)
    .eq('is_active', true)
    .single();

  if (serviceError || !service) {
    return Response.json(
      {error: 'not_found', message: 'Service not found'},
      {status: 404},
    );
  }

  // Build UTC window for the requested date in Europe/Lisbon.
  // We need midnight-to-midnight in Lisbon local time as UTC timestamps.
  // Lisbon is UTC+0 (winter) or UTC+1 (summer); we query a wide UTC window
  // (the full calendar day UTC−1 to UTC+1 buffer) and let the slot engine
  // filter by Lisbon business hours. Simplest correct approach: query
  // [YYYY-MM-DDT00:00:00+00:00, YYYY-MM-DDT23:59:59+00:00] with a ±1h buffer.
  const dayStartUTC = `${dateParam}T00:00:00+00:00`;
  // Use +1 day as upper bound to safely cover both UTC+0 and UTC+1
  const nextDay = new Date(new Date(dayStartUTC).getTime() + 25 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const dayEndUTC = `${nextDay}T00:00:00+00:00`;

  const {data: existingBookings, error: bookingsError} = await supabase
    .from('bookings')
    .select('start_time, end_time, status')
    .gte('start_time', dayStartUTC)
    .lt('start_time', dayEndUTC);

  if (bookingsError) {
    return Response.json(
      {error: 'internal_error', message: 'Failed to fetch bookings'},
      {status: 500},
    );
  }

  const availableSlots = computeAvailableSlots({
    date: dateParam,
    durationMin: service.duration_min,
    existingBookings: (existingBookings ?? []) as Array<{
      start_time: string;
      end_time: string;
      status: 'confirmed' | 'cancelled';
    }>,
  });

  return Response.json({slots: availableSlots});
}
