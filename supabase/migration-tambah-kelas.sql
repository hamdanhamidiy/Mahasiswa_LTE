-- Tambahkan kolom kelas ke tabel users
ALTER TABLE users ADD COLUMN IF NOT EXISTS kelas VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_users_kelas ON users(kelas);
