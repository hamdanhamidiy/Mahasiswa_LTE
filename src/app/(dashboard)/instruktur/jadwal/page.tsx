'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, BookOpen } from 'lucide-react';

interface JadwalItem { id: string; hari: string; jam_mulai: string; jam_selesai: string; ruangan: string; kelas: string; mata_pelajaran: { nama_mapel: string; kode_mapel: string; sks: number }; }
const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const hariColors: Record<string, string> = { 'Senin': 'bg-primary', 'Selasa': 'bg-chart-2', 'Rabu': 'bg-chart-3', 'Kamis': 'bg-chart-4', 'Jumat': 'bg-chart-5', 'Sabtu': 'bg-muted-foreground' };

export default function InstrukturJadwalPage() {
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
  const totalSesi = Object.values(jadwalByHari).flat().length;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Jadwal Mengajar</h1>
            <p>Jadwal mengajar mingguan Anda</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs font-normal px-3 h-9 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5" /> {totalSesi} Sesi / Minggu</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Total Sesi</p><p className="text-2xl font-bold mt-1.5 metric-value">{totalSesi}</p></div><div className="p-2.5 rounded-xl bg-primary/8"><Calendar className="w-[18px] h-[18px] text-primary" /></div></div></CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Hari Aktif</p><p className="text-2xl font-bold mt-1.5 metric-value">{sortedHari.length}</p></div><div className="p-2.5 rounded-xl bg-chart-3/8"><Clock className="w-[18px] h-[18px] text-chart-3" /></div></div></CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Mata Pelajaran</p><p className="text-2xl font-bold mt-1.5 metric-value">{new Set(Object.values(jadwalByHari).flat().map(j => j.mata_pelajaran?.nama_mapel)).size}</p></div><div className="p-2.5 rounded-xl bg-chart-4/8"><BookOpen className="w-[18px] h-[18px] text-chart-4" /></div></div></CardContent>
        </Card>
      </div>

      {sortedHari.length === 0 && <div className="empty-state"><Calendar className="w-12 h-12 mx-auto empty-state-icon" /><h3>Belum ada jadwal mengajar</h3><p>Jadwal akan muncul setelah diatur oleh admin</p></div>}

      <div className="space-y-4 stagger-children">
        {sortedHari.map(hari => {
          const isToday = hari === todayHari;
          return (
            <Card key={hari} className={`border shadow-sm overflow-hidden card-glow animate-slide-up ${isToday ? 'border-primary/30' : 'border-border'}`}>
              <div className="flex items-center justify-between px-5 py-3.5 bg-muted/30 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full ${hariColors[hari] || 'bg-primary'}`} />
                  <h3 className="text-sm font-bold">{hari}</h3>
                  {isToday && <Badge className="bg-primary text-white border-0 text-[10px] px-2 font-normal">Hari Ini</Badge>}
                </div>
                <Badge variant="outline" className="text-[10px] font-medium">{jadwalByHari[hari].length} sesi</Badge>
              </div>
              <div className="px-5 py-3 space-y-1">
                {jadwalByHari[hari].map(j => (
                  <div key={j.id} className="row-hover flex items-center gap-3 py-3 px-3 -mx-3 rounded-lg group">
                    <div className="w-28 shrink-0">
                      <span className="text-xs font-mono text-primary font-semibold tabular-nums">{j.jam_mulai}</span>
                      <span className="text-[10px] text-muted-foreground"> — {j.jam_selesai}</span>
                    </div>
                    <div className="w-px h-8 bg-border/60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">{j.mata_pelajaran?.nama_mapel}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Users className="w-3 h-3" />{j.kelas}
                        {j.ruangan && <><span className="opacity-30">·</span><MapPin className="w-3 h-3" />{j.ruangan}</>}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-normal shrink-0">{j.mata_pelajaran?.sks} SKS</Badge>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
