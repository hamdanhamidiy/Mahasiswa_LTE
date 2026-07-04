'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Download, TrendingUp, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fetchData } from '@/lib/api';

// Note: For now we reuse admin_absensi pattern. A dedicated admin_nilai endpoint
// would aggregate by class. This shows the concept with real data flow.

export default function AdminNilaiPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Using admin_mata_pelajaran as proxy for rekap - shows classes available
  const [mapels, setMapels] = useState<any[]>([]);
  useEffect(() => {
    fetchData('admin_mata_pelajaran').then(d => { setMapels(d || []); setLoading(false); });
  }, []);

  const filtered = mapels.filter((m: any) => !search || m.nama_mapel?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div><h1>Rekap Nilai</h1><p>Ringkasan nilai seluruh kelas LTE Cruise</p></div>
          <Button variant="outline" className="btn-press text-xs h-8 self-start"><Download className="w-3.5 h-3.5 mr-1.5" /> Export Raport</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><GraduationCap className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{loading ? '—' : mapels.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Mata Pelajaran</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><TrendingUp className="w-4 h-4 mx-auto mb-1 text-success" /><p className="text-xl font-bold">{loading ? '—' : mapels.filter((m: any) => m.is_active).length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Aktif Dinilai</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><GraduationCap className="w-4 h-4 mx-auto mb-1 text-chart-4" /><p className="text-xl font-bold">{loading ? '—' : mapels.reduce((a: number, m: any) => a + (m.sks || 0), 0)}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Total SKS</p></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari mata pelajaran..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat rekap nilai...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><GraduationCap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{mapels.length === 0 ? 'Belum ada data nilai' : 'Tidak ada hasil'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="formal-table">
                <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Mata Pelajaran</TableHead><TableHead>Jurusan</TableHead><TableHead className="text-center">SKS</TableHead><TableHead>Instruktur</TableHead><TableHead className="text-center">Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map((m: any) => (
                    <TableRow key={m.id} className="hover:bg-accent/40 group cursor-pointer">
                      <TableCell>
                        <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{m.nama_mapel}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{m.kode_mapel}</p>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px] capitalize">{m.jurusan?.replace('_', ' ') || '—'}</Badge></TableCell>
                      <TableCell className="text-center"><span className="text-sm font-bold tabular-nums text-primary">{m.sks || 0}</span></TableCell>
                      <TableCell className="text-[12px]">{m.instruktur?.nama_lengkap || '—'}</TableCell>
                      <TableCell className="text-center"><span className={`status-indicator text-[8px] ${m.is_active ? 'status-aktif' : 'status-nonaktif'}`}>{m.is_active ? 'Aktif' : 'Nonaktif'}</span></TableCell>
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
