-- ============================================================
-- LTE CRUISE AIS — DATABASE SCHEMA
-- Academic Information System for LTE Cruise
-- Leading Tourism Education — Kampung Inggris, Pare, Kediri
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('mahasiswa', 'instruktur', 'admin', 'headmaster');
CREATE TYPE program_studi AS ENUM ('diploma1', 'executive', 'english_cruise');
CREATE TYPE jurusan_type AS ENUM ('housekeeping', 'fnb_product', 'fnb_service', 'general');
CREATE TYPE jenis_kelamin AS ENUM ('L', 'P');
CREATE TYPE ukuran_seragam AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');
CREATE TYPE fase_akademik AS ENUM ('fase_kelas', 'fase_ojt', 'fase_akhir');
CREATE TYPE hari_type AS ENUM ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu');
CREATE TYPE status_absensi AS ENUM ('hadir', 'izin', 'sakit', 'alpha');
CREATE TYPE metode_absensi AS ENUM ('qr_scan', 'manual', 'online');
CREATE TYPE status_laporan_ojt AS ENUM ('belum_mulai', 'sedang_berjalan', 'laporan_dikirim', 'disetujui', 'ditolak');
CREATE TYPE predikat_kelulusan AS ENUM ('Memuaskan', 'Sangat_Memuaskan', 'Dengan_Pujian');
CREATE TYPE status_penyaluran AS ENUM ('belum_disalurkan', 'proses_interview', 'sudah_bekerja');
CREATE TYPE kategori_pengumuman AS ENUM ('umum', 'akademik', 'ojt', 'wisuda', 'interview_kapal', 'lowongan_kerja');
CREATE TYPE jenis_interview AS ENUM ('kapal_pesiar', 'hotel_luar_negeri');
CREATE TYPE status_interview AS ENUM ('akan_datang', 'sedang_berlangsung', 'selesai');

-- ============================================================
-- TABLE: users
-- Central user table linked to Supabase Auth
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nim VARCHAR(15) UNIQUE, -- Format: LTE-YYYY-XXX
    nama_lengkap VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'mahasiswa',
    program program_studi,
    jurusan jurusan_type DEFAULT 'general',
    angkatan VARCHAR(50), -- e.g., "Angkatan 24"
    periode_masuk DATE,
    status_aktif BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_nim ON users(nim);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_program ON users(program);
CREATE INDEX idx_users_jurusan ON users(jurusan);
CREATE INDEX idx_users_angkatan ON users(angkatan);

-- ============================================================
-- TABLE: mahasiswa_profile
-- Extended profile for students
-- ============================================================

CREATE TABLE mahasiswa_profile (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    jenis_kelamin jenis_kelamin,
    alamat_lengkap TEXT,
    kota_asal VARCHAR(100),
    provinsi_asal VARCHAR(100),
    no_hp VARCHAR(20),
    no_hp_darurat VARCHAR(20),
    nama_wali VARCHAR(255),
    hubungan_wali VARCHAR(50),
    no_hp_wali VARCHAR(20),
    asal_sekolah VARCHAR(255),
    tahun_lulus INTEGER,
    motivasi_bergabung TEXT,
    ukuran_seragam ukuran_seragam,
    foto_ktp_url TEXT,
    foto_ijazah_url TEXT,
    is_onboarded BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false, -- Admin verified
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: mata_pelajaran
-- Courses/subjects offered
-- ============================================================

CREATE TABLE mata_pelajaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_mapel VARCHAR(20) UNIQUE NOT NULL,
    nama_mapel VARCHAR(255) NOT NULL,
    program program_studi NOT NULL,
    jurusan jurusan_type NOT NULL DEFAULT 'general',
    fase fase_akademik NOT NULL,
    sks INTEGER NOT NULL DEFAULT 1,
    deskripsi TEXT,
    instruktur_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mapel_program ON mata_pelajaran(program);
CREATE INDEX idx_mapel_jurusan ON mata_pelajaran(jurusan);
CREATE INDEX idx_mapel_instruktur ON mata_pelajaran(instruktur_id);

-- ============================================================
-- TABLE: jadwal
-- Class schedules
-- ============================================================

CREATE TABLE jadwal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mata_pelajaran_id UUID NOT NULL REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    instruktur_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kelas VARCHAR(50) NOT NULL, -- e.g., "D1-HK-24A"
    hari hari_type NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    ruangan VARCHAR(100),
    tanggal_efektif_mulai DATE NOT NULL,
    tanggal_efektif_selesai DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT jadwal_waktu_check CHECK (jam_selesai > jam_mulai),
    CONSTRAINT jadwal_tanggal_check CHECK (tanggal_efektif_selesai >= tanggal_efektif_mulai)
);

