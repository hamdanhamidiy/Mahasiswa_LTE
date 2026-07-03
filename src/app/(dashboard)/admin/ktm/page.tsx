'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle2, XCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';

export default function AdminKTMPage() {
  const [search, setSearch] = useState('');
  const ktmData = [
    { nama: 'Rina Maharani', nim: 'LTE-2025-001', program: 'D1', jurusan: 'Housekeeping', angkatan: '25', active: true, expired: '13 Jan 2026' },
    { nama: 'Dimas Pratama', nim: 'LTE-2025-002', program: 'D1', jurusan: 'F&B Product', angkatan: '25', active: true, expired: '13 Jan 2026' },
    { nama: 'Siti Nurhaliza', nim: 'LTE-2025-003', program: 'D1', jurusan: 'F&B Service', angkatan: '25', active: true, expired: '13 Jan 2026' },
    { nama: 'Fajar Nugroho', nim: 'LTE-2024-001', program: 'D1', jurusan: 'Housekeeping', angkatan: '24', active: true, expired: '13 Jan 2025' },
    { nama: 'Budi Setiawan', nim: 'LTE-2024-003', program: 'Executive', jurusan: 'F&B Product', angkatan: '24', active: false, expired: '13 Jul 2025' },
  ];
  const filtered = ktmData.filter(k => !search || k.nama.toLowerCase().includes(search.toLowerCase()) || k.nim.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header"><div><h1>Manajemen KTM Digital</h1><p>Kelola Kartu Tanda Mahasiswa seluruh siswa</p></div></div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-stat-highlight animate-slide-up">
          <CardContent className="p-5 text-center"><CreditCard className="w-5 h-5 mx-auto mb-1.5 opacity-50" /><p className="stat-value">{ktmData.length}</p><p className="stat-label mt-1">Total KTM</p></CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Aktif</p><p className="text-2xl font-bold mt-1.5 text-success metric-value">{ktmData.filter(k => k.active).length}</p></div><div className="p-2.5 rounded-xl bg-success/8"><CheckCircle2 className="w-[18px] h-[18px] text-success" /></div></div></CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Nonaktif</p><p className="text-2xl font-bold mt-1.5 text-error metric-value">{ktmData.filter(k => !k.active).length}</p></div><div className="p-2.5 rounded-xl bg-error/8"><XCircle className="w-[18px] h-[18px] text-error" /></div></div></CardContent>
        </Card>
      </div>

      <div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Cari KTM..." className="pl-10 h-10 text-sm bg-muted/30" value={search} onChange={e => setSearch(e.target.value)} /></div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <CardContent className="p-0"><div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Mahasiswa</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Program</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Jurusan</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Berlaku</TableHead>
              <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>{filtered.map((k, i) => (
              <TableRow key={i} className="hover:bg-accent/50 group">
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-primary">{k.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                    </div>
                    <div><p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{k.nama}</p><p className="text-[11px] text-muted-foreground font-mono">{k.nim}</p></div>
                  </div>
                </TableCell>
                <TableCell className="text-[13px]">{k.program}</TableCell>
                <TableCell className="text-[13px]">{k.jurusan}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground">{k.expired}</TableCell>
                <TableCell className="text-center"><span className={`status-indicator text-[9px] ${k.active ? 'status-aktif' : 'status-nonaktif'}`}>{k.active ? 'Aktif' : 'Nonaktif'}</span></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div></CardContent>
      </Card>
    </div>
  );
}
