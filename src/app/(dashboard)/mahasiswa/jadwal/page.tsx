'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, MapPin, Users, BookOpen, Fingerprint } from 'lucide-react';
import Link from 'next/link';

interface JadwalItem { id: string; hari: string; jam_mulai: string; jam_selesai: string; ruangan: string; kelas: string; mata_pelajaran: { nama_mapel: string; kode_mapel: string; sks: number }; instruktur: { nama_lengkap: string } }

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function JadwalPage() {
  const [loading, setLoading] = useState(true);
  const [jadwalByHari, setJadwalByHari] = useState<Record<string, JadwalItem[]>>({});
  const [todayHari, setTodayHari] = useState('');
  const [activeSessions, setActiveSessions] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetchData<JadwalItem[]>('jadwal'),
      fetchData<any[]>('active_absensi_sessions')
    ]).then(([jadwalData, sessionData]) => {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      setTodayHari(days[new Date().getDay()]);
      
      if (jadwalData && jadwalData.length > 0) {
        const grouped: Record<string, JadwalItem[]> = {};
        for (const j of jadwalData) { if (!grouped[j.hari]) grouped[j.hari] = []; grouped[j.hari].push(j); }
        setJadwalByHari(grouped);
      }
      
      if (sessionData && sessionData.length > 0) {
        setActiveSessions(sessionData.map(s => s.jadwal_id));
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page-loading"><div className="loading-content"><div className="spinner-modern mx-auto mb-3" /><p className="text-xs text-muted-foreground">Memuat jadwal...</p></div></div>;

  const sortedHari = HARI_ORDER.filter(h => jadwalByHari[h]);
  const totalSKS = Object.values(jadwalByHari).flat().reduce((a, j) => a + (j.mata_pelajaran?.sks || 0), 0);
  const totalMapel = new Set(Object.values(jadwalByHari).flat().map(j => j.mata_pelajaran?.nama_mapel)).size;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Jadwal Pelajaran</h1>
            <p>Jadwal kelas mingguan — Fase Kelas</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs font-normal px-3 h-9 flex items-center"><BookOpen className="w-3.5 h-3.5 mr-1.5" /> {totalMapel} Mapel</Badge>
            <Badge variant="outline" className="text-xs font-normal px-3 h-9 flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5" /> {totalSKS} SKS</Badge>
          </div>
        </div>
      </div>

      {sortedHari.length === 0 && (
        <div className="empty-state"><Calendar className="w-12 h-12 mx-auto empty-state-icon" /><h3>Belum ada jadwal</h3><p>Jadwal akan muncul setelah diatur oleh admin</p></div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
        {sortedHari.map(hari => {
          const isToday = hari === todayHari;
          return (
            <Card key={hari} className={`border shadow-sm overflow-hidden animate-slide-up ${isToday ? 'border-primary/50 ring-1 ring-primary/20 bg-primary/[0.02]' : 'border-border/60'}`}>
              <CardHeader className={`pb-4 px-5 pt-5 ${isToday ? 'bg-primary/5' : 'bg-muted/30'} border-b`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                    {hari}
                    {isToday && <Badge className="bg-primary text-white border-0 text-[10px] px-2 py-0 h-4 font-medium uppercase tracking-wider">Hari Ini</Badge>}
                  </CardTitle>
                  <Badge variant="outline" className="bg-background text-xs font-normal">
                    {jadwalByHari[hari].length} Sesi
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="relative pl-5 space-y-6 before:absolute before:inset-0 before:ml-[7px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {jadwalByHari[hari]
                    .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))
                    .map((j, idx) => (
                    <div key={j.id} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[25px] top-2 w-3 h-3 rounded-full bg-background border-2 border-primary ring-4 ring-background z-10 shadow-sm" />
                      
                      {/* Time Block */}
                      <div className="mb-2 flex items-center text-xs font-mono font-medium text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-md">
                        {j.jam_mulai.substring(0, 5)} - {j.jam_selesai.substring(0, 5)}
                      </div>
                      
                      {/* Course Card */}
                      <div className="bg-card border border-border/60 rounded-xl p-3.5 hover:border-primary/40 hover:shadow-sm transition-all group">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{j.mata_pelajaran?.nama_mapel}</h4>
                          <Badge variant="secondary" className="text-[10px] whitespace-nowrap bg-secondary/50">{j.mata_pelajaran?.sks} SKS</Badge>
                        </div>
                        
                        <div className="space-y-1.5 mt-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5 text-primary/70" />
                            <span className="truncate">{j.instruktur?.nama_lengkap}</span>
                          </div>
                          {j.ruangan && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5 text-chart-2/70" />
                              <span className="truncate">Ruang {j.ruangan}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Live Attendance Button */}
                        {activeSessions.includes(j.id) && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <Link href="/mahasiswa/dashboard">
                              <button className="w-full relative overflow-hidden bg-gradient-to-r from-success/90 to-emerald-600 hover:from-success hover:to-emerald-500 text-white shadow-md hover:shadow-lg transition-all rounded-lg py-2.5 px-3 flex items-center justify-center gap-2 group/btn btn-press text-xs font-semibold">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite]" />
                                <Fingerprint className="w-4 h-4 group-hover/btn:scale-110 transition-transform relative z-10" />
                                <span className="relative z-10 tracking-wide">ABSEN SEKARANG</span>
                                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-white rounded-full m-1 animate-ping" />
                              </button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
