import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';

/**
 * GET /api/data?type=<query_type>
 * Server-side data fetching that bypasses RLS using service_role key.
 * Validates the user session before returning data.
 */
export async function GET(request: NextRequest) {
  // 1. Validate user session
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;
  const role = user.app_metadata?.role || 'mahasiswa';
  const type = request.nextUrl.searchParams.get('type');

  // 2. Use admin client to fetch data (bypasses RLS)
  const admin = createAdminClient();

  try {
    switch (type) {
      case 'user': {
        const { data } = await admin.from('users').select('*').eq('id', userId).single();
        return NextResponse.json(data);
      }

      case 'profile': {
        const { data } = await admin.from('mahasiswa_profile').select('*').eq('id', userId).single();
        return NextResponse.json(data);
      }

      case 'absensi': {
        const { data } = await admin
          .from('absensi')
          .select('id, tanggal, status, metode, jadwal:jadwal_id(mata_pelajaran:mata_pelajaran_id(nama_mapel, kode_mapel))')
          .eq('mahasiswa_id', userId)
          .order('tanggal', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'nilai': {
        const { data } = await admin
          .from('nilai')
          .select('id, nilai_teori, nilai_praktek, nilai_attitude, nilai_bahasa_inggris, nilai_akhir, grade, semester, mata_pelajaran:mata_pelajaran_id(nama_mapel, kode_mapel, sks, jurusan)')
          .eq('mahasiswa_id', userId)
          .order('nilai_akhir', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'jadwal': {
        const { data } = await admin
          .from('jadwal')
          .select('id, hari, jam_mulai, jam_selesai, ruangan, kelas, mata_pelajaran:mata_pelajaran_id(nama_mapel, kode_mapel, sks), instruktur:instruktur_id(nama_lengkap)')
          .eq('is_active', true)
          .order('jam_mulai');
        return NextResponse.json(data || []);
      }

      case 'jadwal_today': {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const todayHari = days[new Date().getDay()];
        const { data } = await admin
          .from('jadwal')
          .select('jam_mulai, jam_selesai, ruangan, mata_pelajaran:mata_pelajaran_id(nama_mapel), instruktur:instruktur_id(nama_lengkap)')
          .eq('hari', todayHari)
          .eq('is_active', true)
          .order('jam_mulai');
        return NextResponse.json(data || []);
      }

      case 'pengumuman': {
        const { data } = await admin
          .from('pengumuman')
          .select('id, judul, konten, kategori, is_pinned, publish_at, views_count, penulis:penulis_id(nama_lengkap)')
          .lte('publish_at', new Date().toISOString())
          .order('is_pinned', { ascending: false })
          .order('publish_at', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'interview': {
        const { data } = await admin
          .from('interview_sessions')
          .select('*')
          .order('tanggal_interview', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'dashboard_stats': {
        // Kehadiran
        const { data: absensi } = await admin.from('absensi').select('status').eq('mahasiswa_id', userId);
        const totalAbsensi = absensi?.length || 0;
        const totalHadir = absensi?.filter(a => a.status === 'hadir').length || 0;
        const kehadiranPersen = totalAbsensi > 0 ? Math.round((totalHadir / totalAbsensi) * 100) : 0;

        // Rata-rata nilai
        const { data: nilai } = await admin.from('nilai').select('nilai_akhir').eq('mahasiswa_id', userId);
        const rataRataNilai = nilai && nilai.length > 0
          ? +(nilai.reduce((acc, n) => acc + (n.nilai_akhir || 0), 0) / nilai.length).toFixed(1) : 0;

        // Jadwal hari ini
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const todayHari = days[new Date().getDay()];
        const { data: jadwalToday } = await admin
          .from('jadwal')
          .select('jam_mulai, jam_selesai, ruangan, mata_pelajaran:mata_pelajaran_id(nama_mapel), instruktur:instruktur_id(nama_lengkap)')
          .eq('hari', todayHari)
          .eq('is_active', true)
          .order('jam_mulai');

        const jadwalHariIni = (jadwalToday || []).map((j: any) => ({
          waktu: `${j.jam_mulai} - ${j.jam_selesai}`,
          mapel: j.mata_pelajaran?.nama_mapel || '',
          ruangan: j.ruangan || '',
          instruktur: j.instruktur?.nama_lengkap || '',
        }));

        // Pengumuman terbaru
        const { data: pgm } = await admin
          .from('pengumuman')
          .select('id, judul, kategori, publish_at')
          .lte('publish_at', new Date().toISOString())
          .order('publish_at', { ascending: false })
          .limit(3);

        const pengumumanTerbaru = (pgm || []).map((p: any) => {
          const diff = Date.now() - new Date(p.publish_at).getTime();
          const hours = Math.floor(diff / 3600000);
          const waktu = hours < 1 ? 'Baru saja' : hours < 24 ? `${hours} jam lalu` : `${Math.floor(hours / 24)} hari lalu`;
          return { id: p.id, judul: p.judul, kategori: p.kategori, waktu };
        });

        return NextResponse.json({
          kehadiranPersen,
          rataRataNilai,
          jadwalHariIni,
          pengumumanTerbaru,
          totalMapel: nilai?.length || 0,
        });
      }

      case 'ojt_record': {
        const { data } = await admin
          .from('ojt_records')
          .select('*')
          .eq('mahasiswa_id', userId)
          .order('tanggal_mulai', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'ktm_data': {
        const { data } = await admin
          .from('ktm_digital')
          .select('*')
          .eq('mahasiswa_id', userId)
          .eq('is_active', true)
          .single();
        return NextResponse.json(data);
      }

      case 'pembayaran': {
        try {
          const { data } = await admin
            .from('pembayaran')
            .select('*')
            .eq('mahasiswa_id', userId)
            .order('tanggal_jatuh_tempo', { ascending: true });
          return NextResponse.json(data || []);
        } catch {
          return NextResponse.json([]);
        }
      }

      case 'mitra_kerja': {
        try {
          const { data } = await admin
            .from('mitra_kerja')
            .select('*')
            .order('is_featured', { ascending: false })
            .order('alumni_bekerja', { ascending: false });
          return NextResponse.json(data || []);
        } catch {
          return NextResponse.json([]);
        }
      }

      case 'admin_pembayaran': {
        try {
          const { data } = await admin
            .from('pembayaran')
            .select('*, mahasiswa:mahasiswa_id(nama_lengkap, nim)')
            .order('tanggal_jatuh_tempo', { ascending: true });
          return NextResponse.json(data || []);
        } catch {
          return NextResponse.json([]);
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid query type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API /data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
