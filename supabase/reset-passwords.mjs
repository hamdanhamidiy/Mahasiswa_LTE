// ============================================================
// RESET PASSWORDS — Update password for all existing users
// Jalankan: node supabase/reset-passwords.mjs
// ============================================================

const SUPABASE_URL = 'https://oanlpiwbciaxvczczkom.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbmxwaXdiY2lheHZjemN6a29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk3MDk0OSwiZXhwIjoyMDk0NTQ2OTQ5fQ.Z7M11syzihmXtMLHjAJbcVTwhLQ6TT-CxzGOGySov70';

const NEW_PASSWORD = 'ltecruise2025';

const roleMap = {
  'admin@ltecruise.sch.id': 'admin',
  'direktur@ltecruise.sch.id': 'headmaster',
  'ratna@ltecruise.sch.id': 'instruktur',
  'ahmad@ltecruise.sch.id': 'instruktur',
  'budi@ltecruise.sch.id': 'instruktur',
  'rina@student.ltecruise.sch.id': 'mahasiswa',
  'dimas@student.ltecruise.sch.id': 'mahasiswa',
  'siti@student.ltecruise.sch.id': 'mahasiswa',
  'agus@student.ltecruise.sch.id': 'mahasiswa',
  'putri@student.ltecruise.sch.id': 'mahasiswa',
  'fajar@student.ltecruise.sch.id': 'mahasiswa',
  'maya@student.ltecruise.sch.id': 'mahasiswa',
  'rizky@student.ltecruise.sch.id': 'mahasiswa',
  'dewi@student.ltecruise.sch.id': 'mahasiswa',
  'hendra@student.ltecruise.sch.id': 'mahasiswa',
};

async function resetPasswords() {
  console.log('🔑 Resetting passwords for all users...\n');

  // 1. Fetch all auth users
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=50`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  const data = await res.json();
  const authUsers = data.users || [];
  console.log(`  Found ${authUsers.length} auth users\n`);

  for (const user of authUsers) {
    const role = roleMap[user.email];
    if (!role) {
      console.log(`  ⏭️  Skipping unknown user: ${user.email}`);
      continue;
    }

    // 2. Update password + ensure app_metadata.role is set
    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        password: NEW_PASSWORD,
        email_confirm: true,
        app_metadata: { role },
      }),
    });

    if (updateRes.ok) {
      console.log(`  ✅ ${user.email} → password reset + role: ${role}`);
    } else {
      const err = await updateRes.text();
      console.log(`  ❌ ${user.email}: ${err}`);
    }
  }

  console.log('\n🎉 Done! All passwords set to: ltecruise2025');
  console.log('   Login: NIM LTE-2024-001, Password: ltecruise2025');
}

resetPasswords();
