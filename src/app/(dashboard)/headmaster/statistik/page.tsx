'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, GraduationCap, Briefcase, Award, Globe, CheckCircle2, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function HeadmasterStatistikPage() {
  const programStats = [
    { label: 'Diploma 1', total: 120, ojt: 35, lulus: 40, kehadiran: 92 },
    { label: 'Executive', total: 24, ojt: 5, lulus: 8, kehadiran: 88 },
    { label: 'English for Cruise', total: 12, ojt: 2, lulus: 5, kehadiran: 95 },
  ];

  const jurusanStats = [
    { label: 'Housekeeping', count: 65, pct: 42, color: 'bg-primary' },
    { label: 'F&B Product', count: 48, pct: 31, color: 'bg-chart-2' },
    { label: 'F&B Service', count: 43, pct: 27, color: 'bg-chart-3' },
  ];

  const monthlyTrend = [
    { month: 'Jan', pendaftar: 15, kelulusan: 12 },
    { month: 'Feb', pendaftar: 22, kelulusan: 0 },
    { month: 'Mar', pendaftar: 18, kelulusan: 0 },
    { month: 'Apr', pendaftar: 25, kelulusan: 15 },
    { month: 'Mei', pendaftar: 20, kelulusan: 0 },
    { month: 'Jun', pendaftar: 12, kelulusan: 0 },
  ];

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header"><div><h1>Statistik & Analitik</h1><p>Ringkasan data dan kinerja LTE Cruise</p></div></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { label: 'Total Mahasiswa', value: '156', icon: Users, color: 'text-primary', bgColor: 'bg-primary/8', highlight: true },
          { label: 'Rata-rata Kehadiran', value: '92%', icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/8' },
          { label: 'Penyaluran Kerja', value: '89%', icon: Briefcase, color: 'text-chart-4', bgColor: 'bg-chart-4/8' },
          { label: 'Negara Tujuan', value: '12', icon: Globe, color: 'text-chart-5', bgColor: 'bg-chart-5/8' },
        ].map((s, i) => (
          <Card key={i} className={`border border-border shadow-sm animate-slide-up ${i === 0 ? 'card-stat-highlight' : 'card-metric'}`}>
            <CardContent className="p-5">
              <div className={`flex items-start justify-between ${i === 0 ? '' : ''}`}>
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
            {jurusanStats.map((j, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1.5"><span className="font-medium">{j.label}</span><span className="text-muted-foreground tabular-nums">{j.count} ({j.pct}%)</span></div>
                <div className="h-2 rounded-full bg-muted/40 overflow-hidden"><div className={`h-full rounded-full ${j.color} transition-all duration-700 animate-progress`} style={{ width: `${j.pct}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tren Bulanan */}
        <Card className="border border-border/60 shadow-none">
          <CardHeader className="pb-2 px-5 pt-5"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /> Tren Pendaftar Bulanan</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-end gap-3 h-40">
              {monthlyTrend.map((b, i) => {
                const pct = (b.pendaftar / 30) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium tabular-nums text-muted-foreground">{b.pendaftar}</span>
                    <div className="w-full bg-muted/40 rounded-t flex flex-col justify-end" style={{ height: '100%' }}>
                      <div className="bg-primary rounded-t transition-all duration-700" style={{ height: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{b.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per Program */}
      <Card className="border border-border/60 shadow-none">
        <CardHeader className="pb-2 px-5 pt-5"><CardTitle className="text-sm font-medium flex items-center gap-2"><GraduationCap className="w-4 h-4 text-muted-foreground" /> Statistik per Program</CardTitle></CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          {programStats.map((p, i) => (
            <div key={i} className="p-4 rounded-lg border border-border/60 hover:border-primary/20 transition-colors card-interactive">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{p.label}</h3>
                <Badge variant="outline" className="text-[10px]">{p.total} mahasiswa</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><p className="text-lg font-semibold text-primary tabular-nums">{p.ojt}</p><p className="text-[10px] text-muted-foreground">OJT</p></div>
                <div className="text-center"><p className="text-lg font-semibold text-success tabular-nums">{p.lulus}</p><p className="text-[10px] text-muted-foreground">Lulus</p></div>
                <div className="text-center"><p className="text-lg font-semibold tabular-nums">{p.kehadiran}%</p><p className="text-[10px] text-muted-foreground">Kehadiran</p></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
