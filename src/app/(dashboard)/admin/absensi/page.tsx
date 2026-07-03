'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, CheckCircle2, XCircle, AlertCircle, Clock, Download, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function AdminAbsensiPage() {
  const classes = [
    { kelas: 'D1-ALL-25A', mapel: 'English for Hospitality', hadir: 28, izin: 2, sakit: 1, alpha: 1, total: 32 },
    { kelas: 'D1-HK-25A', mapel: 'Housekeeping Management', hadir: 18, izin: 1, sakit: 0, alpha: 1, total: 20 },
    { kelas: 'D1-FP-25A', mapel: 'F&B Product', hadir: 22, izin: 0, sakit: 2, alpha: 0, total: 24 },
    { kelas: 'D1-FS-25A', mapel: 'Restaurant Service', hadir: 15, izin: 1, sakit: 1, alpha: 1, total: 18 },
    { kelas: 'D1-FS-24A', mapel: 'Bartending & Mixology', hadir: 20, izin: 2, sakit: 0, alpha: 0, total: 22 },
  ];

  const totals = classes.reduce((a, c) => ({ hadir: a.hadir + c.hadir, izin: a.izin + c.izin, sakit: a.sakit + c.sakit, alpha: a.alpha + c.alpha, total: a.total + c.total }), { hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 });
  const overallPct = totals.total > 0 ? Math.round((totals.hadir / totals.total) * 100) : 0;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Rekap Absensi</h1>
            <p>Monitoring kehadiran seluruh kelas LTE Cruise</p>
          </div>
          <Button variant="outline" className="btn-press text-xs h-9"><Download className="w-3.5 h-3.5 mr-1.5" /> Export Data</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-stat-highlight col-span-2 lg:col-span-1 animate-slide-up">
          <CardContent className="p-5 text-center">
            <p className="stat-label">Kehadiran</p>
            <p className="stat-value mt-1">{overallPct}%</p>
          </CardContent>
        </Card>
        {[
          { label: 'Hadir', count: totals.hadir, cls: 'text-success', bgCls: 'bg-success/8', icon: CheckCircle2 },
          { label: 'Izin', count: totals.izin, cls: 'text-primary', bgCls: 'bg-primary/8', icon: Clock },
          { label: 'Sakit', count: totals.sakit, cls: 'text-warning', bgCls: 'bg-warning/8', icon: AlertCircle },
          { label: 'Alpha', count: totals.alpha, cls: 'text-error', bgCls: 'bg-error/8', icon: XCircle },
        ].map(s => (
          <Card key={s.label} className="border border-border shadow-sm card-metric animate-slide-up">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1.5 metric-value ${s.cls}`}>{s.count}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.bgCls}`}><s.icon className={`w-[18px] h-[18px] ${s.cls}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-muted-foreground" /> Rekap per Kelas
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          {classes.map((c, i) => {
            const pct = Math.round((c.hadir / c.total) * 100);
            return (
              <div key={i} className="p-4 rounded-xl border border-border hover:border-primary/20 transition-all card-interactive group">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{c.mapel}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.kelas} · {c.total} mahasiswa</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2.5 text-[11px] font-medium">
                      <span className="text-success tabular-nums">{c.hadir}H</span>
                      <span className="text-primary tabular-nums">{c.izin}I</span>
                      <span className="text-warning tabular-nums">{c.sakit}S</span>
                      <span className="text-error tabular-nums">{c.alpha}A</span>
                    </div>
                    <Badge variant="outline" className={`text-xs font-semibold tabular-nums ${pct >= 80 ? 'text-success border-success/20' : 'text-error border-error/20'}`}>{pct}%</Badge>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-success' : 'bg-error'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
