'use client';
import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Megaphone, Pin, Calendar, Eye, Search, Plus } from 'lucide-react';

interface PengumumanItem { id: string; judul: string; konten: string; kategori: string; is_pinned: boolean; publish_at: string; views_count: number; penulis: { nama_lengkap: string } | null }
const KAT: Record<string, string> = { interview_kapal: 'Interview', ojt: 'OJT', akademik: 'Akademik', wisuda: 'Wisuda', lowongan_kerja: 'Lowongan', umum: 'Umum' };

export default function AdminPengumumanPage() {
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
          <div><h1>Manajemen Pengumuman</h1><p>Buat dan kelola pengumuman untuk mahasiswa & instruktur</p></div>
          <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15"><Plus className="w-3.5 h-3.5 mr-1.5" /> Buat Pengumuman</Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari pengumuman..." className="pl-10 h-10 text-sm bg-muted/30" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2 stagger-children">
        {filtered.length === 0 && <div className="empty-state"><Megaphone className="w-12 h-12 mx-auto empty-state-icon" /><h3>Tidak ada pengumuman</h3><p>Buat pengumuman baru untuk memulai</p></div>}
        {filtered.map(p => (
          <Card key={p.id} className={`border shadow-sm card-interactive cursor-pointer animate-slide-up ${p.is_pinned ? 'border-primary/20 bg-primary/[0.02]' : 'border-border'}`} onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                {p.is_pinned && <span className="chip chip-primary"><Pin className="w-2.5 h-2.5" />Pinned</span>}
                <Badge variant="outline" className="text-[10px] font-normal">{KAT[p.kategori] || p.kategori}</Badge>
              </div>
              <h3 className="text-[14px] font-semibold">{p.judul}</h3>
              {expanded === p.id ? <div className="mt-3 p-4 bg-muted/40 rounded-xl text-[13px] whitespace-pre-line leading-relaxed text-foreground/80 animate-fade-in">{p.konten}</div> : <p className="text-[12px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{p.konten.substring(0, 150)}...</p>}
              <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.publish_at).toLocaleDateString('id-ID')}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.views_count}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
