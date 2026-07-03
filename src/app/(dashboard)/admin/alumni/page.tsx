'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, Search, Globe, Briefcase, Ship, Award } from 'lucide-react';
import { useState } from 'react';

export default function AdminAlumniPage() {
  const [search, setSearch] = useState('');
  const alumni = [
    { nama: 'Dewi Anggraeni', nim: 'LTE-2022-001', angkatan: '22', status: 'Sudah Bekerja', tempat: 'Royal Caribbean Cruise', negara: 'USA', posisi: 'Cabin Steward' },
    { nama: 'Rudi Hartono', nim: 'LTE-2022-002', angkatan: '22', status: 'Sudah Bekerja', tempat: 'Hilton Dubai', negara: 'UAE', posisi: 'F&B Service' },
    { nama: 'Maya Sari', nim: 'LTE-2023-001', angkatan: '23', status: 'Proses Interview', tempat: '—', negara: '—', posisi: '—' },
    { nama: 'Eko Prasetyo', nim: 'LTE-2022-003', angkatan: '22', status: 'Sudah Bekerja', tempat: 'Celebrity Cruises', negara: 'International', posisi: 'Housekeeping' },
    { nama: 'Putri Rahayu', nim: 'LTE-2023-002', angkatan: '23', status: 'Belum Disalurkan', tempat: '—', negara: '—', posisi: '—' },
  ];
  const statusCls: Record<string, string> = { 'Sudah Bekerja': 'chip-success', 'Proses Interview': 'chip-warning', 'Belum Disalurkan': 'chip-neutral' };
  const filtered = alumni.filter(a => !search || a.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div><h1>Data Alumni & Penyaluran</h1><p>Tracking alumni dan status penempatan kerja</p></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-stat-highlight animate-slide-up">
          <CardContent className="p-5 text-center">
            <p className="stat-value">{alumni.length}</p>
            <p className="stat-label mt-1">Total Alumni</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Bekerja</p>
                <p className="text-2xl font-bold mt-1.5 text-success metric-value">{alumni.filter(a => a.status === 'Sudah Bekerja').length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-success/8"><Briefcase className="w-[18px] h-[18px] text-success" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Interview</p>
                <p className="text-2xl font-bold mt-1.5 text-primary metric-value">{alumni.filter(a => a.status === 'Proses Interview').length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/8"><Ship className="w-[18px] h-[18px] text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Negara</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{new Set(alumni.filter(a => a.negara !== '—').map(a => a.negara)).size}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-chart-5/8"><Globe className="w-[18px] h-[18px] text-chart-5" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari alumni..." className="pl-10 h-10 text-sm bg-muted/30" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <CardContent className="p-0"><div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Alumni</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Tempat Kerja</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Posisi</TableHead>
                <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{filtered.map((a, i) => (
              <TableRow key={i} className="hover:bg-accent/50 group">
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-primary">{a.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{a.nama}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{a.nim} · Angkatan {a.angkatan}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[13px]">{a.tempat}</TableCell>
                <TableCell className="text-[13px]">{a.posisi}</TableCell>
                <TableCell className="text-center"><span className={`chip ${statusCls[a.status] || 'chip-neutral'}`}>{a.status}</span></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div></CardContent>
      </Card>
    </div>
  );
}
