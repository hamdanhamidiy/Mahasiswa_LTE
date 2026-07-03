'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Plus, Search, MoreHorizontal, FileText, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export default function AdminSertifikatPage() {
  const [search, setSearch] = useState('');
  const sertifikat = [
    { nomor: 'LTE/CERT/2024/001', nama: 'Rina Maharani', ipk: 3.85, predikat: 'Dengan Pujian', tanggal: '15 Des 2024' },
    { nomor: 'LTE/CERT/2024/002', nama: 'Dimas Pratama', ipk: 3.52, predikat: 'Sangat Memuaskan', tanggal: '15 Des 2024' },
    { nomor: 'LTE/CERT/2024/003', nama: 'Siti Nurhaliza', ipk: 3.71, predikat: 'Sangat Memuaskan', tanggal: '15 Des 2024' },
    { nomor: 'LTE/CERT/2024/004', nama: 'Fajar Nugroho', ipk: 3.25, predikat: 'Memuaskan', tanggal: '15 Des 2024' },
  ];
  const predikatCls: Record<string, string> = { 'Dengan Pujian': 'text-success border-success/20', 'Sangat Memuaskan': 'text-primary border-primary/20', 'Memuaskan': 'text-warning border-warning/20' };
  const filtered = sertifikat.filter(s => !search || s.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Sertifikat Kelulusan</h1>
            <p>Kelola penerbitan sertifikat alumni LTE Cruise</p>
          </div>
          <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15"><Plus className="w-3.5 h-3.5 mr-1.5" /> Terbitkan Sertifikat</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-stat-highlight animate-slide-up">
          <CardContent className="p-5 text-center">
            <p className="stat-value">{sertifikat.length}</p>
            <p className="stat-label mt-1">Diterbitkan</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Dengan Pujian</p>
                <p className="text-2xl font-bold mt-1.5 text-success metric-value">{sertifikat.filter(s => s.predikat === 'Dengan Pujian').length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-success/8"><Award className="w-[18px] h-[18px] text-success" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Rata-rata IPK</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{(sertifikat.reduce((a, s) => a + s.ipk, 0) / sertifikat.length).toFixed(2)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-chart-4/8"><FileText className="w-[18px] h-[18px] text-chart-4" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari sertifikat..." className="pl-10 h-10 text-sm bg-muted/30" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <CardContent className="p-0"><div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">No. Sertifikat</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Nama</TableHead>
                <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">IPK</TableHead>
                <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Predikat</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Tanggal</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{filtered.map((s, i) => (
              <TableRow key={i} className="hover:bg-accent/50 group">
                <TableCell className="text-xs font-mono text-primary py-3.5">{s.nomor}</TableCell>
                <TableCell className="text-[13px] font-semibold group-hover:text-primary transition-colors">{s.nama}</TableCell>
                <TableCell className="text-center text-sm font-bold tabular-nums">{s.ipk}</TableCell>
                <TableCell className="text-center"><Badge variant="outline" className={`text-[10px] font-medium ${predikatCls[s.predikat] || ''}`}>{s.predikat}</Badge></TableCell>
                <TableCell className="text-[13px] text-muted-foreground">{s.tanggal}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg h-8 w-8 hover:bg-accent outline-none"><MoreHorizontal className="w-4 h-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-[13px] cursor-pointer py-2">Unduh PDF</DropdownMenuItem>
                      <DropdownMenuItem className="text-[13px] cursor-pointer py-2">Lihat Detail</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div></CardContent>
      </Card>
    </div>
  );
}
