'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { fetchData } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Ship, Calendar, MapPin, Users, FileText, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface InterviewSession { id: string; nama_perusahaan_agensi: string; jenis: string; tanggal_interview: string; lokasi: string; kuota: number; deskripsi: string; requirements: string; dokumen_yang_dibutuhkan: string[]; pendaftar_ids: string[]; approved_ids: string[]; status: string }

export default function InterviewPage() {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchData<InterviewSession[]>('interview').then(d => { if (d) setSessions(d); setLoading(false); }); }, []);

  if (loading) return <div className="page-loading"><div className="loading-content"><div className="spinner-modern mx-auto mb-3" /><p className="text-xs text-muted-foreground">Memuat sesi interview...</p></div></div>;

  const statusLabel: Record<string, string> = { akan_datang: 'Akan Datang', sedang_berlangsung: 'Berlangsung', selesai: 'Selesai' };
  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Sesi Interview</h1>
          <p>Jadwal interview kapal pesiar dan hotel internasional</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 stagger-children">
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up"><CardContent className="p-4 text-center"><p className="text-2xl font-semibold text-primary tabular-nums">{sessions.length}</p><p className="text-xs text-muted-foreground mt-0.5">Total Sesi</p></CardContent></Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up"><CardContent className="p-4 text-center"><p className="text-2xl font-semibold text-success tabular-nums">{sessions.filter(s => s.status === 'akan_datang').length}</p><p className="text-xs text-muted-foreground mt-0.5">Akan Datang</p></CardContent></Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up"><CardContent className="p-4 text-center"><p className="text-2xl font-semibold text-muted-foreground tabular-nums">{sessions.filter(s => s.status !== 'akan_datang').length}</p><p className="text-xs text-muted-foreground mt-0.5">Selesai</p></CardContent></Card>
      </div>

      {sessions.length === 0 && <div className="empty-state"><Ship className="w-12 h-12 mx-auto empty-state-icon" /><h3>Belum ada sesi interview</h3><p>Sesi interview akan muncul di sini setelah dijadwalkan</p></div>}

      <div className="space-y-3 stagger-children">
        {sessions.map(s => {
          const isReg = user && s.pendaftar_ids?.includes(user.id);
          const isAppr = user && s.approved_ids?.includes(user.id);
          const isExp = expanded === s.id;
          const days = daysUntil(s.tanggal_interview);
          const fill = Math.min(100, (s.pendaftar_ids?.length || 0) / s.kuota * 100);

          return (
            <Card key={s.id} className={`border shadow-none card-interactive overflow-hidden animate-slide-up ${s.status === 'akan_datang' ? 'border-primary/20' : 'border-border/60'}`}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-2.5 rounded-lg bg-muted/60 shrink-0"><Ship className="w-5 h-5 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="text-[10px] font-normal">{statusLabel[s.status] || s.status}</Badge>
                        {s.status === 'akan_datang' && days > 0 && <span className="text-[10px] text-muted-foreground">{days} hari lagi</span>}
                        {isReg && <Badge variant="outline" className="text-[10px] text-primary border-primary/20">Terdaftar</Badge>}
                        {isAppr && <Badge variant="outline" className="text-[10px] text-success border-success/20">Diterima</Badge>}
                      </div>
                      <h3 className="text-sm font-semibold">{s.nama_perusahaan_agensi}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(s.tanggal_interview).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        {s.lokasi && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.lokasi}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <div className="flex-1 max-w-[160px]"><Progress value={fill} className="h-1" /></div>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{s.pendaftar_ids?.length || 0}/{s.kuota}</span>
                      </div>
                      <Badge variant="outline" className="mt-2 text-[10px] font-normal">{s.jenis === 'kapal_pesiar' ? 'Kapal Pesiar' : 'Hotel Internasional'}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {s.status === 'akan_datang' && !isReg && <Button size="sm" className="bg-primary btn-press">Daftar</Button>}
                    {s.status === 'akan_datang' && isReg && <Button size="sm" variant="outline" disabled>Terdaftar</Button>}
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setExpanded(isExp ? null : s.id)}>{isExp ? 'Tutup' : 'Detail'}</Button>
                  </div>
                </div>
                {isExp && (
                  <div className="mt-4 pt-4 border-t border-border/60 space-y-3 animate-fade-in">
                    {s.deskripsi && <div><p className="text-[11px] font-medium text-muted-foreground mb-0.5">Deskripsi</p><p className="text-sm text-foreground/80">{s.deskripsi}</p></div>}
                    {s.requirements && <div><p className="text-[11px] font-medium text-muted-foreground mb-0.5">Persyaratan</p><p className="text-sm text-foreground/80">{s.requirements}</p></div>}
                    {s.dokumen_yang_dibutuhkan?.length > 0 && <div><p className="text-[11px] font-medium text-muted-foreground mb-1">Dokumen</p><div className="flex flex-wrap gap-1.5">{s.dokumen_yang_dibutuhkan.map((d, i) => <Badge key={i} variant="outline" className="text-[10px] font-normal"><FileText className="w-2.5 h-2.5 mr-1" />{d}</Badge>)}</div></div>}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
