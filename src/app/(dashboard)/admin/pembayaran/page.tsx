'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Wallet, CheckCircle2, Clock, AlertCircle, XCircle,
  Search, Download, Loader2, Users, TrendingUp,
  Banknote, MoreHorizontal, Eye,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PembayaranRecord {
  id: string;
  mahasiswa_nama: string;
  mahasiswa_nim: string;
  jenis: string;
  jumlah: number;
  status: 'lunas' | 'belum_lunas' | 'cicilan' | 'jatuh_tempo';
  tanggal_bayar: string | null;
  tanggal_jatuh_tempo: string;
  metode_pembayaran: string | null;
}

// Demo data
const DEMO: PembayaranRecord[] = [
  { id: '1', mahasiswa_nama: 'Ahmad Rizki Pratama', mahasiswa_nim: 'LTE-2025-001', jenis: 'SPP Semester 1', jumlah: 15000000, status: 'lunas', tanggal_bayar: '2025-01-20', tanggal_jatuh_tempo: '2025-01-15', metode_pembayaran: 'Transfer BCA' },
  { id: '2', mahasiswa_nama: 'Siti Nurhaliza', mahasiswa_nim: 'LTE-2025-002', jenis: 'SPP Semester 1', jumlah: 15000000, status: 'lunas', tanggal_bayar: '2025-01-12', tanggal_jatuh_tempo: '2025-01-15', metode_pembayaran: 'Transfer BRI' },
  { id: '3', mahasiswa_nama: 'Budi Santoso', mahasiswa_nim: 'LTE-2025-003', jenis: 'SPP Semester 1', jumlah: 15000000, status: 'cicilan', tanggal_bayar: null, tanggal_jatuh_tempo: '2025-01-15', metode_pembayaran: null },
  { id: '4', mahasiswa_nama: 'Dewi Lestari', mahasiswa_nim: 'LTE-2025-004', jenis: 'SPP Semester 1', jumlah: 15000000, status: 'belum_lunas', tanggal_bayar: null, tanggal_jatuh_tempo: '2025-01-15', metode_pembayaran: null },
  { id: '5', mahasiswa_nama: 'Ahmad Rizki Pratama', mahasiswa_nim: 'LTE-2025-001', jenis: 'Biaya Seragam', jumlah: 2500000, status: 'lunas', tanggal_bayar: '2025-01-10', tanggal_jatuh_tempo: '2025-02-01', metode_pembayaran: 'Cash' },
  { id: '6', mahasiswa_nama: 'Rina Wulandari', mahasiswa_nim: 'LTE-2025-005', jenis: 'SPP Semester 1', jumlah: 15000000, status: 'jatuh_tempo', tanggal_bayar: null, tanggal_jatuh_tempo: '2025-01-15', metode_pembayaran: null },
  { id: '7', mahasiswa_nama: 'Fajar Nugroho', mahasiswa_nim: 'LTE-2025-006', jenis: 'Biaya Praktik', jumlah: 3000000, status: 'lunas', tanggal_bayar: '2025-02-05', tanggal_jatuh_tempo: '2025-03-01', metode_pembayaran: 'Transfer Mandiri' },
  { id: '8', mahasiswa_nama: 'Siti Nurhaliza', mahasiswa_nim: 'LTE-2025-002', jenis: 'Biaya Seragam', jumlah: 2500000, status: 'belum_lunas', tanggal_bayar: null, tanggal_jatuh_tempo: '2025-02-01', metode_pembayaran: null },
];

const STATUS_CFG: Record<string, { label: string; cls: string; bgCls: string; icon: typeof CheckCircle2 }> = {
  lunas: { label: 'Lunas', cls: 'text-success', bgCls: 'bg-success/8', icon: CheckCircle2 },
  belum_lunas: { label: 'Belum Lunas', cls: 'text-error', bgCls: 'bg-error/8', icon: XCircle },
  cicilan: { label: 'Cicilan', cls: 'text-warning', bgCls: 'bg-warning/8', icon: Clock },
  jatuh_tempo: { label: 'Jatuh Tempo', cls: 'text-error', bgCls: 'bg-error/8', icon: AlertCircle },
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export default function AdminPembayaranPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PembayaranRecord[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData<PembayaranRecord[]>('admin_pembayaran').then(d => {
      setData(d && d.length > 0 ? d : DEMO);
      setLoading(false);
    });
  }, []);

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
          <Button variant="outline" className="btn-press text-xs h-9 shadow-sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Export Excel
          </Button>
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
                            <DropdownMenuItem className="text-[13px] cursor-pointer py-2"><Eye className="w-3.5 h-3.5 mr-2" /> Detail</DropdownMenuItem>
                            <DropdownMenuItem className="text-[13px] cursor-pointer py-2"><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Konfirmasi</DropdownMenuItem>
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
    </div>
  );
}
