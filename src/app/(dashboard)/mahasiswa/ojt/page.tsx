'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Star, Calendar, Upload, FileText, CheckCircle2, Clock, Loader2, Ship } from 'lucide-react';

interface OJTData {
  id: string;
  nama_hotel_tempat_magang: string;
  bintang_hotel: number | null;
  kota: string | null;
  negara: string;
  posisi_magang: string | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  nama_supervisor: string | null;
  nilai_ojt_hotel: number | null;
  nilai_ojt_instruktur: number | null;
  nilai_ojt_akhir: number | null;
  status_laporan: string;
  dokumen_surat_penerimaan_url: string | null;
  dokumen_laporan_akhir_url: string | null;
}

export default function OJTTrackerPage() {
  const [loading, setLoading] = useState(true);
  const [ojtData, setOjtData] = useState<OJTData | null>(null);

  useEffect(() => {
    fetchData<OJTData[]>('ojt_record').then(data => {
      if (data && data.length > 0) setOjtData(data[0]);
      setLoading(false);
    });
  }, []);

  // Demo fallback
  const ojt = ojtData ? {
    nama_hotel: ojtData.nama_hotel_tempat_magang,
    bintang: ojtData.bintang_hotel || 5,
    kota: ojtData.kota || 'Nusa Dua',
    negara: ojtData.negara,
    posisi: ojtData.posisi_magang || 'Housekeeping Attendant',
    tanggal_mulai: new Date(ojtData.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    tanggal_selesai: new Date(ojtData.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    progress: (() => {
      const start = new Date(ojtData.tanggal_mulai).getTime();
      const end = new Date(ojtData.tanggal_selesai).getTime();
      const now = Date.now();
      return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
    })(),
    status: ojtData.status_laporan,
    supervisor: ojtData.nama_supervisor || 'Belum ditentukan',
    evaluasi: [
      { bulan: 'Hotel', skor: ojtData.nilai_ojt_hotel ?? 0, catatan: 'Nilai dari hotel' },
      { bulan: 'Instruktur', skor: ojtData.nilai_ojt_instruktur ?? 0, catatan: 'Nilai dari instruktur' },
      { bulan: 'Akhir', skor: ojtData.nilai_ojt_akhir ?? 0, catatan: 'Nilai akhir OJT' },
    ].filter(e => e.skor > 0),
    dokumen: [
      { nama: 'Surat Penerimaan', status: ojtData.dokumen_surat_penerimaan_url ? 'selesai' : 'belum_mulai' },
      { nama: 'Laporan Akhir', status: ojtData.dokumen_laporan_akhir_url ? 'selesai' : ojtData.status_laporan === 'sedang_berjalan' ? 'sedang_dikerjakan' : 'belum_mulai' },
    ],
  } : {
    nama_hotel: 'The Ritz-Carlton Bali',
    bintang: 5,
    kota: 'Nusa Dua',
    negara: 'Indonesia',
    posisi: 'Housekeeping Attendant',
    tanggal_mulai: '15 April 2025',
    tanggal_selesai: '15 Oktober 2025',
    progress: 65,
    status: 'sedang_berjalan',
    supervisor: 'Mr. John Smith',
    evaluasi: [
      { bulan: 'April', skor: 82, catatan: 'Adaptasi baik' },
      { bulan: 'Mei', skor: 87, catatan: 'Peningkatan signifikan' },
      { bulan: 'Juni', skor: 90, catatan: 'Konsisten dan reliable' },
    ],
    dokumen: [
      { nama: 'Surat Pengantar', status: 'selesai' },
      { nama: 'Logbook Mingguan', status: 'sedang_dikerjakan' },
      { nama: 'Laporan Akhir', status: 'belum_mulai' },
    ],
  };

  const statusLabel: Record<string, string> = { belum_mulai: 'Belum Mulai', sedang_berjalan: 'Sedang OJT', laporan_dikirim: 'Laporan Dikirim', disetujui: 'Disetujui', ditolak: 'Ditolak', selesai: 'Selesai' };
  const docStatusCfg: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
    selesai: { label: 'Selesai', cls: 'text-success', icon: CheckCircle2 },
    sedang_dikerjakan: { label: 'Progress', cls: 'text-primary', icon: Clock },
    belum_mulai: { label: 'Belum', cls: 'text-muted-foreground', icon: FileText },
  };

  if (loading) return <div className="page-loading"><div className="loading-content"><div className="spinner-modern mx-auto mb-3" /><p className="text-xs text-muted-foreground">Memuat data OJT...</p></div></div>;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>OJT Tracker</h1>
            <p>On-the-Job Training progress Anda</p>
          </div>
          <Badge variant="outline" className="text-xs self-start text-primary border-primary/20 h-9 flex items-center px-3">{statusLabel[ojt.status] || ojt.status}</Badge>
        </div>
      </div>

      {/* Hotel Info */}
      <Card className="border border-border shadow-sm overflow-hidden card-glow">
        <div className="h-1.5 bg-primary" />
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-muted/60 shrink-0"><Briefcase className="w-6 h-6 text-muted-foreground" /></div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold">{ojt.nama_hotel}</h2>
              <div className="flex items-center gap-1 mt-0.5">
                {Array.from({ length: ojt.bintang }).map((_, i) => <Star key={i} className="w-3 h-3 text-warning fill-warning" />)}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ojt.kota}, {ojt.negara}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{ojt.posisi}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ojt.tanggal_mulai} – {ojt.tanggal_selesai}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Supervisor: {ojt.supervisor}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress OJT</span>
              <span className="font-medium tabular-nums">{ojt.progress}%</span>
            </div>
            <Progress value={ojt.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Evaluasi */}
        <Card className="border border-border/60 shadow-none">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-sm font-medium">Evaluasi</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {ojt.evaluasi.length === 0 ? (
              <div className="text-center py-8">
                <Ship className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">Belum ada evaluasi</p>
              </div>
            ) : (
              ojt.evaluasi.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/20 transition-colors">
                  <div className="w-10 text-center"><p className="text-lg font-semibold text-primary tabular-nums">{e.skor}</p><p className="text-[9px] text-muted-foreground">SKOR</p></div>
                  <div className="w-px h-8 bg-border/60" />
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium">{e.bulan}</p><p className="text-[11px] text-muted-foreground">{e.catatan}</p></div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Dokumen */}
        <Card className="border border-border/60 shadow-none">
          <CardHeader className="pb-2 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Dokumen</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-8 text-primary btn-press"><Upload className="w-3 h-3 mr-1.5" />Upload</Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {ojt.dokumen.map((d, i) => {
              const cfg = docStatusCfg[d.status] || docStatusCfg.belum_mulai;
              return (
                <div key={i} className="row-hover flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <cfg.icon className={`w-4 h-4 ${cfg.cls}`} />
                    <p className="text-sm">{d.nama}</p>
                  </div>
                  <span className={`text-[11px] font-medium ${cfg.cls}`}>{cfg.label}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
