'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, Search, Globe, Briefcase, Ship } from 'lucide-react';
import { useState } from 'react';

export default function HeadmasterAlumniPage() {
  const [search, setSearch] = useState('');
  const alumni = [
    { nama: 'Dewi Anggraeni', angkatan: '22', tempat: 'Royal Caribbean Cruise', negara: '🇺🇸 Amerika', posisi: 'Cabin Steward', status: 'bekerja' },
    { nama: 'Rudi Hartono', angkatan: '22', tempat: 'Hilton Dubai', negara: '🇦🇪 Dubai', posisi: 'F&B Service', status: 'bekerja' },
    { nama: 'Lia Susanti', angkatan: '21', tempat: 'Celebrity Cruises', negara: '🌍 International', posisi: 'Housekeeping', status: 'bekerja' },
    { nama: 'Agus Firmansyah', angkatan: '22', tempat: 'Mandarin Oriental KL', negara: '🇲🇾 Malaysia', posisi: 'Kitchen Staff', status: 'bekerja' },
    { nama: 'Nina Rahmawati', angkatan: '21', tempat: 'Norwegian Cruise Line', negara: '🇺🇸 Amerika', posisi: 'Bar Service', status: 'bekerja' },
    { nama: 'Budi Santoso', angkatan: '23', tempat: 'JW Marriott Phuket', negara: '🇹🇭 Thailand', posisi: 'Room Attendant', status: 'bekerja' },
    { nama: 'Maya Sari', angkatan: '23', tempat: '—', negara: '—', posisi: '—', status: 'interview' },
    { nama: 'Eko Prasetyo', angkatan: '23', tempat: '—', negara: '—', posisi: '—', status: 'belum' },
  ];
  const statusCfg: Record<string, { label: string; cls: string }> = { bekerja: { label: 'Bekerja', cls: 'text-success border-success/20' }, interview: { label: 'Interview', cls: 'text-warning border-warning/20' }, belum: { label: 'Belum', cls: 'text-muted-foreground border-border' } };
  const filtered = alumni.filter(a => !search || a.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">
      <div><h1 className="text-xl font-semibold tracking-tight">Data Alumni</h1><p className="text-muted-foreground text-sm mt-0.5">Sebaran alumni dan penyaluran kerja</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="border border-border/60 shadow-none bg-primary text-white animate-slide-up"><CardContent className="p-4 text-center"><p className="text-2xl font-semibold tabular-nums">{alumni.length}</p><p className="text-[10px] text-white/60 mt-0.5">Total Alumni</p></CardContent></Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up"><CardContent className="p-4 text-center"><Briefcase className="w-4 h-4 mx-auto mb-1 text-success" /><p className="text-2xl font-semibold text-success tabular-nums">{alumni.filter(a => a.status === 'bekerja').length}</p><p className="text-[10px] text-muted-foreground mt-0.5">Bekerja</p></CardContent></Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up"><CardContent className="p-4 text-center"><Ship className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-2xl font-semibold tabular-nums">{alumni.filter(a => a.tempat.includes('Cruise')).length}</p><p className="text-[10px] text-muted-foreground mt-0.5">Kapal Pesiar</p></CardContent></Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up"><CardContent className="p-4 text-center"><Globe className="w-4 h-4 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-semibold tabular-nums">{new Set(alumni.filter(a => a.negara !== '—').map(a => a.negara)).size}</p><p className="text-[10px] text-muted-foreground mt-0.5">Negara</p></CardContent></Card>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Cari alumni..." className="pl-9 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} /></div>

      <Card className="border border-border/60 shadow-none overflow-hidden"><CardContent className="p-0"><div className="overflow-x-auto">
        <Table><TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30"><TableHead className="text-xs font-medium">Nama</TableHead><TableHead className="text-xs font-medium">Tempat Kerja</TableHead><TableHead className="text-xs font-medium">Negara</TableHead><TableHead className="text-xs font-medium">Posisi</TableHead><TableHead className="text-center text-xs font-medium">Status</TableHead></TableRow></TableHeader>
        <TableBody>{filtered.map((a, i) => {
          const st = statusCfg[a.status] || statusCfg.belum;
          return (
            <TableRow key={i} className="hover:bg-accent/50"><TableCell><p className="text-sm font-medium">{a.nama}</p><p className="text-[10px] text-muted-foreground">Angkatan {a.angkatan}</p></TableCell>
            <TableCell className="text-sm">{a.tempat}</TableCell><TableCell className="text-sm">{a.negara}</TableCell><TableCell className="text-sm">{a.posisi}</TableCell>
            <TableCell className="text-center"><Badge variant="outline" className={`text-[10px] ${st.cls}`}>{st.label}</Badge></TableCell></TableRow>
          );
        })}</TableBody></Table>
      </div></CardContent></Card>
    </div>
  );
}
