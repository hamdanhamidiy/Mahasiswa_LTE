// ============================================================
// SEED ADDITIONAL DATA — Pengumuman, Absensi, Nilai
// Jalankan: node supabase/seed-additional-data.mjs
// ============================================================

const SUPABASE_URL = 'https://oanlpiwbciaxvczczkom.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbmxwaXdiY2lheHZjemN6a29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk3MDk0OSwiZXhwIjoyMDk0NTQ2OTQ5fQ.Z7M11syzihmXtMLHjAJbcVTwhLQ6TT-CxzGOGySov70';

async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': method === 'POST' ? 'return=representation' : undefined,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${method} ${path}: ${res.status} ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function run() {
  console.log('🚢 Seeding additional data...\n');

  // 1. Get all users and mapel for reference IDs
  const users = await api('users?select=id,email,role,nim');
  const mapels = await api('mata_pelajaran?select=id,kode_mapel,nama_mapel');
  const jadwals = await api('jadwal?select=id,mata_pelajaran_id');

  const mahasiswas = users.filter(u => u.role === 'mahasiswa');
  const instrukturs = users.filter(u => u.role === 'instruktur');
  const admin = users.find(u => u.role === 'admin');

  console.log(`  ${mahasiswas.length} mahasiswa, ${instrukturs.length} instruktur, ${mapels.length} mapel, ${jadwals.length} jadwal\n`);

  // 2. Seed Pengumuman
  console.log('📣 Seeding Pengumuman...');
  const pengumumanData = [
    { judul: 'Jadwal Interview PT Alpha Magsaysay — Februari 2025', konten: 'Kepada seluruh mahasiswa LTE Cruise,\n\nSesi interview untuk posisi kapal pesiar dari PT Alpha Magsaysay akan diadakan pada 20 Februari 2025 di Kampus LTE Cruise.\n\nSyarat:\n- Sudah menyelesaikan Fase Kelas\n- Nilai rata-rata minimal 75\n- Kemampuan bahasa Inggris aktif\n\nPendaftaran: Hubungi bagian administrasi paling lambat 15 Februari 2025.', kategori: 'interview_kapal', target_program: ['diploma1'], target_jurusan: ['housekeeping','fnb_product','fnb_service'], is_pinned: true, publish_at: new Date(Date.now() - 2*60*60*1000).toISOString() },
    { judul: 'Pengumpulan Laporan OJT Minggu ke-8', konten: 'Reminder untuk mahasiswa yang sedang OJT:\n\nBatas akhir pengumpulan laporan mingguan OJT minggu ke-8 adalah hari Jumat, 14 Februari 2025.\n\nFormat laporan:\n1. Deskripsi kegiatan harian\n2. Foto dokumentasi kegiatan\n3. Evaluasi dan refleksi\n\nUpload melalui menu OJT Tracker > Laporan Mingguan.', kategori: 'ojt', target_program: ['diploma1'], target_jurusan: ['housekeeping','fnb_product','fnb_service'], is_pinned: false, publish_at: new Date(Date.now() - 5*60*60*1000).toISOString() },
    { judul: 'Perubahan Jadwal Kelas Bahasa Inggris', konten: 'Mulai minggu depan, jadwal English for Hospitality (GN-101) dipindah ke hari Selasa pukul 10:30 - 12:30 di Ruang A1.\n\nJadwal lama: Senin 08:00 - 10:00\nJadwal baru: Selasa 10:30 - 12:30\n\nPerubahan ini berlaku efektif mulai 17 Februari 2025.', kategori: 'akademik', target_program: ['diploma1'], target_jurusan: ['housekeeping','fnb_product','fnb_service','general'], is_pinned: false, publish_at: new Date(Date.now() - 24*60*60*1000).toISOString() },
    { judul: 'Informasi Wisuda Angkatan 23', konten: 'Wisuda Angkatan 23 akan dilaksanakan pada:\n\nTanggal: 28 Februari 2025\nWaktu: 09:00 WIB\nTempat: Aula Utama LTE Cruise\n\nDress code: Formal (Jas & Batik)\n\nUndangan akan dibagikan melalui email masing-masing alumni.', kategori: 'wisuda', target_program: ['diploma1'], target_jurusan: ['housekeeping','fnb_product','fnb_service'], is_pinned: false, publish_at: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
    { judul: 'Lowongan Kerja: Royal Caribbean Cruise Line', konten: 'Royal Caribbean International membuka lowongan untuk posisi:\n\n1. Housekeeping Attendant - 10 posisi\n2. F&B Steward - 8 posisi\n3. Galley Utility - 5 posisi\n\nKualifikasi:\n- Lulusan LTE Cruise\n- Pengalaman OJT minimal 6 bulan\n- TOEIC Score minimal 450\n\nDeadline: 1 Maret 2025', kategori: 'lowongan_kerja', target_program: ['diploma1'], target_jurusan: ['housekeeping','fnb_product','fnb_service'], is_pinned: false, publish_at: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
    { judul: 'Jadwal Ujian Tengah Semester Ganjil 2025', konten: 'Ujian Tengah Semester (UTS) akan dilaksanakan pada:\n\nTanggal: 3-7 Maret 2025\nWaktu: Sesuai jadwal kelas masing-masing\n\nMateri: Seluruh materi yang telah diajarkan sampai dengan minggu ke-6.\n\nPastikan seluruh tugas sudah dikumpulkan sebelum UTS dimulai.', kategori: 'akademik', target_program: ['diploma1'], target_jurusan: ['housekeeping','fnb_product','fnb_service','general'], is_pinned: false, publish_at: new Date(Date.now() - 4*24*60*60*1000).toISOString() },
  ];

  for (const p of pengumumanData) {
    try {
      await api('pengumuman', 'POST', { ...p, penulis_id: admin.id, views_count: Math.floor(Math.random() * 50) + 5 });
      console.log(`  ✅ ${p.judul.substring(0, 50)}...`);
    } catch (e) { console.log(`  ⚠️  ${e.message.substring(0, 80)}`); }
  }

  // 3. Seed Nilai for mahasiswa
  console.log('\n📊 Seeding Nilai...');
  const instrukturMap = {};
  instrukturs.forEach(i => instrukturMap[i.email.split('@')[0]] = i.id);

  for (const mhs of mahasiswas) {
    for (const mapel of mapels) {
      const teori = 65 + Math.floor(Math.random() * 30);
      const praktek = 70 + Math.floor(Math.random() * 28);
      const attitude = 75 + Math.floor(Math.random() * 25);
      const english = 65 + Math.floor(Math.random() * 30);
      const akhir = +(teori * 0.30 + praktek * 0.40 + attitude * 0.15 + english * 0.15).toFixed(1);
      const grade = akhir >= 85 ? 'A' : akhir >= 75 ? 'B' : akhir >= 65 ? 'C' : akhir >= 55 ? 'D' : 'E';

      try {
        await api('nilai', 'POST', {
          mahasiswa_id: mhs.id,
          mata_pelajaran_id: mapel.id,
          semester: 'Semester 1',
          nilai_teori: teori,
          nilai_praktek: praktek,
          nilai_attitude: attitude,
          nilai_bahasa_inggris: english,
          nilai_akhir: akhir,
          grade,
          instruktur_id: instrukturs[0].id,
        });
      } catch (e) { /* skip duplicates */ }
    }
    console.log(`  ✅ Nilai: ${mhs.nim}`);
  }

  // 4. Seed Absensi
  console.log('\n📋 Seeding Absensi...');
  const today = new Date();
  for (const mhs of mahasiswas) {
    for (const jadwal of jadwals) {
      // Create 12 attendance records per jadwal
      for (let week = 0; week < 12; week++) {
        const tanggal = new Date(today);
        tanggal.setDate(tanggal.getDate() - (12 - week) * 7);
        const rand = Math.random();
        const status = rand > 0.15 ? 'hadir' : rand > 0.08 ? 'izin' : rand > 0.03 ? 'sakit' : 'alpha';
        try {
          await api('absensi', 'POST', {
            mahasiswa_id: mhs.id,
            jadwal_id: jadwal.id,
            tanggal: tanggal.toISOString().split('T')[0],
            status,
            metode: status === 'hadir' ? 'qr_scan' : 'manual',
          });
        } catch (e) { /* skip */ }
      }
    }
    console.log(`  ✅ Absensi: ${mhs.nim}`);
  }

  // 5. Seed Interview Sessions
  console.log('\n🎤 Seeding Interview Sessions...');
  const interviewData = [
    { nama_perusahaan_agensi: 'PT Alpha Magsaysay', jenis: 'kapal_pesiar', tanggal_interview: '2025-02-20', lokasi: 'Kampus LTE Cruise', kuota: 30, deskripsi: 'Interview untuk posisi kapal pesiar internasional', requirements: 'Nilai rata-rata minimal 75, TOEIC 450+', dokumen_yang_dibutuhkan: ['CV','Foto','Ijazah','TOEIC Score'], pendaftar_ids: mahasiswas.slice(0,8).map(m=>m.id), approved_ids: [], rejected_ids: [], status: 'akan_datang', created_by: admin.id },
    { nama_perusahaan_agensi: 'Royal Caribbean International', jenis: 'kapal_pesiar', tanggal_interview: '2025-03-15', lokasi: 'Hotel Santika Kediri', kuota: 25, deskripsi: 'Open recruitment untuk berbagai posisi di kapal pesiar Royal Caribbean', requirements: 'Fresh graduate / experienced, good English', dokumen_yang_dibutuhkan: ['CV','Foto','Sertifikat OJT'], pendaftar_ids: mahasiswas.slice(0,5).map(m=>m.id), approved_ids: [], rejected_ids: [], status: 'akan_datang', created_by: admin.id },
    { nama_perusahaan_agensi: 'Marriott International', jenis: 'hotel_luar_negeri', tanggal_interview: '2025-01-10', lokasi: 'Kampus LTE Cruise', kuota: 20, deskripsi: 'Interview untuk posisi hotel bintang 5 Marriott di UAE', requirements: 'OJT completed, English proficiency', dokumen_yang_dibutuhkan: ['CV','Foto','Laporan OJT'], pendaftar_ids: mahasiswas.map(m=>m.id), approved_ids: mahasiswas.slice(0,3).map(m=>m.id), rejected_ids: [], status: 'selesai', created_by: admin.id },
  ];

  for (const interview of interviewData) {
    try {
      await api('interview_sessions', 'POST', interview);
      console.log(`  ✅ ${interview.nama_perusahaan_agensi}`);
    } catch (e) { console.log(`  ⚠️  ${e.message.substring(0, 80)}`); }
  }

  console.log('\n🎉 Seeding tambahan selesai!');
}

run().catch(console.error);
