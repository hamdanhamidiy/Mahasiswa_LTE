'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Calendar, Loader2 } from 'lucide-react';
import { fetchData } from '@/lib/api';

// Instruktur's absensi - shows classes they can take attendance for
export default function InstrukturAbsensiPage() {
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData('instruktur_jadwal').then(d => { setJadwal(d || []); setLoading(false); }); }, []);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayHari = days[new Date().getDay()];
  const todayJadwal = jadwal.filter((j: any) => j.hari === todayHari);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header"><h1>Input Absensi</h1><p>Rekap kehadiran mahasiswa untuk kelas Anda</p></div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><ClipboardCheck className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{loading ? '—' : jadwal.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Total Kelas</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><Calendar className="w-4 h-4 mx-auto mb-1 text-chart-4" /><p className="text-xl font-bold">{loading ? '—' : todayJadwal.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Hari Ini ({todayHari})</p></CardContent></Card>
      </div>

      <div>
        <h2 className="section-title">Jadwal Hari Ini — {todayHari}</h2>
        <Card className="border border-border shadow-none overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat jadwal...</p></div>
            ) : todayJadwal.length === 0 ? (
              <div className="py-16 text-center"><Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">Tidak ada jadwal hari ini</p></div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="formal-table">
                  <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Mata Pelajaran</TableHead><TableHead>Kelas</TableHead><TableHead>Waktu</TableHead><TableHead>Ruangan</TableHead><TableHead className="text-center">Aksi</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {todayJadwal.map((j: any) => (
                      <TableRow key={j.id} className="hover:bg-accent/40 group">
                        <TableCell><p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{j.mata_pelajaran?.nama_mapel || '—'}</p></TableCell>
                        <TableCell className="text-[12px]">{j.kelas || '—'}</TableCell>
                        <TableCell className="text-[12px] tabular-nums">{j.jam_mulai} - {j.jam_selesai}</TableCell>
                        <TableCell className="text-[12px]">{j.ruangan || '—'}</TableCell>
                        <TableCell className="text-center"><Button size="sm" className="bg-primary text-[10px] h-7">Input Absensi</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All classes */}
      <div>
        <h2 className="section-title">Semua Kelas</h2>
        <Card className="border border-border shadow-none overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>
            ) : jadwal.length === 0 ? (
              <div className="py-12 text-center"><ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">Tidak ada kelas yang diampu</p></div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="formal-table">
                  <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Mata Pelajaran</TableHead><TableHead>Hari</TableHead><TableHead>Waktu</TableHead><TableHead>Kelas</TableHead><TableHead>Ruangan</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {jadwal.map((j: any) => (
                      <TableRow key={j.id} className="hover:bg-accent/40">
                        <TableCell className="text-[13px] font-medium">{j.mata_pelajaran?.nama_mapel || '—'}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{j.hari}</Badge></TableCell>
                        <TableCell className="text-[12px] tabular-nums">{j.jam_mulai} - {j.jam_selesai}</TableCell>
                        <TableCell className="text-[12px]">{j.kelas || '—'}</TableCell>
                        <TableCell className="text-[12px]">{j.ruangan || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
