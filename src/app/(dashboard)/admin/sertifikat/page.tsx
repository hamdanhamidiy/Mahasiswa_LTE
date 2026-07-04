'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Search, Loader2, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fetchData } from '@/lib/api';

interface SertifikatItem {
  id: string; nomor_sertifikat: string; tanggal_lulus: string; created_at: string;
  mahasiswa?: { nama_lengkap: string; nim: string } | null;
}

export default function AdminSertifikatPage() {
  const [data, setData] = useState<SertifikatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData<SertifikatItem[]>('admin_sertifikat').then(d => { setData(d || []); setLoading(false); }); }, []);
  const filtered = data.filter(s => !search || s.mahasiswa?.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) || s.nomor_sertifikat?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header"><h1>Sertifikat</h1><p>Kelola sertifikat kelulusan mahasiswa</p></div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><Award className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{loading ? '—' : data.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Total Sertifikat</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><FileText className="w-4 h-4 mx-auto mb-1 text-success" /><p className="text-xl font-bold">{loading ? '—' : data.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Diterbitkan</p></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari sertifikat..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat sertifikat...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><Award className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{data.length === 0 ? 'Belum ada sertifikat' : 'Tidak ada hasil'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="formal-table">
                <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Mahasiswa</TableHead><TableHead>No. Sertifikat</TableHead><TableHead className="text-center">Tgl Lulus</TableHead><TableHead className="text-center">Diterbitkan</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(s => (
                    <TableRow key={s.id} className="hover:bg-accent/40">
                      <TableCell><p className="text-[13px] font-medium">{s.mahasiswa?.nama_lengkap || '—'}</p><p className="text-[10px] text-muted-foreground font-mono">{s.mahasiswa?.nim || ''}</p></TableCell>
                      <TableCell className="text-[11px] font-mono">{s.nomor_sertifikat || '—'}</TableCell>
                      <TableCell className="text-center text-[11px] tabular-nums">{s.tanggal_lulus ? new Date(s.tanggal_lulus).toLocaleDateString('id-ID') : '—'}</TableCell>
                      <TableCell className="text-center text-[11px] tabular-nums">{s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : '—'}</TableCell>
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
