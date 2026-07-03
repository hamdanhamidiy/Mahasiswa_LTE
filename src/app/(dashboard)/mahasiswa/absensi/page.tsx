'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck, QrCode, CheckCircle2, XCircle, AlertCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';

interface AbsensiRecord { id: string; tanggal: string; status: string; metode: string; jadwal: { mata_pelajaran: { nama_mapel: string; kode_mapel: string } } }
interface RekapMapel { mapel: string; kode: string; hadir: number; izin: number; sakit: number; alpha: number; total: number; persen: number }

export default function AbsensiPage() {
  const [loading, setLoading] = useState(true);
  const [rekap, setRekap] = useState<RekapMapel[]>([]);
  const [recent, setRecent] = useState<AbsensiRecord[]>([]);
  const [stats, setStats] = useState({ hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 });

  useEffect(() => {
    fetchData<AbsensiRecord[]>('absensi').then(data => {
      if (data && data.length > 0) {
        setRecent(data.slice(0, 15));
        const map: Record<string, RekapMapel> = {};
        let h = 0, iz = 0, s = 0, a = 0;
        for (const r of data) {
          const nm = r.jadwal?.mata_pelajaran?.nama_mapel || 'Unknown';
          const kd = r.jadwal?.mata_pelajaran?.kode_mapel || '';
          if (!map[nm]) map[nm] = { mapel: nm, kode: kd, hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0, persen: 0 };
          map[nm].total++;
          if (r.status === 'hadir') { map[nm].hadir++; h++; }
          else if (r.status === 'izin') { map[nm].izin++; iz++; }
          else if (r.status === 'sakit') { map[nm].sakit++; s++; }
          else { map[nm].alpha++; a++; }
        }
        setRekap(Object.values(map).map(r => ({ ...r, persen: Math.round((r.hadir / r.total) * 100) })));
        setStats({ hadir: h, izin: iz, sakit: s, alpha: a, total: data.length });
      }
      setLoading(false);
    });
  }, []);

  const overallPct = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

  const statusCfg: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
    hadir: { label: 'Hadir', cls: 'text-success', icon: CheckCircle2 },
    izin: { label: 'Izin', cls: 'text-primary', icon: Clock },
    sakit: { label: 'Sakit', cls: 'text-warning', icon: AlertCircle },
    alpha: { label: 'Alpha', cls: 'text-error', icon: XCircle },
  };

  if (loading) return <div className="page-loading"><div className="loading-content"><div className="spinner-modern mx-auto mb-3" /><p className="text-xs text-muted-foreground">Memuat data absensi...</p></div></div>;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1>Absensi</h1>
            <p>Rekap kehadiran dan riwayat absensi</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 btn-press shadow-md shadow-primary/15 h-10 text-xs">
            <QrCode className="w-4 h-4 mr-2" /> Scan QR Absensi
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        <Card className="border border-border shadow-sm col-span-2 lg:col-span-1 card-stat-highlight animate-slide-up">
          <CardContent className="p-5 text-center">
            <p className="stat-value">{overallPct}%</p>
            <p className="stat-label mt-1.5">Kehadiran</p>
          </CardContent>
        </Card>
        {(['hadir', 'izin', 'sakit', 'alpha'] as const).map(k => {
          const c = statusCfg[k];
          return (
            <Card key={k} className="border border-border shadow-sm card-interactive animate-slide-up">
              <CardContent className="p-5 text-center">
                <c.icon className={`w-5 h-5 mx-auto mb-2 ${c.cls}`} />
                <p className="text-xl font-bold tabular-nums">{stats[k]}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{c.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Per Mapel */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-muted-foreground" /> Rekap per Mata Pelajaran
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          {rekap.length === 0 && (
            <div className="text-center py-10">
              <ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground/12" />
              <p className="text-sm text-muted-foreground font-medium">Belum ada data absensi</p>
            </div>
          )}
          {rekap.map((r, i) => (
            <div key={i} className="p-4 rounded-xl border border-border hover:border-primary/20 transition-colors duration-200 hover:shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[13px] font-semibold">{r.mapel}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{r.kode}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-muted-foreground">
                    <span>{r.hadir}H</span> <span>{r.izin}I</span> <span>{r.sakit}S</span> <span>{r.alpha}A</span>
                  </div>
                  <Badge variant="outline" className={`text-xs font-semibold ${r.persen >= 80 ? 'text-success border-success/20' : 'text-error border-error/20'}`}>{r.persen}%</Badge>
                </div>
              </div>
              <Progress value={r.persen} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3 px-5 pt-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" /> Riwayat Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="divide-y divide-border">
            {recent.slice(0, 10).map(r => {
              const c = statusCfg[r.status] || statusCfg.alpha;
              return (
                <div key={r.id} className="row-hover flex items-center justify-between py-3 px-2 -mx-2 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <c.icon className={`w-[18px] h-[18px] shrink-0 ${c.cls}`} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate">{r.jadwal?.mata_pelajaran?.nama_mapel}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${c.cls}`}>{c.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
