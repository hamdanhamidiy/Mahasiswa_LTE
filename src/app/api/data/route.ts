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
    const tableMap: Record<string, string> = {
      pengumuman: 'pengumuman',
      mata_pelajaran: 'mata_pelajaran',
      jadwal: 'jadwal',
      interview: 'interview_sessions',
      mitra_kerja: 'mitra_kerja',
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
