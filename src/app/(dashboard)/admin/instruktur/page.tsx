'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Plus, MoreHorizontal, Mail, User, Loader2, Save, X, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { fetchData, createData, updateData, deleteData } from '@/lib/api';

interface InstrukturItem {
  id: string; nim: string; nama_lengkap: string; email: string; status_aktif: boolean; created_at: string;
}

const emptyForm = { nama_lengkap: '', email: '', password: '', jurusan: 'general' };

export default function AdminInstrukturPage() {
  const [search, setSearch] = useState('');
  const [instruktur, setInstruktur] = useState<InstrukturItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({ nama_lengkap: '', email: '', status_aktif: true });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const d = await fetchData<InstrukturItem[]>('admin_instruktur');
    setInstruktur(d || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = instruktur.filter(i => !search || i.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) || i.email?.toLowerCase().includes(search.toLowerCase()));

  // --- TAMBAH ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_lengkap || !form.email || !form.password) return;
    setSaving(true);
    const { error } = await createData('tambah_instruktur', form);
    setSaving(false);
    if (error) { alert('Gagal menambahkan instruktur: ' + error); return; }
    setIsFormOpen(false);
    setForm(emptyForm);
    load();
  };

  // --- EDIT ---
  const openEdit = (item: InstrukturItem) => {
    setSelectedId(item.id);
    setEditForm({ nama_lengkap: item.nama_lengkap, email: item.email, status_aktif: item.status_aktif });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !editForm.nama_lengkap) return;
    setSaving(true);
    const { error } = await updateData('user', selectedId, { nama_lengkap: editForm.nama_lengkap, status_aktif: editForm.status_aktif });
    setSaving(false);
    if (error) { alert('Gagal mengubah data: ' + error); return; }
    setIsEditOpen(false);
    setInstruktur(prev => prev.map(i => i.id === selectedId ? { ...i, nama_lengkap: editForm.nama_lengkap, status_aktif: editForm.status_aktif } : i));
  };

  // --- HAPUS ---
  const openDelete = (item: InstrukturItem) => {
    setSelectedId(item.id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    const { error } = await deleteData('user', selectedId);
    setSaving(false);
    if (error) { alert('Gagal menghapus instruktur: ' + error); return; }
    setIsDeleteOpen(false);
    setInstruktur(prev => prev.filter(i => i.id !== selectedId));
  };

  // --- TOGGLE STATUS ---
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await updateData('user', id, { status_aktif: !currentStatus });
    if (!error) setInstruktur(prev => prev.map(i => i.id === id ? { ...i, status_aktif: !currentStatus } : i));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1>Manajemen Instruktur</h1><p>Kelola data pengajar dan instruktur LTE Cruise</p></div>
        <Button size="sm" className="bg-primary text-xs h-8 btn-press self-start" onClick={() => { setForm(emptyForm); setIsFormOpen(true); }}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Instruktur
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-3.5 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : instruktur.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Total Instruktur</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-3.5 text-center">
            <User className="w-4 h-4 mx-auto mb-1 text-success" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : instruktur.filter(i => i.status_aktif).length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Aktif</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari instruktur..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat data instruktur...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{instruktur.length === 0 ? 'Belum ada data instruktur' : 'Tidak ada hasil'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="formal-table">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Instruktur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(i => (
                    <TableRow key={i.id} className="hover:bg-accent/40 group">
                      <TableCell>
                        <p className="text-[13px] font-medium group-hover:text-primary transition-colors">{i.nama_lengkap}</p>
                      </TableCell>
                      <TableCell className="text-[12px]"><span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-muted-foreground" />{i.email}</span></TableCell>
                      <TableCell className="text-center">
                        <span className={`status-indicator text-[8px] ${i.status_aktif ? 'status-aktif' : 'status-nonaktif'}`}>{i.status_aktif ? 'Aktif' : 'Nonaktif'}</span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent outline-none"><MoreHorizontal className="w-3.5 h-3.5" /></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-[11px]" onClick={() => openEdit(i)}><Pencil className="w-3 h-3 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-[11px]" onClick={() => toggleStatus(i.id, i.status_aktif)}>{i.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-[11px] text-error" onClick={() => openDelete(i)}><Trash2 className="w-3 h-3 mr-2" />Hapus</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border bg-muted/20">
              <p className="text-[10px] text-muted-foreground">Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> instruktur</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Tambah Instruktur */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Tambah Instruktur Baru</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-2">
            <div className="space-y-2"><Label className="text-xs font-semibold">Nama Lengkap *</Label><Input placeholder="Nama lengkap instruktur..." value={form.nama_lengkap} onChange={e => setForm(p => ({ ...p, nama_lengkap: e.target.value }))} required /></div>
            <div className="space-y-2"><Label className="text-xs font-semibold">Email *</Label><Input type="email" placeholder="email@ltecruise.sch.id" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
            <div className="space-y-2"><Label className="text-xs font-semibold">Password *</Label><Input type="text" placeholder="Password untuk login..." value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required /></div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Jurusan</Label>
              <Select value={form.jurusan} onValueChange={v => { if (v) setForm(p => ({ ...p, jurusan: v })); }}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General (English Teacher)</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="fnb_product">F&B Product</SelectItem>
                  <SelectItem value="fnb_service">F&B Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}><X className="w-3.5 h-3.5 mr-1" />Batal</Button>
              <Button type="submit" size="sm" className="bg-primary" disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}Tambah
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Instruktur */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Instruktur</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-2"><Label className="text-xs font-semibold">Nama Lengkap</Label><Input value={editForm.nama_lengkap} onChange={e => setEditForm(p => ({ ...p, nama_lengkap: e.target.value }))} required /></div>
            <div className="space-y-2"><Label className="text-xs font-semibold">Email</Label><Input value={editForm.email} disabled className="opacity-60" /></div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Status</Label>
              <Select value={editForm.status_aktif ? 'aktif' : 'nonaktif'} onValueChange={v => setEditForm(p => ({ ...p, status_aktif: v === 'aktif' }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          <DialogHeader><DialogTitle>Hapus Instruktur?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Data instruktur akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
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
