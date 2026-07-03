// ============================================================
// SEED STEP 2 — Insert ke public.users
// Auth users sudah dibuat, tinggal insert data profil
// Jalankan: node supabase/seed-public-users.mjs
// ============================================================

const SUPABASE_URL = 'https://oanlpiwbciaxvczczkom.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbmxwaXdiY2lheHZjemN6a29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk3MDk0OSwiZXhwIjoyMDk0NTQ2OTQ5fQ.Z7M11syzihmXtMLHjAJbcVTwhLQ6TT-CxzGOGySov70';

async function run() {
  console.log('🚢 Fetching auth users...\n');

  // Ambil semua auth users yang sudah dibuat
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=50`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  const data = await res.json();
  const authUsers = data.users || [];
  console.log(`  Ditemukan ${authUsers.length} auth users\n`);

  // Mapping email → data lengkap
  const userMap = {
    'admin@ltecruise.sch.id': { nim: null, nama: 'Admin LTE Cruise', role: 'admin', program: null, jurusan: null, angkatan: null, periode: null },
    'direktur@ltecruise.sch.id': { nim: null, nama: 'Nur Haidi, BA. IR.', role: 'headmaster', program: null, jurusan: null, angkatan: null, periode: null },
    'ratna@ltecruise.sch.id': { nim: null, nama: 'Ratna Dewi, S.Pd', role: 'instruktur', program: 'diploma1', jurusan: 'housekeeping', angkatan: null, periode: '2020-01-01' },
    'ahmad@ltecruise.sch.id': { nim: null, nama: 'Chef Ahmad Fauzi', role: 'instruktur', program: 'diploma1', jurusan: 'fnb_product', angkatan: null, periode: '2019-06-01' },
    'budi@ltecruise.sch.id': { nim: null, nama: 'Budi Santoso, S.Par', role: 'instruktur', program: 'diploma1', jurusan: 'fnb_service', angkatan: null, periode: '2021-03-01' },
    'rina@student.ltecruise.sch.id': { nim: 'LTE-2024-001', nama: 'Rina Maharani', role: 'mahasiswa', program: 'diploma1', jurusan: 'housekeeping', angkatan: 'Angkatan 24', periode: '2024-01-15' },
    'dimas@student.ltecruise.sch.id': { nim: 'LTE-2024-002', nama: 'Dimas Pratama', role: 'mahasiswa', program: 'diploma1', jurusan: 'fnb_product', angkatan: 'Angkatan 24', periode: '2024-01-15' },
    'siti@student.ltecruise.sch.id': { nim: 'LTE-2024-003', nama: 'Siti Nurhaliza', role: 'mahasiswa', program: 'diploma1', jurusan: 'fnb_service', angkatan: 'Angkatan 24', periode: '2024-01-15' },
    'agus@student.ltecruise.sch.id': { nim: 'LTE-2024-004', nama: 'Agus Setiawan', role: 'mahasiswa', program: 'diploma1', jurusan: 'housekeeping', angkatan: 'Angkatan 24', periode: '2024-01-15' },
    'putri@student.ltecruise.sch.id': { nim: 'LTE-2024-005', nama: 'Putri Amelia', role: 'mahasiswa', program: 'diploma1', jurusan: 'fnb_product', angkatan: 'Angkatan 24', periode: '2024-01-15' },
    'fajar@student.ltecruise.sch.id': { nim: 'LTE-2025-001', nama: 'Fajar Nugroho', role: 'mahasiswa', program: 'diploma1', jurusan: 'housekeeping', angkatan: 'Angkatan 25', periode: '2025-01-13' },
    'maya@student.ltecruise.sch.id': { nim: 'LTE-2025-002', nama: 'Maya Sari', role: 'mahasiswa', program: 'diploma1', jurusan: 'fnb_service', angkatan: 'Angkatan 25', periode: '2025-01-13' },
    'rizky@student.ltecruise.sch.id': { nim: 'LTE-2025-003', nama: 'Rizky Ramadan', role: 'mahasiswa', program: 'diploma1', jurusan: 'fnb_product', angkatan: 'Angkatan 25', periode: '2025-01-13' },
    'dewi@student.ltecruise.sch.id': { nim: 'LTE-2025-004', nama: 'Dewi Lestari', role: 'mahasiswa', program: 'diploma1', jurusan: 'fnb_service', angkatan: 'Angkatan 25', periode: '2025-01-13' },
    'hendra@student.ltecruise.sch.id': { nim: 'LTE-2025-005', nama: 'Hendra Wijaya', role: 'mahasiswa', program: 'diploma1', jurusan: 'housekeeping', angkatan: 'Angkatan 25', periode: '2025-01-13' },
  };

  for (const authUser of authUsers) {
    const info = userMap[authUser.email];
    if (!info) continue;

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        id: authUser.id,
        nim: info.nim,
        nama_lengkap: info.nama,
        email: authUser.email,
        role: info.role,
        program: info.program,
        jurusan: info.jurusan,
        angkatan: info.angkatan,
        periode_masuk: info.periode,
        status_aktif: true,
      }),
    });

    if (insertRes.ok) {
      console.log(`  ✅ ${info.nama} (${info.role}) → ${authUser.id}`);
    } else {
      const err = await insertRes.text();
      console.log(`  ⚠️  ${info.nama}: ${err}`);
    }
  }

  console.log('\n🎉 Done! Login: NIM LTE-2024-001 / Password ltecruise2025');
}

run();
