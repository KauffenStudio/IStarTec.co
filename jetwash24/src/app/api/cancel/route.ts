import {NextRequest} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase';

/**
 * POST /api/cancel
 *
 * Cancels a booking by its cancel_token. Idempotent — cancelling an already-cancelled
 * booking returns HTTP 200 (not an error).
 *
 * Request body: { token: string }  — the cancel_token UUID
 *
 * Response 200: { success: true, message: string }
 * Response 404: { error: 'not_found', message: string }  — unknown token
 * Response 422: { error: 'validation_error', message: string }  — missing token
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

  const {token} = body;

  if (!token || typeof token !== 'string') {
    return Response.json(
      {error: 'validation_error', message: 'token is required'},
      {status: 422},
    );
  }

  const supabase = await createSupabaseServerClient();

  // Look up booking by cancel_token
  const {data: booking, error: fetchError} = await supabase
    .from('bookings')
    .select('id, status')
    .eq('cancel_token', token)
    .single();

  if (fetchError || !booking) {
    // PGRST116: no rows returned — invalid token
    return Response.json(
      {error: 'not_found', message: 'Invalid token'},
      {status: 404},
    );
  }

  // Idempotent: if already cancelled, return success without another UPDATE
  if (booking.status === 'cancelled') {
    return Response.json({
      success: true,
      message: 'Booking already cancelled',
    });
  }

  // Update booking status to cancelled
  const {error: updateError} = await supabase
    .from('bookings')
    .update({status: 'cancelled'})
    .eq('id', booking.id);

  if (updateError) {
    return Response.json(
      {error: 'internal_error', message: 'Failed to cancel booking'},
      {status: 500},
    );
  }

  return Response.json({success: true, message: 'Booking cancelled'});
}
