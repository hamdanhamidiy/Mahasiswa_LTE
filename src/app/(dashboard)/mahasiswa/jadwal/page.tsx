'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchData } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar, Clock, MapPin, Users, BookOpen, Fingerprint,
  CheckCircle2, Loader2, ChevronRight, Sparkles, Radio
} from 'lucide-react';
import Link from 'next/link';

interface JadwalItem {
  id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string;
  kelas: string;
  mata_pelajaran: { nama_mapel: string; kode_mapel: string; sks: number };
  instruktur: { nama_lengkap: string };
}

interface ActiveSession {
  id: string;
  jadwal_id: string;
  jadwal?: { mata_pelajaran?: { nama_mapel: string }; jam_mulai?: string; jam_selesai?: string };
}

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const HARI_COLORS: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  Senin:  { dot: 'bg-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/30',    text: 'text-blue-600 dark:text-blue-400',    border: 'border-blue-200 dark:border-blue-800' },
  Selasa: { dot: 'bg-violet-500',  bg: 'bg-violet-50 dark:bg-violet-950/30',text: 'text-violet-600 dark:text-violet-400',border: 'border-violet-200 dark:border-violet-800' },
  Rabu:   { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30',text: 'text-emerald-600 dark:text-emerald-400',border: 'border-emerald-200 dark:border-emerald-800' },
  Kamis:  { dot: 'bg-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/30',  text: 'text-amber-600 dark:text-amber-400',  border: 'border-amber-200 dark:border-amber-800' },
  Jumat:  { dot: 'bg-rose-500',    bg: 'bg-rose-50 dark:bg-rose-950/30',    text: 'text-rose-600 dark:text-rose-400',    border: 'border-rose-200 dark:border-rose-800' },
  Sabtu:  { dot: 'bg-cyan-500',    bg: 'bg-cyan-50 dark:bg-cyan-950/30',    text: 'text-cyan-600 dark:text-cyan-400',    border: 'border-cyan-200 dark:border-cyan-800' },
};

