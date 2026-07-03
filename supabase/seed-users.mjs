// ============================================================
// SEED SCRIPT — Buat user via Supabase Admin API
// Jalankan: node supabase/seed-users.mjs
// ============================================================

const SUPABASE_URL = 'https://oanlpiwbciaxvczczkom.supabase.co';
// ⚠️ Ganti dengan Service Role Key (bukan anon key!)
// Ambil dari: Supabase Dashboard → Settings → API → service_role key
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbmxwaXdiY2lheHZjemN6a29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk3MDk0OSwiZXhwIjoyMDk0NTQ2OTQ5fQ.Z7M11syzihmXtMLHjAJbcVTwhLQ6TT-CxzGOGySov70';

const users = [
  { email: 'admin@ltecruise.sch.id', password: 'ltecruise2025', nama: 'Admin LTE Cruise', role: 'admin', nim: null },
  { email: 'direktur@ltecruise.sch.id', password: 'ltecruise2025', nama: 'Nur Haidi, BA. IR.', role: 'headmaster', nim: null },
  { email: 'ratna@ltecruise.sch.id', password: 'ltecruise2025', nama: 'Ratna Dewi, S.Pd', role: 'instruktur', nim: null },
  { email: 'ahmad@ltecruise.sch.id', password: 'ltecruise2025', nama: 'Chef Ahmad Fauzi', role: 'instruktur', nim: null },
  { email: 'budi@ltecruise.sch.id', password: 'ltecruise2025', nama: 'Budi Santoso, S.Par', role: 'instruktur', nim: null },
  { email: 'rina@student.ltecruise.sch.id', password: 'ltecruise2025', nama: 'Rina Maharani', role: 'mahasiswa', nim: 'LTE-2024-001' },
  { email: 'dimas@student.ltecruise.sch.id', password: 'ltecruise2025', nama: 'Dimas Pratama', role: 'mahasiswa', nim: 'LTE-2024-002' },
  { email: 'siti@student.ltecruise.sch.id', password: 'ltecruise2025', nama: 'Siti Nurhaliza', role: 'mahasiswa', nim: 'LTE-2024-003' },
  { email: 'agus@student.ltecruise.sch.id', password: 'ltecruise2025', nama: 'Agus Setiawan', role: 'mahasiswa', nim: 'LTE-2024-004' },
  { email: 'putri@student.ltecruise.sch.id', password: 'ltecruise2025', nama: 'Putri Amelia', role: 'mahasiswa', nim: 'LTE-2024-005' },
  { email: 'fajar@student.ltecruise.sch.id', password: 'ltecruise2025', nama: 'Fajar Nugroho', role: 'mahasiswa', nim: 'LTE-2025-001' },
  { email: 'maya@student.ltecruise.sch.id', password: 'ltecruise2025', nama: 'Maya Sari', role: 'mahasiswa', nim: 'LTE-2025-002' },
  { email: 'rizky@student.ltecruise.sch.id', password: 'ltecruise2025', nama: 'Rizky Ramadan', role: 'mahasiswa', nim: 'LTE-2025-003' },
  { email: 'dewi@student.ltecruise.sch.id', password: 'ltecruise2025', nama: 'Dewi Lestari', role: 'mahasiswa', nim: 'LTE-2025-004' },
  { email: 'hendra@student.ltecruise.sch.id', password: 'ltecruise2025', nama: 'Hendra Wijaya', role: 'mahasiswa', nim: 'LTE-2025-005' },
];

const programMap = { instruktur: 'diploma1', mahasiswa: 'diploma1' };
const jurusanMap = {
  'Ratna Dewi, S.Pd': 'housekeeping',
  'Chef Ahmad Fauzi': 'fnb_product',
  'Budi Santoso, S.Par': 'fnb_service',
  'Rina Maharani': 'housekeeping',
  'Dimas Pratama': 'fnb_product',
  'Siti Nurhaliza': 'fnb_service',
  'Agus Setiawan': 'housekeeping',
  'Putri Amelia': 'fnb_product',
  'Fajar Nugroho': 'housekeeping',
  'Maya Sari': 'fnb_service',
  'Rizky Ramadan': 'fnb_product',
  'Dewi Lestari': 'fnb_service',
  'Hendra Wijaya': 'housekeeping',
};
const angkatanMap = {
  'LTE-2024': 'Angkatan 24',
  'LTE-2025': 'Angkatan 25',
};

async function seedUsers() {
  console.log('🚢 LTE Cruise AIS — Seeding Users...\n');

  for (const u of users) {
    // 1. Buat auth user via Admin API
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { nama: u.nama },
        app_metadata: { role: u.role },
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.log(`  ⚠️  ${u.email}: ${result.msg || result.message || JSON.stringify(result)}`);
      continue;
    }

    const authId = result.id;
    console.log(`  ✅ Auth: ${u.email} → ${authId}`);

    // 2. Insert ke public.users
    const angkatan = u.nim ? angkatanMap[u.nim.substring(0, 8)] || null : null;
    const periode = u.nim?.startsWith('LTE-2024') ? '2024-01-15' : u.nim?.startsWith('LTE-2025') ? '2025-01-13' : null;

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        id: authId,
        nim: u.nim,
        nama_lengkap: u.nama,
        email: u.email,
        role: u.role,
        program: programMap[u.role] || null,
        jurusan: jurusanMap[u.nama] || null,
        angkatan: angkatan,
        periode_masuk: periode,
        status_aktif: true,
      }),
    });

    if (insertRes.ok) {
      console.log(`  ✅ DB:   ${u.nama} (${u.role})`);
    } else {
      const err = await insertRes.text();
      console.log(`  ⚠️  DB:   ${u.nama}: ${err}`);
    }
  }

  console.log('\n🎉 Seeding selesai!');
  console.log('   Login dengan NIM: LTE-2024-001, Password: ltecruise2025');
}

seedUsers();
