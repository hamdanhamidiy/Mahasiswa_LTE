'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, MapPin, Star, Calendar, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function InstrukturOJTPage() {
  const ojtStudents = [
    { id: '1', nama: 'Rina Maharani', nim: 'LTE-2024-001', hotel: 'The Ritz-Carlton Bali', bintang: 5, kota: 'Nusa Dua', negara: 'Indonesia', posisi: 'Housekeeping', progress: 75, status: 'sedang_berjalan' },
    { id: '2', nama: 'Dimas Pratama', nim: 'LTE-2024-002', hotel: 'Hilton Singapore', bintang: 5, kota: 'Singapore', negara: 'Singapura', posisi: 'F&B Service', progress: 60, status: 'sedang_berjalan' },
    { id: '3', nama: 'Siti Nurhaliza', nim: 'LTE-2024-003', hotel: 'Four Seasons Jakarta', bintang: 5, kota: 'Jakarta', negara: 'Indonesia', posisi: 'Front Office', progress: 90, status: 'laporan_dikirim' },
    { id: '4', nama: 'Fajar Nugroho', nim: 'LTE-2024-004', hotel: 'Marriott Bangkok', bintang: 5, kota: 'Bangkok', negara: 'Thailand', posisi: 'F&B Product', progress: 45, status: 'sedang_berjalan' },
    { id: '5', nama: 'Anisa Putri', nim: 'LTE-2024-005', hotel: 'Sheraton Dubai', bintang: 5, kota: 'Dubai', negara: 'UAE', posisi: 'Housekeeping', progress: 100, status: 'disetujui' },
  ];

  const statusLabel: Record<string, { label: string; cls: string }> = {
    sedang_berjalan: { label: 'OJT Aktif', cls: 'text-primary border-primary/20' },
    laporan_dikirim: { label: 'Laporan Masuk', cls: 'text-warning border-warning/20' },
    disetujui: { label: 'Selesai', cls: 'text-success border-success/20' },
    belum_mulai: { label: 'Belum Mulai', cls: 'text-muted-foreground border-border' },
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Mahasiswa OJT</h1>
          <p>Monitoring mahasiswa bimbingan yang sedang OJT</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="border border-border/60 shadow-none bg-primary text-white animate-slide-up">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">{ojtStudents.length}</p>
            <p className="text-[10px] text-white/60 mt-0.5">Total Mahasiswa</p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold tabular-nums text-primary">{ojtStudents.filter(s => s.status === 'sedang_berjalan').length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">OJT Aktif</p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold tabular-nums text-warning">{ojtStudents.filter(s => s.status === 'laporan_dikirim').length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Laporan Masuk</p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold tabular-nums text-success">{ojtStudents.filter(s => s.status === 'disetujui').length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Selesai</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 stagger-children">
        {ojtStudents.map(student => {
          const st = statusLabel[student.status] || statusLabel.belum_mulai;
          return (
            <Card key={student.id} className="border border-border/60 shadow-none card-glow overflow-hidden animate-slide-up">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-lg bg-muted/60 shrink-0">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold">{student.nama}</h3>
                        <span className="text-[10px] text-muted-foreground font-mono">{student.nim}</span>
                        <Badge variant="outline" className={`text-[10px] ${st.cls}`}>{st.label}</Badge>
                      </div>
                      <p className="text-sm text-foreground/80">{student.hotel}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{student.kota}, {student.negara}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{student.posisi}</span>
                        <span className="flex items-center gap-1">
                          {Array.from({ length: student.bintang }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 text-warning fill-warning" />)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Progress value={student.progress} className="h-1.5 flex-1" />
                        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">{student.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
