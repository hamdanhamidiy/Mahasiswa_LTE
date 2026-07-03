-- ============================================================
-- LTE CRUISE AIS — ROW LEVEL SECURITY POLICIES
-- ============================================================
-- Jalankan file ini SETELAH schema.sql berhasil dieksekusi.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mahasiswa_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE mata_pelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai ENABLE ROW LEVEL SECURITY;
ALTER TABLE ojt_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sertifikat_alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE ktm_digital ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS (dibuat di schema PUBLIC, bukan auth)
-- Supabase tidak mengizinkan membuat function di schema auth
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_instruktur()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'instruktur');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_headmaster()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'headmaster');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- USERS policies
-- ============================================================
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_instruktur_view" ON users FOR SELECT USING (public.is_instruktur() AND role = 'mahasiswa');
CREATE POLICY "users_admin_all" ON users FOR ALL USING (public.is_admin());
CREATE POLICY "users_headmaster_read" ON users FOR SELECT USING (public.is_headmaster());
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- MAHASISWA_PROFILE policies
-- ============================================================
CREATE POLICY "profile_select_own" ON mahasiswa_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profile_update_own" ON mahasiswa_profile FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profile_insert_own" ON mahasiswa_profile FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profile_instruktur_view" ON mahasiswa_profile FOR SELECT USING (public.is_instruktur());
CREATE POLICY "profile_admin_all" ON mahasiswa_profile FOR ALL USING (public.is_admin());
CREATE POLICY "profile_headmaster_read" ON mahasiswa_profile FOR SELECT USING (public.is_headmaster());

-- ============================================================
-- MATA_PELAJARAN policies
-- ============================================================
CREATE POLICY "mapel_view_all" ON mata_pelajaran FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "mapel_admin_all" ON mata_pelajaran FOR ALL USING (public.is_admin());

-- ============================================================
-- JADWAL policies
-- ============================================================
CREATE POLICY "jadwal_view_all" ON jadwal FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "jadwal_admin_all" ON jadwal FOR ALL USING (public.is_admin());

-- ============================================================
-- ABSENSI policies
-- ============================================================
CREATE POLICY "absensi_select_own" ON absensi FOR SELECT USING (auth.uid() = mahasiswa_id);
CREATE POLICY "absensi_insert_own" ON absensi FOR INSERT WITH CHECK (auth.uid() = mahasiswa_id);
CREATE POLICY "absensi_instruktur_all" ON absensi FOR ALL USING (public.is_instruktur());
CREATE POLICY "absensi_admin_all" ON absensi FOR ALL USING (public.is_admin());
CREATE POLICY "absensi_headmaster_read" ON absensi FOR SELECT USING (public.is_headmaster());

-- ============================================================
-- NILAI policies
-- ============================================================
CREATE POLICY "nilai_select_own" ON nilai FOR SELECT USING (auth.uid() = mahasiswa_id);
CREATE POLICY "nilai_instruktur_all" ON nilai FOR ALL USING (public.is_instruktur());
CREATE POLICY "nilai_admin_all" ON nilai FOR ALL USING (public.is_admin());
CREATE POLICY "nilai_headmaster_read" ON nilai FOR SELECT USING (public.is_headmaster());

-- ============================================================
-- OJT_RECORDS policies
-- ============================================================
CREATE POLICY "ojt_select_own" ON ojt_records FOR SELECT USING (auth.uid() = mahasiswa_id);
CREATE POLICY "ojt_update_own" ON ojt_records FOR UPDATE USING (auth.uid() = mahasiswa_id);
CREATE POLICY "ojt_instruktur_all" ON ojt_records FOR ALL USING (public.is_instruktur());
CREATE POLICY "ojt_admin_all" ON ojt_records FOR ALL USING (public.is_admin());
CREATE POLICY "ojt_headmaster_read" ON ojt_records FOR SELECT USING (public.is_headmaster());

-- ============================================================
-- SERTIFIKAT_ALUMNI policies
-- ============================================================
CREATE POLICY "sertifikat_select_own" ON sertifikat_alumni FOR SELECT USING (auth.uid() = mahasiswa_id);
CREATE POLICY "sertifikat_admin_all" ON sertifikat_alumni FOR ALL USING (public.is_admin());
CREATE POLICY "sertifikat_headmaster_read" ON sertifikat_alumni FOR SELECT USING (public.is_headmaster());

-- ============================================================
-- PENGUMUMAN policies
-- ============================================================
CREATE POLICY "pengumuman_view_published" ON pengumuman FOR SELECT USING (
    auth.uid() IS NOT NULL AND publish_at <= NOW() AND (expired_at IS NULL OR expired_at > NOW())
);
CREATE POLICY "pengumuman_admin_instruktur" ON pengumuman FOR ALL USING (
    public.is_admin() OR (public.is_instruktur() AND penulis_id = auth.uid())
);

-- ============================================================
-- KTM_DIGITAL policies
-- ============================================================
CREATE POLICY "ktm_select_own" ON ktm_digital FOR SELECT USING (auth.uid() = mahasiswa_id);
CREATE POLICY "ktm_admin_all" ON ktm_digital FOR ALL USING (public.is_admin());

-- ============================================================
-- INTERVIEW_SESSIONS policies
-- ============================================================
CREATE POLICY "interview_view_all" ON interview_sessions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "interview_admin_all" ON interview_sessions FOR ALL USING (public.is_admin());

-- ============================================================
-- ABSENSI_SESSIONS policies
-- ============================================================
CREATE POLICY "absensi_sess_view" ON absensi_sessions FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "absensi_sess_instruktur" ON absensi_sessions FOR ALL USING (auth.uid() = instruktur_id);
CREATE POLICY "absensi_sess_admin" ON absensi_sessions FOR ALL USING (public.is_admin());

-- ============================================================
-- AUDIT_LOG policies
-- ============================================================
CREATE POLICY "audit_admin_read" ON audit_log FOR SELECT USING (public.is_admin());
CREATE POLICY "audit_insert" ON audit_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- NOTIFICATIONS policies
-- ============================================================
CREATE POLICY "notif_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_admin_all" ON notifications FOR ALL USING (public.is_admin());

-- ============================================================
-- SYSTEM_SETTINGS policies
-- ============================================================
CREATE POLICY "settings_view_all" ON system_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "settings_admin" ON system_settings FOR ALL USING (public.is_admin());
