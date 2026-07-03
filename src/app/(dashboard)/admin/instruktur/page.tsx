'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Plus, MoreHorizontal, Mail, Calendar, BookOpen, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AdminInstrukturPage() {
  const [search, setSearch] = useState('');

  const instruktur = [
    { id: '1', nama: 'Mr. John Smith', email: 'john.smith@lte.ac.id', mapel: ['English for Hospitality', 'English Conversation'], kelas: 3, joinDate: '2020-01-15', status: true },
    { id: '2', nama: 'Chef Ahmad Yani', email: 'ahmad.yani@lte.ac.id', mapel: ['F&B Product', 'Kitchen Management'], kelas: 2, joinDate: '2021-03-10', status: true },
    { id: '3', nama: 'Ibu Sari Dewi', email: 'sari.dewi@lte.ac.id', mapel: ['Housekeeping Management', 'Room Division'], kelas: 4, joinDate: '2019-07-20', status: true },
    { id: '4', nama: 'Mr. David Lee', email: 'david.lee@lte.ac.id', mapel: ['Restaurant Service', 'Bartending & Mixology'], kelas: 2, joinDate: '2022-01-05', status: true },
    { id: '5', nama: 'Ibu Ratna Sari', email: 'ratna.sari@lte.ac.id', mapel: ['Etika Profesi', 'Grooming'], kelas: 3, joinDate: '2020-08-12', status: false },
  ];

  const filtered = instruktur.filter(i => !search || i.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Manajemen Instruktur</h1>
            <p>Kelola data instruktur dan pengajar LTE Cruise</p>
          </div>
          <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Instruktur
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Total Instruktur</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{instruktur.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/8"><Users className="w-[18px] h-[18px] text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Aktif</p>
                <p className="text-2xl font-bold mt-1.5 text-success metric-value">{instruktur.filter(i => i.status).length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-success/8"><User className="w-[18px] h-[18px] text-success" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Total Kelas</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{instruktur.reduce((a, i) => a + i.kelas, 0)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-chart-4/8"><BookOpen className="w-[18px] h-[18px] text-chart-4" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Mata Pelajaran</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{instruktur.reduce((a, i) => a + i.mapel.length, 0)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-chart-5/8"><Calendar className="w-[18px] h-[18px] text-chart-5" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari instruktur..." className="pl-10 h-10 text-sm bg-muted/30" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Instruktur</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Mata Pelajaran</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Kelas</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(i => (
                  <TableRow key={i.id} className="hover:bg-accent/50 group">
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-primary">{i.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{i.nama}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{i.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">{i.mapel.map((m, idx) => <Badge key={idx} variant="outline" className="text-[10px] font-normal">{m}</Badge>)}</div>
                    </TableCell>
                    <TableCell className="text-center text-sm tabular-nums font-semibold">{i.kelas}</TableCell>
                    <TableCell className="text-center">
                      <span className={`status-indicator text-[9px] ${i.status ? 'status-aktif' : 'status-nonaktif'}`}>
                        {i.status ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 outline-none"><MoreHorizontal className="w-4 h-4" /></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-[13px] cursor-pointer py-2">Lihat Detail</DropdownMenuItem>
                          <DropdownMenuItem className="text-[13px] cursor-pointer py-2">Edit</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Table footer */}
          <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> instruktur</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
