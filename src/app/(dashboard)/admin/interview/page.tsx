'use client';
import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Ship, Calendar, MapPin, Users, Plus, Loader2, ChevronRight } from 'lucide-react';

interface InterviewSession { id: string; nama_perusahaan_agensi: string; jenis: string; tanggal_interview: string; lokasi: string; kuota: number; deskripsi: string; requirements: string; dokumen_yang_dibutuhkan: string[]; pendaftar_ids: string[]; approved_ids: string[]; status: string }

export default function AdminInterviewPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  useEffect(() => { fetchData<InterviewSession[]>('interview').then(d => { if (d) setSessions(d); setLoading(false); }); }, []);
  if (loading) return <div className="page-loading"><div className="loading-content"><div className="spinner-modern mx-auto mb-3" /><p className="text-xs text-muted-foreground">Memuat data interview...</p></div></div>;
  const statusLabel: Record<string, { label: string; cls: string }> = { akan_datang: { label: 'Akan Datang', cls: 'chip-primary' }, sedang_berlangsung: { label: 'Berlangsung', cls: 'chip-warning' }, selesai: { label: 'Selesai', cls: 'chip-success' } };

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div><h1>Manajemen Interview</h1><p>Kelola sesi interview kapal pesiar & hotel internasional</p></div>
          <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15"><Plus className="w-3.5 h-3.5 mr-1.5" /> Buat Sesi Baru</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-stat-highlight animate-slide-up">
          <CardContent className="p-5 text-center"><p className="stat-value">{sessions.length}</p><p className="stat-label mt-1">Total Sesi</p></CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Akan Datang</p><p className="text-2xl font-bold mt-1.5 text-primary metric-value">{sessions.filter(s => s.status === 'akan_datang').length}</p></div><div className="p-2.5 rounded-xl bg-primary/8"><Calendar className="w-[18px] h-[18px] text-primary" /></div></div></CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Total Pendaftar</p><p className="text-2xl font-bold mt-1.5 metric-value">{sessions.reduce((a, s) => a + (s.pendaftar_ids?.length || 0), 0)}</p></div><div className="p-2.5 rounded-xl bg-chart-4/8"><Users className="w-[18px] h-[18px] text-chart-4" /></div></div></CardContent>
        </Card>
      </div>

      {sessions.length === 0 && <div className="empty-state"><Ship className="w-12 h-12 mx-auto empty-state-icon" /><h3>Belum ada sesi interview</h3><p>Buat sesi interview baru untuk memulai</p></div>}

      <div className="space-y-3 stagger-children">
        {sessions.map(s => {
          const st = statusLabel[s.status] || statusLabel.akan_datang;
          const fill = Math.min(100, (s.pendaftar_ids?.length || 0) / s.kuota * 100);
          return (
            <Card key={s.id} className="border border-border shadow-sm card-glow animate-slide-up group cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-muted/60 shrink-0"><Ship className="w-5 h-5 text-muted-foreground" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`chip ${st.cls}`}>{st.label}</span>
                      <Badge variant="outline" className="text-[10px] font-normal">{s.jenis === 'kapal_pesiar' ? 'Kapal Pesiar' : 'Hotel Internasional'}</Badge>
                    </div>
                    <h3 className="text-[14px] font-semibold group-hover:text-primary transition-colors">{s.nama_perusahaan_agensi}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(s.tanggal_interview).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      {s.lokasi && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.lokasi}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <div className="h-2 rounded-full bg-muted/40 overflow-hidden flex-1 max-w-[200px]">
                        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${fill}%` }} />
                      </div>
                      <span className="text-[11px] text-muted-foreground tabular-nums font-medium">{s.pendaftar_ids?.length || 0}/{s.kuota}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0 mt-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
