'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchData } from '@/lib/api';

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

interface JadwalItem {
  id: string; hari: string; jam_mulai: string; jam_selesai: string; ruangan: string; kelas: string; is_active: boolean;
  mata_pelajaran?: { nama_mapel: string; kode_mapel: string };
  instruktur?: { nama_lengkap: string };
}

export default function AdminJadwalPage() {
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchData<JadwalItem[]>('admin_jadwal');
      setJadwalList(data || []);
      setLoading(false);
    };
    load();
  }, []);

  // Group by day
  const grouped = HARI_ORDER.map(hari => ({
    hari,
    sesi: jadwalList.filter(j => j.hari === hari).map(j => ({
      waktu: `${j.jam_mulai} - ${j.jam_selesai}`,
      mapel: j.mata_pelajaran?.nama_mapel || '—',
      kelas: j.kelas || '—',
      ruangan: j.ruangan || '—',
      instruktur: j.instruktur?.nama_lengkap || '—',
    })),
  })).filter(g => g.sesi.length > 0);

  const totalSesi = jadwalList.length;
  const hariColors: Record<string, string> = {
    'Senin': 'bg-primary', 'Selasa': 'bg-chart-2', 'Rabu': 'bg-chart-3',
    'Kamis': 'bg-chart-4', 'Jumat': 'bg-chart-5', 'Sabtu': 'bg-muted-foreground',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Jadwal Kuliah</h1>
            <p>Kelola jadwal perkuliahan seluruh kelas</p>
          </div>
          <Button size="sm" className="bg-primary text-xs h-8 btn-press self-start">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Jadwal
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-3.5 text-center">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : grouped.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Hari Aktif</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-3.5 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-chart-3" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : totalSesi}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Total Sesi</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-3.5 text-center">
            <BookOpen className="w-4 h-4 mx-auto mb-1 text-chart-4" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : new Set(jadwalList.map(j => j.mata_pelajaran?.nama_mapel)).size}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Mata Pelajaran</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-xs text-muted-foreground">Memuat jadwal...</p>
        </div>
      ) : grouped.length === 0 ? (
        <Card className="border border-border shadow-none">
          <CardContent className="py-16 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" />
            <p className="text-xs text-muted-foreground font-medium">Belum ada jadwal</p>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">Klik &quot;Tambah Jadwal&quot; untuk menambah jadwal baru</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 stagger-children">
          {grouped.map((day) => (
            <Card key={day.hari} className="border border-border shadow-none overflow-hidden animate-slide-up">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/30">
                <div className={`w-2 h-2 rounded-full ${hariColors[day.hari] || 'bg-muted-foreground'}`} />
                <h3 className="text-xs font-semibold uppercase tracking-wider">{day.hari}</h3>
                <Badge variant="outline" className="text-[9px] ml-auto">{day.sesi.length} sesi</Badge>
              </div>
              <CardContent className="p-0 divide-y divide-border">
                {day.sesi.map((sesi, si) => (
                  <div key={si} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-2 sm:w-36 shrink-0">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] font-medium tabular-nums">{sesi.waktu}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate">{sesi.mapel}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{sesi.kelas}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{sesi.ruangan}</span>
                        <span>{sesi.instruktur}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
