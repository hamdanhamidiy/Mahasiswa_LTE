-- ============================================================
-- MIGRATION: Tambah tabel pembayaran & mitra_kerja
-- LTE CRUISE AIS
-- ============================================================

-- ENUM untuk status pembayaran
CREATE TYPE status_pembayaran AS ENUM ('belum_bayar', 'menunggu_verifikasi', 'terverifikasi', 'ditolak', 'kadaluarsa');
CREATE TYPE jenis_pembayaran AS ENUM ('spp', 'registrasi', 'seragam', 'ujian', 'sertifikat', 'lainnya');

-- ============================================================
-- TABLE: pembayaran
-- Student payment records
-- ============================================================

CREATE TABLE pembayaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mahasiswa_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jenis jenis_pembayaran NOT NULL DEFAULT 'spp',
    deskripsi VARCHAR(255) NOT NULL,
    nominal NUMERIC(15,2) NOT NULL,
    tanggal_jatuh_tempo DATE NOT NULL,
    tanggal_bayar TIMESTAMPTZ,
    bukti_pembayaran_url TEXT,
    metode_pembayaran VARCHAR(50), -- 'transfer_bank', 'tunai', 'qris'
    nomor_referensi VARCHAR(100),
    status status_pembayaran NOT NULL DEFAULT 'belum_bayar',
    catatan TEXT,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pembayaran_mahasiswa ON pembayaran(mahasiswa_id);
CREATE INDEX idx_pembayaran_status ON pembayaran(status);
CREATE INDEX idx_pembayaran_jatuh_tempo ON pembayaran(tanggal_jatuh_tempo);

CREATE TRIGGER update_pembayaran_updated_at BEFORE UPDATE ON pembayaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: mitra_kerja
-- Partner companies (cruise ships, hotels, agencies)
-- ============================================================

CREATE TABLE mitra_kerja (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL,
    jenis VARCHAR(50) NOT NULL DEFAULT 'hotel', -- 'hotel', 'kapal_pesiar', 'agensi', 'resort'
    negara VARCHAR(100) NOT NULL,
    kota VARCHAR(100),
    deskripsi TEXT,
    logo_url TEXT,
    website_url TEXT,
    bintang INTEGER CHECK (bintang >= 1 AND bintang <= 5),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    alumni_bekerja INTEGER NOT NULL DEFAULT 0,
    posisi_tersedia TEXT[] DEFAULT '{}',
    kontak_person VARCHAR(255),
    kontak_email VARCHAR(255),
    kontak_telepon VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mitra_kerja_jenis ON mitra_kerja(jenis);
CREATE INDEX idx_mitra_kerja_negara ON mitra_kerja(negara);
CREATE INDEX idx_mitra_kerja_featured ON mitra_kerja(is_featured);

CREATE TRIGGER update_mitra_kerja_updated_at BEFORE UPDATE ON mitra_kerja FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED: 1 dummy record per table for testing
-- ============================================================

-- Note: pembayaran requires a valid mahasiswa_id from users table
-- This insert will only work if users table has data
-- INSERT INTO pembayaran (mahasiswa_id, jenis, deskripsi, nominal, tanggal_jatuh_tempo, status)
-- VALUES ((SELECT id FROM users WHERE role = 'mahasiswa' LIMIT 1), 'spp', 'SPP Semester 1 - Angkatan 25', 5500000, '2025-08-15', 'belum_bayar');

INSERT INTO mitra_kerja (nama, jenis, negara, kota, deskripsi, bintang, is_featured, alumni_bekerja, posisi_tersedia)
VALUES (
    'Royal Caribbean International',
    'kapal_pesiar',
    'Amerika Serikat',
    'Miami',
    'Perusahaan kapal pesiar terbesar di dunia. Menyediakan kesempatan magang dan kerja bagi lulusan LTE Cruise di berbagai departemen.',
    5,
    true,
    24,
    ARRAY['Cabin Steward', 'F&B Service', 'Housekeeping', 'Bar Waiter']
);
