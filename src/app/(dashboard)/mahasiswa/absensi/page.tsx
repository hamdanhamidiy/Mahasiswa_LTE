'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ClipboardCheck, CheckCircle2, XCircle, AlertCircle, Clock,
  TrendingUp, Loader2, Download, Radio, Timer, BarChart3,
  CalendarDays, Fingerprint, ChevronRight, History
} from 'lucide-react';
import Link from 'next/link';

interface AbsensiRecord {
  id: string;
  tanggal: string;
  status: string;
  metode: string;
  jadwal: { mata_pelajaran: { nama_mapel: string; kode_mapel: string } };
}

interface RekapMapel {
  mapel: string;
  kode: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  total: number;
  persen: number;
}

export default function AbsensiPage() {
  const [loading, setLoading] = useState(true);
  const [rekap, setRekap] = useState<RekapMapel[]>([]);
  const [recent, setRecent] = useState<AbsensiRecord[]>([]);
  const [stats, setStats] = useState({ hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 });
  const [tab, setTab] = useState<'rekap' | 'riwayat'>('rekap');

  // Live Session State
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [submittingSessionId, setSubmittingSessionId] = useState<string | null>(null);
  const [absenDone, setAbsenDone] = useState<Set<string>>(new Set());

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

  const handleSubmitHadir = async (jadwalId: string, sessionId: string) => {
    setSubmittingSessionId(sessionId);
    try {
      const res = await fetch('/api/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ type: 'submit_absensi_online', data: { jadwal_id: jadwalId } })
      });
      if (res.ok) {
        setAbsenDone(prev => new Set(prev).add(sessionId));
        fetchAbsensiData();
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

  const statusCfg: Record<string, { label: string; cls: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
    hadir: { label: 'Hadir', cls: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
    izin:  { label: 'Izin',  cls: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-950/30',       border: 'border-blue-200 dark:border-blue-800',    icon: Clock },
    sakit: { label: 'Sakit', cls: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30',     border: 'border-amber-200 dark:border-amber-800',  icon: AlertCircle },
    alpha: { label: 'Alpha', cls: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/30',         border: 'border-red-200 dark:border-red-800',      icon: XCircle },
  };

  if (loading) return (
    <div className="page-loading">
      <div className="loading-content">
        <div className="spinner-modern mx-auto mb-3" />
        <p className="text-xs text-muted-foreground">Memuat data absensi...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h1 className="text-2xl font-bold tracking-tight">Absensi</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-[18px]">Rekap kehadiran dan riwayat absensi perkuliahan</p>
        </div>
        <div className="flex gap-2">
          <Link href="/mahasiswa/jadwal">
            <Button variant="outline" className="h-9 text-xs gap-1.5 rounded-xl">
              <CalendarDays className="w-3.5 h-3.5" />
              Lihat Jadwal
            </Button>
          </Link>
          <Button onClick={() => window.print()} variant="outline" className="h-9 text-xs gap-1.5 rounded-xl">
            <Download className="w-3.5 h-3.5" />
            Unduh
          </Button>
        </div>
      </div>

      {/* Live Active Sessions Banner */}
      {activeSessions.length > 0 && (
        <div className="space-y-3">
          {activeSessions.map((session) => {
            const isDone = absenDone.has(session.id);
            const hasAttended = isDone || recent.some(r =>
              r.jadwal?.mata_pelajaran?.nama_mapel === session.jadwal?.mata_pelajaran?.nama_mapel
              && r.status === 'hadir'
              && new Date(r.tanggal).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
            );

            return (
              <div key={session.id} className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/30 shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl" />
                <div className="relative p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                        <Radio className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                      </div>
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge className="bg-emerald-500 text-white border-0 text-[9px] px-1.5 py-0 h-4 font-semibold uppercase tracking-wider inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          LIVE
                        </Badge>
                        <span className="text-xs text-emerald-600/60 dark:text-emerald-400/50 flex items-center gap-1 font-medium">
                          <Timer className="w-3 h-3" /> Sesi Terbatas
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-emerald-900 dark:text-emerald-200">
                        {session.jadwal?.mata_pelajaran?.nama_mapel || "Kelas Aktif"}
                      </h3>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto shrink-0">
                    {hasAttended ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/30 px-4 py-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-700/40 font-semibold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Anda Sudah Absen
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleSubmitHadir(session.jadwal_id, session.id)}
                        disabled={submittingSessionId === session.id}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg transition-all h-11 px-6 rounded-xl font-semibold text-sm gap-2"
                      >
                        {submittingSessionId === session.id ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                        ) : (
                          <><Fingerprint className="w-4.5 h-4.5" /> Klik Hadir Sekarang</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        {/* Overall Circular */}
        <div className="col-span-2 lg:col-span-1 bg-card p-5 rounded-2xl border border-border/80 shadow-sm flex flex-col items-center justify-center animate-slide-up overflow-hidden relative">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/5 rounded-full" />
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="7" className="text-muted/15" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                strokeWidth="7" strokeLinecap="round"
                className={overallPct >= 80 ? 'text-emerald-500' : overallPct >= 60 ? 'text-amber-500' : 'text-red-500'}
                stroke="currentColor"
                strokeDasharray={`${overallPct * 2.64} 264`}
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums">{overallPct}%</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Kehadiran</p>
        </div>

        {/* Individual Status Cards */}
        {(['hadir', 'izin', 'sakit', 'alpha'] as const).map(k => {
          const c = statusCfg[k];
          const count = stats[k];
          const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          return (
            <div key={k} className={`group relative bg-card p-5 rounded-2xl border ${c.border} shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up hover:-translate-y-1 overflow-hidden`}>
              <c.icon className={`absolute -right-3 -bottom-3 w-20 h-20 ${c.cls} opacity-5 group-hover:scale-110 transition-transform duration-500`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center`}>
                    <c.icon className={`w-4 h-4 ${c.cls}`} />
                  </div>
                  {stats.total > 0 && (
                    <span className="text-[10px] text-muted-foreground font-semibold tabular-nums bg-muted/50 px-2 py-0.5 rounded-md">
                      {pct}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold tabular-nums leading-none">{count}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase tracking-wider">{c.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-2xl border border-border/50 w-fit">
        <button
          onClick={() => setTab('rekap')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === 'rekap'
              ? 'bg-background text-foreground shadow-sm border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" /> Rekap per Mapel
        </button>
        <button
          onClick={() => setTab('riwayat')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === 'riwayat'
              ? 'bg-background text-foreground shadow-sm border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Riwayat Terbaru
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {tab === 'rekap' && (
          <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center gap-2.5 bg-muted/10">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">Rekap Kehadiran per Mata Pelajaran</h3>
            </div>
            <div className="p-5 bg-background/50 space-y-3">
              {rekap.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-14">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Belum ada data absensi</p>
                    <p className="text-xs text-muted-foreground mt-1">Data akan muncul setelah Anda mengikuti kelas</p>
                  </div>
                </div>
              )}
              {rekap.map((r, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/60 hover:border-border transition-all hover:shadow-sm group animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">{r.mapel}</p>
                      {r.kode && <p className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-60">{r.kode}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex items-center gap-2 text-[10px] font-medium">
                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">{r.hadir}H</span>
                        <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">{r.izin}I</span>
                        <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">{r.sakit}S</span>
                        <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">{r.alpha}A</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs font-bold tabular-nums ${
                          r.persen >= 80
                            ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
                            : r.persen >= 60
                            ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
                            : 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30'
                        }`}
                      >
                        {r.persen}%
                      </Badge>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        r.persen >= 80 ? 'bg-emerald-500' : r.persen >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${r.persen}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'riwayat' && (
          <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center gap-2.5 bg-muted/10">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                <History className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">Riwayat Absensi Terbaru</h3>
            </div>
            <div className="bg-background/50">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-14">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <History className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Belum ada riwayat absensi</p>
                    <p className="text-xs text-muted-foreground mt-1">Riwayat akan muncul setelah Anda mengikuti kelas</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {recent.slice(0, 10).map((r, i) => {
                    const c = statusCfg[r.status] || statusCfg.alpha;
                    return (
                      <div key={r.id} className="flex items-center justify-between py-3.5 px-5 hover:bg-muted/20 transition-colors animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}>
                            <c.icon className={`w-4 h-4 ${c.cls}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{r.jadwal?.mata_pelajaran?.nama_mapel}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground font-medium">
                              <span>{new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                              {r.metode === 'online' && (
                                <>
                                  <span className="opacity-30">•</span>
                                  <span className="text-primary/70 flex items-center gap-1"><Radio className="w-2.5 h-2.5" /> Online</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${c.cls} ${c.bg} ${c.border}`}
                        >
                          {c.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
