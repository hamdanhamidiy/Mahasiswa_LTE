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
import { Ship, Calendar, MapPin, Users, Plus, Loader2, Save, X, MoreHorizontal, Pencil, Trash2, ChevronRight } from 'lucide-react';

interface InterviewSession { id: string; nama_perusahaan_agensi: string; jenis: string; tanggal_interview: string; lokasi: string; kuota: number; deskripsi: string; requirements: string; dokumen_yang_dibutuhkan: string[]; pendaftar_ids: string[]; approved_ids: string[]; status: string }

export default function AdminInterviewPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nama_perusahaan_agensi: '', jenis: 'kapal_pesiar', tanggal_interview: '', lokasi: '', kuota: 30, deskripsi: '', requirements: '', status: 'akan_datang' });

  const loadData = () => { setLoading(true); fetchData<InterviewSession[]>('admin_interview').then(d => { if (d) setSessions(d); setLoading(false); }); };
  useEffect(() => { loadData(); }, []);

  const statusLabel: Record<string, { label: string; cls: string }> = { akan_datang: { label: 'Akan Datang', cls: 'chip-primary' }, sedang_berlangsung: { label: 'Berlangsung', cls: 'chip-warning' }, selesai: { label: 'Selesai', cls: 'chip-success' } };

  const openCreate = () => { setEditingId(null); setForm({ nama_perusahaan_agensi: '', jenis: 'kapal_pesiar', tanggal_interview: '', lokasi: '', kuota: 30, deskripsi: '', requirements: '', status: 'akan_datang' }); setIsFormOpen(true); };
  const openEdit = (s: InterviewSession) => { setEditingId(s.id); setForm({ nama_perusahaan_agensi: s.nama_perusahaan_agensi, jenis: s.jenis, tanggal_interview: s.tanggal_interview, lokasi: s.lokasi, kuota: s.kuota, deskripsi: s.deskripsi || '', requirements: s.requirements || '', status: s.status }); setIsFormOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      const { error } = await updateData('interview', editingId, form);
      if (error) { alert('Gagal: ' + error); setSaving(false); return; }
    } else {
      const { error } = await createData('interview', { ...form, pendaftar_ids: [], approved_ids: [], rejected_ids: [], dokumen_yang_dibutuhkan: [] });
      if (error) { alert('Gagal: ' + error); setSaving(false); return; }
    }
    setSaving(false); setIsFormOpen(false); loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus sesi interview ini?')) return;
    const { error } = await deleteData('interview', id);
    if (error) alert('Gagal: ' + error); else loadData();
  };

  if (loading) return <div className="page-loading"><div className="loading-content"><div className="spinner-modern mx-auto mb-3" /><p className="text-xs text-muted-foreground">Memuat data interview...</p></div></div>;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div><h1>Manajemen Interview</h1><p>Kelola sesi interview kapal pesiar &amp; hotel internasional</p></div>
          <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15" onClick={openCreate}><Plus className="w-3.5 h-3.5 mr-1.5" /> Buat Sesi Baru</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-stat-highlight animate-slide-up"><CardContent className="p-5 text-center"><p className="stat-value">{sessions.length}</p><p className="stat-label mt-1">Total Sesi</p></CardContent></Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Akan Datang</p><p className="text-2xl font-bold mt-1.5 text-primary metric-value">{sessions.filter(s => s.status === 'akan_datang').length}</p></div><div className="p-2.5 rounded-xl bg-primary/8"><Calendar className="w-[18px] h-[18px] text-primary" /></div></div></CardContent></Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Total Pendaftar</p><p className="text-2xl font-bold mt-1.5 metric-value">{sessions.reduce((a, s) => a + (s.pendaftar_ids?.length || 0), 0)}</p></div><div className="p-2.5 rounded-xl bg-chart-4/8"><Users className="w-[18px] h-[18px] text-chart-4" /></div></div></CardContent></Card>
      </div>

      {sessions.length === 0 && <div className="empty-state"><Ship className="w-12 h-12 mx-auto empty-state-icon" /><h3>Belum ada sesi interview</h3><p>Buat sesi interview baru untuk memulai</p></div>}

      <div className="space-y-3 stagger-children">
        {sessions.map(s => {
          const st = statusLabel[s.status] || statusLabel.akan_datang;
          const fill = Math.min(100, (s.pendaftar_ids?.length || 0) / s.kuota * 100);
          return (
            <Card key={s.id} className="border border-border shadow-sm card-glow animate-slide-up group">
              <CardContent className="p-5">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-muted/60 shrink-0"><Ship className="w-5 h-5 text-muted-foreground" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`chip ${st.cls}`}>{st.label}</span>
                      <Badge variant="outline" className="text-[10px] font-normal">{s.jenis === 'kapal_pesiar' ? 'Kapal Pesiar' : 'Hotel Internasional'}</Badge>
                    </div>
                    <h3 className="text-[14px] font-semibold group-hover:text-primary transition-colors">{s.nama_perusahaan_agensi}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(s.tanggal_interview).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      {s.lokasi && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.lokasi}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <div className="h-2 rounded-full bg-muted/40 overflow-hidden flex-1 max-w-[200px]"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${fill}%` }} /></div>
                      <span className="text-[11px] text-muted-foreground tabular-nums font-medium">{s.pendaftar_ids?.length || 0}/{s.kuota}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-accent outline-none shrink-0"><MoreHorizontal className="w-4 h-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-[12px] cursor-pointer" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-[12px] cursor-pointer text-error" onClick={() => handleDelete(s.id)}><Trash2 className="w-3.5 h-3.5 mr-2" />Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Sesi Interview' : 'Buat Sesi Interview Baru'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2"><Label className="text-xs font-semibold">Perusahaan / Agensi</Label><Input placeholder="Nama perusahaan..." value={form.nama_perusahaan_agensi} onChange={e => setForm(p => ({ ...p, nama_perusahaan_agensi: e.target.value }))} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Jenis</Label>
                <Select value={form.jenis} onValueChange={(v) => { if (v) setForm(p => ({ ...p, jenis: v })); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kapal_pesiar">Kapal Pesiar</SelectItem>
                    <SelectItem value="hotel_luar_negeri">Hotel Internasional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Status</Label>
                <Select value={form.status} onValueChange={(v) => { if (v) setForm(p => ({ ...p, status: v })); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="akan_datang">Akan Datang</SelectItem>
                    <SelectItem value="sedang_berlangsung">Berlangsung</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs font-semibold">Tanggal Interview</Label><Input type="date" value={form.tanggal_interview} onChange={e => setForm(p => ({ ...p, tanggal_interview: e.target.value }))} required /></div>
              <div className="space-y-2"><Label className="text-xs font-semibold">Kuota</Label><Input type="number" min="1" value={form.kuota} onChange={e => setForm(p => ({ ...p, kuota: Number(e.target.value) }))} /></div>
            </div>
            <div className="space-y-2"><Label className="text-xs font-semibold">Lokasi</Label><Input placeholder="Lokasi interview..." value={form.lokasi} onChange={e => setForm(p => ({ ...p, lokasi: e.target.value }))} /></div>
            <div className="space-y-2"><Label className="text-xs font-semibold">Deskripsi</Label><Textarea placeholder="Deskripsi sesi interview..." rows={3} value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))} /></div>
            <div className="space-y-2"><Label className="text-xs font-semibold">Requirements</Label><Textarea placeholder="Syarat-syarat pendaftaran..." rows={3} value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}><X className="w-3.5 h-3.5 mr-1" />Batal</Button>
              <Button type="submit" className="bg-primary" disabled={saving}>{saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}{editingId ? 'Simpan' : 'Buat Sesi'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
