'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchData } from '@/lib/api';

interface KTMItem {
  id: string; qr_code_url: string; nomor_ktm: string; is_active: boolean; generated_at: string;
  mahasiswa?: { nama_lengkap: string; nim: string; program: string; jurusan: string } | null;
}

export default function AdminKTMPage() {
  const [data, setData] = useState<KTMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData<KTMItem[]>('admin_ktm').then(d => { setData(d || []); setLoading(false); }); }, []);
  const filtered = data.filter(k => !search || k.mahasiswa?.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) || k.nomor_ktm?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header"><h1>KTM Digital</h1><p>Kelola Kartu Tanda Mahasiswa digital</p></div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><CreditCard className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{loading ? '—' : data.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Total KTM</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><CreditCard className="w-4 h-4 mx-auto mb-1 text-success" /><p className="text-xl font-bold">{loading ? '—' : data.filter(k => k.is_active).length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Aktif</p></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari KTM..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat KTM...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><CreditCard className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{data.length === 0 ? 'Belum ada KTM' : 'Tidak ada hasil'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="formal-table">
                <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Mahasiswa</TableHead><TableHead>No. KTM</TableHead><TableHead>Program</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-center">Dibuat</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(k => (
                    <TableRow key={k.id} className="hover:bg-accent/40">
                      <TableCell><p className="text-[13px] font-medium">{k.mahasiswa?.nama_lengkap || '—'}</p><p className="text-[10px] text-muted-foreground font-mono">{k.mahasiswa?.nim || ''}</p></TableCell>
                      <TableCell className="text-[11px] font-mono">{k.nomor_ktm || '—'}</TableCell>
                      <TableCell className="text-[12px]">{k.mahasiswa?.program || '—'}</TableCell>
                      <TableCell className="text-center"><span className={`status-indicator text-[8px] ${k.is_active ? 'status-aktif' : 'status-nonaktif'}`}>{k.is_active ? 'Aktif' : 'Nonaktif'}</span></TableCell>
                      <TableCell className="text-center text-[11px] tabular-nums">{k.generated_at ? new Date(k.generated_at).toLocaleDateString('id-ID') : '—'}</TableCell>
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
