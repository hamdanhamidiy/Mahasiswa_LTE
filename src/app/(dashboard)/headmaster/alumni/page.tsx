'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, Search, Globe, Briefcase, Ship, Loader2, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchData } from '@/lib/api';

interface AlumniItem {
  id: string; nomor_sertifikat: string; tanggal_lulus: string;
  mahasiswa?: { nama_lengkap: string; nim: string; program: string; jurusan: string } | null;
}

export default function HeadmasterAlumniPage() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<AlumniItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData<AlumniItem[]>('admin_alumni').then(d => {
      setData(d || []);
      setLoading(false);
    });
  }, []);

  const filtered = data.filter(a => !search || a.mahasiswa?.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) || a.nomor_sertifikat?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Data Alumni</h1>
        <p>Daftar alumni LTE Cruise yang telah lulus</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <Card className="border border-border shadow-none card-interactive animate-slide-up"><CardContent className="p-4 text-center"><Briefcase className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold tabular-nums">{loading ? '—' : data.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Total Alumni</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up"><CardContent className="p-4 text-center"><Award className="w-4 h-4 mx-auto mb-1 text-success" /><p className="text-xl font-bold tabular-nums">{loading ? '—' : data.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Bersertifikat</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up"><CardContent className="p-4 text-center"><Ship className="w-4 h-4 mx-auto mb-1 text-chart-4" /><p className="text-xl font-bold tabular-nums">{loading ? '—' : data.filter(a => a.mahasiswa?.jurusan?.includes('hotel') || a.mahasiswa?.jurusan?.includes('kapal_pesiar')).length || 0}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Kapal Pesiar</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up"><CardContent className="p-4 text-center"><Globe className="w-4 h-4 mx-auto mb-1 text-chart-5" /><p className="text-xl font-bold tabular-nums">{loading ? '—' : 0}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Negara</p></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari alumni..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat data alumni...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{data.length === 0 ? 'Belum ada data alumni' : 'Tidak ada hasil'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="formal-table">
                <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Alumni</TableHead><TableHead>Program</TableHead><TableHead>Jurusan</TableHead><TableHead>No. Sertifikat</TableHead><TableHead className="text-center">Tgl Lulus</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(a => (
                    <TableRow key={a.id} className="hover:bg-accent/40 group">
                      <TableCell><p className="text-[13px] font-medium">{a.mahasiswa?.nama_lengkap || '—'}</p><p className="text-[10px] text-muted-foreground font-mono">{a.mahasiswa?.nim || ''}</p></TableCell>
                      <TableCell className="text-[12px]">{a.mahasiswa?.program || '—'}</TableCell>
                      <TableCell className="text-[12px] capitalize">{a.mahasiswa?.jurusan?.replace('_', ' ') || '—'}</TableCell>
                      <TableCell className="text-[11px] font-mono">{a.nomor_sertifikat || '—'}</TableCell>
                      <TableCell className="text-center text-[11px] tabular-nums">{a.tanggal_lulus ? new Date(a.tanggal_lulus).toLocaleDateString('id-ID') : '—'}</TableCell>
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
