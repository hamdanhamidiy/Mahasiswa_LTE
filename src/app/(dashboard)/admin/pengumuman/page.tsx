'use client';
import { useEffect, useState } from 'react';
import { fetchData, createData, updateData, deleteData } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Megaphone, Pin, Calendar, Eye, Search, Plus, Loader2, Save, X, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface PengumumanItem { id: string; judul: string; konten: string; kategori: string; is_pinned: boolean; publish_at: string; views_count: number; penulis: { nama_lengkap: string } | null }
const KAT: Record<string, string> = { interview_kapal: 'Interview', ojt: 'OJT', akademik: 'Akademik', wisuda: 'Wisuda', lowongan_kerja: 'Lowongan', umum: 'Umum' };

export default function AdminPengumumanPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PengumumanItem[]>([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  // CRUD dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ judul: '', konten: '', kategori: 'umum', is_pinned: false });
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetchData<PengumumanItem[]>('admin_pengumuman').then(d => { if (d) setData(d); setLoading(false); });
  };
  useEffect(() => { loadData(); }, []);

  const filtered = data.filter(p => !search || p.judul.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditingId(null); setForm({ judul: '', konten: '', kategori: 'umum', is_pinned: false }); setIsFormOpen(true); };
  const openEdit = (p: PengumumanItem) => { setEditingId(p.id); setForm({ judul: p.judul, konten: p.konten, kategori: p.kategori, is_pinned: p.is_pinned }); setIsFormOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.konten.trim()) return;
    setSaving(true);
    if (editingId) {
      const { error } = await updateData('pengumuman', editingId, form);
      if (error) { alert('Gagal: ' + error); setSaving(false); return; }
    } else {
      const { error } = await createData('pengumuman', { ...form, publish_at: new Date().toISOString(), views_count: 0 });
      if (error) { alert('Gagal: ' + error); setSaving(false); return; }
    }
    setSaving(false);
    setIsFormOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    const { error } = await deleteData('pengumuman', id);
    if (error) alert('Gagal: ' + error);
    else loadData();
  };

  if (loading) return <div className="page-loading"><div className="loading-content"><div className="spinner-modern mx-auto mb-3" /><p className="text-xs text-muted-foreground">Memuat pengumuman...</p></div></div>;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div><h1>Manajemen Pengumuman</h1><p>Buat dan kelola pengumuman untuk mahasiswa &amp; instruktur</p></div>
          <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15" onClick={openCreate}><Plus className="w-3.5 h-3.5 mr-1.5" /> Buat Pengumuman</Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari pengumuman..." className="pl-10 h-10 text-sm bg-muted/30" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2 stagger-children">
        {filtered.length === 0 && <div className="empty-state"><Megaphone className="w-12 h-12 mx-auto empty-state-icon" /><h3>Tidak ada pengumuman</h3><p>Buat pengumuman baru untuk memulai</p></div>}
        {filtered.map(p => (
          <Card key={p.id} className={`border shadow-sm card-interactive animate-slide-up ${p.is_pinned ? 'border-primary/20 bg-primary/[0.02]' : 'border-border'}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                  <div className="flex items-center gap-2 mb-2">
                    {p.is_pinned && <span className="chip chip-primary"><Pin className="w-2.5 h-2.5" />Pinned</span>}
                    <Badge variant="outline" className="text-[10px] font-normal">{KAT[p.kategori] || p.kategori}</Badge>
                  </div>
                  <h3 className="text-[14px] font-semibold">{p.judul}</h3>
                  {expanded === p.id ? <div className="mt-3 p-4 bg-muted/40 rounded-xl text-[13px] whitespace-pre-line leading-relaxed text-foreground/80 animate-fade-in">{p.konten}</div> : <p className="text-[12px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{p.konten.substring(0, 150)}...</p>}
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.publish_at).toLocaleDateString('id-ID')}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.views_count}</span>
                    {p.penulis && <span>{p.penulis.nama_lengkap}</span>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg h-8 w-8 hover:bg-accent outline-none shrink-0 ml-2"><MoreHorizontal className="w-4 h-4" /></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-[12px] cursor-pointer text-error" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5 mr-2" />Hapus</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2"><Label className="text-xs font-semibold">Judul</Label><Input placeholder="Judul pengumuman..." value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Kategori</Label>
                <Select value={form.kategori} onValueChange={(v) => { if (v) setForm(p => ({ ...p, kategori: v })); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(KAT).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Pin</Label>
                <label className="flex items-center gap-2 h-9 px-3 border border-border rounded-md cursor-pointer hover:bg-muted/30">
                  <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))} />
                  <span className="text-sm">Pinned</span>
                </label>
              </div>
            </div>
            <div className="space-y-2"><Label className="text-xs font-semibold">Konten</Label><Textarea placeholder="Isi pengumuman..." rows={6} value={form.konten} onChange={e => setForm(p => ({ ...p, konten: e.target.value }))} required /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}><X className="w-3.5 h-3.5 mr-1" />Batal</Button>
              <Button type="submit" className="bg-primary" disabled={saving}>{saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}{editingId ? 'Simpan' : 'Terbitkan'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
