'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Plus, UserCheck, GraduationCap, Briefcase, MoreHorizontal, Download, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchData, updateData } from '@/lib/api';

interface MahasiswaItem {
  id: string; nama_lengkap: string; nim: string; email: string; program: string; jurusan: string; angkatan: string; status_aktif: boolean; created_at: string;
}

export default function AdminMahasiswaPage() {
  const [search, setSearch] = useState('');
  const [filterJurusan, setFilterJurusan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [mahasiswa, setMahasiswa] = useState<MahasiswaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchData<MahasiswaItem[]>('admin_mahasiswa');
      setMahasiswa(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = mahasiswa.filter(m => {
    if (search && !m.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) && !m.nim?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterJurusan !== 'all' && m.jurusan !== filterJurusan) return false;
    if (filterStatus === 'aktif' && !m.status_aktif) return false;
    if (filterStatus === 'nonaktif' && m.status_aktif) return false;
    return true;
  });

  const aktif = mahasiswa.filter(m => m.status_aktif);
  const nonaktif = mahasiswa.filter(m => !m.status_aktif);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await updateData('user', id, { status_aktif: !currentStatus });
    if (!error) {
      setMahasiswa(prev => prev.map(m => m.id === id ? { ...m, status_aktif: !currentStatus } : m));
    }
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
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : mahasiswa.length}</p>
            <p className="text-[9px] text-white/50 mt-0.5 uppercase tracking-wider font-medium">Total Mahasiswa</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <GraduationCap className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : aktif.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Aktif</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <Briefcase className="w-4 h-4 mx-auto mb-1 text-warning" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : nonaktif.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Nonaktif</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <UserCheck className="w-4 h-4 mx-auto mb-1 text-success" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : filtered.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Hasil Filter</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-3">
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
              <SelectItem value="housekeeping">Housekeeping</SelectItem>
              <SelectItem value="fnb_product">F&B Product</SelectItem>
              <SelectItem value="fnb_service">F&B Service</SelectItem>
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
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Memuat data mahasiswa...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" />
                <p className="text-xs text-muted-foreground font-medium">
                  {mahasiswa.length === 0 ? 'Belum ada data mahasiswa' : 'Tidak ada hasil yang cocok'}
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                  {mahasiswa.length === 0 ? 'Data mahasiswa akan muncul setelah mahasiswa didaftarkan' : 'Coba ubah filter pencarian'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table className="formal-table">
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead>Mahasiswa</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Jurusan</TableHead>
                        <TableHead className="text-center">Angkatan</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(m => (
                        <TableRow key={m.id} className="hover:bg-accent/40 group">
                          <TableCell>
                            <p className="text-[13px] font-medium group-hover:text-primary transition-colors">{m.nama_lengkap}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{m.nim || '—'}</p>
                          </TableCell>
                          <TableCell className="text-[12px]">{m.program || '—'}</TableCell>
                          <TableCell className="text-[12px] capitalize">{m.jurusan?.replace('_', ' ') || '—'}</TableCell>
                          <TableCell className="text-center"><Badge variant="outline" className="text-[9px] font-medium">{m.angkatan || '—'}</Badge></TableCell>
                          <TableCell className="text-center">
                            <span className={`status-indicator text-[8px] ${m.status_aktif ? 'status-aktif' : 'status-nonaktif'}`}>
                              {m.status_aktif ? 'Aktif' : 'Nonaktif'}
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
                                <DropdownMenuItem className="text-[11px]" onClick={() => toggleStatus(m.id, m.status_aktif)}>
                                  {m.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}
                                </DropdownMenuItem>
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
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
