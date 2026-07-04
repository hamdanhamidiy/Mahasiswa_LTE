'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Plus, MoreHorizontal, Mail, User, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { fetchData, updateData } from '@/lib/api';

interface InstrukturItem {
  id: string; nim: string; nama_lengkap: string; email: string; status_aktif: boolean; created_at: string;
}

export default function AdminInstrukturPage() {
  const [search, setSearch] = useState('');
  const [instruktur, setInstruktur] = useState<InstrukturItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData<InstrukturItem[]>('admin_instruktur').then(d => { setInstruktur(d || []); setLoading(false); });
  }, []);

  const filtered = instruktur.filter(i => !search || i.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) || i.email?.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await updateData('user', id, { status_aktif: !currentStatus });
    if (!error) setInstruktur(prev => prev.map(i => i.id === id ? { ...i, status_aktif: !currentStatus } : i));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1>Manajemen Instruktur</h1><p>Kelola data pengajar dan instruktur LTE Cruise</p></div>
        <Button size="sm" className="bg-primary text-xs h-8 btn-press self-start"><Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Instruktur</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-3.5 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : instruktur.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Total Instruktur</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-3.5 text-center">
            <User className="w-4 h-4 mx-auto mb-1 text-success" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : instruktur.filter(i => i.status_aktif).length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Aktif</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari instruktur..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat data instruktur...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{instruktur.length === 0 ? 'Belum ada data instruktur' : 'Tidak ada hasil'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="formal-table">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Instruktur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(i => (
                    <TableRow key={i.id} className="hover:bg-accent/40 group">
                      <TableCell>
                        <p className="text-[13px] font-medium group-hover:text-primary transition-colors">{i.nama_lengkap}</p>
                      </TableCell>
                      <TableCell className="text-[12px]"><span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-muted-foreground" />{i.email}</span></TableCell>
                      <TableCell className="text-center">
                        <span className={`status-indicator text-[8px] ${i.status_aktif ? 'status-aktif' : 'status-nonaktif'}`}>{i.status_aktif ? 'Aktif' : 'Nonaktif'}</span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent outline-none"><MoreHorizontal className="w-3.5 h-3.5" /></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-[11px]">Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-[11px]" onClick={() => toggleStatus(i.id, i.status_aktif)}>{i.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border bg-muted/20">
              <p className="text-[10px] text-muted-foreground">Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> instruktur</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
