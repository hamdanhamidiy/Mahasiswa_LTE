'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Calendar, Search, Loader2, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchData } from '@/lib/api';

interface AbsensiItem {
  id: string; tanggal: string; status: string; metode: string;
  mahasiswa?: { nama_lengkap: string; nim: string } | null;
  jadwal?: { kelas: string; mata_pelajaran?: { nama_mapel: string } | null } | null;
}

const statusCls: Record<string, string> = { hadir: 'status-aktif', izin: 'status-pending', sakit: 'status-info', alpha: 'status-nonaktif' };

export default function AdminAbsensiPage() {
  const [data, setData] = useState<AbsensiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetchData<AbsensiItem[]>('admin_absensi').then(d => { setData(d || []); setLoading(false); }); }, []);

  const filtered = data.filter(a => {
    if (search && !a.mahasiswa?.nama_lengkap?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header"><h1>Rekap Absensi</h1><p>Monitor kehadiran mahasiswa di semua kelas</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><ClipboardCheck className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{loading ? '—' : data.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Total Record</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><Users className="w-4 h-4 mx-auto mb-1 text-success" /><p className="text-xl font-bold">{loading ? '—' : data.filter(a => a.status === 'hadir').length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Hadir</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><Calendar className="w-4 h-4 mx-auto mb-1 text-warning" /><p className="text-xl font-bold">{loading ? '—' : data.filter(a => a.status === 'izin' || a.status === 'sakit').length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Izin/Sakit</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><ClipboardCheck className="w-4 h-4 mx-auto mb-1 text-error" /><p className="text-xl font-bold">{loading ? '—' : data.filter(a => a.status === 'alpha').length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Alpha</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Cari mahasiswa..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={v => setFilterStatus(v ?? 'all')}>
          <SelectTrigger className="w-full sm:w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="hadir">Hadir</SelectItem>
            <SelectItem value="izin">Izin</SelectItem>
            <SelectItem value="sakit">Sakit</SelectItem>
            <SelectItem value="alpha">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat absensi...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{data.length === 0 ? 'Belum ada data absensi' : 'Tidak ada hasil'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="formal-table">
                <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Mahasiswa</TableHead><TableHead>Mata Pelajaran</TableHead><TableHead>Kelas</TableHead><TableHead className="text-center">Tanggal</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-center">Metode</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(a => (
                    <TableRow key={a.id} className="hover:bg-accent/40">
                      <TableCell><p className="text-[13px] font-medium">{a.mahasiswa?.nama_lengkap || '—'}</p><p className="text-[10px] text-muted-foreground font-mono">{a.mahasiswa?.nim || ''}</p></TableCell>
                      <TableCell className="text-[12px]">{a.jadwal?.mata_pelajaran?.nama_mapel || '—'}</TableCell>
                      <TableCell className="text-[12px]">{a.jadwal?.kelas || '—'}</TableCell>
                      <TableCell className="text-center text-[11px] tabular-nums">{a.tanggal ? new Date(a.tanggal).toLocaleDateString('id-ID') : '—'}</TableCell>
                      <TableCell className="text-center"><span className={`status-indicator text-[8px] capitalize ${statusCls[a.status] || ''}`}>{a.status}</span></TableCell>
                      <TableCell className="text-center"><Badge variant="outline" className="text-[9px] capitalize">{a.metode || '—'}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border bg-muted/20"><p className="text-[10px] text-muted-foreground">Menampilkan {filtered.length} dari {data.length} record</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
