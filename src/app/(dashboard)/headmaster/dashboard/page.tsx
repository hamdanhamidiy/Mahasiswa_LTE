'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { fetchData } from '@/lib/api';
import {
  Users, TrendingUp, Award, Ship, Globe,
  BarChart3, GraduationCap, Briefcase, Clock,
  Loader2, ChevronRight,
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
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData('admin_stats').then(d => {
      setStats(d || { total_mahasiswa: 0, total_instruktur: 0, total_ojt: 0, total_alumni: 0 });
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Total Mahasiswa', value: stats?.total_mahasiswa || 0, sub: 'Terdaftar di sistem', icon: Users, color: 'text-primary', bgColor: 'bg-primary/8' },
    { label: 'Total Instruktur', value: stats?.total_instruktur || 0, sub: 'Pengajar aktif', icon: GraduationCap, color: 'text-success', bgColor: 'bg-success/8' },
    { label: 'Mahasiswa OJT', value: stats?.total_ojt || 0, sub: 'Sedang magang', icon: Briefcase, color: 'text-warning', bgColor: 'bg-warning/8' },
    { label: 'Total Alumni', value: stats?.total_alumni || 0, sub: 'Lulusan bersertifikat', icon: Award, color: 'text-chart-4', bgColor: 'bg-chart-4/8' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-hero-pattern rounded-xl p-6 sm:p-7 text-white relative overflow-hidden">
        <div className="wave-decoration" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <Badge variant="outline" className="border-white/15 text-white/55 text-[10px] bg-white/[0.05]">Panel Headmaster</Badge>
            <div className="flex items-center gap-1.5 text-[10px] text-white/30">
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {getGreeting()}, {user?.nama_lengkap?.split(' ')[0] || 'Headmaster'} 👋
          </h1>
          <p className="text-white/50 text-sm mt-1.5">Ringkasan performa dan statistik kampus LTE Cruise</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {statCards.map((s, i) => (
          <Card key={i} className="border border-border shadow-sm card-metric animate-slide-up">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
                <div className={`p-2 rounded-xl ${s.bgColor}`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Links */}
        <Card className="border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-primary/8"><BarChart3 className="w-4 h-4 text-primary" /></div>
              <h3 className="font-semibold">Laporan & Analitik</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/headmaster/statistik">
                <div className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors group cursor-pointer text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold">Statistik</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Data detail kampus</p>
                </div>
              </Link>
              <Link href="/headmaster/laporan">
                <div className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors group cursor-pointer text-center">
                  <Award className="w-6 h-6 mx-auto mb-2 text-chart-4 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold">Laporan</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Rekap OJT & Alumni</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Global Network */}
        <Card className="border border-border shadow-sm bg-gradient-to-br from-background to-muted/30">
          <CardContent className="p-5 flex flex-col justify-center h-full text-center">
            <Globe className="w-10 h-10 mx-auto mb-3 text-chart-5" />
            <h3 className="font-bold text-lg">Jaringan Global LTE Cruise</h3>
            <p className="text-[11px] text-muted-foreground mt-1.5 max-w-xs mx-auto">Pantau persebaran mahasiswa OJT dan Alumni di berbagai mitra kapal pesiar dan perhotelan internasional.</p>
            <Link href="/headmaster/alumni" className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline justify-center">
              Lihat Persebaran <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
