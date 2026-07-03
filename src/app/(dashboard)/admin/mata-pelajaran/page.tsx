'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Search, Plus, MoreHorizontal, BookMarked, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AdminMataPelajaranPage() {
  const [search, setSearch] = useState('');

  const mapels = [
    { id: '1', kode: 'HK-101', nama: 'Housekeeping Management', program: 'D1', jurusan: 'Housekeeping', fase: 'Fase Kelas', sks: 3, instruktur: 'Ibu Sari Dewi', active: true },
    { id: '2', kode: 'HK-102', nama: 'Room Division Operations', program: 'D1', jurusan: 'Housekeeping', fase: 'Fase Kelas', sks: 2, instruktur: 'Ibu Sari Dewi', active: true },
    { id: '3', kode: 'FB-101', nama: 'F&B Product', program: 'D1', jurusan: 'F&B Product', fase: 'Fase Kelas', sks: 4, instruktur: 'Chef Ahmad Yani', active: true },
    { id: '4', kode: 'FB-201', nama: 'Restaurant Service', program: 'D1', jurusan: 'F&B Service', fase: 'Fase Kelas', sks: 3, instruktur: 'Mr. David Lee', active: true },
    { id: '5', kode: 'FB-202', nama: 'Bartending & Mixology', program: 'D1', jurusan: 'F&B Service', fase: 'Fase Kelas', sks: 2, instruktur: 'Mr. David Lee', active: true },
    { id: '6', kode: 'EN-101', nama: 'English for Hospitality', program: 'D1', jurusan: 'Umum', fase: 'Fase Kelas', sks: 3, instruktur: 'Mr. John Smith', active: true },
    { id: '7', kode: 'EN-102', nama: 'English Conversation', program: 'D1', jurusan: 'Umum', fase: 'Fase Kelas', sks: 2, instruktur: 'Mr. John Smith', active: true },
    { id: '8', kode: 'GN-101', nama: 'Etika Profesi & Grooming', program: 'D1', jurusan: 'Umum', fase: 'Fase Kelas', sks: 2, instruktur: 'Ibu Ratna Sari', active: false },
  ];

  const filtered = mapels.filter(m => !search || m.nama.toLowerCase().includes(search.toLowerCase()) || m.kode.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Mata Pelajaran</h1>
            <p>Kelola kurikulum dan mata pelajaran LTE Cruise</p>
          </div>
          <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Mata Pelajaran
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Total Mapel</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{mapels.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/8"><BookOpen className="w-[18px] h-[18px] text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Total SKS</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{mapels.reduce((a, m) => a + m.sks, 0)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-chart-4/8"><BookMarked className="w-[18px] h-[18px] text-chart-4" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Aktif</p>
                <p className="text-2xl font-bold mt-1.5 text-success metric-value">{mapels.filter(m => m.active).length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-success/8"><BookOpen className="w-[18px] h-[18px] text-success" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Instruktur</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{new Set(mapels.map(m => m.instruktur)).size}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-chart-5/8"><Users className="w-[18px] h-[18px] text-chart-5" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari mata pelajaran atau kode..." className="pl-10 h-10 text-sm bg-muted/30" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Mata Pelajaran</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Jurusan</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Instruktur</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">SKS</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(m => (
                  <TableRow key={m.id} className="hover:bg-accent/50 group">
                    <TableCell className="py-3.5">
                      <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{m.nama}</p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{m.kode} · {m.fase}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] font-normal">{m.jurusan}</Badge></TableCell>
                    <TableCell className="text-[13px]">{m.instruktur}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold tabular-nums text-primary">{m.sks}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`status-indicator text-[9px] ${m.active ? 'status-aktif' : 'status-nonaktif'}`}>
                        {m.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 outline-none"><MoreHorizontal className="w-4 h-4" /></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-[13px] cursor-pointer py-2">Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-[13px] cursor-pointer py-2 text-error">Nonaktifkan</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> dari <span className="font-semibold text-foreground">{mapels.length}</span> mata pelajaran</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
