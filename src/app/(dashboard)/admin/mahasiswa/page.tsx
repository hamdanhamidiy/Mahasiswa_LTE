'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Plus, UserCheck, GraduationCap, Briefcase, MoreHorizontal, Download, Filter } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MahasiswaItem {
  id: string; nama: string; nim: string; program: string; jurusan: string; angkatan: string; status: boolean; fase: string;
}

export default function AdminMahasiswaPage() {
  const [search, setSearch] = useState('');
  const [filterJurusan, setFilterJurusan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const mahasiswa: MahasiswaItem[] = [
    { id: '1', nama: 'Rina Maharani', nim: 'LTE-2025-001', program: 'Diploma 1', jurusan: 'Housekeeping', angkatan: '25', status: true, fase: 'Fase Kelas' },
    { id: '2', nama: 'Dimas Pratama', nim: 'LTE-2025-002', program: 'Diploma 1', jurusan: 'F&B Product', angkatan: '25', status: true, fase: 'Fase Kelas' },
    { id: '3', nama: 'Siti Nurhaliza', nim: 'LTE-2025-003', program: 'Diploma 1', jurusan: 'F&B Service', angkatan: '25', status: true, fase: 'Fase Kelas' },
    { id: '4', nama: 'Fajar Nugroho', nim: 'LTE-2024-001', program: 'Diploma 1', jurusan: 'Housekeeping', angkatan: '24', status: true, fase: 'Fase OJT' },
    { id: '5', nama: 'Anisa Putri', nim: 'LTE-2024-002', program: 'Diploma 1', jurusan: 'F&B Service', angkatan: '24', status: true, fase: 'Fase OJT' },
    { id: '6', nama: 'Budi Setiawan', nim: 'LTE-2024-003', program: 'Executive', jurusan: 'F&B Product', angkatan: '24', status: false, fase: 'Fase Akhir' },
    { id: '7', nama: 'Citra Dewi', nim: 'LTE-2023-001', program: 'Diploma 1', jurusan: 'Housekeeping', angkatan: '23', status: true, fase: 'Fase Akhir' },
    { id: '8', nama: 'Dwi Lestari', nim: 'LTE-2023-002', program: 'Diploma 1', jurusan: 'F&B Service', angkatan: '23', status: true, fase: 'Fase Akhir' },
  ];

  const filtered = mahasiswa.filter(m => {
    if (search && !m.nama.toLowerCase().includes(search.toLowerCase()) && !m.nim.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterJurusan !== 'all' && m.jurusan !== filterJurusan) return false;
    if (filterStatus === 'aktif' && !m.status) return false;
    if (filterStatus === 'nonaktif' && m.status) return false;
    return true;
  });

  const faseCls: Record<string, string> = {
    'Fase Kelas': 'status-info',
    'Fase OJT': 'status-pending',
    'Fase Akhir': 'status-aktif',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1>Manajemen Mahasiswa</h1>
          <p>Kelola data dan informasi seluruh mahasiswa LTE Cruise</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs h-8">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
          <Button size="sm" className="bg-primary text-xs h-8 btn-press">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Mahasiswa
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <Card className="border border-border shadow-none bg-primary text-white card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 opacity-50" />
            <p className="text-xl font-bold tabular-nums">{mahasiswa.length}</p>
            <p className="text-[9px] text-white/50 mt-0.5 uppercase tracking-wider font-medium">Total Mahasiswa</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <GraduationCap className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold tabular-nums">{mahasiswa.filter(m => m.fase === 'Fase Kelas').length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Fase Kelas</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <Briefcase className="w-4 h-4 mx-auto mb-1 text-warning" />
            <p className="text-xl font-bold tabular-nums">{mahasiswa.filter(m => m.fase === 'Fase OJT').length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Fase OJT</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <UserCheck className="w-4 h-4 mx-auto mb-1 text-success" />
            <p className="text-xl font-bold tabular-nums">{mahasiswa.filter(m => m.fase === 'Fase Akhir').length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Fase Akhir</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="aktif" className="space-y-4">
        <TabsList className="h-8">
          <TabsTrigger value="aktif" className="text-[11px] h-7 px-3">Mahasiswa Aktif</TabsTrigger>
          <TabsTrigger value="pendaftar" className="text-[11px] h-7 px-3">Pendaftar Baru</TabsTrigger>
          <TabsTrigger value="alumni" className="text-[11px] h-7 px-3">Alumni</TabsTrigger>
        </TabsList>

        <TabsContent value="aktif" className="space-y-3">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Cari nama atau NIM..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterJurusan} onValueChange={(v) => setFilterJurusan(v ?? 'all')}>
              <SelectTrigger className="w-full sm:w-44 h-8 text-xs"><SelectValue placeholder="Jurusan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jurusan</SelectItem>
                <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                <SelectItem value="F&B Product">F&B Product</SelectItem>
                <SelectItem value="F&B Service">F&B Service</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? 'all')}>
              <SelectTrigger className="w-full sm:w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card className="border border-border shadow-none overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="formal-table">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Mahasiswa</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Jurusan</TableHead>
                      <TableHead className="text-center">Angkatan</TableHead>
                      <TableHead className="text-center">Fase</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(m => (
                      <TableRow key={m.id} className="hover:bg-accent/40 group">
                        <TableCell>
                          <p className="text-[13px] font-medium group-hover:text-primary transition-colors">{m.nama}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{m.nim}</p>
                        </TableCell>
                        <TableCell className="text-[12px]">{m.program}</TableCell>
                        <TableCell className="text-[12px]">{m.jurusan}</TableCell>
                        <TableCell className="text-center"><Badge variant="outline" className="text-[9px] font-medium">{m.angkatan}</Badge></TableCell>
                        <TableCell className="text-center">
                          <span className={`status-indicator text-[8px] ${faseCls[m.fase] || ''}`}>{m.fase}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`status-indicator text-[8px] ${m.status ? 'status-aktif' : 'status-nonaktif'}`}>
                            {m.status ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7 outline-none">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-[11px]">Lihat Detail</DropdownMenuItem>
                              <DropdownMenuItem className="text-[11px]">Edit Data</DropdownMenuItem>
                              <DropdownMenuItem className="text-[11px] text-error">Nonaktifkan</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Table footer */}
              <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> dari <span className="font-semibold text-foreground">{mahasiswa.length}</span> mahasiswa
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" disabled>Prev</Button>
                  <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 bg-primary text-white">1</Button>
                  <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" disabled>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pendaftar">
          <Card className="border border-border shadow-none">
            <CardContent className="py-12 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" />
              <p className="text-xs text-muted-foreground font-medium">Belum ada pendaftar baru</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">Pendaftar akan muncul di sini setelah mengisi form pendaftaran</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alumni">
          <Card className="border border-border shadow-none">
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" />
              <p className="text-xs text-muted-foreground font-medium">Data alumni akan ditampilkan di sini</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">Alumni yang sudah lulus dan mendapatkan sertifikat</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
