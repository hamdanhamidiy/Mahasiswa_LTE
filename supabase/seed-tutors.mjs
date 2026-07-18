// ============================================================
// SEED SCRIPT — Buat tutor/karyawan via Supabase Admin API
// Jalankan: node supabase/seed-tutors.mjs
// ============================================================

const SUPABASE_URL = 'https://oanlpiwbciaxvczczkom.supabase.co';
// ⚠️ Ganti dengan Service Role Key (bukan anon key!)
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbmxwaXdiY2lheHZjemN6a29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk3MDk0OSwiZXhwIjoyMDk0NTQ2OTQ5fQ.Z7M11syzihmXtMLHjAJbcVTwhLQ6TT-CxzGOGySov70';

const newUsers = [
  { nama: 'M. Sodikin', email: 'sodikin@ltecruise.sch.id', role: 'admin', jabatan: 'General Manager' },
  { nama: 'Syifah Fauziah, S.Sos.', email: 'syifah@ltecruise.sch.id', role: 'admin', jabatan: 'Manager Administrasi' },
  { nama: 'Millatul Khaqimah, S.Ak.', email: 'millatul@ltecruise.sch.id', role: 'admin', jabatan: 'Accounting Staf' },
  { nama: 'Erni Latul, S.Ak.', email: 'erni@ltecruise.sch.id', role: 'admin', jabatan: 'Staf Administrasi LTE' },
  { nama: 'Annisa Rahmawati, S.AP.', email: 'annisa@ltecruise.sch.id', role: 'admin', jabatan: 'Staf Administrasi LTE' },
  { nama: 'Shefira Salsabila Eka W', email: 'shefira@ltecruise.sch.id', role: 'admin', jabatan: 'Staf Administrasi PT. LTEC' },
  { nama: 'Berlian Ajeng Nadita, S.M.', email: 'berlian@ltecruise.sch.id', role: 'admin', jabatan: 'Staf Administrasi PT. LTEC' },
  { nama: 'Allanda Ayu Fatimah, S.Pd.', email: 'allanda@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Heri Sutomo, A.Md.', email: 'heri@ltecruise.sch.id', role: 'instruktur', jabatan: 'F&B Service Instructor' },
  { nama: 'Jefril Aji, A.Md.', email: 'jefril@ltecruise.sch.id', role: 'instruktur', jabatan: 'Housekeeping Instructor' },
  { nama: 'Yonas Otniel Prakoso, A.Md.', email: 'yonas@ltecruise.sch.id', role: 'instruktur', jabatan: 'F&B Product Instructor' },
  { nama: 'Tita Novita Sari, S.Pd.', email: 'tita@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Uswatul Hasanah, S.Pd.', email: 'uswatul@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Siti Holifatul Husnul Hotimah', email: 'siti_holifatul@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Ika Agustina, S.Pd.', email: 'ika@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Dedik Prasetyo, S.Pd.', email: 'dedik@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Dillah Syarifullah, S.S.', email: 'dillah@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'M. Azizin, M.Pd.', email: 'azizin@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Rolly Firza', email: 'rolly@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Oyong Adi Saputra', email: 'oyong@ltecruise.sch.id', role: 'instruktur', jabatan: 'Pastry Instructor' },
  { nama: 'Astuti Alawiyah', email: 'astuti@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Arifviansyah Yuniva, S.Kom.', email: 'arifviansyah@ltecruise.sch.id', role: 'admin', jabatan: 'IT & Design Specialist' },
  { nama: 'M. Arifin, M.M.', email: 'arifin@ltecruise.sch.id', role: 'admin', jabatan: 'Asst. Design Video' },
  { nama: 'Hiyoga Ikhsan Pratama', email: 'hiyoga@ltecruise.sch.id', role: 'admin', jabatan: 'Content Creator' },
  { nama: 'Septiva Alavianudin, S.Pd.', email: 'septiva@ltecruise.sch.id', role: 'admin', jabatan: 'Staf Marketing' },
  { nama: 'Fikri Wahyudin', email: 'fikri@ltecruise.sch.id', role: 'admin', jabatan: 'Staf Marketing' },
  { nama: 'Ibnu Fadillah', email: 'ibnu@ltecruise.sch.id', role: 'admin', jabatan: 'Office Boy' },
  { nama: 'Faisal Akbar Prasetyo Widodo S', email: 'faisal@ltecruise.sch.id', role: 'admin', jabatan: 'Office Boy' },
  { nama: 'Ayu Sri Permata Putih', email: 'ayu@ltecruise.sch.id', role: 'admin', jabatan: 'Staf Administrasi LTE' },
  { nama: 'Muhammad Fakhrur Rozi Afkari', email: 'fakhrur@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Abdul Mun\'im', email: 'abdul@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Irmawati', email: 'irmawati@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Teacher' },
  { nama: 'Muhammad Giusson Habibullah', email: 'giusson@ltecruise.sch.id', role: 'instruktur', jabatan: 'Housekeeping Instructor' },
  { nama: 'Musringah, S.S.', email: 'musringah@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Instructor' },
  { nama: 'Iwan Setiawan, M.Pd.', email: 'iwan@ltecruise.sch.id', role: 'instruktur', jabatan: 'English Instructor' },
  { nama: 'Riza Harsydu', email: 'riza@ltecruise.sch.id', role: 'instruktur', jabatan: 'F&B Service Instructor' },
  { nama: 'Aldi Maulana', email: 'aldi@ltecruise.sch.id', role: 'instruktur', jabatan: 'F&B Service Instructor' }
];

function determineJurusan(jabatan) {
  const j = jabatan.toLowerCase();
  if (j.includes('housekeeping')) return 'housekeeping';
  if (j.includes('f&b product') || j.includes('pastry')) return 'fnb_product';
  if (j.includes('f&b service')) return 'fnb_service';
  return 'general';
}

async function seedTutors() {
  console.log('🚢 LTE Cruise AIS — Seeding Tutors/Karyawan...\n');

  for (const u of newUsers) {
    const password = 'ltecruise2025'; // Default password

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
        password: password,
        email_confirm: true,
        user_metadata: { nama: u.nama },
        app_metadata: { role: u.role },
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      if (result.message && result.message.includes('User already registered')) {
        console.log(`  ℹ️  ${u.email} sudah ada.`);
      } else {
        console.log(`  ⚠️  ${u.email}: ${result.msg || result.message || JSON.stringify(result)}`);
      }
      continue;
    }

    const authId = result.id;
    console.log(`  ✅ Auth: ${u.email} → ${authId}`);

    // 2. Insert ke public.users
    const jurusan = determineJurusan(u.jabatan);

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
        nama_lengkap: u.nama,
        email: u.email,
        role: u.role,
        program: 'diploma1',
        jurusan: jurusan,
        status_aktif: true,
      }),
    });

    if (insertRes.ok) {
      console.log(`  ✅ DB:   ${u.nama} (${u.jabatan} - ${jurusan})`);
    } else {
      const err = await insertRes.text();
      console.log(`  ⚠️  DB:   ${u.nama}: ${err}`);
    }
  }

  console.log('\n🎉 Seeding selesai!');
}

seedTutors();