CREATE INDEX idx_jadwal_mapel ON jadwal(mata_pelajaran_id);
CREATE INDEX idx_jadwal_instruktur ON jadwal(instruktur_id);
CREATE INDEX idx_jadwal_kelas ON jadwal(kelas);
CREATE INDEX idx_jadwal_hari ON jadwal(hari);

-- ============================================================
-- TABLE: absensi
-- Attendance records
-- ============================================================

CREATE TABLE absensi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mahasiswa_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jadwal_id UUID NOT NULL REFERENCES jadwal(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    status status_absensi NOT NULL DEFAULT 'alpha',
    metode metode_absensi NOT NULL DEFAULT 'manual',
    keterangan TEXT,
    dicatat_oleh UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT absensi_unique UNIQUE (mahasiswa_id, jadwal_id, tanggal)
);

CREATE INDEX idx_absensi_mahasiswa ON absensi(mahasiswa_id);
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);
CREATE INDEX idx_absensi_jadwal ON absensi(jadwal_id);
CREATE INDEX idx_absensi_status ON absensi(status);

-- ============================================================
-- TABLE: nilai
-- Academic grades
-- ============================================================

CREATE TABLE nilai (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mahasiswa_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mata_pelajaran_id UUID NOT NULL REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    semester VARCHAR(20) NOT NULL DEFAULT '1',
    nilai_teori NUMERIC(5,2) CHECK (nilai_teori >= 0 AND nilai_teori <= 100),
    nilai_praktek NUMERIC(5,2) CHECK (nilai_praktek >= 0 AND nilai_praktek <= 100),
    nilai_attitude NUMERIC(5,2) CHECK (nilai_attitude >= 0 AND nilai_attitude <= 100),
    nilai_bahasa_inggris NUMERIC(5,2) CHECK (nilai_bahasa_inggris >= 0 AND nilai_bahasa_inggris <= 100),
    nilai_akhir NUMERIC(5,2), -- Auto-calculated: teori 30% + praktek 40% + attitude 15% + english 15%
    grade VARCHAR(2), -- A/B/C/D/E
    keterangan_instruktur TEXT,
    instruktur_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT nilai_unique UNIQUE (mahasiswa_id, mata_pelajaran_id, semester)
);

CREATE INDEX idx_nilai_mahasiswa ON nilai(mahasiswa_id);
CREATE INDEX idx_nilai_mapel ON nilai(mata_pelajaran_id);

-- ============================================================
-- TABLE: ojt_records
-- On-the-Job Training records
-- ============================================================

CREATE TABLE ojt_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mahasiswa_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama_hotel_tempat_magang VARCHAR(255) NOT NULL,
    bintang_hotel INTEGER CHECK (bintang_hotel >= 1 AND bintang_hotel <= 5),
    kota VARCHAR(100),
    negara VARCHAR(100) NOT NULL DEFAULT 'Indonesia',
    posisi_magang VARCHAR(100),
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    nama_supervisor VARCHAR(255),
    kontak_supervisor VARCHAR(100),
    nilai_ojt_hotel NUMERIC(5,2) CHECK (nilai_ojt_hotel >= 0 AND nilai_ojt_hotel <= 100),
    nilai_ojt_instruktur NUMERIC(5,2) CHECK (nilai_ojt_instruktur >= 0 AND nilai_ojt_instruktur <= 100),
    nilai_ojt_akhir NUMERIC(5,2),
    status_laporan status_laporan_ojt NOT NULL DEFAULT 'belum_mulai',
    catatan_instruktur TEXT,
    dokumen_surat_penerimaan_url TEXT,
    dokumen_laporan_mingguan_url TEXT[] DEFAULT '{}',
    dokumen_laporan_akhir_url TEXT,
    foto_kegiatan_urls TEXT[] DEFAULT '{}',
    instruktur_pembimbing_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ojt_tanggal_check CHECK (tanggal_selesai >= tanggal_mulai)
);

