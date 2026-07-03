-- ============================================================
-- FUNGSI LOOKUP NIM → EMAIL (untuk login)
-- Jalankan ini di Supabase SQL Editor
-- Fungsi ini menggunakan SECURITY DEFINER agar bypass RLS
-- sehingga bisa dipanggil sebelum user login
-- ============================================================

CREATE OR REPLACE FUNCTION public.lookup_nim(nim_input TEXT)
RETURNS TABLE (email TEXT, role user_role) AS $$
BEGIN
    RETURN QUERY
    SELECT u.email::TEXT, u.role
    FROM public.users u
    WHERE u.nim = nim_input AND u.status_aktif = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
