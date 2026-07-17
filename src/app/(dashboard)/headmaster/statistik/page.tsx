'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, GraduationCap, Briefcase, Award, Globe, CheckCircle2, Loader2 } from 'lucide-react';
import { fetchData } from '@/lib/api';

const JURUSAN_LABELS: Record<string, string> = { housekeeping: 'Housekeeping', fnb_product: 'F&B Product', fnb_service: 'F&B Service', general: 'Umum' };
const PROGRAM_LABELS: Record<string, string> = { diploma1: 'Diploma 1', executive: 'Executive', english_cruise: 'English for Cruise' };
const JURUSAN_COLORS = ['bg-primary', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4'];

export default function HeadmasterStatistikPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData('headmaster_stats').then(d => {
      setStats(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const totalMhs = stats?.totalMahasiswa || 0;
  const avgKehadiran = stats?.avgKehadiran || 0;
  const uniqueCountries = stats?.uniqueCountries || 0;
  const jurusanCount: Record<string, number> = stats?.jurusanCount || {};
  const programCount: Record<string, number> = stats?.programCount || {};

  // Build jurusan stats
  const totalJurusan = Object.values(jurusanCount).reduce((a: number, b: any) => a + b, 0) || 1;
  const jurusanStats = Object.entries(jurusanCount).map(([key, count]) => ({
    label: JURUSAN_LABELS[key] || key,
    count: count as number,
    pct: Math.round(((count as number) / totalJurusan) * 100),
  }));

  // Build program stats
  const programStats = Object.entries(programCount).map(([key, count]) => ({
    label: PROGRAM_LABELS[key] || key,
    total: count as number,
  }));

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header"><div><h1>Statistik & Analitik</h1><p>Ringkasan data dan kinerja LTE Cruise</p></div></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { label: 'Total Mahasiswa', value: totalMhs.toString(), icon: Users, color: 'text-primary', bgColor: 'bg-primary/8', highlight: true },
          { label: 'Rata-rata Kehadiran', value: `${avgKehadiran}%`, icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/8' },
          { label: 'Total OJT Aktif', value: (stats?.totalOJT || 0).toString(), icon: Briefcase, color: 'text-chart-4', bgColor: 'bg-chart-4/8' },
          { label: 'Negara Tujuan', value: uniqueCountries.toString(), icon: Globe, color: 'text-chart-5', bgColor: 'bg-chart-5/8' },
        ].map((s, i) => (
          <Card key={i} className={`border border-border shadow-sm animate-slide-up ${i === 0 ? 'card-stat-highlight' : 'card-metric'}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${i === 0 ? 'stat-label' : 'text-muted-foreground'}`}>{s.label}</p>
                  <p className={`text-2xl font-bold mt-1.5 ${i === 0 ? 'stat-value' : 'metric-value'}`}>{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${i === 0 ? 'bg-white/10' : s.bgColor}`}>
                  <s.icon className={`w-[18px] h-[18px] ${i === 0 ? 'text-white/60' : s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Distribusi Jurusan */}
        <Card className="border border-border/60 shadow-none">
          <CardHeader className="pb-2 px-5 pt-5"><CardTitle className="text-sm font-medium flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted-foreground" /> Distribusi per Jurusan</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {jurusanStats.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Belum ada data</p>
            ) : jurusanStats.map((j, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1.5"><span className="font-medium">{j.label}</span><span className="text-muted-foreground tabular-nums">{j.count} ({j.pct}%)</span></div>
                <div className="h-2 rounded-full bg-muted/40 overflow-hidden"><div className={`h-full rounded-full ${JURUSAN_COLORS[i % JURUSAN_COLORS.length]} transition-all duration-700 animate-progress`} style={{ width: `${j.pct}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Card className="border border-border/60 shadow-none">
          <CardHeader className="pb-2 px-5 pt-5"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /> Ringkasan Institusi</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            <div className="p-4 rounded-lg border border-border/60 hover:border-primary/20 transition-colors card-interactive">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Instruktur</span>
                <span className="text-xl font-bold text-primary tabular-nums">{stats?.totalInstruktur || 0}</span>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-border/60 hover:border-primary/20 transition-colors card-interactive">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Alumni</span>
                <span className="text-xl font-bold text-success tabular-nums">{stats?.totalAlumni || 0}</span>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-border/60 hover:border-primary/20 transition-colors card-interactive">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">OJT Aktif</span>
                <span className="text-xl font-bold text-chart-4 tabular-nums">{stats?.totalOJT || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per Program */}
      <Card className="border border-border/60 shadow-none">
        <CardHeader className="pb-2 px-5 pt-5"><CardTitle className="text-sm font-medium flex items-center gap-2"><GraduationCap className="w-4 h-4 text-muted-foreground" /> Statistik per Program</CardTitle></CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          {programStats.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Belum ada data</p>
          ) : programStats.map((p, i) => (
            <div key={i} className="p-4 rounded-lg border border-border/60 hover:border-primary/20 transition-colors card-interactive">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{p.label}</h3>
                <Badge variant="outline" className="text-[10px]">{p.total} mahasiswa</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
