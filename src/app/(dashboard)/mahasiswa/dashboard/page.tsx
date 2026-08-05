'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap, Briefcase, Calendar, CheckCircle2,
  TrendingUp, ChevronRight, BookOpen, Megaphone,
  CreditCard, UserCheck, Clock, Anchor,
  FileText, Wallet, Building2, ClipboardCheck,
  Sparkles, Bell
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData<DashboardData>('dashboard_stats').then(d => { 
      if (d) setData(d); 
      setLoading(false);
    });
  }, []);

  const fases = user?.periode_masuk ? calculateFase(user.periode_masuk) : [];
  const currentFase = user?.periode_masuk ? getCurrentFase(user.periode_masuk) : 'fase_kelas';
  const overallProgress = user?.periode_masuk ? getOverallProgress(user.periode_masuk) : 0;
  const gradeFromAvg = (avg: number) => avg >= 85 ? 'A' : avg >= 75 ? 'B' : avg >= 65 ? 'C' : avg >= 55 ? 'D' : 'E';

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Menyiapkan Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      {/* 1. HERO BANNER - Vibrant Blue Gradient Modern */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 25%, #2563eb 50%, #1e3a8a 75%, #172554 100%)'}}>
        {/* Layered gradient depth - top left lighter */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-blue-950/60 pointer-events-none" />
        {/* Bottom fade to deep navy */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-950/50 to-transparent pointer-events-none" />
        {/* Decorative subtle circle top-right */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        {/* Subtle grid/dot texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px'}} />

        <div className="relative z-10 p-7 sm:p-9 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
          
          {/* Left: User Identity */}
          <div className="space-y-5 flex-1 min-w-0">
            {/* Greeting chip */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-300 shadow-[0_0_6px_rgba(186,230,253,0.9)] animate-pulse" />
              <span className="text-xs font-semibold text-blue-100 tracking-wide">{getGreeting()}</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-sm truncate">
                {user?.nama_lengkap || 'Mahasiswa'}
              </h1>
              <p className="text-blue-200/70 text-sm font-medium">Mahasiswa LTE Cruise AIS</p>
            </div>

            {/* Info chips row */}
            <div className="flex flex-wrap gap-2">
              {user?.nim && (
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <CreditCard className="w-3.5 h-3.5 text-sky-300" />
                  <span className="font-mono text-white text-xs font-semibold">{user.nim}</span>
                </div>
              )}
              {user?.angkatan && (
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-sky-300" />
                  <span className="text-blue-100 text-xs font-medium">{user.angkatan}</span>
                </div>
              )}
              {user?.program && (
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-300" />
                  <span className="text-blue-100 text-xs font-medium">{getProgramLabel(user.program)}</span>
                </div>
              )}
              {user?.jurusan && (
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Briefcase className="w-3.5 h-3.5 text-sky-300" />
                  <span className="text-blue-100 text-xs font-medium">{getJurusanLabel(user.jurusan)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Progress Tracker Card */}
          <div className="w-full lg:w-[300px] shrink-0">
            <div className="bg-white/8 border border-white/15 backdrop-blur-md rounded-2xl p-5 shadow-xl">
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-400/20 border border-sky-400/20">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-300" />
                  </div>
                  <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">Progress Studi</p>
                </div>
                <p className="text-2xl font-extrabold text-white tabular-nums">{overallProgress}<span className="text-sm font-medium text-blue-200 ml-0.5">%</span></p>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 w-full bg-blue-950/60 rounded-full overflow-hidden mb-4 shadow-inner">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${overallProgress}%`, background: 'linear-gradient(90deg, #38bdf8, #818cf8)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-[shimmer_2.5s_ease-in-out_infinite]" style={{animationName: 'slideShimmer'}} />
                </div>
              </div>

              {/* Steps with milestones */}
              <div className="flex justify-between items-center">
                {[
                  { label: 'Kelas', threshold: 0 },
                  { label: 'OJT', threshold: 70 },
                  { label: 'Akhir', threshold: 100 },
                ].map((step) => (
                  <div key={step.label} className="flex flex-col items-center gap-1">
                    <div className={`w-2 h-2 rounded-full transition-all duration-500 ${overallProgress >= step.threshold ? 'bg-sky-300 shadow-[0_0_6px_rgba(125,211,252,0.8)]' : 'bg-blue-800/60'}`} />
                    <span className={`text-[10px] font-semibold ${overallProgress >= step.threshold ? 'text-sky-300' : 'text-blue-400/50'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 2. STATS GRID - Minimalist Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
        {[
          { label: 'Tingkat Kehadiran', value: data ? `${data.kehadiranPersen}%` : '—', desc: 'Bulan ini', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
          { label: 'Rata-rata IPK', value: data ? `${data.rataRataNilai}` : '—', desc: data ? `Grade ${gradeFromAvg(data.rataRataNilai)}` : 'Belum ada', icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
          { label: 'Mata Pelajaran', value: data ? `${data.totalMapel}` : '—', desc: 'Telah dievaluasi', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' },
          { label: 'Jadwal Hari Ini', value: data ? `${data.jadwalHariIni.length}` : '—', desc: new Date().toLocaleDateString('id-ID', { weekday: 'long' }), icon: Calendar, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
        ].map((stat, i) => (
          <div key={i} className={`group relative bg-card p-6 rounded-[2rem] border ${stat.border} shadow-sm hover:shadow-xl hover:shadow-${stat.color.split('-')[1]}/10 transition-all duration-500 animate-slide-up hover:-translate-y-1.5 overflow-hidden`}>
            {/* Background Icon Watermark */}
            <stat.icon className={`absolute -right-4 -bottom-4 w-32 h-32 ${stat.color} opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700`} />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform duration-500 group-hover:scale-110`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-extrabold tracking-tight text-foreground tabular-nums mb-1.5">
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {stat.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. MENU LAYANAN - Compact Modern Grid */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          <h2 className="text-lg font-bold tracking-tight">Layanan Akademik</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3 stagger-children">
          {[
            { href: '/mahasiswa/absensi', label: 'Absensi', icon: ClipboardCheck, color: 'group-hover:text-emerald-500' },
            { href: '/mahasiswa/jadwal', label: 'Jadwal', icon: Calendar, color: 'group-hover:text-blue-500' },
            { href: '/mahasiswa/nilai', label: 'Nilai', icon: GraduationCap, color: 'group-hover:text-indigo-500' },
            { href: '/mahasiswa/transkrip', label: 'Transkrip', icon: FileText, color: 'group-hover:text-purple-500' },
            { href: '/mahasiswa/pembayaran', label: 'Keuangan', icon: Wallet, color: 'group-hover:text-amber-500' },
            { href: '/mahasiswa/ojt', label: 'OJT', icon: Briefcase, color: 'group-hover:text-orange-500' },
            { href: '/mahasiswa/mitra-kerja', label: 'Mitra', icon: Building2, color: 'group-hover:text-teal-500' },
            { href: '/mahasiswa/ktm', label: 'KTM', icon: CreditCard, color: 'group-hover:text-rose-500' },
            { href: '/mahasiswa/interview', label: 'Interview', icon: UserCheck, color: 'group-hover:text-cyan-500' },
            { href: '/mahasiswa/pengumuman', label: 'Info', icon: Megaphone, color: 'group-hover:text-pink-500' },
          ].map((item, i) => (
            <Link key={item.href} href={item.href} className="block group animate-slide-up h-full">
              <div className="bg-card border border-border/40 hover:border-border/80 rounded-[1.5rem] p-4 flex flex-col items-center justify-center gap-3.5 h-full shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 p-3 rounded-2xl bg-muted/30 group-hover:bg-background transition-colors duration-500">
                  <item.icon className={`w-6 h-6 text-muted-foreground transition-all duration-500 group-hover:scale-110 ${item.color}`} />
                </div>
                <span className="relative z-10 text-[10px] font-semibold text-muted-foreground group-hover:text-foreground text-center">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. BOTTOM SECTIONS - Split Layout */}
      <div className="grid lg:grid-cols-2 gap-6 pt-4">
        
        {/* Jadwal Hari Ini Timeline */}
        <div className="bg-card rounded-[2rem] border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-500 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/40 flex items-center justify-between bg-muted/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Agenda Hari Ini</h3>
            </div>
            <Link href="/mahasiswa/jadwal" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="p-6 flex-1 bg-background/30">
            {(!data || data.jadwalHariIni.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Tidak ada jadwal</p>
                  <p className="text-xs text-muted-foreground mt-1">Anda tidak memiliki kelas hari ini.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[43px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {data.jadwalHariIni.map((j, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </div>
                    
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3.5 rounded-xl border border-border/50 bg-card shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded tabular-nums">
                          {j.waktu}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                          <Anchor className="w-3 h-3" /> {j.ruangan}
                        </span>
                      </div>
                      <h4 className="font-bold text-[13px] leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {j.mapel}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {j.instruktur}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pengumuman Feed */}
        <div className="bg-card rounded-[2rem] border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-500 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/40 flex items-center justify-between bg-muted/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Pengumuman Terbaru</h3>
            </div>
            <Link href="/mahasiswa/pengumuman" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Pusat Info <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="p-0 flex-1">
            {(!data || data.pengumumanTerbaru.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8 bg-background/50">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Belum ada pengumuman</p>
                  <p className="text-xs text-muted-foreground mt-1">Informasi kampus akan tampil di sini.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/50 h-full flex flex-col">
                {data.pengumumanTerbaru.map((p) => (
                  <Link key={p.id} href="/mahasiswa/pengumuman" className="block p-5 flex-1 bg-background/50 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-start justify-between gap-4 h-full items-center">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider bg-background text-muted-foreground">
                            {p.kategori}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {p.waktu}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {p.judul}
                        </h4>
                      </div>
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ChevronRight className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
