'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap, Briefcase, Calendar, CheckCircle2,
  TrendingUp, ChevronRight, BookOpen, Megaphone,
  CreditCard, UserCheck, Clock, Anchor,
  FileText, Wallet, Building2, ClipboardCheck,
  ArrowUpRight, Sparkles,
} from 'lucide-react';
import { calculateFase, getCurrentFase, getFaseLabel, getOverallProgress, getProgramLabel, getJurusanLabel } from '@/lib/utils/helpers';
import Link from 'next/link';

interface DashboardData {
  kehadiranPersen: number;
  rataRataNilai: number;
  jadwalHariIni: { waktu: string; mapel: string; ruangan: string; instruktur: string }[];
  pengumumanTerbaru: { id: string; judul: string; kategori: string; waktu: string }[];
  totalMapel: number;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Selamat Pagi';
  if (h < 17) return 'Selamat Siang';
  return 'Selamat Malam';
}

export default function MahasiswaDashboard() {
  const { user } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchData<DashboardData>('dashboard_stats').then(d => { if (d) setData(d); });
  }, []);

  const fases = user?.periode_masuk ? calculateFase(user.periode_masuk) : [];
  const currentFase = user?.periode_masuk ? getCurrentFase(user.periode_masuk) : 'fase_kelas';
  const overallProgress = user?.periode_masuk ? getOverallProgress(user.periode_masuk) : 0;
  const gradeFromAvg = (avg: number) => avg >= 85 ? 'A' : avg >= 75 ? 'B' : avg >= 65 ? 'C' : avg >= 55 ? 'D' : 'E';

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header Banner — Premium Institutional */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 rounded-xl p-6 sm:p-7 text-white relative overflow-hidden shadow-lg shadow-blue-200/30">
        <div className="wave-decoration" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-white/35 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  {getGreeting()}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-white/25">
                  <Clock className="w-3 h-3" />
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                {user?.nama_lengkap || 'Mahasiswa'} 👋
              </h1>
              <div className="flex items-center flex-wrap gap-2.5 mt-3">
                <span className="status-indicator text-[9px] bg-white/[0.08] text-white/70 border-white/[0.1]">
                  {getFaseLabel(currentFase)}
                </span>
                {user?.program && (
                  <span className="text-[11px] text-white/45 font-medium">{getProgramLabel(user.program)}</span>
                )}
                {user?.jurusan && user.jurusan !== 'general' && (
                  <>
                    <span className="text-white/15">·</span>
                    <span className="text-[11px] text-white/45 font-medium">{getJurusanLabel(user.jurusan)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.nim && (
                <Badge variant="outline" className="border-white/15 text-white/55 text-[10px] shrink-0 bg-white/[0.05] font-mono">
                  {user.nim}
                </Badge>
              )}
              <Badge variant="outline" className="border-white/15 text-white/55 text-[10px] shrink-0 bg-white/[0.05]">
                {user?.angkatan || 'Angkatan 25'}
              </Badge>
            </div>
          </div>

          {/* Progress — Enhanced */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-[11px] mb-2.5">
              <span className="text-white/40 font-medium">Progress Akademik (1 Tahun)</span>
              <span className="text-white/65 font-bold tabular-nums">{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-white/20 via-white/40 to-white/55 transition-all duration-1000 ease-out" style={{ width: `${overallProgress}%` }} />
            </div>
            <div className="flex justify-between mt-2.5">
              {fases.map(f => (
                <div key={f.fase} className="flex items-center gap-1.5">
                  {f.isActive && <div className="w-1.5 h-1.5 rounded-full bg-white/60" />}
                  <span className={`text-[10px] font-medium ${f.isActive ? 'text-white/60' : 'text-white/22'}`}>{f.label}</span>
                </div>
              ))}
              {fases.length === 0 && <>
                <span className="text-[10px] text-white/22">Fase Kelas</span>
                <span className="text-[10px] text-white/22">Fase OJT</span>
                <span className="text-[10px] text-white/22">Fase Akhir</span>
              </>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards — Enhanced */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { label: 'Kehadiran', value: data ? `${data.kehadiranPersen}%` : '—', sub: 'Bulan ini', icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/8' },
          { label: 'Rata-rata Nilai', value: data ? `${data.rataRataNilai}` : '—', sub: data ? `Grade ${gradeFromAvg(data.rataRataNilai)}` : '', icon: TrendingUp, color: 'text-primary', bgColor: 'bg-primary/8' },
          { label: 'Mata Pelajaran', value: data ? `${data.totalMapel}` : '—', sub: 'Dengan nilai', icon: BookOpen, color: 'text-chart-4', bgColor: 'bg-chart-4/8' },
          { label: 'Jadwal Hari Ini', value: data ? `${data.jadwalHariIni.length}` : '—', sub: new Date().toLocaleDateString('id-ID', { weekday: 'long' }), icon: Calendar, color: 'text-chart-5', bgColor: 'bg-chart-5/8' },
        ].map((s, i) => (
          <Card key={i} className="border border-border shadow-sm card-metric animate-slide-up">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold mt-1.5 tracking-tight metric-value">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{s.sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.bgColor} transition-colors`}>
                  <s.icon className={`w-[18px] h-[18px] ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access Menu — Premium Grid */}
      <div>
        <h2 className="section-title">Menu Layanan</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 stagger-children">
          {[
            { href: '/mahasiswa/absensi', label: 'Absensi', icon: ClipboardCheck, color: 'text-success', bgHover: 'group-hover:bg-success/8' },
            { href: '/mahasiswa/nilai', label: 'Nilai', icon: GraduationCap, color: 'text-primary', bgHover: 'group-hover:bg-primary/8' },
            { href: '/mahasiswa/transkrip', label: 'Transkrip', icon: FileText, color: 'text-chart-2', bgHover: 'group-hover:bg-chart-2/8' },
            { href: '/mahasiswa/pembayaran', label: 'Pembayaran', icon: Wallet, color: 'text-chart-4', bgHover: 'group-hover:bg-chart-4/8' },
            { href: '/mahasiswa/ojt', label: 'OJT', icon: Briefcase, color: 'text-warning', bgHover: 'group-hover:bg-warning/8' },
            { href: '/mahasiswa/mitra-kerja', label: 'Mitra Kerja', icon: Building2, color: 'text-chart-5', bgHover: 'group-hover:bg-chart-5/8' },
            { href: '/mahasiswa/ktm', label: 'KTM Digital', icon: CreditCard, color: 'text-primary', bgHover: 'group-hover:bg-primary/8' },
            { href: '/mahasiswa/interview', label: 'Interview', icon: UserCheck, color: 'text-chart-3', bgHover: 'group-hover:bg-chart-3/8' },
            { href: '/mahasiswa/jadwal', label: 'Jadwal', icon: Calendar, color: 'text-chart-1', bgHover: 'group-hover:bg-chart-1/8' },
            { href: '/mahasiswa/pengumuman', label: 'Pengumuman', icon: Megaphone, color: 'text-chart-4', bgHover: 'group-hover:bg-chart-4/8' },
            { href: '/mahasiswa/profil', label: 'Profil', icon: Anchor, color: 'text-muted-foreground', bgHover: 'group-hover:bg-muted' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="border border-border shadow-sm card-feature group animate-slide-up h-full">
                <CardContent className="p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                  <div className={`w-10 h-10 rounded-xl bg-muted/50 ${item.bgHover} flex items-center justify-center mb-2.5 transition-all duration-200`}>
                    <item.icon className="w-[18px] h-[18px] text-muted-foreground group-hover:text-primary card-feature-icon transition-colors duration-200" />
                  </div>
                  <p className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{item.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Grid — Schedule & Announcements */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Today's Schedule */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" /> Jadwal Hari Ini
              </CardTitle>
              <Link href="/mahasiswa/jadwal" className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 font-medium hover-underline">
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-1">
            {data?.jadwalHariIni.map((j, i) => (
              <div key={i} className="row-hover flex items-center gap-3 py-2.5 rounded-lg px-2 -mx-2 group">
                <div className="text-[12px] font-mono text-primary font-semibold w-28 shrink-0 tabular-nums">{j.waktu}</div>
                <div className="w-px h-8 bg-border/60 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">{j.mapel}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{j.instruktur} · {j.ruangan}</p>
                </div>
              </div>
            ))}
            {(!data || data.jadwalHariIni.length === 0) && (
              <div className="empty-state">
                <Clock className="w-10 h-10 mx-auto text-muted-foreground/10" />
                <h3>Tidak ada jadwal hari ini</h3>
                <p>Nikmati hari libur Anda 🎉</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                <Megaphone className="w-4 h-4 text-primary" /> Pengumuman Terbaru
              </CardTitle>
              <Link href="/mahasiswa/pengumuman" className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 font-medium hover-underline">
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-1">
            {data?.pengumumanTerbaru.map((p) => (
              <Link key={p.id} href="/mahasiswa/pengumuman">
                <div className="row-hover flex items-start justify-between gap-3 py-2.5 rounded-lg px-2 -mx-2 group">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold line-clamp-1 group-hover:text-primary transition-colors">{p.judul}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{p.waktu}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5 font-medium">{p.kategori}</Badge>
                </div>
              </Link>
            ))}
            {(!data || data.pengumumanTerbaru.length === 0) && (
              <div className="empty-state">
                <Megaphone className="w-10 h-10 mx-auto text-muted-foreground/10" />
                <h3>Belum ada pengumuman</h3>
                <p>Pengumuman terbaru akan muncul di sini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
