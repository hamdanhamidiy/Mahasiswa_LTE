'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, MapPin, Users, BookOpen } from 'lucide-react';

interface JadwalItem { id: string; hari: string; jam_mulai: string; jam_selesai: string; ruangan: string; kelas: string; mata_pelajaran: { nama_mapel: string; kode_mapel: string; sks: number }; instruktur: { nama_lengkap: string } }

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function JadwalPage() {
  const [loading, setLoading] = useState(true);
  const [jadwalByHari, setJadwalByHari] = useState<Record<string, JadwalItem[]>>({});
  const [todayHari, setTodayHari] = useState('');

  useEffect(() => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    setTodayHari(days[new Date().getDay()]);
    fetchData<JadwalItem[]>('jadwal').then(data => {
      if (data && data.length > 0) {
        const grouped: Record<string, JadwalItem[]> = {};
        for (const j of data) { if (!grouped[j.hari]) grouped[j.hari] = []; grouped[j.hari].push(j); }
        setJadwalByHari(grouped);
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

      <div className="space-y-4 stagger-children">
        {sortedHari.map(hari => {
          const isToday = hari === todayHari;
          return (
            <Card key={hari} className={`border shadow-none overflow-hidden animate-slide-up ${isToday ? 'border-primary/30 bg-primary/[0.02]' : 'border-border/60'}`}>
              <CardHeader className="pb-3 px-5 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2.5">
                    <span className="font-semibold">{hari}</span>
                    {isToday && <Badge className="bg-primary text-white border-0 text-[10px] px-2 font-normal">Hari Ini</Badge>}
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground">{jadwalByHari[hari].length} sesi</span>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                {jadwalByHari[hari].map(j => (
                  <div key={j.id} className="row-hover flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg border border-transparent hover:border-border/60 transition-all">
                    <div className="w-20 shrink-0">
                      <span className="text-xs font-mono text-primary font-medium">{j.jam_mulai}</span>
                      <span className="text-[10px] text-muted-foreground"> - {j.jam_selesai}</span>
                    </div>
                    <div className="w-px h-8 bg-border/60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{j.mata_pelajaran?.nama_mapel}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Users className="w-3 h-3" />{j.instruktur?.nama_lengkap}
                        {j.ruangan && <><span className="opacity-30">·</span><MapPin className="w-3 h-3" />{j.ruangan}</>}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-normal shrink-0">{j.mata_pelajaran?.sks} SKS</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