export default function JadwalPage() {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [jadwalByHari, setJadwalByHari] = useState<Record<string, JadwalItem[]>>({});
  const [todayHari, setTodayHari] = useState('');
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [selectedHari, setSelectedHari] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [absenDone, setAbsenDone] = useState<Set<string>>(new Set());

  const fetchSessions = useCallback(async () => {
    const sess = await fetchData<ActiveSession[]>('active_absensi_sessions');
    setActiveSessions(sess || []);
  }, []);

  useEffect(() => {
    Promise.all([
      fetchData<JadwalItem[]>('jadwal'),
      fetchData<ActiveSession[]>('active_absensi_sessions')
    ]).then(([jadwalData, sessionData]) => {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const today = days[new Date().getDay()];
      setTodayHari(today);

      if (jadwalData && jadwalData.length > 0) {
        const grouped: Record<string, JadwalItem[]> = {};
        for (const j of jadwalData) {
          if (!grouped[j.hari]) grouped[j.hari] = [];
          grouped[j.hari].push(j);
        }
        setJadwalByHari(grouped);
        setSelectedHari(grouped[today] ? today : HARI_ORDER.find(h => grouped[h]) || null);
      }

      if (sessionData && sessionData.length > 0) {
        setActiveSessions(sessionData);
      }
      setLoading(false);
    });

    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleAbsen = async (jadwalId: string) => {
    setSubmitting(jadwalId);
    try {
      const res = await fetch('/api/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ type: 'submit_absensi_online', data: { jadwal_id: jadwalId } })
      });
      if (res.ok) {
        setAbsenDone(prev => new Set(prev).add(jadwalId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return (
    <div className="page-loading">
      <div className="loading-content">
        <div className="spinner-modern mx-auto mb-3" />
        <p className="text-xs text-muted-foreground">Memuat jadwal...</p>
      </div>
    </div>
  );

  const sortedHari = HARI_ORDER.filter(h => jadwalByHari[h]);
  const totalSKS = Object.values(jadwalByHari).flat().reduce((a, j) => a + (j.mata_pelajaran?.sks || 0), 0);
  const totalMapel = new Set(Object.values(jadwalByHari).flat().map(j => j.mata_pelajaran?.nama_mapel)).size;
  const totalSesi = Object.values(jadwalByHari).flat().length;
  const currentSessions = selectedHari ? (jadwalByHari[selectedHari] || []).sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai)) : [];
  const activeJadwalIds = new Set(activeSessions.map(s => s.jadwal_id));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Jadwal Pelajaran</h1>
            <p>Jadwal kelas mingguan {(user as any)?.kelas ? `— ${(user as any).kelas}` : ''}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs font-medium px-3 h-8 flex items-center gap-1.5 bg-background">
              <BookOpen className="w-3.5 h-3.5 text-primary" /> {totalMapel} Mapel
            </Badge>
            <Badge variant="outline" className="text-xs font-medium px-3 h-8 flex items-center gap-1.5 bg-background">
              <Calendar className="w-3.5 h-3.5 text-primary" /> {totalSesi} Sesi
            </Badge>
            <Badge variant="outline" className="text-xs font-medium px-3 h-8 flex items-center gap-1.5 bg-background">
              <Clock className="w-3.5 h-3.5 text-primary" /> {totalSKS} SKS
            </Badge>
          </div>
        </div>
      </div>

      {/* Active Session Alert */}
      {activeSessions.length > 0 && (
        <div className="relative overflow-hidden rounded-xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/30 p-4 sm:p-5 shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {activeSessions.length} sesi absensi sedang dibuka
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">
                Klik tombol &quot;Absen Hadir&quot; pada jadwal yang aktif di bawah
              </p>
            </div>
          </div>
        </div>
      )}

      {sortedHari.length === 0 && (
        <div className="empty-state">
          <Calendar className="w-12 h-12 mx-auto empty-state-icon" />
          <h3>Belum ada jadwal</h3>
          <p>Jadwal akan muncul setelah diatur oleh admin</p>
        </div>
      )}

      {sortedHari.length > 0 && (
        <>
          {/* Day Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {sortedHari.map(hari => {
              const isToday = hari === todayHari;
              const isSelected = hari === selectedHari;
              const color = HARI_COLORS[hari] || HARI_COLORS.Senin;
              const count = jadwalByHari[hari]?.length || 0;
              const hasLive = jadwalByHari[hari]?.some(j => activeJadwalIds.has(j.id));

              return (
                <button
                  key={hari}
                  onClick={() => setSelectedHari(hari)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200 shrink-0 border
                    ${isSelected
                      ? `${color.bg} ${color.text} ${color.border} shadow-sm`
                      : 'bg-background border-border/50 text-muted-foreground hover:bg-muted/50 hover:border-border'
                    }
                  `}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? color.dot : 'bg-muted-foreground/30'}`} />
                  <span>{hari}</span>
                  <span className={`text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/60 dark:bg-white/10' : 'bg-muted'}`}>
                    {count}
                  </span>
                  {isToday && (
                    <span className="text-[9px] uppercase tracking-wider font-bold text-primary ml-0.5">
                      Hari Ini
                    </span>
                  )}
                  {hasLive && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Schedule List */}
          <div className="space-y-3">
            {currentSessions.map((j, idx) => {
              const isLive = activeJadwalIds.has(j.id);
              const isDone = absenDone.has(j.id);
              const color = HARI_COLORS[j.hari] || HARI_COLORS.Senin;
              
              return (
                <div
                  key={j.id}
                  className={`
                    group relative rounded-xl border bg-card transition-all duration-200 animate-slide-up
                    ${isLive 
                      ? 'border-emerald-400/60 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-400/20' 
                      : 'border-border/60 hover:border-border hover:shadow-sm'
                    }
                  `}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {isLive && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 rounded-t-xl" />
                  )}

                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      {/* Time Column */}
                      <div className="shrink-0 text-center min-w-[68px]">
                        <div className={`
                          inline-flex flex-col items-center px-3 py-2 rounded-xl border
                          ${isLive 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' 
                            : `${color.bg} ${color.border}`
                          }
                        `}>
                          <span className={`text-[13px] font-bold tabular-nums ${isLive ? 'text-emerald-600 dark:text-emerald-400' : color.text}`}>
                            {j.jam_mulai.substring(0, 5)}
                          </span>
                          <div className={`w-px h-2 my-0.5 ${isLive ? 'bg-emerald-300' : 'bg-current opacity-20'}`} />
                          <span className={`text-[11px] font-medium tabular-nums ${isLive ? 'text-emerald-500 dark:text-emerald-500' : `${color.text} opacity-70`}`}>
                            {j.jam_selesai.substring(0, 5)}
                          </span>
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {isLive && (
                              <Badge className="bg-emerald-500 text-white border-0 text-[9px] px-1.5 py-0 h-4 font-semibold uppercase tracking-wider mb-1.5 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                KELAS DIBUKA
                              </Badge>
                            )}
                            <h3 className="text-[15px] font-semibold leading-tight text-foreground group-hover:text-primary transition-colors truncate">
                              {j.mata_pelajaran?.nama_mapel}
                            </h3>
                            {j.mata_pelajaran?.kode_mapel && (
                              <p className="text-[11px] text-muted-foreground font-mono mt-0.5 opacity-60">{j.mata_pelajaran.kode_mapel}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-[10px] font-medium shrink-0 bg-background">
                            {j.mata_pelajaran?.sks || 0} SKS
                          </Badge>
                        </div>

                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5 text-primary/60" />
                            <span>{j.instruktur?.nama_lengkap}</span>
                          </div>
                          {j.ruangan && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5 text-chart-2/60" />
                              <span>Ruang {j.ruangan}</span>
                            </div>
                          )}
                        </div>

                        {/* Live Attendance Action */}
                        {isLive && (
                          <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40">
                            {isDone ? (
                              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-semibold">Anda Sudah Absen</span>
                              </div>
                            ) : (
                              <Button
                                onClick={() => handleAbsen(j.id)}
                                disabled={submitting === j.id}
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg transition-all h-10 px-6 rounded-lg font-semibold text-sm gap-2"
                              >
                                {submitting === j.id ? (
                                  <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                                ) : (
                                  <><Fingerprint className="w-4 h-4" /> Absen Hadir Sekarang</>
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
