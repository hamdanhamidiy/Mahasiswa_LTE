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
      
      {/* 1. HERO BANNER - Premium Modern Gradient */}
      <div className="relative overflow-hidden rounded-[2rem] text-white shadow-xl shadow-blue-900/10 border border-white/5 bg-[#0a1526]">
        {/* Soft Mesh Background Gradients */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-600/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-indigo-600/30 via-transparent to-transparent" />
        
        {/* Floating Ambient Lights */}
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite] mix-blend-screen pointer-events-none" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite_reverse] mix-blend-screen pointer-events-none" />
        <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-cyan-400/15 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite] mix-blend-screen pointer-events-none" />
        
        {/* Modern Dot Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at center, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
        
        <div className="relative z-10 p-8 sm:p-12 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
          
          {/* Left: User Identity */}
          <div className="space-y-5 flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-100/90">
                {getGreeting()}
              </span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                {user?.nama_lengkap || 'Mahasiswa'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-blue-100/70">
                {user?.nim && (
                  <span className="font-mono bg-blue-900/40 border border-blue-400/20 px-2.5 py-1 rounded-md text-blue-200">{user.nim}</span>
                )}
                <span>•</span>
                <span>{user?.angkatan || 'Angkatan 25'}</span>
                {user?.program && (
                  <>
                    <span>•</span>
                    <span className="bg-white/10 px-2.5 py-1 rounded-md">{getProgramLabel(user.program)}</span>
                  </>
                )}
                {user?.jurusan && (
                  <>
                    <span>•</span>
                    <span className="bg-white/10 px-2.5 py-1 rounded-md">{getJurusanLabel(user.jurusan)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Progress Tracker */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Progress Studi</p>
                <p className="text-2xl font-bold text-white tabular-nums">{overallProgress}%</p>
              </div>
              
              <div className="relative h-2 w-full bg-slate-900/50 rounded-full overflow-hidden mb-4">
                <div 
                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 shadow-[0_0_10px_rgba(96,165,250,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-medium text-slate-400 relative">
                <span className={overallProgress >= 0 ? 'text-blue-300 font-bold' : ''}>Kelas</span>
                <span className={overallProgress >= 70 ? 'text-blue-300 font-bold' : ''}>OJT</span>
                <span className={overallProgress >= 100 ? 'text-blue-300 font-bold' : ''}>Akhir</span>
                
                {/* Milestone dots */}
                <div className="absolute -top-6 left-0 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]" />
                <div className={`absolute -top-6 left-[70%] w-1.5 h-1.5 rounded-full transition-colors ${overallProgress >= 70 ? 'bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]' : 'bg-slate-700'}`} />
                <div className={`absolute -top-6 right-0 w-1.5 h-1.5 rounded-full transition-colors ${overallProgress >= 100 ? 'bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]' : 'bg-slate-700'}`} />
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
          <div key={i} className={`group relative bg-card p-5 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up hover:-translate-y-1 overflow-hidden`}>
            {/* Background Icon Watermark */}
            <stat.icon className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.color} opacity-5 group-hover:scale-110 transition-transform duration-500`} />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums mb-1">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
              <div className="bg-card border border-border/60 hover:border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 h-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 p-2 rounded-xl bg-muted/40 group-hover:bg-background transition-colors">
                  <item.icon className={`w-5 h-5 text-muted-foreground transition-colors duration-300 ${item.color}`} />
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
        <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-md text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">Agenda Hari Ini</h3>
            </div>
            <Link href="/mahasiswa/jadwal" className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="p-5 flex-1 bg-background/50">
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
        <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-md text-blue-600 dark:text-blue-400">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">Pengumuman Terbaru</h3>
            </div>
            <Link href="/mahasiswa/pengumuman" className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
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
