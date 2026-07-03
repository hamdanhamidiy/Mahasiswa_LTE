'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import {
  Users, TrendingUp, Award, Ship, Globe,
  BarChart3, GraduationCap, Briefcase, Clock,
  ArrowUpRight, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Selamat Pagi';
  if (h < 17) return 'Selamat Siang';
  return 'Selamat Malam';
}

export default function HeadmasterDashboard() {
  const { user } = useAppStore();

  const stats = [
    { label: 'Total Mahasiswa', value: '156', sub: '5 angkatan aktif', icon: Users, color: 'text-primary', bgColor: 'bg-primary/8' },
    { label: 'Tingkat Kelulusan', value: '96%', sub: 'rata-rata 3 tahun', icon: GraduationCap, color: 'text-success', bgColor: 'bg-success/8' },
    { label: 'Penyaluran Kerja', value: '89%', sub: 'alumni bekerja', icon: Award, color: 'text-chart-4', bgColor: 'bg-chart-4/8' },
    { label: 'Negara Tujuan', value: '12', sub: 'destinasi alumni', icon: Globe, color: 'text-chart-5', bgColor: 'bg-chart-5/8' },
  ];

  const topStudents = [
    { nama: 'Rina Maharani', jurusan: 'Housekeeping', nilai: 92.5, angkatan: '24' },
    { nama: 'Dimas Pratama', jurusan: 'F&B Product', nilai: 89.3, angkatan: '24' },
    { nama: 'Siti Nurhaliza', jurusan: 'F&B Service', nilai: 87.8, angkatan: '24' },
  ];

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="bg-hero-pattern rounded-xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="wave-decoration" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <Badge variant="outline" className="border-white/15 text-white/55 text-[10px] bg-white/[0.05]">Dashboard Eksekutif</Badge>
            <div className="flex items-center gap-1.5 text-[10px] text-white/30">
              <Clock className="w-3 h-3" />
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {getGreeting()}, {user?.nama_lengkap?.split(' ')[0] || 'Direktur'} 👋
          </h1>
          <p className="text-white/50 text-sm mt-1.5">
            Ringkasan kinerja LTE Cruise — Sistem Informasi Akademik
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

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Trend Chart */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" /> Tren Pertumbuhan Pendaftar
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">5 Tahun</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="bar-chart" style={{ height: '180px' }}>
              {[
                { label: '2021', value: 85 },
                { label: '2022', value: 102 },
                { label: '2023', value: 128 },
                { label: '2024', value: 156 },
                { label: '2025', value: 142 },
              ].map((b, i) => {
                const maxVal = 170;
                const pct = (b.value / maxVal) * 100;
                return (
                  <div key={i} className="bar-item group">
                    <span className="bar-value">{b.value}</span>
                    <div className="bar-track">
                      <div className="bar-fill animate-bar-grow group-hover:brightness-110" style={{ height: `${pct}%`, animationDelay: `${i * 100}ms` }} />
                    </div>
                    <span className="bar-label">{b.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top students */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" /> Top Performing Students
              </CardTitle>
              <Link href="/headmaster/statistik" className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 font-medium hover-underline">
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {topStudents.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-lg border border-border hover:border-primary/20 transition-all card-interactive group">
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center text-primary font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{s.nama}</p>
                  <p className="text-[11px] text-muted-foreground">{s.jurusan} · Angkatan {s.angkatan}</p>
                </div>
                <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/20 tabular-nums">{s.nilai}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Alumni distribution */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" /> Sebaran Alumni Bekerja per Negara
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
            {[
              { flag: '🇮🇩', negara: 'Indonesia', jumlah: 45 },
              { flag: '🇲🇾', negara: 'Malaysia', jumlah: 32 },
              { flag: '🇹🇭', negara: 'Thailand', jumlah: 18 },
              { flag: '🇦🇪', negara: 'Dubai', jumlah: 28 },
              { flag: '🇺🇸', negara: 'Amerika', jumlah: 15 },
              { flag: '🇪🇺', negara: 'Eropa', jumlah: 22 },
            ].map((a, i) => (
              <div key={i} className="text-center p-4 rounded-xl border border-border hover:border-primary/20 transition-all card-interactive animate-slide-up group">
                <p className="text-2xl mb-1.5 group-hover:scale-110 transition-transform inline-block">{a.flag}</p>
                <p className="text-xl font-bold tabular-nums metric-value">{a.jumlah}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{a.negara}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
