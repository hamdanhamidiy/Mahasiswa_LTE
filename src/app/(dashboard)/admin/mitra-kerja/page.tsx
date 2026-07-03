'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Building2, MapPin, Star, Globe, Users, Ship, Hotel,
  Search, Plus, Loader2, MoreHorizontal, ExternalLink,
  Briefcase, Edit, Trash2, Eye,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MitraKerja {
  id: string;
  nama: string;
  jenis: 'hotel' | 'kapal_pesiar' | 'resort';
  bintang: number;
  kota: string;
  negara: string;
  posisi_tersedia: string[];
  alumni_bekerja: number;
  is_featured: boolean;
  website_url: string | null;
}

const DEMO: MitraKerja[] = [
  { id: '1', nama: 'The Ritz-Carlton Bali', jenis: 'hotel', bintang: 5, kota: 'Nusa Dua', negara: 'Indonesia', posisi_tersedia: ['Housekeeping', 'F&B Service', 'Front Office'], alumni_bekerja: 12, is_featured: true, website_url: 'https://ritzcarlton.com' },
  { id: '2', nama: 'Royal Caribbean International', jenis: 'kapal_pesiar', bintang: 5, kota: 'Miami', negara: 'Amerika Serikat', posisi_tersedia: ['Cabin Steward', 'Waiter', 'Cook'], alumni_bekerja: 28, is_featured: true, website_url: 'https://royalcaribbean.com' },
  { id: '3', nama: 'Carnival Cruise Line', jenis: 'kapal_pesiar', bintang: 5, kota: 'Miami', negara: 'Amerika Serikat', posisi_tersedia: ['Cabin Steward', 'Assistant Waiter'], alumni_bekerja: 18, is_featured: true, website_url: 'https://carnival.com' },
  { id: '4', nama: 'Four Seasons Resort Bali', jenis: 'resort', bintang: 5, kota: 'Jimbaran', negara: 'Indonesia', posisi_tersedia: ['Housekeeping', 'F&B Product'], alumni_bekerja: 8, is_featured: false, website_url: 'https://fourseasons.com' },
  { id: '5', nama: 'MSC Cruises', jenis: 'kapal_pesiar', bintang: 4, kota: 'Geneva', negara: 'Swiss', posisi_tersedia: ['Cabin Steward', 'Galley Steward'], alumni_bekerja: 15, is_featured: false, website_url: 'https://msccruises.com' },
  { id: '6', nama: 'The Mulia Bali', jenis: 'resort', bintang: 5, kota: 'Nusa Dua', negara: 'Indonesia', posisi_tersedia: ['Housekeeping', 'Butler'], alumni_bekerja: 6, is_featured: false, website_url: 'https://themulia.com' },
  { id: '7', nama: 'Norwegian Cruise Line', jenis: 'kapal_pesiar', bintang: 4, kota: 'Miami', negara: 'Amerika Serikat', posisi_tersedia: ['Cabin Steward', 'Restaurant Steward'], alumni_bekerja: 10, is_featured: false, website_url: 'https://ncl.com' },
  { id: '8', nama: 'Bulgari Resort Bali', jenis: 'resort', bintang: 5, kota: 'Uluwatu', negara: 'Indonesia', posisi_tersedia: ['Housekeeping', 'F&B Product'], alumni_bekerja: 4, is_featured: false, website_url: null },
];

const JENIS_LABEL: Record<string, string> = { hotel: 'Hotel', kapal_pesiar: 'Kapal Pesiar', resort: 'Resort' };
const JENIS_ICON: Record<string, typeof Hotel> = { hotel: Hotel, kapal_pesiar: Ship, resort: Building2 };

export default function AdminMitraKerjaPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MitraKerja[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData<MitraKerja[]>('mitra_kerja').then(d => {
      setData(d && d.length > 0 ? d : DEMO);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const filtered = data.filter(m =>
    !search || m.nama.toLowerCase().includes(search.toLowerCase()) || m.negara.toLowerCase().includes(search.toLowerCase())
  );

  const totalAlumni = data.reduce((a, m) => a + m.alumni_bekerja, 0);
  const totalNegara = new Set(data.map(m => m.negara)).size;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Manajemen Mitra Kerja</h1>
            <p>Kelola data hotel, kapal pesiar, dan resort mitra</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 btn-press text-xs h-9">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Mitra
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Total Mitra</p><p className="text-2xl font-bold mt-1 tabular-nums">{data.length}</p></div><div className="p-2 rounded-md bg-primary/8"><Building2 className="w-4 h-4 text-primary" /></div></div></CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Alumni Bekerja</p><p className="text-2xl font-bold mt-1 tabular-nums">{totalAlumni}+</p></div><div className="p-2 rounded-md bg-success/8"><Users className="w-4 h-4 text-success" /></div></div></CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Negara</p><p className="text-2xl font-bold mt-1 tabular-nums">{totalNegara}</p></div><div className="p-2 rounded-md bg-chart-5/8"><Globe className="w-4 h-4 text-chart-5" /></div></div></CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Kapal Pesiar</p><p className="text-2xl font-bold mt-1 tabular-nums">{data.filter(m => m.jenis === 'kapal_pesiar').length}</p></div><div className="p-2 rounded-md bg-chart-4/8"><Ship className="w-4 h-4 text-chart-4" /></div></div></CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari mitra atau negara..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card className="border border-border/60 shadow-none overflow-hidden">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
            <Building2 className="w-3.5 h-3.5" /> Daftar Mitra Kerja
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Nama Mitra</TableHead>
                  <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider">Jenis</TableHead>
                  <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider">Bintang</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Lokasi</TableHead>
                  <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider">Alumni</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Posisi</TableHead>
                  <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider">Featured</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">Tidak ada data ditemukan</TableCell></TableRow>
                )}
                {filtered.map(m => {
                  const JenisIcon = JENIS_ICON[m.jenis] || Building2;
                  return (
                    <TableRow key={m.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-md bg-muted/60 shrink-0"><JenisIcon className="w-3.5 h-3.5 text-muted-foreground" /></div>
                          <div>
                            <p className="text-[13px] font-medium">{m.nama}</p>
                            {m.website_url && (
                              <a href={m.website_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-0.5">
                                <ExternalLink className="w-2.5 h-2.5" /> Website
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-normal">{JENIS_LABEL[m.jenis]}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          {Array.from({ length: Math.min(m.bintang, 5) }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 text-warning fill-warning" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" />{m.kota}, {m.negara}</span>
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold tabular-nums">{m.alumni_bekerja}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {m.posisi_tersedia.slice(0, 2).map((p, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] font-normal">{p}</Badge>
                          ))}
                          {m.posisi_tersedia.length > 2 && (
                            <Badge variant="outline" className="text-[9px] font-normal text-muted-foreground">+{m.posisi_tersedia.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {m.is_featured ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary"><Star className="w-3 h-3 fill-primary" /></span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7 outline-none"><MoreHorizontal className="w-4 h-4" /></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-xs"><Eye className="w-3 h-3 mr-1.5" /> Detail</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs"><Edit className="w-3 h-3 mr-1.5" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-error"><Trash2 className="w-3 h-3 mr-1.5" /> Hapus</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
