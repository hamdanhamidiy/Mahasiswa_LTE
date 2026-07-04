import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client — SERVER SIDE ONLY.
 * Uses the service_role key to bypass RLS.
 * NEVER import this in client components or expose the key.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
