'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2, MapPin, Star, Globe, Users, Briefcase,
  Search, ExternalLink, Ship, Loader2, Filter, Hotel,
  Anchor, Award, ChevronRight,
} from 'lucide-react';

interface MitraKerja {
  id: string;
  nama: string;
  jenis: 'hotel' | 'kapal_pesiar' | 'resort';
  bintang: number;
  kota: string;
  negara: string;
  deskripsi: string;
  posisi_tersedia: string[];
  alumni_bekerja: number;
  logo_url: string | null;
  website_url: string | null;
  is_featured: boolean;
}

// Demo data when no API data
const DEMO_MITRA: MitraKerja[] = [
  {
    id: '1',
    nama: 'The Ritz-Carlton Bali',
    jenis: 'hotel',
    bintang: 5,
    kota: 'Nusa Dua',
    negara: 'Indonesia',
    deskripsi: 'Hotel bintang 5 internasional yang berada di area Nusa Dua, Bali. Menjadi mitra OJT dan penempatan kerja utama bagi alumni LTE Cruise.',
    posisi_tersedia: ['Housekeeping', 'F&B Service', 'Front Office'],
    alumni_bekerja: 12,
    logo_url: null,
    website_url: 'https://www.ritzcarlton.com',
    is_featured: true,
  },
  {
    id: '2',
    nama: 'Royal Caribbean International',
    jenis: 'kapal_pesiar',
    bintang: 5,
    kota: 'Miami',
    negara: 'Amerika Serikat',
    deskripsi: 'Perusahaan kapal pesiar terbesar kedua di dunia. Alumni LTE Cruise bekerja di berbagai kapal dalam fleet Royal Caribbean.',
    posisi_tersedia: ['Cabin Steward', 'Waiter', 'Cook', 'Housekeeping'],
    alumni_bekerja: 28,
    logo_url: null,
    website_url: 'https://www.royalcaribbean.com',
    is_featured: true,
  },
  {
    id: '3',
    nama: 'Carnival Cruise Line',
    jenis: 'kapal_pesiar',
    bintang: 5,
    kota: 'Miami',
    negara: 'Amerika Serikat',
    deskripsi: 'Salah satu perusahaan kapal pesiar terbesar di dunia dengan fleet lebih dari 20 kapal.',
    posisi_tersedia: ['Cabin Steward', 'Assistant Waiter', 'Utility'],
    alumni_bekerja: 18,
    logo_url: null,
    website_url: 'https://www.carnival.com',
    is_featured: true,
  },
  {
    id: '4',
    nama: 'Four Seasons Resort Bali',
    jenis: 'resort',
    bintang: 5,
    kota: 'Jimbaran',
    negara: 'Indonesia',
    deskripsi: 'Resort mewah bintang 5 di Jimbaran Bay, Bali. Menerima mahasiswa OJT dan alumni LTE Cruise untuk penempatan kerja.',
    posisi_tersedia: ['Housekeeping', 'F&B Product', 'Spa Attendant'],
    alumni_bekerja: 8,
    logo_url: null,
    website_url: 'https://www.fourseasons.com',
    is_featured: false,
  },
  {
    id: '5',
    nama: 'MSC Cruises',
    jenis: 'kapal_pesiar',
    bintang: 4,
    kota: 'Geneva',
    negara: 'Swiss',
    deskripsi: 'Perusahaan kapal pesiar Eropa dengan fleet modern dan rute di Mediterania, Karibia, dan Asia.',
    posisi_tersedia: ['Cabin Steward', 'Galley Steward', 'Bar Waiter'],
    alumni_bekerja: 15,
    logo_url: null,
    website_url: 'https://www.msccruises.com',
    is_featured: false,
  },
  {
    id: '6',
    nama: 'The Mulia Bali',
    jenis: 'resort',
    bintang: 5,
    kota: 'Nusa Dua',
    negara: 'Indonesia',
    deskripsi: 'Resort all-suite mewah di Nusa Dua, Bali. Salah satu resort terbaik di Indonesia.',
    posisi_tersedia: ['Housekeeping', 'F&B Service', 'Butler'],
    alumni_bekerja: 6,
    logo_url: null,
    website_url: 'https://www.themulia.com',
    is_featured: false,
  },
  {
    id: '7',
    nama: 'Norwegian Cruise Line',
    jenis: 'kapal_pesiar',
    bintang: 4,
    kota: 'Miami',
    negara: 'Amerika Serikat',
    deskripsi: 'Perusahaan kapal pesiar yang dikenal dengan konsep freestyle cruising dan kapal-kapal modern.',
    posisi_tersedia: ['Cabin Steward', 'Restaurant Steward', 'Utility'],
    alumni_bekerja: 10,
    logo_url: null,
    website_url: 'https://www.ncl.com',
    is_featured: false,
  },
  {
    id: '8',
    nama: 'Bulgari Resort Bali',
    jenis: 'resort',
    bintang: 5,
    kota: 'Uluwatu',
    negara: 'Indonesia',
    deskripsi: 'Resort ultra-luxury di tebing Uluwatu, Bali. Menerima mahasiswa OJT dari program D1 LTE Cruise.',
    posisi_tersedia: ['Housekeeping', 'F&B Product'],
    alumni_bekerja: 4,
    logo_url: null,
    website_url: 'https://www.bulgarihotels.com',
    is_featured: false,
  },
];

const JENIS_ICON: Record<string, typeof Hotel> = {
  hotel: Hotel,
  kapal_pesiar: Ship,
  resort: Building2,
};

