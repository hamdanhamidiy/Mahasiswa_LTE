'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Search, Plus, MoreHorizontal, BookMarked, Users, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { fetchData } from '@/lib/api';

interface MapelItem {
  id: string; kode_mapel: string; nama_mapel: string; jurusan: string; sks: number; is_active: boolean;
  instruktur?: { nama_lengkap: string } | null;
}

export default function AdminMataPelajaranPage() {
  const [search, setSearch] = useState('');
  const [mapels, setMapels] = useState<MapelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData<MapelItem[]>('admin_mata_pelajaran').then(d => { setMapels(d || []); setLoading(false); });
  }, []);

  const filtered = mapels.filter(m => !search || m.nama_mapel?.toLowerCase().includes(search.toLowerCase()) || m.kode_mapel?.toLowerCase().includes(search.toLowerCase()));
  const totalSks = mapels.reduce((a, m) => a + (m.sks || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div><h1>Mata Pelajaran</h1><p>Kelola kurikulum dan mata pelajaran LTE Cruise</p></div>
          <Button className="bg-primary btn-press text-xs h-8 self-start"><Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Mapel</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <BookOpen className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : mapels.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Total Mapel</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <BookMarked className="w-4 h-4 mx-auto mb-1 text-chart-4" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : totalSks}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Total SKS</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <BookOpen className="w-4 h-4 mx-auto mb-1 text-success" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : mapels.filter(m => m.is_active).length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Aktif</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-chart-5" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : new Set(mapels.map(m => m.instruktur?.nama_lengkap).filter(Boolean)).size}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Instruktur</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari mata pelajaran atau kode..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat data...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{mapels.length === 0 ? 'Belum ada mata pelajaran' : 'Tidak ada hasil'}</p></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="formal-table">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Mata Pelajaran</TableHead>
                      <TableHead>Jurusan</TableHead>
                      <TableHead>Instruktur</TableHead>
                      <TableHead className="text-center">SKS</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(m => (
                      <TableRow key={m.id} className="hover:bg-accent/40 group">
                        <TableCell>
                          <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{m.nama_mapel}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{m.kode_mapel}</p>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] font-normal capitalize">{m.jurusan?.replace('_', ' ') || '—'}</Badge></TableCell>
                        <TableCell className="text-[12px]">{m.instruktur?.nama_lengkap || '—'}</TableCell>
                        <TableCell className="text-center"><span className="text-sm font-bold tabular-nums text-primary">{m.sks || 0}</span></TableCell>
                        <TableCell className="text-center">
                          <span className={`status-indicator text-[8px] ${m.is_active ? 'status-aktif' : 'status-nonaktif'}`}>{m.is_active ? 'Aktif' : 'Nonaktif'}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent outline-none"><MoreHorizontal className="w-3.5 h-3.5" /></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-[11px]">Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-[11px] text-error">Nonaktifkan</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-4 py-2.5 border-t border-border bg-muted/20">
                <p className="text-[10px] text-muted-foreground">Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> dari <span className="font-semibold text-foreground">{mapels.length}</span> mata pelajaran</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
