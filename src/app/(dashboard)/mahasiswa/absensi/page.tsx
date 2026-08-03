'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck, CheckCircle2, XCircle, AlertCircle, Clock, TrendingUp, Loader2, Download, Radio, Timer } from 'lucide-react';

interface AbsensiRecord { id: string; tanggal: string; status: string; metode: string; jadwal: { mata_pelajaran: { nama_mapel: string; kode_mapel: string } } }
interface RekapMapel { mapel: string; kode: string; hadir: number; izin: number; sakit: number; alpha: number; total: number; persen: number }

export default function AbsensiPage() {
  const [loading, setLoading] = useState(true);
  const [rekap, setRekap] = useState<RekapMapel[]>([]);
  const [recent, setRecent] = useState<AbsensiRecord[]>([]);
  const [stats, setStats] = useState({ hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 });
  
  // Live Session State
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [submittingSessionId, setSubmittingSessionId] = useState<string | null>(null);

  const fetchAbsensiData = useCallback(async () => {
    try {
      const data = await fetchData<AbsensiRecord[]>('absensi');
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for active sessions
  useEffect(() => {
    fetchAbsensiData();
    const pollActiveSessions = async () => {
      const sess = await fetchData<any[]>('active_absensi_sessions');
      setActiveSessions(sess || []);
    };
    pollActiveSessions();
    const interval = setInterval(pollActiveSessions, 5000);
    return () => clearInterval(interval);
  }, [fetchAbsensiData]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleSubmitHadir = async (jadwalId: string, sessionId: string) => {
    setSubmittingSessionId(sessionId);
    try {
      const res = await fetch('/api/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ type: 'submit_absensi_online', data: { jadwal_id: jadwalId } })
      });
      if (res.ok) {
        fetchAbsensiData(); // Refresh history
      } else {
        alert("Gagal melakukan absensi");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingSessionId(null);
    }
  };

  const overallPct = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

  const statusCfg: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
    hadir: { label: 'Hadir', cls: 'text-success', icon: CheckCircle2 },
    izin: { label: 'Izin', cls: 'text-primary', icon: Clock },
    sakit: { label: 'Sakit', cls: 'text-warning', icon: AlertCircle },
    alpha: { label: 'Alpha', cls: 'text-error', icon: XCircle },
  };

  if (loading) return <div className="page-loading"><div className="loading-content"><div className="spinner-modern mx-auto mb-3" /><p className="text-xs text-muted-foreground">Memuat data absensi...</p></div></div>;

  return (
    <div className="space-y-7 animate-fade-in pb-20">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1>Absensi</h1>
            <p>Rekap kehadiran dan riwayat absensi perkuliahan</p>
          </div>
          <Button onClick={handleDownloadPDF} variant="outline" className="btn-press shadow-sm h-10 text-xs w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Unduh Riwayat
          </Button>
        </div>
      </div>

      {/* Live Active Sessions Banner */}
      {activeSessions.length > 0 && (
        <div className="space-y-4">
          {activeSessions.map((session) => {
            const hasAttended = recent.some(r => r.jadwal?.mata_pelajaran?.nama_mapel === session.jadwal?.mata_pelajaran?.nama_mapel && r.status === 'hadir' && new Date(r.tanggal).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]);
            
            return (
              <Card key={session.id} className="border-primary bg-primary/5 shadow-md shadow-primary/10 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4 text-center sm:text-left w-full sm:w-auto">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-background border border-primary/20 shadow-inner flex items-center justify-center relative mx-auto sm:mx-0">
                      <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping opacity-30"></div>
                      <Radio className="w-7 h-7 text-primary animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                        <Badge variant="outline" className="bg-primary text-primary-foreground border-none text-[10px] px-2 py-0">LIVE SESSION</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium"><Timer className="w-3.5 h-3.5" /> Terbatas</span>
                      </div>
                      <h3 className="font-bold text-lg text-foreground">{session.jadwal?.mata_pelajaran?.nama_mapel || "Kelas Aktif"}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Instruktur telah membuka sesi absensi online.
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto shrink-0 flex justify-center">
                    {hasAttended ? (
                      <div className="flex items-center gap-2 text-success bg-success/10 px-5 py-3 rounded-xl border border-success/20 font-semibold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        Anda Sudah Absen
                      </div>
                    ) : (
                      <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 w-full sm:w-auto h-12 px-8 font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-[15px]"
                        onClick={() => handleSubmitHadir(session.jadwal_id, session.id)}
                        disabled={submittingSessionId === session.id}
                      >
                        {submittingSessionId === session.id ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...</>
                        ) : (
                          "Klik Hadir Sekarang"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div id="absensi-content" className="space-y-7">
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
                    <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-muted-foreground font-medium">
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
              {recent.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada riwayat absensi.</p>
              )}
              {recent.slice(0, 10).map(r => {
                const c = statusCfg[r.status] || statusCfg.alpha;
                return (
                  <div key={r.id} className="row-hover flex items-center justify-between py-3 px-2 -mx-2 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <c.icon className={`w-[18px] h-[18px] shrink-0 ${c.cls}`} />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold truncate">{r.jadwal?.mata_pelajaran?.nama_mapel}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground font-medium">
                          <span>{new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                          {r.metode === 'online' && (
                            <>
                              <span>•</span>
                              <span className="text-primary/70 flex items-center gap-1"><Radio className="w-3 h-3" /> Online</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold ${r.status === 'hadir' ? 'border-success/20 bg-success/10 text-success' : r.status === 'izin' ? 'border-primary/20 bg-primary/10 text-primary' : r.status === 'sakit' ? 'border-warning/20 bg-warning/10 text-warning' : 'border-error/20 bg-error/10 text-error'}`}>{c.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
