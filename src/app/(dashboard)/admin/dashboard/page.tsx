'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { fetchData } from '@/lib/api';
import {
  Users, Briefcase, GraduationCap, Award, TrendingUp,
  UserCheck, BookOpen, Ship, ChevronRight, Calendar,
  Clock, ArrowUpRight, Anchor, Activity, BarChart3, Loader2,
} from 'lucide-react';
import Link from 'next/link';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Selamat Pagi';
  if (h < 17) return 'Selamat Siang';
  return 'Selamat Malam';
}

interface AdminStats {
  totalMahasiswa: number;
  totalInstruktur: number;
  totalOJT: number;
  totalAlumni: number;
}

export default function AdminDashboard() {
  const { user } = useAppStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchData<AdminStats>('admin_stats');
      setStats(data);
      setLoading(false);
    };
    load();
  }, []);

  const kpis = [
    { label: 'Total Mahasiswa Aktif', value: stats?.totalMahasiswa ?? '—', icon: Users, color: 'text-primary', bgColor: 'bg-primary/8' },
    { label: 'Sedang OJT', value: stats?.totalOJT ?? '—', icon: Briefcase, color: 'text-chart-3', bgColor: 'bg-chart-3/8' },
    { label: 'Instruktur Aktif', value: stats?.totalInstruktur ?? '—', icon: GraduationCap, color: 'text-chart-4', bgColor: 'bg-chart-4/8' },
    { label: 'Total Alumni', value: stats?.totalAlumni ?? '—', icon: Award, color: 'text-chart-5', bgColor: 'bg-chart-5/8' },
  ];

  const quickActions = [
    { label: 'Mahasiswa', href: '/admin/mahasiswa', icon: Users, desc: 'Kelola data' },
    { label: 'Jadwal', href: '/admin/jadwal', icon: Calendar, desc: 'Atur jadwal' },
    { label: 'Nilai', href: '/admin/nilai', icon: GraduationCap, desc: 'Rekap nilai' },
    { label: 'Pembayaran', href: '/admin/pembayaran', icon: TrendingUp, desc: 'Keuangan' },
    { label: 'Interview', href: '/admin/interview', icon: Ship, desc: 'Sesi kapal' },
    { label: 'Alumni', href: '/admin/alumni', icon: Award, desc: 'Penyaluran' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-hero-pattern rounded-xl p-6 sm:p-7 text-white relative overflow-hidden">
        <div className="wave-decoration" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Badge variant="outline" className="border-white/15 text-white/55 text-[10px] bg-white/[0.05]">Panel Administrator</Badge>
                <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                  <Clock className="w-3 h-3" />
                  <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {getGreeting()}, {user?.nama_lengkap?.split(' ')[0] || 'Admin'} 👋
              </h1>
              <p className="text-white/50 text-sm mt-1.5">
                Kelola seluruh data akademik LTE Cruise dari satu tempat
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/mahasiswa">
                <Button variant="outline" className="border-white/15 text-white/70 hover:text-white hover:bg-white/10 text-xs h-9 btn-press bg-white/[0.05]">
                  <Users className="w-3.5 h-3.5 mr-2" /> Kelola Mahasiswa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {kpis.map((kpi, i) => (
          <Card key={i} className="border border-border shadow-sm card-metric animate-slide-up">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{kpi.label}</p>
                  {loading ? (
                    <div className="mt-2"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                  ) : (
                    <p className="text-2xl font-bold mt-1.5 tracking-tight metric-value">{kpi.value}</p>
                  )}
                </div>
                <div className={`p-2.5 rounded-xl ${kpi.bgColor} transition-colors duration-200`}>
                  <kpi.icon className={`w-[18px] h-[18px] ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="section-title">Akses Cepat</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 stagger-children">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="border border-border shadow-sm card-feature group animate-slide-up h-full">
                <CardContent className="p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 group-hover:bg-primary/8 flex items-center justify-center mb-2 transition-all duration-200">
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

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Distribution Chart - placeholder until real data */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" /> Distribusi per Jurusan
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">Data Real</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-4">
              {[
                { label: 'Housekeeping', count: '—', pct: 40, color: 'bg-primary' },
                { label: 'F&B Product', count: '—', pct: 30, color: 'bg-ocean-light' },
                { label: 'F&B Service', count: '—', pct: 30, color: 'bg-chart-3' },
              ].map((j, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold group-hover:text-primary transition-colors">{j.label}</span>
                    <span className="text-muted-foreground tabular-nums">{j.count} siswa</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden">
                    <div className={`h-full rounded-full ${j.color} transition-all duration-700 group-hover:opacity-80`} style={{ width: `${j.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground font-semibold tabular-nums">
                Total: {loading ? '...' : stats?.totalMahasiswa || 0} Mahasiswa Aktif
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" /> Aktivitas Terbaru
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">Hari ini</span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-1">
            {[
              { action: 'Sistem dimuat', detail: 'Dashboard admin berhasil diakses', time: 'Baru saja', icon: Activity, iconBg: 'bg-success/8', iconColor: 'text-success' },
              { action: 'Data tersinkronisasi', detail: 'Semua data dari database terhubung', time: 'Baru saja', icon: BarChart3, iconBg: 'bg-primary/8', iconColor: 'text-primary' },
            ].map((item, i) => (
              <div key={i} className="row-hover flex items-start gap-3.5 py-3 rounded-lg px-3 -mx-3 group cursor-pointer">
                <div className={`p-2.5 rounded-xl ${item.iconBg} shrink-0 transition-all duration-200`}>
                  <item.icon className={`w-[18px] h-[18px] ${item.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{item.action}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">{item.time}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
