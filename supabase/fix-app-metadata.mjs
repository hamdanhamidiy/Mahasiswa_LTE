// ============================================================
// FIX: Update all auth users' app_metadata with their role
// This lets the middleware read role without querying the DB
// Jalankan: node supabase/fix-app-metadata.mjs
// ============================================================

const SUPABASE_URL = 'https://oanlpiwbciaxvczczkom.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbmxwaXdiY2lheHZjemN6a29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk3MDk0OSwiZXhwIjoyMDk0NTQ2OTQ5fQ.Z7M11syzihmXtMLHjAJbcVTwhLQ6TT-CxzGOGySov70';

async function fixMetadata() {
  console.log('🔧 Fixing app_metadata for all users...\n');

  // 1. Get all public.users with their roles
  const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,email,role`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  const users = await usersRes.json();
  console.log(`  Found ${users.length} users in public.users\n`);

  // 2. Update each auth user's app_metadata with role
  for (const u of users) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${u.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        app_metadata: {
          provider: 'email',
          providers: ['email'],
          role: u.role,
        },
      }),
    });

    if (res.ok) {
      console.log(`  ✅ ${u.email} → app_metadata.role = "${u.role}"`);
    } else {
      const err = await res.text();
      console.log(`  ❌ ${u.email}: ${err}`);
    }
  }

  console.log('\n🎉 Done! Middleware can now read role from app_metadata.');
}

fixMetadata();
