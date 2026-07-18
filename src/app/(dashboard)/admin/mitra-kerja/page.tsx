'use client';

import { useEffect, useState } from 'react';
import { fetchData, createData, updateData, deleteData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Building2, MapPin, Star, Globe, Users, Ship, Hotel,
  Search, Plus, Loader2, MoreHorizontal, ExternalLink,
  Edit, Trash2, Save, X, Eye
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

const emptyForm = {
  nama: '',
  jenis: 'hotel' as 'hotel' | 'kapal_pesiar' | 'resort',
  bintang: 4,
  kota: '',
  negara: '',
  posisi_tersedia: '',
  is_featured: false,
  website_url: '',
};

const JENIS_LABEL: Record<string, string> = { hotel: 'Hotel', kapal_pesiar: 'Kapal Pesiar', resort: 'Resort' };
const JENIS_ICON: Record<string, typeof Hotel> = { hotel: Hotel, kapal_pesiar: Ship, resort: Building2 };

export default function AdminMitraKerjaPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MitraKerja[]>([]);
  const [search, setSearch] = useState('');

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [selectedTarget, setSelectedTarget] = useState<MitraKerja | null>(null);

  const load = async () => {
    setLoading(true);
    const d = await fetchData<MitraKerja[]>('mitra_kerja');
    setData(d || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = data.filter(m =>
    !search || m.nama.toLowerCase().includes(search.toLowerCase()) || m.negara.toLowerCase().includes(search.toLowerCase())
  );

  const totalAlumni = data.reduce((a, m) => a + (m.alumni_bekerja || 0), 0);
  const totalNegara = new Set(data.map(m => m.negara)).size;

  // --- TAMBAH ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.kota || !form.negara) return;
    setSaving(true);
    const payload = {
      ...form,
      posisi_tersedia: form.posisi_tersedia.split(',').map(s => s.trim()).filter(Boolean),
      website_url: form.website_url || null,
      alumni_bekerja: 0
    };
    const { error } = await createData('mitra_kerja', payload);
    setSaving(false);
    if (error) { alert('Gagal menambahkan mitra: ' + error); return; }
    setIsFormOpen(false);
    setForm(emptyForm);
    load();
  };

  // --- EDIT ---
  const openEdit = (m: MitraKerja) => {
    setSelectedTarget(m);
    setEditForm({
      nama: m.nama,
      jenis: m.jenis,
      bintang: m.bintang || 4,
      kota: m.kota || '',
      negara: m.negara || '',
      posisi_tersedia: (m.posisi_tersedia || []).join(', '),
      is_featured: m.is_featured || false,
      website_url: m.website_url || '',
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget || !editForm.nama) return;
    setSaving(true);
    const payload = {
      ...editForm,
      posisi_tersedia: editForm.posisi_tersedia.split(',').map(s => s.trim()).filter(Boolean),
      website_url: editForm.website_url || null,
    };
    const { error } = await updateData('mitra_kerja', selectedTarget.id, payload);
    setSaving(false);
    if (error) { alert('Gagal mengubah mitra: ' + error); return; }
    setIsEditOpen(false);
    load();
  };

  // --- HAPUS ---
  const handleDelete = async () => {
    if (!selectedTarget) return;
    setSaving(true);
    const { error } = await deleteData('mitra_kerja', selectedTarget.id);
    setSaving(false);
    if (error) { alert('Gagal menghapus mitra: ' + error); return; }
    setIsDeleteOpen(false);
    setData(prev => prev.filter(m => m.id !== selectedTarget.id));
  };

  // Shared Form Renderer
  const renderForm = (formData: typeof emptyForm, setFormData: (fn: (p: typeof emptyForm) => typeof emptyForm) => void) => (
    <>
      <div className="space-y-2"><Label className="text-xs font-semibold">Nama Mitra *</Label><Input placeholder="The Ritz-Carlton Bali..." value={formData.nama} onChange={e => setFormData(p => ({ ...p, nama: e.target.value }))} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Jenis *</Label>
          <Select value={formData.jenis} onValueChange={v => setFormData(p => ({ ...p, jenis: v as any }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="kapal_pesiar">Kapal Pesiar</SelectItem>
              <SelectItem value="resort">Resort</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Bintang</Label>
          <Select value={String(formData.bintang)} onValueChange={v => setFormData(p => ({ ...p, bintang: Number(v) }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map(b => <SelectItem key={b} value={String(b)}>{b} Bintang</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label className="text-xs font-semibold">Kota *</Label><Input placeholder="Nusa Dua..." value={formData.kota} onChange={e => setFormData(p => ({ ...p, kota: e.target.value }))} required /></div>
        <div className="space-y-2"><Label className="text-xs font-semibold">Negara *</Label><Input placeholder="Indonesia..." value={formData.negara} onChange={e => setFormData(p => ({ ...p, negara: e.target.value }))} required /></div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Posisi Tersedia</Label>
        <Input placeholder="Housekeeping, F&B Service, dll (pisahkan dengan koma)" value={formData.posisi_tersedia} onChange={e => setFormData(p => ({ ...p, posisi_tersedia: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Website (Opsional)</Label>
        <Input type="url" placeholder="https://..." value={formData.website_url} onChange={e => setFormData(p => ({ ...p, website_url: e.target.value }))} />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <input type="checkbox" id="is_featured" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" checked={formData.is_featured} onChange={(e) => setFormData(p => ({ ...p, is_featured: e.target.checked }))} />
        <Label htmlFor="is_featured" className="text-sm cursor-pointer">Tandai sebagai Mitra Unggulan (Featured)</Label>
      </div>
    </>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Manajemen Mitra Kerja</h1>
            <p>Kelola data hotel, kapal pesiar, dan resort mitra</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 btn-press text-xs h-9" onClick={() => { setForm(emptyForm); setIsFormOpen(true); }}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Mitra
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Total Mitra</p><p className="text-2xl font-bold mt-1 tabular-nums">{loading ? '—' : data.length}</p></div><div className="p-2 rounded-md bg-primary/8"><Building2 className="w-4 h-4 text-primary" /></div></div></CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Alumni Bekerja</p><p className="text-2xl font-bold mt-1 tabular-nums">{loading ? '—' : `${totalAlumni}+`}</p></div><div className="p-2 rounded-md bg-success/8"><Users className="w-4 h-4 text-success" /></div></div></CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Negara</p><p className="text-2xl font-bold mt-1 tabular-nums">{loading ? '—' : totalNegara}</p></div><div className="p-2 rounded-md bg-chart-5/8"><Globe className="w-4 h-4 text-chart-5" /></div></div></CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Kapal Pesiar</p><p className="text-2xl font-bold mt-1 tabular-nums">{loading ? '—' : data.filter(m => m.jenis === 'kapal_pesiar').length}</p></div><div className="p-2 rounded-md bg-chart-4/8"><Ship className="w-4 h-4 text-chart-4" /></div></div></CardContent>
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
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat data...</p></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-16 text-sm text-muted-foreground">Tidak ada data ditemukan</TableCell></TableRow>
                ) : (
                  filtered.map(m => {
                    const JenisIcon = JENIS_ICON[m.jenis] || Building2;
                    return (
                      <TableRow key={m.id} className="hover:bg-accent/50 group">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-md bg-muted/60 shrink-0 group-hover:bg-primary/10 transition-colors"><JenisIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" /></div>
                            <div>
                              <p className="text-[13px] font-medium group-hover:text-primary transition-colors">{m.nama}</p>
                              {m.website_url && (
                                <a href={m.website_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-0.5">
                                  <ExternalLink className="w-2.5 h-2.5" /> Website
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-[10px] font-normal capitalize">{m.jenis.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            {Array.from({ length: Math.min(m.bintang || 0, 5) }).map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 text-warning fill-warning" />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" />{m.kota}, {m.negara}</span>
                        </TableCell>
                        <TableCell className="text-center text-sm font-semibold tabular-nums text-primary">{m.alumni_bekerja || 0}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(m.posisi_tersedia || []).slice(0, 2).map((p, i) => (
                              <Badge key={i} variant="outline" className="text-[9px] font-normal">{p}</Badge>
                            ))}
                            {(m.posisi_tersedia || []).length > 2 && (
                              <Badge variant="outline" className="text-[9px] font-normal text-muted-foreground">+{(m.posisi_tersedia || []).length - 2}</Badge>
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
                              <DropdownMenuItem className="text-xs" onClick={() => openEdit(m)}><Edit className="w-3 h-3 mr-1.5" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-xs text-error" onClick={() => { setSelectedTarget(m); setIsDeleteOpen(true); }}><Trash2 className="w-3 h-3 mr-1.5" /> Hapus</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Tambah */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tambah Mitra Kerja Baru</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-2">
            {renderForm(form, setForm as any)}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}><X className="w-3.5 h-3.5 mr-1" />Batal</Button>
              <Button type="submit" size="sm" className="bg-primary" disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}Tambah
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Mitra Kerja</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            {renderForm(editForm, setEditForm as any)}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}><X className="w-3.5 h-3.5 mr-1" />Batal</Button>
              <Button type="submit" size="sm" className="bg-primary" disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Hapus */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Hapus Mitra Kerja?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Mitra kerja <span className="font-semibold text-foreground">{selectedTarget?.nama}</span> akan dihapus secara permanen.</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1" />}Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
