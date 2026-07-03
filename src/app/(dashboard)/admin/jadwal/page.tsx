'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function AdminJadwalPage() {
  const jadwal = [
    { hari: 'Senin', sesi: [{ waktu: '08:00 - 10:00', mapel: 'English for Hospitality', kelas: 'D1-ALL-25A', ruangan: 'Ruang A1', instruktur: 'Mr. John Smith' }, { waktu: '10:30 - 12:30', mapel: 'Housekeeping Management', kelas: 'D1-HK-25A', ruangan: 'Ruang B1', instruktur: 'Ibu Sari Dewi' }] },
    { hari: 'Selasa', sesi: [{ waktu: '08:00 - 10:00', mapel: 'F&B Product', kelas: 'D1-FP-25A', ruangan: 'Kitchen Lab', instruktur: 'Chef Ahmad Yani' }, { waktu: '13:00 - 15:00', mapel: 'Restaurant Service', kelas: 'D1-FS-25A', ruangan: 'Ruang C1', instruktur: 'Mr. David Lee' }] },
    { hari: 'Rabu', sesi: [{ waktu: '08:00 - 10:00', mapel: 'English Conversation', kelas: 'D1-ALL-25A', ruangan: 'Ruang A2', instruktur: 'Mr. John Smith' }] },
    { hari: 'Kamis', sesi: [{ waktu: '08:00 - 10:00', mapel: 'F&B Product', kelas: 'D1-FP-24A', ruangan: 'Kitchen Lab', instruktur: 'Chef Ahmad Yani' }, { waktu: '10:30 - 12:30', mapel: 'Room Division Operations', kelas: 'D1-HK-25A', ruangan: 'Ruang B2', instruktur: 'Ibu Sari Dewi' }, { waktu: '13:00 - 15:00', mapel: 'Bartending & Mixology', kelas: 'D1-FS-24A', ruangan: 'Bar Lab', instruktur: 'Mr. David Lee' }] },
    { hari: 'Jumat', sesi: [{ waktu: '08:00 - 10:00', mapel: 'Etika Profesi & Grooming', kelas: 'D1-ALL-25A', ruangan: 'Aula', instruktur: 'Ibu Ratna Sari' }] },
  ];

  const totalSesi = jadwal.reduce((a, h) => a + h.sesi.length, 0);
  const hariColors: Record<string, string> = {
    'Senin': 'bg-primary', 'Selasa': 'bg-chart-2', 'Rabu': 'bg-chart-3',
    'Kamis': 'bg-chart-4', 'Jumat': 'bg-chart-5', 'Sabtu': 'bg-muted-foreground',
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Manajemen Jadwal</h1>
            <p>Atur jadwal pelajaran seluruh kelas LTE Cruise</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs font-normal px-3 h-9 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5" /> {totalSesi} Sesi / Minggu</Badge>
            <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15"><Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Jadwal</Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Total Sesi</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{totalSesi}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/8"><Calendar className="w-[18px] h-[18px] text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Hari Aktif</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{jadwal.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-chart-3/8"><Clock className="w-[18px] h-[18px] text-chart-3" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Mata Pelajaran</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{new Set(jadwal.flatMap(h => h.sesi.map(s => s.mapel))).size}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-chart-4/8"><BookOpen className="w-[18px] h-[18px] text-chart-4" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Ruangan</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{new Set(jadwal.flatMap(h => h.sesi.map(s => s.ruangan))).size}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-chart-5/8"><MapPin className="w-[18px] h-[18px] text-chart-5" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-4 stagger-children">
        {jadwal.map(({ hari, sesi }) => (
          <Card key={hari} className="border border-border shadow-sm overflow-hidden card-glow animate-slide-up">
            <div className="flex items-center justify-between px-5 py-3.5 bg-muted/30 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${hariColors[hari] || 'bg-primary'}`} />
                <h3 className="text-sm font-bold">{hari}</h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-medium">{sesi.length} sesi</Badge>
            </div>
            <div className="px-5 py-3 space-y-1">
              {sesi.map((s, i) => (
                <div key={i} className="row-hover flex items-center gap-3 py-3 px-3 -mx-3 rounded-lg group">
                  <div className="w-28 shrink-0">
                    <span className="text-xs font-mono text-primary font-semibold tabular-nums">{s.waktu.split(' - ')[0]}</span>
                    <span className="text-[10px] text-muted-foreground"> — {s.waktu.split(' - ')[1]}</span>
                  </div>
                  <div className="w-px h-8 bg-border/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">{s.mapel}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <Users className="w-3 h-3" />{s.kelas}
                      <span className="opacity-30">·</span>
                      <MapPin className="w-3 h-3" />{s.ruangan}
                      <span className="opacity-30">·</span>
                      {s.instruktur}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
