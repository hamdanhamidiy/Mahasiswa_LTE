'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Plus, UserCheck, GraduationCap, Briefcase, MoreHorizontal, Download, Loader2, Save, X, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { fetchData, updateData, createData, deleteData } from '@/lib/api';

interface MahasiswaItem {
  id: string; nama_lengkap: string; nim: string; email: string; program: string; jurusan: string; angkatan: string; status_aktif: boolean; created_at: string;
}

export default function AdminMahasiswaPage() {
  const [search, setSearch] = useState('');
  const [filterJurusan, setFilterJurusan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [mahasiswa, setMahasiswa] = useState<MahasiswaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await fetchData<MahasiswaItem[]>('admin_mahasiswa');
    setMahasiswa(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    nama_lengkap: '', email: '', password: '', nim: '', 
    program: 'diploma1', jurusan: 'general', angkatan: `Angkatan ${new Date().getFullYear()}-${new Date().getFullYear()+1}` 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_lengkap || !form.email || !form.password) return;
    setSaving(true);
    const { data, error } = await createData('tambah_mahasiswa', form);
    setSaving(false);
    
    if (error) {
      alert('Gagal menambahkan mahasiswa: ' + error);
      return;
    }
    
    setIsFormOpen(false);
    setForm({ nama_lengkap: '', email: '', password: '', nim: '', program: 'diploma1', jurusan: 'general', angkatan: `Angkatan ${new Date().getFullYear()}-${new Date().getFullYear()+1}` });
    load();
  };

  const filtered = mahasiswa.filter(m => {
    if (search && !m.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) && !m.nim?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterJurusan !== 'all' && m.jurusan !== filterJurusan) return false;
    if (filterStatus === 'aktif' && !m.status_aktif) return false;
    if (filterStatus === 'nonaktif' && m.status_aktif) return false;
    return true;
  });

  const aktif = mahasiswa.filter(m => m.status_aktif);
  const nonaktif = mahasiswa.filter(m => !m.status_aktif);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await updateData('user', id, { status_aktif: !currentStatus });
    if (!error) {
      setMahasiswa(prev => prev.map(m => m.id === id ? { ...m, status_aktif: !currentStatus } : m));
    }
  };

  // --- EDIT ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nama_lengkap: '', nim: '', program: 'diploma1', jurusan: 'general', angkatan: '', status_aktif: true });
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (m: MahasiswaItem) => {
    setEditId(m.id);
    setEditForm({ nama_lengkap: m.nama_lengkap, nim: m.nim || '', program: m.program || 'diploma1', jurusan: m.jurusan || 'general', angkatan: m.angkatan || '', status_aktif: m.status_aktif });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSavingEdit(true);
    const { error } = await updateData('user', editId, editForm);
    setSavingEdit(false);
    if (error) { alert('Gagal mengubah data: ' + error); return; }
    setIsEditOpen(false);
    setMahasiswa(prev => prev.map(m => m.id === editId ? { ...m, ...editForm } : m));
  };

  // --- HAPUS ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MahasiswaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await deleteData('user', deleteTarget.id);
    setDeleting(false);
    if (error) { alert('Gagal menghapus mahasiswa: ' + error); return; }
    setIsDeleteOpen(false);
    setMahasiswa(prev => prev.filter(m => m.id !== deleteTarget.id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1>Manajemen Mahasiswa</h1>
          <p>Kelola data dan informasi seluruh mahasiswa LTE Cruise</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs h-8">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
          <Button size="sm" className="bg-primary text-xs h-8 btn-press" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Mahasiswa
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <Card className="border border-border shadow-none bg-primary text-white card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 opacity-50" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : mahasiswa.length}</p>
            <p className="text-[9px] text-white/50 mt-0.5 uppercase tracking-wider font-medium">Total Mahasiswa</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <GraduationCap className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : aktif.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Aktif</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <Briefcase className="w-4 h-4 mx-auto mb-1 text-warning" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : nonaktif.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Nonaktif</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive animate-slide-up">
          <CardContent className="p-3.5 text-center">
            <UserCheck className="w-4 h-4 mx-auto mb-1 text-success" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : filtered.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Hasil Filter</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-3">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Cari nama atau NIM..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterJurusan} onValueChange={(v) => setFilterJurusan(v ?? 'all')}>
            <SelectTrigger className="w-full sm:w-44 h-8 text-xs"><SelectValue placeholder="Jurusan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jurusan</SelectItem>
              <SelectItem value="housekeeping">Housekeeping</SelectItem>
              <SelectItem value="fnb_product">F&B Product</SelectItem>
              <SelectItem value="fnb_service">F&B Service</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? 'all')}>
            <SelectTrigger className="w-full sm:w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="border border-border shadow-none overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Memuat data mahasiswa...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" />
                <p className="text-xs text-muted-foreground font-medium">
                  {mahasiswa.length === 0 ? 'Belum ada data mahasiswa' : 'Tidak ada hasil yang cocok'}
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                  {mahasiswa.length === 0 ? 'Data mahasiswa akan muncul setelah mahasiswa didaftarkan' : 'Coba ubah filter pencarian'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table className="formal-table">
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead>Mahasiswa</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Jurusan</TableHead>
                        <TableHead className="text-center">Angkatan</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(m => (
                        <TableRow key={m.id} className="hover:bg-accent/40 group">
                          <TableCell>
                            <p className="text-[13px] font-medium group-hover:text-primary transition-colors">{m.nama_lengkap}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{m.nim || '—'}</p>
                          </TableCell>
                          <TableCell className="text-[12px]">{m.program || '—'}</TableCell>
                          <TableCell className="text-[12px] capitalize">{m.jurusan?.replace('_', ' ') || '—'}</TableCell>
                          <TableCell className="text-center"><Badge variant="outline" className="text-[9px] font-medium">{m.angkatan || '—'}</Badge></TableCell>
                          <TableCell className="text-center">
                            <span className={`status-indicator text-[8px] ${m.status_aktif ? 'status-aktif' : 'status-nonaktif'}`}>
                              {m.status_aktif ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7 outline-none">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-[11px]" onClick={() => openEdit(m)}><Pencil className="w-3 h-3 mr-2" />Edit Data</DropdownMenuItem>
                                <DropdownMenuItem className="text-[11px]" onClick={() => toggleStatus(m.id, m.status_aktif)}>
                                  {m.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-[11px] text-error" onClick={() => { setDeleteTarget(m); setIsDeleteOpen(true); }}><Trash2 className="w-3 h-3 mr-2" />Hapus</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Table footer */}
                <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> dari <span className="font-semibold text-foreground">{mahasiswa.length}</span> mahasiswa
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Tambah Mahasiswa */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Mahasiswa Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs font-semibold">Nama Lengkap</Label><Input placeholder="Nama..." value={form.nama_lengkap} onChange={e => setForm(p => ({ ...p, nama_lengkap: e.target.value }))} required /></div>
              <div className="space-y-2"><Label className="text-xs font-semibold">NIM</Label><Input placeholder="NIM..." value={form.nim} onChange={e => setForm(p => ({ ...p, nim: e.target.value }))} required /></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs font-semibold">Email</Label><Input type="email" placeholder="Email..." value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
              <div className="space-y-2"><Label className="text-xs font-semibold">Password</Label><Input type="text" placeholder="Password untuk login..." value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required /></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Program</Label>
                <Select value={form.program} onValueChange={(v) => { if (v) setForm(p => ({ ...p, program: v })); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diploma1">Diploma 1</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="english_cruise">English for Cruise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Jurusan</Label>
                <Select value={form.jurusan} onValueChange={(v) => { if (v) setForm(p => ({ ...p, jurusan: v })); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="fnb_product">F&B Product</SelectItem>
                    <SelectItem value="fnb_service">F&B Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2"><Label className="text-xs font-semibold">Angkatan</Label><Input placeholder="Angkatan 2026-2027" value={form.angkatan} onChange={e => setForm(p => ({ ...p, angkatan: e.target.value }))} required /></div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}><X className="w-3.5 h-3.5 mr-1" />Batal</Button>
              <Button type="submit" className="bg-primary" disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}Tambah Mahasiswa
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Mahasiswa */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Data Mahasiswa</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs font-semibold">Nama Lengkap</Label><Input value={editForm.nama_lengkap} onChange={e => setEditForm(p => ({ ...p, nama_lengkap: e.target.value }))} required /></div>
              <div className="space-y-2"><Label className="text-xs font-semibold">NIM</Label><Input value={editForm.nim} onChange={e => setEditForm(p => ({ ...p, nim: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Program</Label>
                <Select value={editForm.program} onValueChange={v => { if (v) setEditForm(p => ({ ...p, program: v })); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diploma1">Diploma 1</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="english_cruise">English for Cruise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Jurusan</Label>
                <Select value={editForm.jurusan} onValueChange={v => { if (v) setEditForm(p => ({ ...p, jurusan: v })); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="fnb_product">F&B Product</SelectItem>
                    <SelectItem value="fnb_service">F&B Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs font-semibold">Angkatan</Label><Input value={editForm.angkatan} onChange={e => setEditForm(p => ({ ...p, angkatan: e.target.value }))} /></div>
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
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}><X className="w-3.5 h-3.5 mr-1" />Batal</Button>
              <Button type="submit" className="bg-primary" disabled={savingEdit}>
                {savingEdit ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}Simpan Perubahan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Hapus Mahasiswa?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Data <span className="font-semibold text-foreground">{deleteTarget?.nama_lengkap}</span> akan dihapus secara permanen termasuk akun login. Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1" />}Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
