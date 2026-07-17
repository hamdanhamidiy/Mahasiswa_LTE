'use client';

import { useEffect, useState } from 'react';
import { fetchData, createData } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Megaphone, Pin, Calendar, Eye, Search, Plus, Loader2, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ judul: '', konten: '', kategori: 'umum' });
  const [creating, setCreating] = useState(false);

  const loadData = () => {
    fetchData<PengumumanItem[]>('pengumuman').then(d => { if (d) setData(d); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(p => !search || p.judul.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.judul.trim() || !createForm.konten.trim()) return;
    setCreating(true);
    const { error } = await createData('pengumuman', {
      judul: createForm.judul,
      konten: createForm.konten,
      kategori: createForm.kategori,
      is_pinned: false,
      publish_at: new Date().toISOString(),
      views_count: 0,
    });
    setCreating(false);
    if (!error) {
      setIsCreateOpen(false);
      setCreateForm({ judul: '', konten: '', kategori: 'umum' });
      loadData();
    } else {
      alert('Gagal membuat pengumuman: ' + error);
    }
  };

  if (loading) return <div className="page-loading"><div className="loading-content"><div className="spinner-modern mx-auto mb-3" /><p className="text-xs text-muted-foreground">Memuat pengumuman...</p></div></div>;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Pengumuman</h1>
            <p>Informasi terbaru dari LTE Cruise</p>
          </div>
          <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15" onClick={() => setIsCreateOpen(true)}>
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

      {/* Dialog Buat Pengumuman */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Buat Pengumuman Baru</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Judul</Label>
              <Input placeholder="Judul pengumuman..." value={createForm.judul} onChange={e => setCreateForm(p => ({ ...p, judul: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Kategori</Label>
              <Select value={createForm.kategori} onValueChange={(v) => { if (v) setCreateForm(p => ({ ...p, kategori: v })); }}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(KAT).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Konten</Label>
              <Textarea placeholder="Isi pengumuman..." rows={6} value={createForm.konten} onChange={e => setCreateForm(p => ({ ...p, konten: e.target.value }))} required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}><X className="w-3.5 h-3.5 mr-1" />Batal</Button>
              <Button type="submit" className="bg-primary" disabled={creating}>
                {creating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}Terbitkan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
