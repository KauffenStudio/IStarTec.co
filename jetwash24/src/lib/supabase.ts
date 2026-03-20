import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {createClient} from '@supabase/supabase-js';

// Server-side client (use in Server Components, Route Handlers, Server Actions)
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({name, value, options}) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// Browser-side client (use in Client Components)
export function createSupabaseBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
