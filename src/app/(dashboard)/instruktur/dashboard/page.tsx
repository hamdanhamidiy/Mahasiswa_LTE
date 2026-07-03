'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, Calendar, ClipboardCheck, BookOpen, Briefcase,
  ChevronRight, Clock, GraduationCap, TrendingUp,
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

  const stats = [
    { label: 'Mahasiswa Bimbingan', value: '32', icon: Users, sub: 'aktif semester ini', color: 'text-primary', bgColor: 'bg-primary/8' },
    { label: 'Kelas Aktif', value: '4', icon: BookOpen, sub: 'mata pelajaran', color: 'text-chart-3', bgColor: 'bg-chart-3/8' },
    { label: 'Jadwal Hari Ini', value: '3', icon: Calendar, sub: new Date().toLocaleDateString('id-ID', { weekday: 'long' }), color: 'text-chart-4', bgColor: 'bg-chart-4/8' },
    { label: 'Mahasiswa OJT', value: '8', icon: Briefcase, sub: 'di bimbingan Anda', color: 'text-chart-5', bgColor: 'bg-chart-5/8' },
  ];

  const jadwalHariIni = [
    { waktu: '08:00 - 10:00', mapel: 'English for Hospitality', kelas: 'D1-ALL-25A', ruangan: 'Ruang A1' },
    { waktu: '10:30 - 12:30', mapel: 'Restaurant Service', kelas: 'D1-FS-25A', ruangan: 'Ruang C1' },
    { waktu: '13:00 - 15:00', mapel: 'Bartending & Mixology', kelas: 'D1-FS-24A', ruangan: 'Bar Lab' },
  ];

  const quickActions = [
    { href: '/instruktur/absensi', label: 'Input Absensi', icon: ClipboardCheck, desc: 'Rekap kehadiran', color: 'group-hover:bg-success/8' },
    { href: '/instruktur/nilai', label: 'Input Nilai', icon: GraduationCap, desc: 'Nilai mahasiswa', color: 'group-hover:bg-primary/8' },
    { href: '/instruktur/jadwal', label: 'Jadwal', icon: Calendar, desc: 'Jadwal mengajar', color: 'group-hover:bg-chart-4/8' },
    { href: '/instruktur/ojt', label: 'OJT', icon: Briefcase, desc: 'Bimbingan OJT', color: 'group-hover:bg-chart-5/8' },
  ];

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="bg-hero-pattern rounded-xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="wave-decoration" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <Badge variant="outline" className="border-white/15 text-white/55 text-[10px] bg-white/[0.05]">Dashboard Instruktur</Badge>
            <div className="flex items-center gap-1.5 text-[10px] text-white/30">
              <Clock className="w-3 h-3" />
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {getGreeting()}, {user?.nama_lengkap?.split(' ')[0] || 'Instruktur'} 👋
          </h1>
          <p className="text-white/50 text-sm mt-1.5">
            Kelola kelas, absensi, dan nilai mahasiswa Anda
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((s, i) => (
          <Card key={i} className="border border-border shadow-sm card-metric animate-slide-up">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold mt-1.5 tracking-tight metric-value">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{s.sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.bgColor}`}>
                  <s.icon className={`w-[18px] h-[18px] ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title">Akses Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="border border-border shadow-sm card-feature group animate-slide-up h-full">
                <CardContent className="p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                  <div className={`w-10 h-10 rounded-xl bg-muted/50 ${action.color} flex items-center justify-center mb-2.5 transition-all duration-200`}>
                    <action.icon className="w-[18px] h-[18px] text-muted-foreground group-hover:text-primary card-feature-icon transition-colors duration-200" />
                  </div>
                  <p className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</p>
                  <p className="text-[9px] text-muted-foreground/50 mt-0.5">{action.desc}</p>
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
              <ClipboardCheck className="w-4 h-4 text-muted-foreground" /> Jadwal Mengajar Hari Ini
            </CardTitle>
            <Link href="/instruktur/jadwal" className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 font-medium hover-underline">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-1">
          {jadwalHariIni.map((j, i) => (
            <div key={i} className="row-hover flex items-center gap-3 py-3 rounded-lg px-3 -mx-3 group">
              <div className="w-28 shrink-0">
                <span className="text-xs font-mono text-primary font-semibold tabular-nums">{j.waktu.split(' - ')[0]}</span>
                <span className="text-[10px] text-muted-foreground"> — {j.waktu.split(' - ')[1]}</span>
              </div>
              <div className="w-px h-8 bg-border/60 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">{j.mapel}</p>
                <p className="text-[11px] text-muted-foreground">{j.kelas} · {j.ruangan}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0" />
            </div>
          ))}
          {jadwalHariIni.length === 0 && (
            <div className="empty-state">
              <Clock className="w-10 h-10 mx-auto text-muted-foreground/10" />
              <h3>Tidak ada jadwal mengajar hari ini</h3>
              <p>Nikmati waktu istirahat Anda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
