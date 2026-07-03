'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Megaphone, Pin, Calendar, Eye, Search, Loader2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PengumumanItem { id: string; judul: string; konten: string; kategori: string; is_pinned: boolean; publish_at: string; views_count: number; penulis: { nama_lengkap: string } | null }

const KAT: Record<string, string> = { interview_kapal: 'Interview', ojt: 'OJT', akademik: 'Akademik', wisuda: 'Wisuda', lowongan_kerja: 'Lowongan', umum: 'Umum' };

function timeAgo(d: string): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}h lalu`;
}

export default function InstrukturPengumumanPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PengumumanItem[]>([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchData<PengumumanItem[]>('pengumuman').then(d => { if (d) setData(d); setLoading(false); }); }, []);

  const filtered = data.filter(p => !search || p.judul.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="page-loading"><div className="loading-content"><div className="spinner-modern mx-auto mb-3" /><p className="text-xs text-muted-foreground">Memuat pengumuman...</p></div></div>;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Pengumuman</h1>
            <p>Informasi terbaru dari LTE Cruise</p>
          </div>
          <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Buat Pengumuman
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari pengumuman..." className="pl-9 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2 stagger-children">
        {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><Megaphone className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="text-sm">Tidak ada pengumuman</p></div>}
        {filtered.map(p => {
          const isExp = expanded === p.id;
          return (
            <Card key={p.id} className={`border shadow-none card-interactive cursor-pointer animate-slide-up ${p.is_pinned ? 'border-primary/20 bg-primary/[0.02]' : 'border-border/60'}`} onClick={() => setExpanded(isExp ? null : p.id)}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  {p.is_pinned && <Badge variant="outline" className="text-[10px] border-primary/20 text-primary"><Pin className="w-2.5 h-2.5 mr-1" />Pinned</Badge>}
                  <Badge variant="outline" className="text-[10px] font-normal">{KAT[p.kategori] || p.kategori}</Badge>
                </div>
                <h3 className="text-sm font-medium leading-snug">{p.judul}</h3>
                {isExp ? (
                  <div className="mt-3 p-3 bg-muted/40 rounded-lg text-[13px] whitespace-pre-line leading-relaxed text-foreground/80 animate-fade-in">{p.konten}</div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{p.konten.substring(0, 130)}...</p>
                )}
                <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{timeAgo(p.publish_at)}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.views_count}</span>
                  {p.penulis && <span>{p.penulis.nama_lengkap}</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
