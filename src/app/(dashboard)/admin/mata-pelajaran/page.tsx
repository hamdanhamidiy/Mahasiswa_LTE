'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search, Plus, MoreHorizontal, BookMarked, Users, Loader2, Save, X, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { fetchData, createData, updateData, deleteData } from '@/lib/api';

interface MapelItem {
  id: string; kode_mapel: string; nama_mapel: string; program: string; jurusan: string; fase: string; sks: number; is_active: boolean;
  instruktur?: { nama_lengkap: string } | null; instruktur_id?: string | null;
}

interface InstrukturOption { id: string; nama_lengkap: string; }

const emptyForm = { kode_mapel: '', nama_mapel: '', program: 'diploma1', jurusan: 'general', fase: 'fase_kelas', sks: 1, instruktur_id: '', is_active: true };

export default function AdminMataPelajaranPage() {
  const [search, setSearch] = useState('');
  const [mapels, setMapels] = useState<MapelItem[]>([]);
  const [instrukturList, setInstrukturList] = useState<InstrukturOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MapelItem | null>(null);

  const load = async () => {
    setLoading(true);
    const [d, instrData] = await Promise.all([
      fetchData<MapelItem[]>('admin_mata_pelajaran'),
      fetchData<InstrukturOption[]>('admin_instruktur'),
    ]);
    setMapels(d || []);
    setInstrukturList(instrData || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = mapels.filter(m => !search || m.nama_mapel?.toLowerCase().includes(search.toLowerCase()) || m.kode_mapel?.toLowerCase().includes(search.toLowerCase()));
  const totalSks = mapels.reduce((a, m) => a + (m.sks || 0), 0);

  // --- TAMBAH ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kode_mapel || !form.nama_mapel) return;
    setSaving(true);
    const payload = { ...form, sks: Number(form.sks), instruktur_id: form.instruktur_id || null };
    const { error } = await createData('mata_pelajaran', payload);
    setSaving(false);
    if (error) { alert('Gagal menambahkan: ' + error); return; }
    setIsFormOpen(false);
    setForm(emptyForm);
    load();
  };

  // --- EDIT ---
  const openEdit = (m: MapelItem) => {
    setEditId(m.id);
    setEditForm({
      kode_mapel: m.kode_mapel, nama_mapel: m.nama_mapel, program: m.program || 'diploma1',
      jurusan: m.jurusan || 'general', fase: m.fase || 'fase_kelas', sks: m.sks || 1,
      instruktur_id: m.instruktur_id || '', is_active: m.is_active,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);
    const payload = { ...editForm, sks: Number(editForm.sks), instruktur_id: editForm.instruktur_id || null };
    const { error } = await updateData('mata_pelajaran', editId, payload);
    setSaving(false);
    if (error) { alert('Gagal mengubah data: ' + error); return; }
    setIsEditOpen(false);
    load();
  };

  // --- TOGGLE STATUS ---
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await updateData('mata_pelajaran', id, { is_active: !currentStatus });
    if (!error) setMapels(prev => prev.map(m => m.id === id ? { ...m, is_active: !currentStatus } : m));
  };

  // --- HAPUS ---
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const { error } = await deleteData('mata_pelajaran', deleteTarget.id);
    setSaving(false);
    if (error) { alert('Gagal menghapus: ' + error); return; }
    setIsDeleteOpen(false);
    setMapels(prev => prev.filter(m => m.id !== deleteTarget.id));
  };

  // Shared form renderer
  const renderForm = (formData: typeof emptyForm, setFormData: (fn: (p: typeof emptyForm) => typeof emptyForm) => void) => (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label className="text-xs font-semibold">Kode Mapel *</Label><Input placeholder="HK-101" value={formData.kode_mapel} onChange={e => setFormData(p => ({ ...p, kode_mapel: e.target.value }))} required /></div>
        <div className="space-y-2"><Label className="text-xs font-semibold">Nama Mapel *</Label><Input placeholder="Room Division Management" value={formData.nama_mapel} onChange={e => setFormData(p => ({ ...p, nama_mapel: e.target.value }))} required /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Program</Label>
          <Select value={formData.program} onValueChange={v => { if (v) setFormData(p => ({ ...p, program: v })); }}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="diploma1">Diploma 1</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
              <SelectItem value="english_cruise">English Cruise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Jurusan</Label>
          <Select value={formData.jurusan} onValueChange={v => { if (v) setFormData(p => ({ ...p, jurusan: v })); }}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="housekeeping">Housekeeping</SelectItem>
              <SelectItem value="fnb_product">F&B Product</SelectItem>
              <SelectItem value="fnb_service">F&B Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Fase</Label>
          <Select value={formData.fase} onValueChange={v => { if (v) setFormData(p => ({ ...p, fase: v })); }}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fase_kelas">Fase Kelas</SelectItem>
              <SelectItem value="fase_ojt">Fase OJT</SelectItem>
              <SelectItem value="fase_akhir">Fase Akhir</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label className="text-xs font-semibold">SKS</Label><Input type="number" min="1" max="10" value={formData.sks} onChange={e => setFormData(p => ({ ...p, sks: Number(e.target.value) || 1 }))} /></div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Instruktur</Label>
          <Select value={formData.instruktur_id || 'none'} onValueChange={v => { if (v) setFormData(p => ({ ...p, instruktur_id: v === 'none' ? '' : v })); }}>
            <SelectTrigger className="h-9 text-sm">
              <div data-slot="select-value" className="flex flex-1 text-left line-clamp-1">
                {formData.instruktur_id 
                  ? instrukturList.find(i => i.id === formData.instruktur_id)?.nama_lengkap || '— Belum ditentukan —'
                  : <span className="text-muted-foreground">Pilih instruktur...</span>}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Belum ditentukan —</SelectItem>
              {instrukturList.map(i => <SelectItem key={i.id} value={i.id}>{i.nama_lengkap}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div><h1>Mata Pelajaran</h1><p>Kelola kurikulum dan mata pelajaran LTE Cruise</p></div>
          <Button className="bg-primary btn-press text-xs h-8 self-start" onClick={() => { setForm(emptyForm); setIsFormOpen(true); }}><Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Mapel</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <BookOpen className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : mapels.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Total Mapel</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <BookMarked className="w-4 h-4 mx-auto mb-1 text-chart-4" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : totalSks}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Total SKS</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <BookOpen className="w-4 h-4 mx-auto mb-1 text-success" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : mapels.filter(m => m.is_active).length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Aktif</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-chart-5" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : new Set(mapels.map(m => m.instruktur?.nama_lengkap).filter(Boolean)).size}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Instruktur</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari mata pelajaran atau kode..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat data...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{mapels.length === 0 ? 'Belum ada mata pelajaran' : 'Tidak ada hasil'}</p></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="formal-table">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Mata Pelajaran</TableHead>
                      <TableHead>Jurusan</TableHead>
                      <TableHead>Instruktur</TableHead>
                      <TableHead className="text-center">SKS</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(m => (
                      <TableRow key={m.id} className="hover:bg-accent/40 group">
                        <TableCell>
                          <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{m.nama_mapel}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{m.kode_mapel}</p>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] font-normal capitalize">{m.jurusan?.replace('_', ' ') || '—'}</Badge></TableCell>
                        <TableCell className="text-[12px]">{m.instruktur?.nama_lengkap || '—'}</TableCell>
                        <TableCell className="text-center"><span className="text-sm font-bold tabular-nums text-primary">{m.sks || 0}</span></TableCell>
                        <TableCell className="text-center">
                          <span className={`status-indicator text-[8px] ${m.is_active ? 'status-aktif' : 'status-nonaktif'}`}>{m.is_active ? 'Aktif' : 'Nonaktif'}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent outline-none"><MoreHorizontal className="w-3.5 h-3.5" /></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-[11px]" onClick={() => openEdit(m)}><Pencil className="w-3 h-3 mr-2" />Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-[11px]" onClick={() => toggleStatus(m.id, m.is_active)}>{m.is_active ? 'Nonaktifkan' : 'Aktifkan'}</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-[11px] text-error" onClick={() => { setDeleteTarget(m); setIsDeleteOpen(true); }}><Trash2 className="w-3 h-3 mr-2" />Hapus</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-4 py-2.5 border-t border-border bg-muted/20">
                <p className="text-[10px] text-muted-foreground">Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> dari <span className="font-semibold text-foreground">{mapels.length}</span> mata pelajaran</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog Tambah Mapel */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tambah Mata Pelajaran Baru</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-2">
            {renderForm(form, setForm as any)}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}><X className="w-3.5 h-3.5 mr-1" />Batal</Button>
              <Button type="submit" size="sm" className="bg-primary" disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}Tambah
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Mapel */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Mata Pelajaran</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            {renderForm(editForm, setEditForm as any)}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}><X className="w-3.5 h-3.5 mr-1" />Batal</Button>
              <Button type="submit" size="sm" className="bg-primary" disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Hapus Mata Pelajaran?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Mata pelajaran <span className="font-semibold text-foreground">{deleteTarget?.nama_mapel}</span> ({deleteTarget?.kode_mapel}) akan dihapus secara permanen.</p>
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
