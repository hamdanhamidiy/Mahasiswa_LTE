'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Briefcase, MapPin, Globe, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fetchData } from '@/lib/api';

interface OJTItem {
  id: string; nama_perusahaan: string; negara: string; posisi: string; tanggal_mulai: string; tanggal_selesai: string | null; status_laporan: string;
  mahasiswa?: { nama_lengkap: string; nim: string } | null;
}

const statusMap: Record<string, { label: string; cls: string }> = {
  sedang_berjalan: { label: 'Berjalan', cls: 'status-pending' },
  laporan_dikirim: { label: 'Lap. Terkirim', cls: 'status-info' },
  selesai: { label: 'Selesai', cls: 'status-aktif' },
};

export default function InstrukturOJTPage() {
  const [data, setData] = useState<OJTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData<OJTItem[]>('instruktur_mahasiswa_ojt').then(d => { setData(d || []); setLoading(false); }); }, []);
  const filtered = data.filter(o => !search || o.mahasiswa?.nama_lengkap?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header"><h1>Mahasiswa Bimbingan OJT</h1><p>Monitor OJT mahasiswa di bawah bimbingan Anda</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><Briefcase className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{loading ? '—' : data.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Total Bimbingan</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><Globe className="w-4 h-4 mx-auto mb-1 text-chart-3" /><p className="text-xl font-bold">{loading ? '—' : data.filter(o => o.status_laporan === 'sedang_berjalan').length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Sedang Berjalan</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><MapPin className="w-4 h-4 mx-auto mb-1 text-success" /><p className="text-xl font-bold">{loading ? '—' : data.filter(o => o.status_laporan === 'selesai').length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Selesai</p></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari mahasiswa..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat data OJT...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{data.length === 0 ? 'Tidak ada mahasiswa OJT di bimbingan Anda' : 'Tidak ada hasil'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="formal-table">
                <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Mahasiswa</TableHead><TableHead>Perusahaan</TableHead><TableHead>Posisi</TableHead><TableHead className="text-center">Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(o => (
                    <TableRow key={o.id} className="hover:bg-accent/40 group">
                      <TableCell><p className="text-[13px] font-medium">{o.mahasiswa?.nama_lengkap || '—'}</p><p className="text-[10px] text-muted-foreground font-mono">{o.mahasiswa?.nim || ''}</p></TableCell>
                      <TableCell><p className="text-[12px]">{o.nama_perusahaan}</p><p className="text-[10px] text-muted-foreground">{o.negara}</p></TableCell>
                      <TableCell className="text-[12px]">{o.posisi || '—'}</TableCell>
                      <TableCell className="text-center"><span className={`status-indicator text-[8px] ${statusMap[o.status_laporan]?.cls || 'status-info'}`}>{statusMap[o.status_laporan]?.label || o.status_laporan}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