const JENIS_LABEL: Record<string, string> = {
  hotel: 'Hotel',
  kapal_pesiar: 'Kapal Pesiar',
  resort: 'Resort',
};

export default function MitraKerjaPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MitraKerja[]>([]);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState<string | null>(null);

  useEffect(() => {
    fetchData<MitraKerja[]>('mitra_kerja').then(d => {
      if (d && d.length > 0) {
        setData(d);
      } else {
        setData(DEMO_MITRA);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filtered = data.filter(m => {
    if (search && !m.nama.toLowerCase().includes(search.toLowerCase()) && !m.negara.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterJenis && m.jenis !== filterJenis) return false;
    return true;
  });

  const featured = filtered.filter(m => m.is_featured);
  const others = filtered.filter(m => !m.is_featured);
  const totalAlumni = data.reduce((a, m) => a + m.alumni_bekerja, 0);
  const totalNegara = new Set(data.map(m => m.negara)).size;
  const jenisOptions = [...new Set(data.map(m => m.jenis))];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1>Mitra Kerja</h1>
        <p>Daftar hotel, kapal pesiar, dan resort mitra LTE Cruise</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Total Mitra</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{data.length}</p>
              </div>
              <div className="p-2 rounded-md bg-primary/8">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Alumni Bekerja</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{totalAlumni}+</p>
              </div>
              <div className="p-2 rounded-md bg-success/8">
                <Users className="w-4 h-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Negara</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{totalNegara}</p>
              </div>
              <div className="p-2 rounded-md bg-chart-5/8">
                <Globe className="w-4 h-4 text-chart-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Kapal Pesiar</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{data.filter(m => m.jenis === 'kapal_pesiar').length}</p>
              </div>
              <div className="p-2 rounded-md bg-chart-4/8">
                <Ship className="w-4 h-4 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari mitra kerja, negara..."
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button
            variant={filterJenis === null ? 'default' : 'outline'}
            size="sm"
            className={`text-xs h-9 btn-press ${filterJenis === null ? 'bg-primary' : ''}`}
            onClick={() => setFilterJenis(null)}
          >
            Semua
          </Button>
          {jenisOptions.map(j => {
            const JenisIcon = JENIS_ICON[j] || Building2;
            return (
              <Button
                key={j}
                variant={filterJenis === j ? 'default' : 'outline'}
                size="sm"
                className={`text-xs h-9 btn-press ${filterJenis === j ? 'bg-primary' : ''}`}
                onClick={() => setFilterJenis(filterJenis === j ? null : j)}
              >
                <JenisIcon className="w-3 h-3 mr-1.5" />
                {JENIS_LABEL[j] || j}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Featured Partners */}
      {featured.length > 0 && (
        <div>
          <h2 className="section-title">Mitra Unggulan</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {featured.map(m => {
              const JenisIcon = JENIS_ICON[m.jenis] || Building2;
              return (
                <Card key={m.id} className="border border-primary/15 shadow-none card-interactive overflow-hidden animate-slide-up bg-primary/[0.01]">
                  {/* Top accent */}
                  <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-primary/8 shrink-0">
                        <JenisIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[9px] text-primary border-primary/20 font-medium">
                            <Award className="w-2.5 h-2.5 mr-0.5" /> Unggulan
                          </Badge>
                          <Badge variant="outline" className="text-[9px] font-normal">
                            {JENIS_LABEL[m.jenis]}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-semibold mt-1.5 leading-snug">{m.nama}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: m.bintang }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-warning fill-warning" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">{m.deskripsi}</p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{m.kota}, {m.negara}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />{m.alumni_bekerja} Alumni
                      </span>
                    </div>

                    {/* Posisi tersedia */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {m.posisi_tersedia.map((p, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] font-normal">
                          <Briefcase className="w-2.5 h-2.5 mr-0.5" />{p}
                        </Badge>
                      ))}
                    </div>

                    {m.website_url && (
                      <a href={m.website_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary font-medium hover:text-primary/80 transition-colors hover-underline">
                        Kunjungi Website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Partners */}
      {others.length > 0 && (
        <div>
          <h2 className="section-title">Semua Mitra</h2>
          <div className="space-y-2 stagger-children">
            {others.map(m => {
              const JenisIcon = JENIS_ICON[m.jenis] || Building2;
              return (
                <Card key={m.id} className="border border-border/60 shadow-none card-interactive overflow-hidden animate-slide-up">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-muted/60 shrink-0">
                        <JenisIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="outline" className="text-[9px] font-normal">
                            {JENIS_LABEL[m.jenis]}
                          </Badge>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: m.bintang }).map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 text-warning fill-warning" />
                            ))}
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold">{m.nama}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{m.deskripsi}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{m.kota}, {m.negara}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-success" />{m.alumni_bekerja} Alumni
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />{m.posisi_tersedia.length} posisi
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {m.posisi_tersedia.slice(0, 3).map((p, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] font-normal">
                              {p}
                            </Badge>
                          ))}
                          {m.posisi_tersedia.length > 3 && (
                            <Badge variant="outline" className="text-[9px] font-normal text-muted-foreground">
                              +{m.posisi_tersedia.length - 3} lainnya
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        {m.website_url && (
                          <a href={m.website_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="text-xs h-8 text-primary">
                              <ExternalLink className="w-3 h-3 mr-1" /> Website
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="py-16 text-center">
            <Anchor className="w-12 h-12 mx-auto mb-3 text-muted-foreground/15" />
            <p className="text-sm text-muted-foreground font-medium">Tidak ada mitra kerja ditemukan</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Coba ubah kata kunci pencarian atau filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
