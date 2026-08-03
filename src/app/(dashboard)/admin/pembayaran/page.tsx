'use client';

import { useEffect, useState } from 'react';
import { fetchData, updateData, createData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Wallet, CheckCircle2, Clock, AlertCircle, XCircle,
  Search, Download, Loader2, Users, TrendingUp,
  Banknote, MoreHorizontal, Eye, Calendar, CreditCard, Upload, Plus,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/export';
import { UploadCSVModal } from '@/components/shared/UploadCSVModal';
import { PEMBAYARAN_FIELDS } from '@/lib/import';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PembayaranRecord {
  id: string;
  mahasiswa_nama: string;
  mahasiswa_nim: string;
  jenis: string;
  jumlah: number;
  status: 'lunas' | 'belum_lunas' | 'cicilan' | 'jatuh_tempo' | 'menunggu_verifikasi';
  tanggal_bayar: string | null;
  tanggal_jatuh_tempo: string;
  metode_pembayaran: string | null;
  bukti_pembayaran_url: string | null;
}

// Demo data
const DEMO: PembayaranRecord[] = [
  { id: '1', mahasiswa_nama: 'Ahmad Rizki Pratama', mahasiswa_nim: 'LTE-2025-001', jenis: 'SPP Semester 1', jumlah: 15000000, status: 'lunas', tanggal_bayar: '2025-01-20', tanggal_jatuh_tempo: '2025-01-15', metode_pembayaran: 'Transfer BCA', bukti_pembayaran_url: null },
  { id: '2', mahasiswa_nama: 'Siti Nurhaliza', mahasiswa_nim: 'LTE-2025-002', jenis: 'SPP Semester 1', jumlah: 15000000, status: 'lunas', tanggal_bayar: '2025-01-12', tanggal_jatuh_tempo: '2025-01-15', metode_pembayaran: 'Transfer BRI', bukti_pembayaran_url: null },
  { id: '3', mahasiswa_nama: 'Budi Santoso', mahasiswa_nim: 'LTE-2025-003', jenis: 'SPP Semester 1', jumlah: 15000000, status: 'cicilan', tanggal_bayar: null, tanggal_jatuh_tempo: '2025-01-15', metode_pembayaran: null, bukti_pembayaran_url: null },
  { id: '4', mahasiswa_nama: 'Dewi Lestari', mahasiswa_nim: 'LTE-2025-004', jenis: 'SPP Semester 1', jumlah: 15000000, status: 'belum_lunas', tanggal_bayar: null, tanggal_jatuh_tempo: '2025-01-15', metode_pembayaran: null, bukti_pembayaran_url: null },
  { id: '5', mahasiswa_nama: 'Ahmad Rizki Pratama', mahasiswa_nim: 'LTE-2025-001', jenis: 'Biaya Seragam', jumlah: 2500000, status: 'lunas', tanggal_bayar: '2025-01-10', tanggal_jatuh_tempo: '2025-02-01', metode_pembayaran: 'Cash', bukti_pembayaran_url: null },
  { id: '6', mahasiswa_nama: 'Rina Wulandari', mahasiswa_nim: 'LTE-2025-005', jenis: 'SPP Semester 1', jumlah: 15000000, status: 'jatuh_tempo', tanggal_bayar: null, tanggal_jatuh_tempo: '2025-01-15', metode_pembayaran: null, bukti_pembayaran_url: null },
  { id: '7', mahasiswa_nama: 'Fajar Nugroho', mahasiswa_nim: 'LTE-2025-006', jenis: 'Biaya Praktik', jumlah: 3000000, status: 'lunas', tanggal_bayar: '2025-02-05', tanggal_jatuh_tempo: '2025-03-01', metode_pembayaran: 'Transfer Mandiri', bukti_pembayaran_url: null },
  { id: '8', mahasiswa_nama: 'Siti Nurhaliza', mahasiswa_nim: 'LTE-2025-002', jenis: 'Biaya Seragam', jumlah: 2500000, status: 'belum_lunas', tanggal_bayar: null, tanggal_jatuh_tempo: '2025-02-01', metode_pembayaran: null, bukti_pembayaran_url: null },
];

// Map API response (nested mahasiswa object) to flat PembayaranRecord
function mapApiData(records: any[]): PembayaranRecord[] {
  return records.map((r: any) => ({
    id: r.id,
    mahasiswa_nama: r.mahasiswa?.nama_lengkap || r.mahasiswa_nama || '—',
    mahasiswa_nim: r.mahasiswa?.nim || r.mahasiswa_nim || '—',
    jenis: r.jenis,
    jumlah: r.jumlah,
    status: r.status,
    tanggal_bayar: r.tanggal_bayar,
    tanggal_jatuh_tempo: r.tanggal_jatuh_tempo,
    metode_pembayaran: r.metode_pembayaran,
    bukti_pembayaran_url: r.bukti_pembayaran_url || null,
  }));
}

const STATUS_CFG: Record<string, { label: string; cls: string; bgCls: string; icon: typeof CheckCircle2 }> = {
  lunas: { label: 'Lunas', cls: 'text-success', bgCls: 'bg-success/8', icon: CheckCircle2 },
  belum_lunas: { label: 'Belum Lunas', cls: 'text-error', bgCls: 'bg-error/8', icon: XCircle },
  cicilan: { label: 'Cicilan', cls: 'text-warning', bgCls: 'bg-warning/8', icon: Clock },
  jatuh_tempo: { label: 'Jatuh Tempo', cls: 'text-error', bgCls: 'bg-error/8', icon: AlertCircle },
  menunggu_verifikasi: { label: 'Menunggu Verifikasi', cls: 'text-primary', bgCls: 'bg-primary/8', icon: Clock },
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AdminPembayaranPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PembayaranRecord[]>([]);
  const [search, setSearch] = useState('');
  const [detailItem, setDetailItem] = useState<PembayaranRecord | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isTagihanOpen, setIsTagihanOpen] = useState(false);
  const [mahasiswaList, setMahasiswaList] = useState<any[]>([]);
  const [tagihanForm, setTagihanForm] = useState({ mahasiswa_id: '', jenis: '', jumlah: '', tanggal_jatuh_tempo: '', keterangan: '' });
  const [savingTagihan, setSavingTagihan] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetchData<any[]>('admin_pembayaran').then(d => {
      setData(d && d.length > 0 ? mapApiData(d) : DEMO);
      setLoading(false);
    });
  };
  useEffect(() => { loadData(); }, []);

  const handleConfirm = async (id: string) => {
    if (!confirm('Konfirmasi pembayaran ini sebagai terverifikasi?')) return;
    const { error } = await updateData('pembayaran_verify', id, {});
    if (error) toast.error('Gagal: ' + error);
    else { toast.success('Pembayaran berhasil dikonfirmasi'); loadData(); }
  };

  const handleExportCSV = () => {
    exportToCSV(filtered, [
      { header: 'Nama Mahasiswa', accessor: r => r.mahasiswa_nama },
      { header: 'NIM', accessor: r => r.mahasiswa_nim },
      { header: 'Jenis Pembayaran', accessor: r => r.jenis },
      { header: 'Jumlah', accessor: r => r.jumlah },
      { header: 'Status', accessor: r => STATUS_CFG[r.status]?.label || r.status },
      { header: 'Jatuh Tempo', accessor: r => r.tanggal_jatuh_tempo },
      { header: 'Tanggal Bayar', accessor: r => r.tanggal_bayar || '-' },
      { header: 'Metode', accessor: r => r.metode_pembayaran || '-' },
    ], `pembayaran-${new Date().toISOString().split('T')[0]}`);
    toast.success('File CSV berhasil diunduh');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center space-y-3">
        <Loader2 className="w-7 h-7 animate-spin text-primary/40 mx-auto" />
        <p className="text-xs text-muted-foreground">Memuat data pembayaran...</p>
      </div>
    </div>
  );

  const filtered = data.filter(p =>
    !search || p.mahasiswa_nama.toLowerCase().includes(search.toLowerCase()) || p.mahasiswa_nim.toLowerCase().includes(search.toLowerCase())
  );

  const totalTagihan = data.reduce((a, p) => a + p.jumlah, 0);
  const totalLunas = data.filter(p => p.status === 'lunas').reduce((a, p) => a + p.jumlah, 0);
  const countLunas = data.filter(p => p.status === 'lunas').length;
  const countBelum = data.filter(p => p.status !== 'lunas').length;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Manajemen Pembayaran</h1>
            <p>Kelola tagihan dan pembayaran seluruh mahasiswa</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="btn-press text-xs h-9 shadow-sm" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5 mr-2" /> Export
            </Button>
            <Button variant="outline" className="btn-press text-xs h-9 shadow-sm" onClick={() => setIsImportOpen(true)}>
              <Upload className="w-3.5 h-3.5 mr-2" /> Import CSV
            </Button>
            <Button className="bg-primary btn-press text-xs h-9 shadow-sm" onClick={async () => {
              const mhs = await fetchData<any[]>('admin_mahasiswa');
              setMahasiswaList(mhs || []);
              setTagihanForm({ mahasiswa_id: '', jenis: '', jumlah: '', tanggal_jatuh_tempo: '', keterangan: '' });
              setIsTagihanOpen(true);
            }}>
              <Plus className="w-3.5 h-3.5 mr-2" /> Tambah Tagihan
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-interactive animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Total Tagihan</p>
                <p className="text-lg font-bold mt-1.5 tabular-nums">{formatCurrency(totalTagihan)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/8"><Wallet className="w-[18px] h-[18px] text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-interactive animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Sudah Diterima</p>
                <p className="text-lg font-bold mt-1.5 tabular-nums">{formatCurrency(totalLunas)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-success/8"><TrendingUp className="w-[18px] h-[18px] text-success" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-interactive animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Lunas</p>
                <p className="text-2xl font-bold mt-1.5 tabular-nums">{countLunas}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-success/8"><CheckCircle2 className="w-[18px] h-[18px] text-success" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-interactive animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Belum Lunas</p>
                <p className="text-2xl font-bold mt-1.5 tabular-nums">{countBelum}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-error/8"><XCircle className="w-[18px] h-[18px] text-error" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari nama atau NIM mahasiswa..." className="pl-10 h-10 text-sm bg-muted/30" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Banknote className="w-4 h-4 text-muted-foreground" /> Daftar Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Mahasiswa</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Jenis</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider">Jumlah</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Jatuh Tempo</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Metode</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">Tidak ada data ditemukan</TableCell></TableRow>
                )}
                {filtered.map(p => {
                  const cfg = STATUS_CFG[p.status] || STATUS_CFG.belum_lunas;
                  const StatusIcon = cfg.icon;
                  return (
                    <TableRow key={p.id} className="hover:bg-accent/50">
                      <TableCell className="py-3.5">
                        <p className="text-[13px] font-semibold">{p.mahasiswa_nama}</p>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{p.mahasiswa_nim}</p>
                      </TableCell>
                      <TableCell className="text-[13px]">{p.jenis}</TableCell>
                      <TableCell className="text-right text-[13px] font-semibold tabular-nums">{formatCurrency(p.jumlah)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md ${cfg.cls} ${cfg.bgCls}`}>
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {new Date(p.tanggal_jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{p.metode_pembayaran || '—'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 outline-none"><MoreHorizontal className="w-4 h-4" /></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-[13px] cursor-pointer py-2" onClick={() => setDetailItem(p)}><Eye className="w-3.5 h-3.5 mr-2" /> Detail</DropdownMenuItem>
                            <DropdownMenuItem className="text-[13px] cursor-pointer py-2" onClick={() => handleConfirm(p.id)}><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Konfirmasi</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4 text-muted-foreground" /> Detail Pembayaran</DialogTitle>
          </DialogHeader>
          {detailItem && (() => {
            const cfg = STATUS_CFG[detailItem.status] || STATUS_CFG.belum_lunas;
            const StatusIcon = cfg.icon;
            return (
              <div className="space-y-5 pt-2">
                {/* Status banner */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${cfg.bgCls} ${cfg.cls}`}>
                  <StatusIcon className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-semibold">{cfg.label}</p>
                    <p className="text-xs opacity-70">Status pembayaran saat ini</p>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Mahasiswa</p>
                    <p className="text-sm font-semibold">{detailItem.mahasiswa_nama}</p>
                    <p className="text-xs text-muted-foreground font-mono">{detailItem.mahasiswa_nim}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Jenis Pembayaran</p>
                    <p className="text-sm font-semibold">{detailItem.jenis}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Jumlah</p>
                    <p className="text-lg font-bold text-primary tabular-nums">{formatCurrency(detailItem.jumlah)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Jatuh Tempo</p>
                    <p className="text-sm font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" />{formatDate(detailItem.tanggal_jatuh_tempo)}</p>
                  </div>
                  {detailItem.tanggal_bayar && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Tanggal Bayar</p>
                      <p className="text-sm font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" />{formatDate(detailItem.tanggal_bayar)}</p>
                    </div>
                  )}
                  {detailItem.metode_pembayaran && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Metode Pembayaran</p>
                      <p className="text-sm font-medium flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-muted-foreground" />{detailItem.metode_pembayaran}</p>
                    </div>
                  )}
                </div>

                {/* Bukti Pembayaran */}
                {detailItem.bukti_pembayaran_url && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Bukti Pembayaran</p>
                    <img src={detailItem.bukti_pembayaran_url} alt="Bukti Pembayaran" className="w-full rounded-xl border border-border max-h-[300px] object-contain bg-muted/20" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => setDetailItem(null)}>Tutup</Button>
                  {detailItem.status !== 'lunas' && (
                    <Button size="sm" className="bg-primary" onClick={() => { handleConfirm(detailItem.id); setDetailItem(null); }}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Konfirmasi Lunas
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Tambah Tagihan Manual */}
      <Dialog open={isTagihanOpen} onOpenChange={setIsTagihanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Tambah Tagihan</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 pt-2" onSubmit={async (e) => {
            e.preventDefault();
            if (!tagihanForm.mahasiswa_id || !tagihanForm.jenis || !tagihanForm.jumlah || !tagihanForm.tanggal_jatuh_tempo) {
              toast.error('Semua field wajib diisi');
              return;
            }
            setSavingTagihan(true);
            const { error } = await createData('tambah_tagihan', tagihanForm);
            setSavingTagihan(false);
            if (error) { toast.error('Gagal: ' + error); }
            else { toast.success('Tagihan berhasil dibuat'); setIsTagihanOpen(false); loadData(); }
          }}>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Mahasiswa *</Label>
              <Select value={tagihanForm.mahasiswa_id} onValueChange={v => setTagihanForm(p => ({ ...p, mahasiswa_id: v || '' }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Pilih mahasiswa..." />
                </SelectTrigger>
                <SelectContent>
                  {mahasiswaList.map((m: any) => (
                    <SelectItem key={m.id} value={m.id} className="text-sm">{m.nama_lengkap} ({m.nim || m.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Jenis Pembayaran *</Label>
              <Input placeholder="Contoh: SPP Semester 1" className="h-9 text-sm" value={tagihanForm.jenis} onChange={e => setTagihanForm(p => ({ ...p, jenis: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Jumlah (Rp) *</Label>
                <Input type="number" placeholder="15000000" className="h-9 text-sm" value={tagihanForm.jumlah} onChange={e => setTagihanForm(p => ({ ...p, jumlah: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Jatuh Tempo *</Label>
                <Input type="date" className="h-9 text-sm" value={tagihanForm.tanggal_jatuh_tempo} onChange={e => setTagihanForm(p => ({ ...p, tanggal_jatuh_tempo: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Keterangan (opsional)</Label>
              <Input placeholder="Catatan tambahan..." className="h-9 text-sm" value={tagihanForm.keterangan} onChange={e => setTagihanForm(p => ({ ...p, keterangan: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTagihanOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary" disabled={savingTagihan}>
                {savingTagihan ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                Buat Tagihan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV Import Modal */}
      <UploadCSVModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        title="Import Tagihan Massal"
        description="Upload file CSV berisi tagihan pembayaran. Sistem akan mencari mahasiswa berdasarkan NIM secara otomatis."
        targetFields={PEMBAYARAN_FIELDS}
        onImport={async (data) => {
          const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ type: 'bulk_import_pembayaran', data: { rows: data } }),
          });
          const result = await res.json();
          if (result.success > 0) loadData();
          return result;
        }}
      />
    </div>
  );
}
