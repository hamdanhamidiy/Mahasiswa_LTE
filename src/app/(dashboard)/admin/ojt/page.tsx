'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, MapPin, Users, ChevronRight } from 'lucide-react';

export default function AdminOJTPage() {
  const ojtData = [
    { nama: 'Rina Maharani', nim: 'LTE-2024-001', hotel: 'The Ritz-Carlton Bali', bintang: 5, kota: 'Nusa Dua', negara: 'Indonesia', posisi: 'Housekeeping', progress: 75, status: 'sedang_berjalan', instruktur: 'Ibu Sari Dewi' },
    { nama: 'Dimas Pratama', nim: 'LTE-2024-002', hotel: 'Hilton Singapore', bintang: 5, kota: 'Singapore', negara: 'Singapura', posisi: 'F&B Service', progress: 60, status: 'sedang_berjalan', instruktur: 'Mr. David Lee' },
    { nama: 'Siti Nurhaliza', nim: 'LTE-2024-003', hotel: 'Four Seasons Jakarta', bintang: 5, kota: 'Jakarta', negara: 'Indonesia', posisi: 'Front Office', progress: 90, status: 'laporan_dikirim', instruktur: 'Ibu Sari Dewi' },
    { nama: 'Fajar Nugroho', nim: 'LTE-2024-004', hotel: 'Marriott Bangkok', bintang: 5, kota: 'Bangkok', negara: 'Thailand', posisi: 'F&B Product', progress: 45, status: 'sedang_berjalan', instruktur: 'Chef Ahmad Yani' },
    { nama: 'Anisa Putri', nim: 'LTE-2024-005', hotel: 'Sheraton Dubai', bintang: 5, kota: 'Dubai', negara: 'UAE', posisi: 'Housekeeping', progress: 100, status: 'disetujui', instruktur: 'Ibu Sari Dewi' },
  ];
  const statusLabel: Record<string, { label: string; cls: string }> = {
    sedang_berjalan: { label: 'OJT Aktif', cls: 'chip-primary' },
    laporan_dikirim: { label: 'Laporan', cls: 'chip-warning' },
    disetujui: { label: 'Selesai', cls: 'chip-success' },
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div><h1>Monitoring OJT</h1><p>Pantau seluruh mahasiswa yang sedang menjalani OJT</p></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-stat-highlight animate-slide-up">
          <CardContent className="p-5 text-center">
            <p className="stat-value">{ojtData.length}</p>
            <p className="stat-label mt-1">Total OJT</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Aktif</p>
                <p className="text-2xl font-bold mt-1.5 text-primary metric-value">{ojtData.filter(o => o.status === 'sedang_berjalan').length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/8"><Briefcase className="w-[18px] h-[18px] text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Selesai</p>
                <p className="text-2xl font-bold mt-1.5 text-success metric-value">{ojtData.filter(o => o.status === 'disetujui').length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-success/8"><Briefcase className="w-[18px] h-[18px] text-success" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 stagger-children">
        {ojtData.map((o, i) => {
          const st = statusLabel[o.status] || statusLabel.sedang_berjalan;
          return (
            <Card key={i} className="border border-border shadow-sm card-glow animate-slide-up group cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-primary">{o.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-[13px] font-semibold group-hover:text-primary transition-colors">{o.nama}</h3>
                      <span className="text-[10px] text-muted-foreground font-mono">{o.nim}</span>
                      <span className={`chip ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="text-[13px] font-medium">{o.hotel}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{o.kota}, {o.negara}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{o.posisi}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{o.instruktur}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-2 rounded-full bg-muted/40 overflow-hidden flex-1">
                        <div className={`h-full rounded-full transition-all duration-700 ${o.progress >= 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${o.progress}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold tabular-nums">{o.progress}%</span>
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
