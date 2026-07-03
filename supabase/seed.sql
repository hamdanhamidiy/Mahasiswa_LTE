-- ============================================================
-- LTE CRUISE AIS — SEED DATA
-- Jalankan SETELAH schema.sql dan rls_policies.sql
-- ============================================================

-- ============================================================
-- STEP 1: Buat user di auth.users terlebih dahulu
-- Ini WAJIB karena tabel public.users memiliki FK ke auth.users
-- Password default untuk semua user: "ltecruise2025"
-- ============================================================

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at, confirmation_token)
VALUES
-- Admin
('a0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Admin LTE Cruise"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
-- Headmaster
('a0000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'direktur@ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Nur Haidi"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
-- Instruktur
('b0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'ratna@ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Ratna Dewi"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
('b0000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'ahmad@ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Chef Ahmad"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
('b0000003-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'budi@ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Budi Santoso"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
-- Mahasiswa Angkatan 24
('c0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'rina@student.ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Rina Maharani"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
('c0000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'dimas@student.ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Dimas Pratama"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
('c0000003-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'siti@student.ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Siti Nurhaliza"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
('c0000004-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'agus@student.ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Agus Setiawan"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
('c0000005-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'putri@student.ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Putri Amelia"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
-- Mahasiswa Angkatan 25
('c0000006-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'fajar@student.ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Fajar Nugroho"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
('c0000007-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'maya@student.ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Maya Sari"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
('c0000008-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'rizky@student.ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Rizky Ramadan"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
('c0000009-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'dewi@student.ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Dewi Lestari"}', 'authenticated', 'authenticated', NOW(), NOW(), ''),
('c0000010-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'hendra@student.ltecruise.sch.id', crypt('ltecruise2025', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"nama":"Hendra Wijaya"}', 'authenticated', 'authenticated', NOW(), NOW(), '');

-- Buat juga identities agar login berfungsi
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT id, id, json_build_object('sub', id, 'email', email), 'email', id, NOW(), NOW(), NOW()
FROM auth.users
WHERE id IN (
  'a0000001-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000002', 'b0000003-0000-0000-0000-000000000003',
  'c0000001-0000-0000-0000-000000000001', 'c0000002-0000-0000-0000-000000000002', 'c0000003-0000-0000-0000-000000000003',
  'c0000004-0000-0000-0000-000000000004', 'c0000005-0000-0000-0000-000000000005', 'c0000006-0000-0000-0000-000000000006',
  'c0000007-0000-0000-0000-000000000007', 'c0000008-0000-0000-0000-000000000008', 'c0000009-0000-0000-0000-000000000009',
  'c0000010-0000-0000-0000-000000000010'
);

-- ============================================================
-- STEP 2: Sekarang baru insert ke public.users
-- FK constraint terpenuhi karena auth.users sudah ada
-- ============================================================

-- Admin
INSERT INTO users (id, nim, nama_lengkap, email, role, program, jurusan, angkatan, periode_masuk, status_aktif) VALUES
('a0000001-0000-0000-0000-000000000001', NULL, 'Admin LTE Cruise', 'admin@ltecruise.sch.id', 'admin', NULL, NULL, NULL, NULL, true);

-- Headmaster
INSERT INTO users (id, nim, nama_lengkap, email, role, program, jurusan, angkatan, periode_masuk, status_aktif) VALUES
('a0000002-0000-0000-0000-000000000002', NULL, 'Nur Haidi, BA. IR.', 'direktur@ltecruise.sch.id', 'headmaster', NULL, NULL, NULL, NULL, true);

-- Instruktur
INSERT INTO users (id, nim, nama_lengkap, email, role, program, jurusan, angkatan, periode_masuk, status_aktif) VALUES
('b0000001-0000-0000-0000-000000000001', NULL, 'Ratna Dewi, S.Pd', 'ratna@ltecruise.sch.id', 'instruktur', 'diploma1', 'housekeeping', NULL, '2020-01-01', true),
('b0000002-0000-0000-0000-000000000002', NULL, 'Chef Ahmad Fauzi', 'ahmad@ltecruise.sch.id', 'instruktur', 'diploma1', 'fnb_product', NULL, '2019-06-01', true),
('b0000003-0000-0000-0000-000000000003', NULL, 'Budi Santoso, S.Par', 'budi@ltecruise.sch.id', 'instruktur', 'diploma1', 'fnb_service', NULL, '2021-03-01', true);

-- Mahasiswa Angkatan 24
INSERT INTO users (id, nim, nama_lengkap, email, role, program, jurusan, angkatan, periode_masuk, status_aktif) VALUES
('c0000001-0000-0000-0000-000000000001', 'LTE-2024-001', 'Rina Maharani', 'rina@student.ltecruise.sch.id', 'mahasiswa', 'diploma1', 'housekeeping', 'Angkatan 24', '2024-01-15', true),
('c0000002-0000-0000-0000-000000000002', 'LTE-2024-002', 'Dimas Pratama', 'dimas@student.ltecruise.sch.id', 'mahasiswa', 'diploma1', 'fnb_product', 'Angkatan 24', '2024-01-15', true),
('c0000003-0000-0000-0000-000000000003', 'LTE-2024-003', 'Siti Nurhaliza', 'siti@student.ltecruise.sch.id', 'mahasiswa', 'diploma1', 'fnb_service', 'Angkatan 24', '2024-01-15', true),
('c0000004-0000-0000-0000-000000000004', 'LTE-2024-004', 'Agus Setiawan', 'agus@student.ltecruise.sch.id', 'mahasiswa', 'diploma1', 'housekeeping', 'Angkatan 24', '2024-01-15', true),
('c0000005-0000-0000-0000-000000000005', 'LTE-2024-005', 'Putri Amelia', 'putri@student.ltecruise.sch.id', 'mahasiswa', 'diploma1', 'fnb_product', 'Angkatan 24', '2024-01-15', true);

-- Mahasiswa Angkatan 25
INSERT INTO users (id, nim, nama_lengkap, email, role, program, jurusan, angkatan, periode_masuk, status_aktif) VALUES
('c0000006-0000-0000-0000-000000000006', 'LTE-2025-001', 'Fajar Nugroho', 'fajar@student.ltecruise.sch.id', 'mahasiswa', 'diploma1', 'housekeeping', 'Angkatan 25', '2025-01-13', true),
('c0000007-0000-0000-0000-000000000007', 'LTE-2025-002', 'Maya Sari', 'maya@student.ltecruise.sch.id', 'mahasiswa', 'diploma1', 'fnb_service', 'Angkatan 25', '2025-01-13', true),
('c0000008-0000-0000-0000-000000000008', 'LTE-2025-003', 'Rizky Ramadan', 'rizky@student.ltecruise.sch.id', 'mahasiswa', 'diploma1', 'fnb_product', 'Angkatan 25', '2025-01-13', true),
('c0000009-0000-0000-0000-000000000009', 'LTE-2025-004', 'Dewi Lestari', 'dewi@student.ltecruise.sch.id', 'mahasiswa', 'diploma1', 'fnb_service', 'Angkatan 25', '2025-01-13', true),
('c0000010-0000-0000-0000-000000000010', 'LTE-2025-005', 'Hendra Wijaya', 'hendra@student.ltecruise.sch.id', 'mahasiswa', 'diploma1', 'housekeeping', 'Angkatan 25', '2025-01-13', true);

-- ============================================================
-- STEP 3: Data lainnya (profiles, mapel, jadwal, settings)
-- ============================================================

-- Mahasiswa Profiles
INSERT INTO mahasiswa_profile (id, tempat_lahir, tanggal_lahir, jenis_kelamin, kota_asal, provinsi_asal, no_hp, asal_sekolah, tahun_lulus, is_onboarded) VALUES
('c0000001-0000-0000-0000-000000000001', 'Surabaya', '2004-03-15', 'P', 'Surabaya', 'Jawa Timur', '081234567001', 'SMAN 1 Surabaya', 2023, true),
('c0000002-0000-0000-0000-000000000002', 'Malang', '2003-07-22', 'L', 'Malang', 'Jawa Timur', '081234567002', 'SMKN 3 Malang', 2023, true),
('c0000003-0000-0000-0000-000000000003', 'Kediri', '2004-11-08', 'P', 'Kediri', 'Jawa Timur', '081234567003', 'SMAN 2 Kediri', 2023, true),
('c0000006-0000-0000-0000-000000000006', 'Jakarta', '2005-01-20', 'L', 'Jakarta', 'DKI Jakarta', '081234567006', 'SMAN 5 Jakarta', 2024, true),
('c0000007-0000-0000-0000-000000000007', 'Bandung', '2005-05-12', 'P', 'Bandung', 'Jawa Barat', '081234567007', 'SMKN 1 Bandung', 2024, true);

-- Mata Pelajaran — Housekeeping
INSERT INTO mata_pelajaran (id, kode_mapel, nama_mapel, program, jurusan, fase, sks, deskripsi, instruktur_id) VALUES
('d0000001-0000-0000-0000-000000000001', 'HK-101', 'Room Division Management', 'diploma1', 'housekeeping', 'fase_kelas', 3, 'Manajemen divisi kamar hotel bintang lima', 'b0000001-0000-0000-0000-000000000001'),
('d0000002-0000-0000-0000-000000000002', 'HK-102', 'Housekeeping Operation', 'diploma1', 'housekeeping', 'fase_kelas', 4, 'Operasional housekeeping sehari-hari', 'b0000001-0000-0000-0000-000000000001'),
('d0000003-0000-0000-0000-000000000003', 'HK-103', 'Laundry & Linen Management', 'diploma1', 'housekeeping', 'fase_kelas', 2, 'Pengelolaan laundry dan linen hotel', 'b0000001-0000-0000-0000-000000000001');

-- Mata Pelajaran — FnB Product
INSERT INTO mata_pelajaran (id, kode_mapel, nama_mapel, program, jurusan, fase, sks, deskripsi, instruktur_id) VALUES
('d0000004-0000-0000-0000-000000000004', 'FP-101', 'Basic Culinary Arts', 'diploma1', 'fnb_product', 'fase_kelas', 4, 'Dasar-dasar seni kuliner internasional', 'b0000002-0000-0000-0000-000000000002'),
('d0000005-0000-0000-0000-000000000005', 'FP-102', 'Pastry & Bakery', 'diploma1', 'fnb_product', 'fase_kelas', 3, 'Teknik pastry dan bakery profesional', 'b0000002-0000-0000-0000-000000000002'),
('d0000006-0000-0000-0000-000000000006', 'FP-103', 'Kitchen Management', 'diploma1', 'fnb_product', 'fase_kelas', 3, 'Manajemen dapur hotel dan kapal pesiar', 'b0000002-0000-0000-0000-000000000002');

-- Mata Pelajaran — FnB Service
INSERT INTO mata_pelajaran (id, kode_mapel, nama_mapel, program, jurusan, fase, sks, deskripsi, instruktur_id) VALUES
('d0000007-0000-0000-0000-000000000007', 'FS-101', 'Restaurant Service', 'diploma1', 'fnb_service', 'fase_kelas', 4, 'Teknik pelayanan restoran fine dining', 'b0000003-0000-0000-0000-000000000003'),
('d0000008-0000-0000-0000-000000000008', 'FS-102', 'Bartending & Mixology', 'diploma1', 'fnb_service', 'fase_kelas', 3, 'Teknik bartending dan mixology', 'b0000003-0000-0000-0000-000000000003'),
('d0000009-0000-0000-0000-000000000009', 'FS-103', 'Banquet & Event Management', 'diploma1', 'fnb_service', 'fase_kelas', 3, 'Manajemen banquet dan event', 'b0000003-0000-0000-0000-000000000003');

-- Mata Pelajaran — Umum (semua jurusan)
INSERT INTO mata_pelajaran (id, kode_mapel, nama_mapel, program, jurusan, fase, sks, deskripsi, instruktur_id) VALUES
('d0000010-0000-0000-0000-000000000010', 'GN-101', 'English for Hospitality', 'diploma1', 'general', 'fase_kelas', 4, 'Bahasa Inggris untuk perhotelan dan kapal pesiar', 'b0000003-0000-0000-0000-000000000003'),
('d0000011-0000-0000-0000-000000000011', 'GN-102', 'Grooming & Personal Development', 'diploma1', 'general', 'fase_kelas', 2, 'Penampilan dan pengembangan diri profesional', 'b0000001-0000-0000-0000-000000000001'),
('d0000012-0000-0000-0000-000000000012', 'GN-103', 'Attitude & Service Excellence', 'diploma1', 'general', 'fase_kelas', 2, 'Sikap profesional dan standar layanan', 'b0000001-0000-0000-0000-000000000001');

-- Sample Jadwal
INSERT INTO jadwal (id, mata_pelajaran_id, instruktur_id, kelas, hari, jam_mulai, jam_selesai, ruangan, tanggal_efektif_mulai, tanggal_efektif_selesai) VALUES
('e0000001-0000-0000-0000-000000000001', 'd0000010-0000-0000-0000-000000000010', 'b0000003-0000-0000-0000-000000000003', 'D1-ALL-25A', 'Senin', '08:00', '10:00', 'Ruang A1', '2025-01-13', '2025-04-13'),
('e0000002-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'D1-HK-25A', 'Senin', '10:30', '12:30', 'Ruang B1', '2025-01-13', '2025-04-13'),
('e0000003-0000-0000-0000-000000000003', 'd0000004-0000-0000-0000-000000000004', 'b0000002-0000-0000-0000-000000000002', 'D1-FP-25A', 'Selasa', '08:00', '12:00', 'Kitchen Lab', '2025-01-13', '2025-04-13'),
('e0000004-0000-0000-0000-000000000004', 'd0000007-0000-0000-0000-000000000007', 'b0000003-0000-0000-0000-000000000003', 'D1-FS-25A', 'Selasa', '13:00', '15:00', 'Ruang C1', '2025-01-13', '2025-04-13'),
('e0000005-0000-0000-0000-000000000005', 'd0000011-0000-0000-0000-000000000011', 'b0000001-0000-0000-0000-000000000001', 'D1-ALL-25A', 'Rabu', '08:00', '10:00', 'Ruang A1', '2025-01-13', '2025-04-13'),
('e0000006-0000-0000-0000-000000000006', 'd0000012-0000-0000-0000-000000000012', 'b0000001-0000-0000-0000-000000000001', 'D1-ALL-25A', 'Kamis', '08:00', '10:00', 'Ruang A1', '2025-01-13', '2025-04-13');

-- System Settings
INSERT INTO system_settings (key, value, description) VALUES
('institution_name', '"LTE Cruise — Leading Tourism Education"', 'Nama lembaga'),
('institution_tagline', '"Your Gateway to Hotel & Cruise Career"', 'Tagline lembaga'),
('institution_address', '"Jl. Pancawarna, Perumahan Oasis Cluster, Tulungrejo, Pare, Kab. Kediri"', 'Alamat lembaga'),
('institution_email', '"ltecruise@gmail.com"', 'Email resmi'),
('institution_website', '"ltecruise.sch.id"', 'Website resmi'),
('director_name', '"Nur Haidi, BA. IR."', 'Nama direktur'),
('nilai_formula', '{"teori": 0.30, "praktek": 0.40, "attitude": 0.15, "bahasa_inggris": 0.15}', 'Formula bobot nilai');
