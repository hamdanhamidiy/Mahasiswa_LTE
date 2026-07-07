'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchData } from '@/lib/api';
import {
  Users, Calendar, ClipboardCheck, BookOpen, Briefcase,
  ChevronRight, Clock, GraduationCap, Loader2,
} from 'lucide-react';
import Link from 'next/link';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Selamat Pagi';
  if (h < 17) return 'Selamat Siang';
  return 'Selamat Malam';
}

export default function InstrukturDashboard() {
  const { user } = useAppStore();
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [ojt, setOjt] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [j, o] = await Promise.all([
        fetchData('instruktur_jadwal'),
        fetchData('instruktur_mahasiswa_ojt'),
      ]);
      setJadwal(j || []);
      setOjt(o || []);
      setLoading(false);
    };
    load();
  }, []);

  // Today's schedule
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayHari = days[new Date().getDay()];
  const jadwalHariIni = jadwal.filter((j: any) => j.hari === todayHari).map((j: any) => ({
    waktu: `${j.jam_mulai} - ${j.jam_selesai}`,
    mapel: j.mata_pelajaran?.nama_mapel || '—',
    kelas: j.kelas || '—',
    ruangan: j.ruangan || '—',
  }));

  const uniqueMapel = new Set(jadwal.map((j: any) => j.mata_pelajaran?.nama_mapel)).size;

  const stats = [
    { label: 'Kelas Aktif', value: loading ? '—' : jadwal.length, icon: BookOpen, sub: 'total sesi', color: 'text-chart-3', bgColor: 'bg-chart-3/8' },
    { label: 'Mata Pelajaran', value: loading ? '—' : uniqueMapel, icon: GraduationCap, sub: 'yang diampu', color: 'text-primary', bgColor: 'bg-primary/8' },
    { label: 'Jadwal Hari Ini', value: loading ? '—' : jadwalHariIni.length, icon: Calendar, sub: todayHari, color: 'text-chart-4', bgColor: 'bg-chart-4/8' },
    { label: 'Mahasiswa OJT', value: loading ? '—' : ojt.length, icon: Briefcase, sub: 'di bimbingan', color: 'text-chart-5', bgColor: 'bg-chart-5/8' },
  ];

  const quickActions = [
    { href: '/instruktur/absensi', label: 'Input Absensi', icon: ClipboardCheck, desc: 'Rekap kehadiran' },
    { href: '/instruktur/nilai', label: 'Input Nilai', icon: GraduationCap, desc: 'Nilai mahasiswa' },
    { href: '/instruktur/jadwal', label: 'Jadwal', icon: Calendar, desc: 'Jadwal mengajar' },
    { href: '/instruktur/ojt', label: 'OJT', icon: Briefcase, desc: 'Bimbingan OJT' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-sky-500 via-cyan-500 to-sky-400 rounded-xl p-6 sm:p-7 text-white relative overflow-hidden shadow-lg shadow-sky-200/30">
        <div className="wave-decoration" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <Badge variant="outline" className="border-white/15 text-white/55 text-[10px] bg-white/[0.05]">Panel Instruktur</Badge>
            <div className="flex items-center gap-1.5 text-[10px] text-white/30">
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {getGreeting()}, {user?.nama_lengkap?.split(' ')[0] || 'Instruktur'} 👋
          </h1>
          <p className="text-white/50 text-sm mt-1.5">Kelola kelas, nilai, dan bimbingan OJT mahasiswa Anda</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {stats.map((s, i) => (
          <Card key={i} className="border border-border shadow-sm card-metric animate-slide-up">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold mt-1 tracking-tight metric-value">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
                <div className={`p-2 rounded-xl ${s.bgColor}`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title">Akses Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href}>
              <Card className="border border-border shadow-sm card-feature group animate-slide-up h-full">
                <CardContent className="p-4 text-center flex flex-col items-center justify-center min-h-[90px]">
                  <div className="w-9 h-9 rounded-xl bg-muted/50 group-hover:bg-primary/8 flex items-center justify-center mb-2 transition-all">
                    <a.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary card-feature-icon transition-colors" />
                  </div>
                  <p className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{a.label}</p>
                  <p className="text-[9px] text-muted-foreground/50 mt-0.5">{a.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3 px-5 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" /> Jadwal Hari Ini — {todayHari}
            </CardTitle>
            <Link href="/instruktur/jadwal" className="text-[11px] text-primary font-medium flex items-center gap-1 hover:underline">
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {loading ? (
            <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat jadwal...</p></div>
          ) : jadwalHariIni.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/15" />
              <p className="text-xs text-muted-foreground">Tidak ada jadwal hari ini</p>
            </div>
          ) : (
            <div className="space-y-1">
              {jadwalHariIni.map((j: any, i: number) => (
                <div key={i} className="row-hover flex items-center gap-3.5 py-3 rounded-lg px-3 -mx-3 group cursor-pointer">
                  <div className="p-2 rounded-xl bg-primary/8 shrink-0"><Clock className="w-4 h-4 text-primary" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{j.mapel}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{j.kelas} · {j.ruangan}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium tabular-nums shrink-0">{j.waktu}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
