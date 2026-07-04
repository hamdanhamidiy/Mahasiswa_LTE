'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Search, Loader2, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fetchData } from '@/lib/api';

// Shows classes the instruktur teaches, from which they can input grades
export default function InstrukturNilaiPage() {
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData('instruktur_jadwal').then(d => { setJadwal(d || []); setLoading(false); }); }, []);

  // Unique classes for grade entry
  const classes = Array.from(new Map(jadwal.map((j: any) => [
    j.mata_pelajaran?.nama_mapel,
    { mapel: j.mata_pelajaran?.nama_mapel || '—', kode: j.mata_pelajaran?.kode_mapel || '—', kelas: j.kelas || '—', sks: j.mata_pelajaran?.sks || 0 }
  ])).values());

  const filtered = classes.filter(c => !search || c.mapel.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header"><h1>Input Nilai</h1><p>Kelola nilai mahasiswa untuk mata pelajaran Anda</p></div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><GraduationCap className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{loading ? '—' : classes.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Mata Pelajaran</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><BookOpen className="w-4 h-4 mx-auto mb-1 text-chart-3" /><p className="text-xl font-bold">{loading ? '—' : classes.reduce((a, c) => a + c.sks, 0)}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Total SKS</p></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari mata pelajaran..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat data...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><GraduationCap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{classes.length === 0 ? 'Tidak ada kelas yang diampu' : 'Tidak ada hasil'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="formal-table">
                <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Mata Pelajaran</TableHead><TableHead>Kelas</TableHead><TableHead className="text-center">SKS</TableHead><TableHead className="text-center">Aksi</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map((c, i) => (
                    <TableRow key={i} className="hover:bg-accent/40 group">
                      <TableCell><p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{c.mapel}</p><p className="text-[10px] text-muted-foreground font-mono">{c.kode}</p></TableCell>
                      <TableCell className="text-[12px]">{c.kelas}</TableCell>
                      <TableCell className="text-center"><span className="text-sm font-bold tabular-nums text-primary">{c.sks}</span></TableCell>
                      <TableCell className="text-center"><Button size="sm" variant="outline" className="text-[10px] h-7">Input Nilai</Button></TableCell>
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
