import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      // ============================================================
      // SHARED / MAHASISWA QUERIES
      // ============================================================

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
        // Find user's kelas
        let userKelas = null;
        if (role === 'mahasiswa') {
          const { data: userData } = await admin.from('users').select('kelas').eq('id', userId).single();
          userKelas = userData?.kelas;
        }

        let query = admin
          .from('jadwal')
          .select('id, hari, jam_mulai, jam_selesai, ruangan, kelas, mata_pelajaran:mata_pelajaran_id(nama_mapel, kode_mapel, sks), instruktur:instruktur_id(nama_lengkap)')
          .eq('is_active', true)
          
        if (userKelas) {
          query = query.eq('kelas', userKelas);
        } else if (role === 'mahasiswa') {
          // If mahasiswa but no kelas assigned, return empty
          return NextResponse.json([]);
        }
        
        const { data } = await query.order('jam_mulai');
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

      case 'active_absensi_sessions': {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await admin
          .from('absensi_sessions')
          .select('*, jadwal:jadwal_id(mata_pelajaran:mata_pelajaran_id(nama_mapel), jam_mulai, jam_selesai)')
          .eq('is_active', true)
          .eq('tanggal', today)
          .gt('session_expired_at', new Date().toISOString());
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
        
        let userKelas = null;
        if (role === 'mahasiswa') {
          const { data: userData } = await admin.from('users').select('kelas').eq('id', userId).single();
          userKelas = userData?.kelas;
        }

        let query = admin
          .from('jadwal')
          .select('jam_mulai, jam_selesai, ruangan, mata_pelajaran:mata_pelajaran_id(nama_mapel), instruktur:instruktur_id(nama_lengkap)')
          .eq('hari', todayHari)
          .eq('is_active', true)
          .order('jam_mulai');

        if (userKelas) {
          query = query.eq('kelas', userKelas);
        }

        const { data: jadwalToday } = await query;

        const jadwalHariIni = (jadwalToday || []).map((j: any) => ({
          waktu: `${j.jam_mulai.substring(0, 5)} - ${j.jam_selesai.substring(0, 5)}`,
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
            .eq('is_active', true)
            .order('is_featured', { ascending: false })
            .order('alumni_bekerja', { ascending: false });
          return NextResponse.json(data || []);
        } catch {
          return NextResponse.json([]);
        }
      }

      // ============================================================
      // ADMIN QUERIES
      // ============================================================

      case 'admin_stats': {
        if (role !== 'admin' && role !== 'headmaster') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { count: totalMhs } = await admin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'mahasiswa').eq('status_aktif', true);
        const { count: totalInstruktur } = await admin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'instruktur').eq('status_aktif', true);
        const { count: totalOJT } = await admin.from('ojt_records').select('*', { count: 'exact', head: true }).in('status_laporan', ['sedang_berjalan', 'laporan_dikirim']);
        const { count: totalAlumni } = await admin.from('sertifikat_alumni').select('*', { count: 'exact', head: true });

        return NextResponse.json({
          totalMahasiswa: totalMhs || 0,
          totalInstruktur: totalInstruktur || 0,
          totalOJT: totalOJT || 0,
          totalAlumni: totalAlumni || 0,
        });
      }

      case 'admin_mahasiswa': {
        if (role !== 'admin' && role !== 'headmaster') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('users')
          .select('id, nim, nama_lengkap, email, program, jurusan, angkatan, status_aktif, created_at')
          .eq('role', 'mahasiswa')
          .order('created_at', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'admin_instruktur': {
        if (role !== 'admin' && role !== 'headmaster') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('users')
          .select('id, nim, nama_lengkap, email, status_aktif, created_at')
          .eq('role', 'instruktur')
          .order('nama_lengkap');
        return NextResponse.json(data || []);
      }

      case 'admin_mata_pelajaran': {
        if (role !== 'admin' && role !== 'headmaster') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('mata_pelajaran')
          .select('*, instruktur:instruktur_id(nama_lengkap)')
          .order('kode_mapel');
        return NextResponse.json(data || []);
      }

      case 'admin_jadwal': {
        if (role !== 'admin' && role !== 'headmaster') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('jadwal')
          .select('*, mata_pelajaran:mata_pelajaran_id(nama_mapel, kode_mapel), instruktur:instruktur_id(nama_lengkap)')
          .order('hari')
          .order('jam_mulai');
        return NextResponse.json(data || []);
      }

      case 'admin_pembayaran': {
        if (role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
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

      case 'admin_ojt': {
        if (role !== 'admin' && role !== 'headmaster') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('ojt_records')
          .select('*, mahasiswa:mahasiswa_id(nama_lengkap, nim), instruktur:instruktur_pembimbing_id(nama_lengkap)')
          .order('tanggal_mulai', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'admin_pengumuman': {
        if (role !== 'admin' && role !== 'instruktur') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('pengumuman')
          .select('*, penulis:penulis_id(nama_lengkap)')
          .order('publish_at', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'admin_interview': {
        if (role !== 'admin' && role !== 'headmaster') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('interview_sessions')
          .select('*')
          .order('tanggal_interview', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'admin_alumni': {
        if (role !== 'admin' && role !== 'headmaster') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('sertifikat_alumni')
          .select('*, mahasiswa:mahasiswa_id(nama_lengkap, nim, program, jurusan)')
          .order('tanggal_lulus', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'admin_sertifikat': {
        if (role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('sertifikat_alumni')
          .select('*, mahasiswa:mahasiswa_id(nama_lengkap, nim)')
          .order('created_at', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'admin_absensi': {
        if (role !== 'admin' && role !== 'instruktur') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('absensi')
          .select('*, mahasiswa:mahasiswa_id(nama_lengkap, nim), jadwal:jadwal_id(kelas, mata_pelajaran:mata_pelajaran_id(nama_mapel))')
          .order('tanggal', { ascending: false })
          .limit(100);
        return NextResponse.json(data || []);
      }

      case 'admin_ktm': {
        if (role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('ktm_digital')
          .select('*, mahasiswa:mahasiswa_id(nama_lengkap, nim, program, jurusan)')
          .order('generated_at', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'admin_mitra_kerja': {
        if (role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('mitra_kerja')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('nama');
        return NextResponse.json(data || []);
      }

      // ============================================================
      // INSTRUKTUR QUERIES
      // ============================================================

      case 'instruktur_jadwal': {
        if (role !== 'instruktur') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('jadwal')
          .select('*, mata_pelajaran:mata_pelajaran_id(nama_mapel, kode_mapel, sks)')
          .eq('instruktur_id', userId)
          .eq('is_active', true)
          .order('hari')
          .order('jam_mulai');
        return NextResponse.json(data || []);
      }

      case 'instruktur_mahasiswa_ojt': {
        if (role !== 'instruktur') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data } = await admin
          .from('ojt_records')
          .select('*, mahasiswa:mahasiswa_id(nama_lengkap, nim)')
          .eq('instruktur_pembimbing_id', userId)
          .order('tanggal_mulai', { ascending: false });
        return NextResponse.json(data || []);
      }

      case 'instruktur_mahasiswa_by_jadwal': {
        if (role !== 'instruktur' && role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        // Get the jadwal_id from query params
        const jadwalId = request.nextUrl.searchParams.get('jadwal_id');
        const mapelId = request.nextUrl.searchParams.get('mapel_id');
        if (!jadwalId && !mapelId) return NextResponse.json({ error: 'jadwal_id or mapel_id required' }, { status: 400 });

        // Get the jadwal to know which kelas students belong to
        let targetJurusan: string | null = null;
        let targetProgram: string | null = null;
        let targetKelas: string | null = null;
        
        if (jadwalId) {
          const { data: jadwalData } = await admin.from('jadwal').select('kelas, mata_pelajaran:mata_pelajaran_id(jurusan, program)').eq('id', jadwalId).single();
          targetJurusan = (jadwalData as any)?.mata_pelajaran?.jurusan || null;
          targetProgram = (jadwalData as any)?.mata_pelajaran?.program || null;
          targetKelas = (jadwalData as any)?.kelas || null;
        } else if (mapelId) {
          const { data: mapelData } = await admin.from('mata_pelajaran').select('jurusan, program').eq('id', mapelId).single();
          targetJurusan = mapelData?.jurusan || null;
          targetProgram = mapelData?.program || null;
        }

        // Get mahasiswa filtered by matching kelas (if jadwalId) or program (if mapelId)
        let query = admin.from('users').select('id, nim, nama_lengkap').eq('role', 'mahasiswa').eq('status_aktif', true);
        if (targetKelas) {
          query = query.eq('kelas', targetKelas);
        } else {
          if (targetProgram) query = query.eq('program', targetProgram);
          if (targetJurusan && targetJurusan !== 'general') query = query.or(`jurusan.eq.${targetJurusan},jurusan.eq.general`);
        }
        query = query.order('nama_lengkap');
        const { data: students } = await query;
        return NextResponse.json(students || []);
      }

      // ============================================================
      // HEADMASTER QUERIES
      // ============================================================

      case 'headmaster_stats': {
        if (role !== 'headmaster' && role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { count: totalMhs } = await admin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'mahasiswa').eq('status_aktif', true);
        const { count: totalInstr } = await admin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'instruktur').eq('status_aktif', true);
        const { count: totalOjtActive } = await admin.from('ojt_records').select('*', { count: 'exact', head: true }).in('status_laporan', ['sedang_berjalan', 'laporan_dikirim']);
        const { count: totalAlumni } = await admin.from('sertifikat_alumni').select('*', { count: 'exact', head: true });

        // Kehadiran rata-rata
        const { data: allAbsensi } = await admin.from('absensi').select('status');
        const totalAbs = allAbsensi?.length || 0;
        const totalHadir = allAbsensi?.filter((a: any) => a.status === 'hadir').length || 0;
        const avgKehadiran = totalAbs > 0 ? Math.round((totalHadir / totalAbs) * 100) : 0;

        // Distribusi jurusan
        const { data: mhsByJurusan } = await admin.from('users').select('jurusan').eq('role', 'mahasiswa').eq('status_aktif', true);
        const jurusanCount: Record<string, number> = {};
        (mhsByJurusan || []).forEach((m: any) => { jurusanCount[m.jurusan || 'general'] = (jurusanCount[m.jurusan || 'general'] || 0) + 1; });

        // Distribusi program
        const { data: mhsByProgram } = await admin.from('users').select('program').eq('role', 'mahasiswa').eq('status_aktif', true);
        const programCount: Record<string, number> = {};
        (mhsByProgram || []).forEach((m: any) => { programCount[m.program || 'diploma1'] = (programCount[m.program || 'diploma1'] || 0) + 1; });

        // OJT negara unik
        const { data: ojtCountries } = await admin.from('ojt_records').select('negara');
        const uniqueCountries = new Set((ojtCountries || []).map((o: any) => o.negara)).size;

        return NextResponse.json({
          totalMahasiswa: totalMhs || 0,
          totalInstruktur: totalInstr || 0,
          totalOJT: totalOjtActive || 0,
          totalAlumni: totalAlumni || 0,
          avgKehadiran,
          uniqueCountries,
          jurusanCount,
          programCount,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid query type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API /data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/data
 * Create new records. Body: { type, data }
 */
export async function POST(request: NextRequest) {
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

  const role = user.app_metadata?.role || 'mahasiswa';
  const body = await request.json();
  const { type, data: payload } = body;
  const admin = createAdminClient();

  try {
    switch (type) {
      case 'pengumuman': {
        if (role !== 'admin' && role !== 'instruktur') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data, error } = await admin.from('pengumuman').insert({ ...payload, penulis_id: user.id }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'mata_pelajaran': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('mata_pelajaran').insert(payload).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'jadwal': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('jadwal').insert(payload).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'interview': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('interview_sessions').insert({ ...payload, created_by: user.id }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'mitra_kerja': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('mitra_kerja').insert(payload).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'nilai': {
        if (role !== 'admin' && role !== 'instruktur') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('nilai').insert({ ...payload, instruktur_id: user.id }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'absensi': {
        if (role !== 'admin' && role !== 'instruktur') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('absensi').insert({ ...payload, dicatat_oleh: user.id }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'absensi_bulk': {
        if (role !== 'admin' && role !== 'instruktur') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const records = (payload.records || []).map((r: any) => ({ ...r, dicatat_oleh: user.id }));
        if (records.length === 0) return NextResponse.json({ error: 'No records provided' }, { status: 400 });
        const { data, error } = await admin.from('absensi').upsert(records, { onConflict: 'mahasiswa_id,jadwal_id,tanggal' }).select();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'open_absensi_session': {
        if (role !== 'instruktur' && role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { jadwal_id, duration_minutes } = payload;
        const expired_at = new Date(Date.now() + duration_minutes * 60000).toISOString();
        
        // Deactivate any existing active session for this jadwal today
        const today = new Date().toISOString().split('T')[0];
        await admin.from('absensi_sessions')
          .update({ is_active: false })
          .eq('jadwal_id', jadwal_id)
          .eq('tanggal', today);
          
        const { data, error } = await admin.from('absensi_sessions').insert({
          jadwal_id,
          instruktur_id: user.id,
          tanggal: today,
          metode: 'online',
          session_expired_at: expired_at,
          is_active: true
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'close_absensi_session': {
        if (role !== 'instruktur' && role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { session_id } = payload;
        const { data, error } = await admin.from('absensi_sessions')
          .update({ is_active: false, session_expired_at: new Date().toISOString() })
          .eq('id', session_id)
          .select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'submit_absensi_online': {
        if (role !== 'mahasiswa') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { jadwal_id } = payload;
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await admin.from('absensi').upsert({
          mahasiswa_id: user.id,
          jadwal_id,
          tanggal: today,
          status: 'hadir',
          metode: 'online',
          dicatat_oleh: user.id
        }, { onConflict: 'mahasiswa_id,jadwal_id,tanggal' }).select().single();
        
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'tambah_mahasiswa': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        
        // 1. Create auth user
        const { data: authData, error: authError } = await admin.auth.admin.createUser({
          email: payload.email,
          password: payload.password,
          email_confirm: true,
          user_metadata: { nama: payload.nama_lengkap },
          app_metadata: { role: 'mahasiswa' },
        });
        
        if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
        if (!authData.user) return NextResponse.json({ error: 'Gagal membuat user' }, { status: 400 });

        // 2. Insert into users table
        const { data: dbData, error: dbError } = await admin.from('users').insert({
          id: authData.user.id,
          email: payload.email,
          nama_lengkap: payload.nama_lengkap,
          nim: payload.nim,
          program: payload.program,
          jurusan: payload.jurusan,
          angkatan: payload.angkatan,
          role: 'mahasiswa',
          status_aktif: true
        }).select().single();

        if (dbError) {
          await admin.auth.admin.deleteUser(authData.user.id);
          return NextResponse.json({ error: dbError.message }, { status: 400 });
        }

        return NextResponse.json(dbData);
      }

      case 'tambah_instruktur': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { data: authData2, error: authError2 } = await admin.auth.admin.createUser({
          email: payload.email,
          password: payload.password,
          email_confirm: true,
          user_metadata: { nama: payload.nama_lengkap },
          app_metadata: { role: 'instruktur' },
        });

        if (authError2) return NextResponse.json({ error: authError2.message }, { status: 400 });
        if (!authData2.user) return NextResponse.json({ error: 'Gagal membuat user' }, { status: 400 });

        const { data: dbData2, error: dbError2 } = await admin.from('users').insert({
          id: authData2.user.id,
          email: payload.email,
          nama_lengkap: payload.nama_lengkap,
          role: 'instruktur',
          program: payload.program || 'diploma1',
          jurusan: payload.jurusan || 'general',
          status_aktif: true,
        }).select().single();

        if (dbError2) {
          await admin.auth.admin.deleteUser(authData2.user.id);
          return NextResponse.json({ error: dbError2.message }, { status: 400 });
        }

        return NextResponse.json(dbData2);
      }

      case 'upload_avatar': {
        // Accept base64 image, upload to Supabase Storage, update users.avatar_url
        const { base64, mimeType } = payload;
        if (!base64) return NextResponse.json({ error: 'No image data provided' }, { status: 400 });

        const ext = (mimeType || 'image/jpeg').split('/')[1] || 'jpg';
        const fileName = `${user.id}_${Date.now()}.${ext}`;

        // Decode base64 to buffer
        const buffer = Buffer.from(base64, 'base64');

        // Upload to Supabase Storage
        const { error: uploadError } = await admin.storage
          .from('avatars')
          .upload(fileName, buffer, {
            contentType: mimeType || 'image/jpeg',
            upsert: true,
          });

        if (uploadError) return NextResponse.json({ error: 'Upload gagal: ' + uploadError.message }, { status: 400 });

        // Get public URL
        const { data: urlData } = admin.storage.from('avatars').getPublicUrl(fileName);
        const avatarUrl = urlData.publicUrl;

        // Update users table
        const { data: userData, error: updateError } = await admin
          .from('users')
          .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
        return NextResponse.json({ avatar_url: avatarUrl, user: userData });
      }

      case 'interview_register': {
        // Mahasiswa registers for an interview session
        const sessionId = payload.session_id;
        if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 });

        // Get current session
        const { data: session, error: sessErr } = await admin
          .from('interview_sessions')
          .select('pendaftar_ids, kuota')
          .eq('id', sessionId)
          .single();

        if (sessErr || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        const currentIds: string[] = session.pendaftar_ids || [];
        if (currentIds.includes(user.id)) {
          return NextResponse.json({ error: 'Anda sudah terdaftar pada sesi ini' }, { status: 400 });
        }
        if (currentIds.length >= session.kuota) {
          return NextResponse.json({ error: 'Kuota sesi sudah penuh' }, { status: 400 });
        }

        const updatedIds = [...currentIds, user.id];
        const { data: updated, error: updateErr } = await admin
          .from('interview_sessions')
          .update({ pendaftar_ids: updatedIds })
          .eq('id', sessionId)
          .select()
          .single();

        if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 400 });
        return NextResponse.json(updated);
      }

      case 'upload_bukti_pembayaran': {
        // Upload bukti pembayaran image
        const { pembayaran_id, base64, mimeType } = payload;
        if (!pembayaran_id || !base64) return NextResponse.json({ error: 'pembayaran_id and base64 required' }, { status: 400 });

        const ext = (mimeType || 'image/jpeg').split('/')[1] || 'jpg';
        const fileName = `bukti_${pembayaran_id}_${Date.now()}.${ext}`;

        const buffer = Buffer.from(base64, 'base64');
        const { error: uploadErr } = await admin.storage
          .from('bukti-pembayaran')
          .upload(fileName, buffer, { contentType: mimeType || 'image/jpeg', upsert: true });

        if (uploadErr) return NextResponse.json({ error: 'Upload gagal: ' + uploadErr.message }, { status: 400 });

        const { data: urlData } = admin.storage.from('bukti-pembayaran').getPublicUrl(fileName);
        const buktiUrl = urlData.publicUrl;

        const { data: pembData, error: pembErr } = await admin
          .from('pembayaran')
          .update({
            bukti_pembayaran_url: buktiUrl,
            status: 'menunggu_verifikasi',
            tanggal_bayar: new Date().toISOString().split('T')[0],
          })
          .eq('id', pembayaran_id)
          .select()
          .single();

        if (pembErr) return NextResponse.json({ error: pembErr.message }, { status: 400 });
        return NextResponse.json(pembData);
      }

      case 'upload_ojt_dokumen': {
        // Upload OJT document (surat penerimaan or laporan akhir)
        const { ojt_id, doc_type, base64: docBase64, mimeType: docMime } = payload;
        if (!ojt_id || !docBase64 || !doc_type) return NextResponse.json({ error: 'ojt_id, doc_type, and base64 required' }, { status: 400 });

        const fieldMap: Record<string, string> = {
          surat_penerimaan: 'dokumen_surat_penerimaan_url',
          laporan_akhir: 'dokumen_laporan_akhir_url',
        };
        const fieldName = fieldMap[doc_type];
        if (!fieldName) return NextResponse.json({ error: 'Invalid doc_type' }, { status: 400 });

        const docExt = (docMime || 'image/jpeg').split('/')[1] || 'jpg';
        const docFileName = `ojt_${doc_type}_${ojt_id}_${Date.now()}.${docExt}`;

        const docBuffer = Buffer.from(docBase64, 'base64');
        const { error: docUploadErr } = await admin.storage
          .from('ojt-documents')
          .upload(docFileName, docBuffer, { contentType: docMime || 'image/jpeg', upsert: true });

        if (docUploadErr) return NextResponse.json({ error: 'Upload gagal: ' + docUploadErr.message }, { status: 400 });

        const { data: docUrlData } = admin.storage.from('ojt-documents').getPublicUrl(docFileName);
        const docUrl = docUrlData.publicUrl;

        const { data: ojtUpdated, error: ojtUpdateErr } = await admin
          .from('ojt_records')
          .update({ [fieldName]: docUrl })
          .eq('id', ojt_id)
          .select()
          .single();

        if (ojtUpdateErr) return NextResponse.json({ error: ojtUpdateErr.message }, { status: 400 });
        return NextResponse.json(ojtUpdated);
      }

      // ============================================================
      // BULK IMPORT ENDPOINTS
      // ============================================================

      case 'bulk_import_mahasiswa': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { rows } = payload as { rows: Record<string, string>[] };
        if (!rows || !Array.isArray(rows)) return NextResponse.json({ error: 'rows array required' }, { status: 400 });

        let success = 0;
        const errors: string[] = [];

        for (const row of rows) {
          try {
            if (!row.nama_lengkap || !row.email) {
              errors.push(`Baris "${row.nama_lengkap || '?'}": nama_lengkap dan email wajib diisi`);
              continue;
            }
            const password = row.password || 'ltecruise2025';
            const { data: authData, error: authErr } = await admin.auth.admin.createUser({
              email: row.email,
              password,
              email_confirm: true,
              user_metadata: {
                nama_lengkap: row.nama_lengkap,
                role: 'mahasiswa',
              },
              app_metadata: { role: 'mahasiswa' },
            });
            if (authErr) {
              errors.push(`${row.nama_lengkap} (${row.email}): ${authErr.message}`);
              continue;
            }
            // Update profile fields
            if (authData.user) {
              await admin.from('users').update({
                nama_lengkap: row.nama_lengkap,
                nim: row.nim || null,
                program: row.program || 'diploma1',
                jurusan: row.jurusan || 'general',
                angkatan: row.angkatan || `Angkatan ${new Date().getFullYear()}`,
              }).eq('id', authData.user.id);
            }
            success++;
          } catch (err: any) {
            errors.push(`${row.nama_lengkap || '?'}: ${err.message}`);
          }
        }

        return NextResponse.json({ success, failed: rows.length - success, errors });
      }

      case 'bulk_import_instruktur': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { rows } = payload as { rows: Record<string, string>[] };
        if (!rows || !Array.isArray(rows)) return NextResponse.json({ error: 'rows array required' }, { status: 400 });

        let success = 0;
        const errors: string[] = [];

        for (const row of rows) {
          try {
            if (!row.nama_lengkap || !row.email) {
              errors.push(`Baris "${row.nama_lengkap || '?'}": nama_lengkap dan email wajib diisi`);
              continue;
            }
            const password = row.password || 'tutor2025';
            const { data: authData, error: authErr } = await admin.auth.admin.createUser({
              email: row.email,
              password,
              email_confirm: true,
              user_metadata: { nama_lengkap: row.nama_lengkap, role: 'instruktur' },
              app_metadata: { role: 'instruktur' },
            });
            if (authErr) {
              errors.push(`${row.nama_lengkap} (${row.email}): ${authErr.message}`);
              continue;
            }
            if (authData.user) {
              await admin.from('users').update({ nama_lengkap: row.nama_lengkap }).eq('id', authData.user.id);
            }
            success++;
          } catch (err: any) {
            errors.push(`${row.nama_lengkap || '?'}: ${err.message}`);
          }
        }

        return NextResponse.json({ success, failed: rows.length - success, errors });
      }

      case 'bulk_import_jadwal': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { rows } = payload as { rows: Record<string, string>[] };
        if (!rows || !Array.isArray(rows)) return NextResponse.json({ error: 'rows array required' }, { status: 400 });

        // Pre-fetch lookup tables
        const { data: allMapel } = await admin.from('mata_pelajaran').select('id, kode_mapel, nama_mapel');
        const { data: allInstruktur } = await admin.from('users').select('id, email, nama_lengkap').eq('role', 'instruktur');

        let success = 0;
        const errors: string[] = [];

        for (const row of rows) {
          try {
            // Lookup mapel by kode_mapel
            const mapel = (allMapel || []).find(
              (m: any) => m.kode_mapel?.toLowerCase() === row.kode_mapel?.toLowerCase()
            );
            if (!mapel) {
              errors.push(`Baris "${row.kode_mapel}": Kode mata pelajaran tidak ditemukan di database`);
              continue;
            }

            // Lookup instruktur by email
            const instruktur = (allInstruktur || []).find(
              (i: any) => i.email?.toLowerCase() === row.email_instruktur?.toLowerCase()
            );
            if (!instruktur) {
              errors.push(`Baris "${row.kode_mapel}": Email instruktur "${row.email_instruktur}" tidak ditemukan`);
              continue;
            }

            if (!row.hari || !row.jam_mulai || !row.jam_selesai) {
              errors.push(`Baris "${row.kode_mapel}": Hari, jam mulai, dan jam selesai wajib diisi`);
              continue;
            }

            const { error: insertErr } = await admin.from('jadwal').insert({
              mata_pelajaran_id: mapel.id,
              instruktur_id: instruktur.id,
              kelas: row.kelas || 'A',
              hari: row.hari,
              jam_mulai: row.jam_mulai,
              jam_selesai: row.jam_selesai,
              ruangan: row.ruangan || '-',
              is_active: true,
              tanggal_efektif_mulai: new Date().toISOString().split('T')[0],
              tanggal_efektif_selesai: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
            });

            if (insertErr) {
              errors.push(`Jadwal ${row.kode_mapel} ${row.hari}: ${insertErr.message}`);
              continue;
            }
            success++;
          } catch (err: any) {
            errors.push(`${row.kode_mapel || '?'}: ${err.message}`);
          }
        }

        return NextResponse.json({ success, failed: rows.length - success, errors });
      }

      case 'bulk_import_pembayaran': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { rows } = payload as { rows: Record<string, string>[] };
        if (!rows || !Array.isArray(rows)) return NextResponse.json({ error: 'rows array required' }, { status: 400 });

        // Pre-fetch all mahasiswa by NIM for lookup
        const { data: allMhs } = await admin.from('users').select('id, nim, nama_lengkap').eq('role', 'mahasiswa');

        let success = 0;
        const errors: string[] = [];

        for (const row of rows) {
          try {
            if (!row.nim || !row.jenis || !row.jumlah || !row.tanggal_jatuh_tempo) {
              errors.push(`Baris NIM "${row.nim || '?'}": nim, jenis, jumlah, dan tanggal_jatuh_tempo wajib diisi`);
              continue;
            }

            const mhs = (allMhs || []).find(
              (m: any) => m.nim?.toLowerCase() === row.nim?.toLowerCase()
            );
            if (!mhs) {
              errors.push(`NIM "${row.nim}": Mahasiswa tidak ditemukan di database`);
              continue;
            }

            const jumlah = parseInt(row.jumlah.replace(/[^\d]/g, ''), 10);
            if (isNaN(jumlah) || jumlah <= 0) {
              errors.push(`NIM "${row.nim}": Jumlah "${row.jumlah}" tidak valid`);
              continue;
            }

            const { error: insertErr } = await admin.from('pembayaran').insert({
              mahasiswa_id: mhs.id,
              jenis: row.jenis,
              jumlah,
              status: row.status || 'belum_lunas',
              tanggal_jatuh_tempo: row.tanggal_jatuh_tempo,
            });

            if (insertErr) {
              errors.push(`NIM "${row.nim}" - ${row.jenis}: ${insertErr.message}`);
              continue;
            }
            success++;
          } catch (err: any) {
            errors.push(`NIM "${row.nim || '?'}": ${err.message}`);
          }
        }

        return NextResponse.json({ success, failed: rows.length - success, errors });
      }

      case 'tambah_tagihan': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { mahasiswa_id, jenis, jumlah, tanggal_jatuh_tempo, keterangan } = payload;
        if (!mahasiswa_id || !jenis || !jumlah || !tanggal_jatuh_tempo) {
          return NextResponse.json({ error: 'mahasiswa_id, jenis, jumlah, tanggal_jatuh_tempo required' }, { status: 400 });
        }
        const { data, error } = await admin.from('pembayaran').insert({
          mahasiswa_id,
          jenis,
          jumlah: parseInt(String(jumlah).replace(/[^\d]/g, ''), 10),
          status: 'belum_lunas',
          tanggal_jatuh_tempo,
          keterangan: keterangan || null,
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json({ error: 'Invalid type for POST' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/data
 * Update existing records. Body: { type, id, data }
 */
export async function PUT(request: NextRequest) {
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

  const role = user.app_metadata?.role || 'mahasiswa';
  const body = await request.json();
  const { type, id, data: payload } = body;
  const admin = createAdminClient();

  try {
    switch (type) {
      case 'user': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('users').update(payload).eq('id', id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'profile': {
        if (role !== 'mahasiswa' && role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const targetId = role === 'admin' ? id : user.id;
        const { data, error } = await admin.from('mahasiswa_profile').update(payload).eq('id', targetId).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'pembayaran_verify': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('pembayaran').update({
          status: 'terverifikasi',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        }).eq('id', id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'pengumuman': {
        if (role !== 'admin' && role !== 'instruktur') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('pengumuman').update(payload).eq('id', id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'ojt_status': {
        if (role !== 'admin' && role !== 'instruktur') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('ojt_records').update(payload).eq('id', id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'mata_pelajaran': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('mata_pelajaran').update(payload).eq('id', id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'jadwal': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('jadwal').update(payload).eq('id', id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'interview': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('interview_sessions').update(payload).eq('id', id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      case 'mitra_kerja': {
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        const { data, error } = await admin.from('mitra_kerja').update(payload).eq('id', id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json({ error: 'Invalid type for PUT' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/data
 * Delete records. Body: { type, id }
 */
export async function DELETE(request: NextRequest) {
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

  const role = user.app_metadata?.role || 'mahasiswa';
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { type, id } = body;
  const admin = createAdminClient();

  try {
    // Special case: deleting a user (mahasiswa/instruktur) requires auth cleanup
    if (type === 'user') {
      const { error: dbErr } = await admin.from('users').delete().eq('id', id);
      if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 400 });
      // Also delete from Supabase Auth
      const { error: authErr } = await admin.auth.admin.deleteUser(id);
      if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    const tableMap: Record<string, string> = {
      pengumuman: 'pengumuman',
      mata_pelajaran: 'mata_pelajaran',
      jadwal: 'jadwal',
      interview: 'interview_sessions',
      mitra_kerja: 'mitra_kerja',
      nilai: 'nilai',
      absensi: 'absensi',
      ojt_records: 'ojt_records',
    };

    const table = tableMap[type];
    if (!table) {
      return NextResponse.json({ error: 'Invalid type for DELETE' }, { status: 400 });
    }

    const { error } = await admin.from(table).delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