CREATE INDEX idx_ojt_mahasiswa ON ojt_records(mahasiswa_id);
CREATE INDEX idx_ojt_status ON ojt_records(status_laporan);
CREATE INDEX idx_ojt_negara ON ojt_records(negara);

-- ============================================================
-- TABLE: sertifikat_alumni
-- Graduation certificates & alumni tracking
-- ============================================================

CREATE TABLE sertifikat_alumni (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mahasiswa_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nomor_sertifikat VARCHAR(50) UNIQUE NOT NULL, -- Format: LTE/CERT/YYYY/XXX
    tanggal_lulus DATE NOT NULL,
    ipk_akhir NUMERIC(4,2),
    predikat predikat_kelulusan NOT NULL,
    tempat_ojt_terakhir VARCHAR(255),
    status_penyaluran status_penyaluran NOT NULL DEFAULT 'belum_disalurkan',
    nama_kapal_hotel_kerja VARCHAR(255),
    perusahaan_agensi VARCHAR(255),
    negara_kerja VARCHAR(100),
    posisi_kerja VARCHAR(100),
    tanggal_berangkat_kerja DATE,
    gaji_estimasi NUMERIC(15,2), -- Only visible to admin
    issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sertifikat_mahasiswa ON sertifikat_alumni(mahasiswa_id);
CREATE INDEX idx_sertifikat_nomor ON sertifikat_alumni(nomor_sertifikat);
CREATE INDEX idx_sertifikat_status ON sertifikat_alumni(status_penyaluran);

-- ============================================================
-- TABLE: pengumuman
-- Announcements
-- ============================================================

CREATE TABLE pengumuman (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul VARCHAR(500) NOT NULL,
    konten TEXT NOT NULL, -- HTML from Tiptap
    kategori kategori_pengumuman NOT NULL DEFAULT 'umum',
    target_program program_studi[] DEFAULT '{diploma1,executive,english_cruise}',
    target_jurusan jurusan_type[] DEFAULT '{housekeeping,fnb_product,fnb_service,general}',
    penulis_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    publish_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expired_at TIMESTAMPTZ,
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pengumuman_kategori ON pengumuman(kategori);
CREATE INDEX idx_pengumuman_publish ON pengumuman(publish_at);
CREATE INDEX idx_pengumuman_expired ON pengumuman(expired_at);

-- ============================================================
-- TABLE: ktm_digital
-- Digital Student ID Cards
-- ============================================================

CREATE TABLE ktm_digital (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mahasiswa_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qr_payload TEXT NOT NULL, -- Encrypted JSON
    is_active BOOLEAN NOT NULL DEFAULT true,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expired_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ktm_mahasiswa ON ktm_digital(mahasiswa_id);

-- ============================================================
-- TABLE: interview_sessions
-- Cruise ship & hotel interview sessions
-- ============================================================

CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_perusahaan_agensi VARCHAR(255) NOT NULL,
    jenis jenis_interview NOT NULL,
    tanggal_interview DATE NOT NULL,
    lokasi VARCHAR(255),
    kuota INTEGER NOT NULL DEFAULT 0,
    deskripsi TEXT,
    requirements TEXT,
    dokumen_yang_dibutuhkan TEXT[] DEFAULT '{}',
    pendaftar_ids UUID[] DEFAULT '{}',
    approved_ids UUID[] DEFAULT '{}',
    rejected_ids UUID[] DEFAULT '{}',
    status status_interview NOT NULL DEFAULT 'akan_datang',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_tanggal ON interview_sessions(tanggal_interview);
CREATE INDEX idx_interview_status ON interview_sessions(status);

-- ============================================================
-- TABLE: absensi_sessions
-- Online & QR attendance sessions
-- ============================================================

CREATE TABLE absensi_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jadwal_id UUID NOT NULL REFERENCES jadwal(id) ON DELETE CASCADE,
    instruktur_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    metode metode_absensi NOT NULL,
    qr_token TEXT, -- Unique token for QR code
    qr_expired_at TIMESTAMPTZ, -- QR expires in 15 minutes
    session_expired_at TIMESTAMPTZ, -- Online session window
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_absensi_session_jadwal ON absensi_sessions(jadwal_id);
CREATE INDEX idx_absensi_session_token ON absensi_sessions(qr_token);

-- ============================================================
-- TABLE: audit_log
-- System audit trail
-- ============================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ============================================================
-- TABLE: notifications
-- In-app notifications
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info', -- info, warning, success, error
    link VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================================
-- TABLE: system_settings
-- Global system configuration
-- ============================================================

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mahasiswa_profile_updated_at BEFORE UPDATE ON mahasiswa_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mata_pelajaran_updated_at BEFORE UPDATE ON mata_pelajaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jadwal_updated_at BEFORE UPDATE ON jadwal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_absensi_updated_at BEFORE UPDATE ON absensi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nilai_updated_at BEFORE UPDATE ON nilai FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ojt_records_updated_at BEFORE UPDATE ON ojt_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sertifikat_alumni_updated_at BEFORE UPDATE ON sertifikat_alumni FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pengumuman_updated_at BEFORE UPDATE ON pengumuman FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ktm_digital_updated_at BEFORE UPDATE ON ktm_digital FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_sessions_updated_at BEFORE UPDATE ON interview_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_absensi_sessions_updated_at BEFORE UPDATE ON absensi_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: Auto-calculate nilai_akhir and grade
-- Formula: Teori 30% + Praktek 40% + Attitude 15% + Bahasa Inggris 15%
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_nilai_akhir()
RETURNS TRIGGER AS $$
BEGIN
    -- Only calculate if all components are present
    IF NEW.nilai_teori IS NOT NULL 
       AND NEW.nilai_praktek IS NOT NULL 
       AND NEW.nilai_attitude IS NOT NULL 
       AND NEW.nilai_bahasa_inggris IS NOT NULL THEN
        
        NEW.nilai_akhir = ROUND(
            (NEW.nilai_teori * 0.30) + 
            (NEW.nilai_praktek * 0.40) + 
            (NEW.nilai_attitude * 0.15) + 
            (NEW.nilai_bahasa_inggris * 0.15), 2
        );
        
        -- Determine grade
        NEW.grade = CASE
            WHEN NEW.nilai_akhir >= 85 THEN 'A'
            WHEN NEW.nilai_akhir >= 75 THEN 'B'
            WHEN NEW.nilai_akhir >= 65 THEN 'C'
            WHEN NEW.nilai_akhir >= 55 THEN 'D'
            ELSE 'E'
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_nilai
BEFORE INSERT OR UPDATE ON nilai
FOR EACH ROW
EXECUTE FUNCTION calculate_nilai_akhir();

-- ============================================================
-- FUNCTION: Auto-calculate OJT final score
-- Average of hotel score and instructor score
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_ojt_nilai_akhir()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.nilai_ojt_hotel IS NOT NULL AND NEW.nilai_ojt_instruktur IS NOT NULL THEN
        NEW.nilai_ojt_akhir = ROUND((NEW.nilai_ojt_hotel + NEW.nilai_ojt_instruktur) / 2, 2);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_ojt_nilai
BEFORE INSERT OR UPDATE ON ojt_records
FOR EACH ROW
EXECUTE FUNCTION calculate_ojt_nilai_akhir();

-- ============================================================
-- FUNCTION: Auto-generate certificate number
-- Format: LTE/CERT/YYYY/XXX
-- ============================================================

CREATE OR REPLACE FUNCTION generate_nomor_sertifikat()
RETURNS TRIGGER AS $$
DECLARE
    year_str TEXT;
    seq_num INTEGER;
    new_nomor TEXT;
BEGIN
    IF NEW.nomor_sertifikat IS NULL OR NEW.nomor_sertifikat = '' THEN
        year_str := TO_CHAR(NEW.tanggal_lulus, 'YYYY');
        
        SELECT COALESCE(MAX(
            CAST(SPLIT_PART(nomor_sertifikat, '/', 4) AS INTEGER)
        ), 0) + 1
        INTO seq_num
        FROM sertifikat_alumni
        WHERE nomor_sertifikat LIKE 'LTE/CERT/' || year_str || '/%';
        
        new_nomor := 'LTE/CERT/' || year_str || '/' || LPAD(seq_num::TEXT, 3, '0');
        NEW.nomor_sertifikat := new_nomor;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_sertifikat
BEFORE INSERT ON sertifikat_alumni
FOR EACH ROW
EXECUTE FUNCTION generate_nomor_sertifikat();

-- ============================================================
-- FUNCTION: Increment pengumuman views
-- ============================================================

CREATE OR REPLACE FUNCTION increment_views(announcement_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE pengumuman SET views_count = views_count + 1 WHERE id = announcement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
