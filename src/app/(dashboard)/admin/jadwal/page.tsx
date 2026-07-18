'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, BookOpen, Loader2, Save, X, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { fetchData, createData, updateData, deleteData } from '@/lib/api';

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

interface JadwalItem {
  id: string; hari: string; jam_mulai: string; jam_selesai: string; ruangan: string; kelas: string; is_active: boolean;
  mata_pelajaran_id?: string; instruktur_id?: string;
  tanggal_efektif_mulai?: string; tanggal_efektif_selesai?: string;
  mata_pelajaran?: { nama_mapel: string; kode_mapel: string };
  instruktur?: { nama_lengkap: string };
}

interface MapelOption { id: string; nama_mapel: string; kode_mapel: string; }
interface InstrukturOption { id: string; nama_lengkap: string; }

const emptyForm = {
  mata_pelajaran_id: '', instruktur_id: '', kelas: '', hari: 'Senin',
  jam_mulai: '08:00', jam_selesai: '09:30', ruangan: '',
  tanggal_efektif_mulai: new Date().toISOString().split('T')[0],
  tanggal_efektif_selesai: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
  is_active: true,
};

export default function AdminJadwalPage() {
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [mapelList, setMapelList] = useState<MapelOption[]>([]);
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
  const [deleteTarget, setDeleteTarget] = useState<JadwalItem | null>(null);

  const load = async () => {
    setLoading(true);
    const [jadwal, mapels, instrData] = await Promise.all([
      fetchData<JadwalItem[]>('admin_jadwal'),
      fetchData<MapelOption[]>('admin_mata_pelajaran'),
      fetchData<InstrukturOption[]>('admin_instruktur'),
    ]);
    setJadwalList(jadwal || []);
    setMapelList(mapels || []);
    setInstrukturList(instrData || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Group by day
  const grouped = HARI_ORDER.map(hari => ({
    hari,
    sesi: jadwalList.filter(j => j.hari === hari),
  })).filter(g => g.sesi.length > 0);

  const totalSesi = jadwalList.length;
  const hariColors: Record<string, string> = {
    'Senin': 'bg-primary', 'Selasa': 'bg-chart-2', 'Rabu': 'bg-chart-3',
    'Kamis': 'bg-chart-4', 'Jumat': 'bg-chart-5', 'Sabtu': 'bg-muted-foreground',
  };

  // --- TAMBAH ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mata_pelajaran_id || !form.instruktur_id || !form.kelas) return;
    setSaving(true);
    const { error } = await createData('jadwal', form);
    setSaving(false);
    if (error) { alert('Gagal menambahkan jadwal: ' + error); return; }
    setIsFormOpen(false);
    setForm(emptyForm);
    load();
  };

  // --- EDIT ---
  const openEdit = (j: JadwalItem) => {
    setEditId(j.id);
    setEditForm({
      mata_pelajaran_id: j.mata_pelajaran_id || '', instruktur_id: j.instruktur_id || '',
      kelas: j.kelas || '', hari: j.hari || 'Senin',
      jam_mulai: j.jam_mulai?.substring(0, 5) || '08:00', jam_selesai: j.jam_selesai?.substring(0, 5) || '09:30',
      ruangan: j.ruangan || '',
      tanggal_efektif_mulai: j.tanggal_efektif_mulai || emptyForm.tanggal_efektif_mulai,
      tanggal_efektif_selesai: j.tanggal_efektif_selesai || emptyForm.tanggal_efektif_selesai,
      is_active: j.is_active,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);
    const { error } = await updateData('jadwal', editId, editForm);
    setSaving(false);
    if (error) { alert('Gagal mengubah jadwal: ' + error); return; }
    setIsEditOpen(false);
    load();
  };

  // --- HAPUS ---
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const { error } = await deleteData('jadwal', deleteTarget.id);
    setSaving(false);
    if (error) { alert('Gagal menghapus jadwal: ' + error); return; }
    setIsDeleteOpen(false);
    setJadwalList(prev => prev.filter(j => j.id !== deleteTarget.id));
  };

  // Shared form fields
  const renderForm = (formData: typeof emptyForm, setFormData: (fn: (p: typeof emptyForm) => typeof emptyForm) => void) => (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Mata Pelajaran *</Label>
          <Select value={formData.mata_pelajaran_id} onValueChange={v => { if (v) setFormData(p => ({ ...p, mata_pelajaran_id: v })); }}>
            <SelectTrigger className="h-9 text-sm">
              <div data-slot="select-value" className="flex flex-1 text-left line-clamp-1">
                {formData.mata_pelajaran_id 
                  ? mapelList.find(m => m.id === formData.mata_pelajaran_id)?.nama_mapel || 'Pilih mapel...'
                  : <span className="text-muted-foreground">Pilih mapel...</span>}
              </div>
            </SelectTrigger>
            <SelectContent>
              {mapelList.map(m => <SelectItem key={m.id} value={m.id}>{m.nama_mapel} ({m.kode_mapel})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Instruktur *</Label>
          <Select value={formData.instruktur_id} onValueChange={v => { if (v) setFormData(p => ({ ...p, instruktur_id: v })); }}>
            <SelectTrigger className="h-9 text-sm">
              <div data-slot="select-value" className="flex flex-1 text-left line-clamp-1">
                {formData.instruktur_id 
                  ? instrukturList.find(i => i.id === formData.instruktur_id)?.nama_lengkap || 'Pilih instruktur...'
                  : <span className="text-muted-foreground">Pilih instruktur...</span>}
              </div>
            </SelectTrigger>
            <SelectContent>
              {instrukturList.map(i => <SelectItem key={i.id} value={i.id}>{i.nama_lengkap}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2"><Label className="text-xs font-semibold">Kelas *</Label><Input placeholder="D1-HK-25" value={formData.kelas} onChange={e => setFormData(p => ({ ...p, kelas: e.target.value }))} required /></div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Hari</Label>
          <Select value={formData.hari} onValueChange={v => { if (v) setFormData(p => ({ ...p, hari: v })); }}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {HARI_ORDER.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label className="text-xs font-semibold">Ruangan</Label><Input placeholder="R.201" value={formData.ruangan} onChange={e => setFormData(p => ({ ...p, ruangan: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label className="text-xs font-semibold">Jam Mulai</Label><Input type="time" value={formData.jam_mulai} onChange={e => setFormData(p => ({ ...p, jam_mulai: e.target.value }))} required /></div>
        <div className="space-y-2"><Label className="text-xs font-semibold">Jam Selesai</Label><Input type="time" value={formData.jam_selesai} onChange={e => setFormData(p => ({ ...p, jam_selesai: e.target.value }))} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label className="text-xs font-semibold">Tanggal Efektif Mulai</Label><Input type="date" value={formData.tanggal_efektif_mulai} onChange={e => setFormData(p => ({ ...p, tanggal_efektif_mulai: e.target.value }))} required /></div>
        <div className="space-y-2"><Label className="text-xs font-semibold">Tanggal Efektif Selesai</Label><Input type="date" value={formData.tanggal_efektif_selesai} onChange={e => setFormData(p => ({ ...p, tanggal_efektif_selesai: e.target.value }))} required /></div>
      </div>
    </>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div><h1>Jadwal Kuliah</h1><p>Kelola jadwal perkuliahan seluruh kelas</p></div>
          <Button size="sm" className="bg-primary text-xs h-8 btn-press self-start" onClick={() => { setForm(emptyForm); setIsFormOpen(true); }}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Jadwal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-3.5 text-center">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : grouped.length}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Hari Aktif</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-3.5 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-chart-3" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : totalSesi}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Total Sesi</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-3.5 text-center">
            <BookOpen className="w-4 h-4 mx-auto mb-1 text-chart-4" />
            <p className="text-xl font-bold tabular-nums">{loading ? '—' : new Set(jadwalList.map(j => j.mata_pelajaran?.nama_mapel)).size}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Mata Pelajaran</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat jadwal...</p></div>
      ) : grouped.length === 0 ? (
        <Card className="border border-border shadow-none">
          <CardContent className="py-16 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" />
            <p className="text-xs text-muted-foreground font-medium">Belum ada jadwal</p>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">Klik &quot;Tambah Jadwal&quot; untuk menambah jadwal baru</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 stagger-children">
          {grouped.map((day) => (
            <Card key={day.hari} className="border border-border shadow-none overflow-hidden animate-slide-up">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/30">
                <div className={`w-2 h-2 rounded-full ${hariColors[day.hari] || 'bg-muted-foreground'}`} />
                <h3 className="text-xs font-semibold uppercase tracking-wider">{day.hari}</h3>
                <Badge variant="outline" className="text-[9px] ml-auto">{day.sesi.length} sesi</Badge>
              </div>
              <CardContent className="p-0 divide-y divide-border">
                {day.sesi.map((j) => (
                  <div key={j.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 hover:bg-accent/30 transition-colors group">
                    <div className="flex items-center gap-2 sm:w-36 shrink-0">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] font-medium tabular-nums">{j.jam_mulai?.substring(0,5)} - {j.jam_selesai?.substring(0,5)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate">{j.mata_pelajaran?.nama_mapel || '—'}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{j.kelas}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{j.ruangan || '—'}</span>
                        <span>{j.instruktur?.nama_lengkap || '—'}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent outline-none shrink-0">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-[11px]" onClick={() => openEdit(j)}><Pencil className="w-3 h-3 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-[11px] text-error" onClick={() => { setDeleteTarget(j); setIsDeleteOpen(true); }}><Trash2 className="w-3 h-3 mr-2" />Hapus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Tambah Jadwal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tambah Jadwal Baru</DialogTitle></DialogHeader>
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

      {/* Dialog Edit Jadwal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Jadwal</DialogTitle></DialogHeader>
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
          <DialogHeader><DialogTitle>Hapus Jadwal?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Jadwal <span className="font-semibold text-foreground">{deleteTarget?.mata_pelajaran?.nama_mapel}</span> ({deleteTarget?.hari}, {deleteTarget?.jam_mulai?.substring(0,5)}) akan dihapus.</p>
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
