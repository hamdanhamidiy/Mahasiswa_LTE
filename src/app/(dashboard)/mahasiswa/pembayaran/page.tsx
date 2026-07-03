'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Wallet, CheckCircle2, Clock, AlertCircle, Calendar,
  Receipt, Download, CreditCard, Loader2, Banknote,
  ArrowUpRight, XCircle, Info,
} from 'lucide-react';

interface PembayaranItem {
  id: string;
  jenis: string;
  jumlah: number;
  status: 'lunas' | 'belum_lunas' | 'cicilan' | 'jatuh_tempo';
  tanggal_bayar: string | null;
  tanggal_jatuh_tempo: string;
  metode_pembayaran: string | null;
  keterangan: string | null;
  bukti_pembayaran_url: string | null;
}

// Demo data for display when no data from API
const DEMO_DATA: PembayaranItem[] = [
  {
    id: '1',
    jenis: 'SPP Semester 1',
    jumlah: 15000000,
    status: 'lunas',
    tanggal_bayar: '2025-01-20T00:00:00Z',
    tanggal_jatuh_tempo: '2025-01-15T00:00:00Z',
    metode_pembayaran: 'Transfer Bank BCA',
    keterangan: 'Pembayaran penuh',
    bukti_pembayaran_url: null,
  },
  {
    id: '2',
    jenis: 'Biaya Seragam',
    jumlah: 2500000,
    status: 'lunas',
    tanggal_bayar: '2025-01-10T00:00:00Z',
    tanggal_jatuh_tempo: '2025-02-01T00:00:00Z',
    metode_pembayaran: 'Transfer Bank BRI',
    keterangan: '3 set seragam lengkap',
    bukti_pembayaran_url: null,
  },
  {
    id: '3',
    jenis: 'Biaya Praktik & Lab',
    jumlah: 3000000,
    status: 'cicilan',
    tanggal_bayar: null,
    tanggal_jatuh_tempo: '2025-03-15T00:00:00Z',
    metode_pembayaran: null,
    keterangan: 'Cicilan 2x — sudah bayar 50%',
    bukti_pembayaran_url: null,
  },
  {
    id: '4',
    jenis: 'Biaya Sertifikasi',
    jumlah: 1500000,
    status: 'belum_lunas',
    tanggal_bayar: null,
    tanggal_jatuh_tempo: '2025-06-01T00:00:00Z',
    metode_pembayaran: null,
    keterangan: 'Sertifikasi Housekeeping International',
    bukti_pembayaran_url: null,
  },
  {
    id: '5',
    jenis: 'Biaya Wisuda & Sertifikat',
    jumlah: 2000000,
    status: 'belum_lunas',
    tanggal_bayar: null,
    tanggal_jatuh_tempo: '2025-12-01T00:00:00Z',
    metode_pembayaran: null,
    keterangan: 'Termasuk foto wisuda',
    bukti_pembayaran_url: null,
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof CheckCircle2 }> = {
  lunas: { label: 'Lunas', color: 'text-success', bgColor: 'bg-success/8', borderColor: 'border-success/15', icon: CheckCircle2 },
  belum_lunas: { label: 'Belum Lunas', color: 'text-error', bgColor: 'bg-error/8', borderColor: 'border-error/15', icon: XCircle },
  cicilan: { label: 'Cicilan', color: 'text-warning', bgColor: 'bg-warning/8', borderColor: 'border-warning/15', icon: Clock },
  jatuh_tempo: { label: 'Jatuh Tempo', color: 'text-error', bgColor: 'bg-error/8', borderColor: 'border-error/15', icon: AlertCircle },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function PembayaranPage() {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PembayaranItem[]>([]);

  useEffect(() => {
    fetchData<PembayaranItem[]>('pembayaran').then(d => {
      if (d && d.length > 0) {
        setData(d);
      } else {
        // Use demo data when no API data
        setData(DEMO_DATA);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary/40 mx-auto" />
          <p className="text-xs text-muted-foreground">Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  const totalTagihan = data.reduce((a, p) => a + p.jumlah, 0);
  const totalLunas = data.filter(p => p.status === 'lunas').reduce((a, p) => a + p.jumlah, 0);
  const totalBelumBayar = totalTagihan - totalLunas;
  const progressPct = totalTagihan > 0 ? Math.round((totalLunas / totalTagihan) * 100) : 0;

  const countByStatus = {
    lunas: data.filter(p => p.status === 'lunas').length,
    belum_lunas: data.filter(p => p.status === 'belum_lunas').length,
    cicilan: data.filter(p => p.status === 'cicilan').length,
    jatuh_tempo: data.filter(p => p.status === 'jatuh_tempo').length,
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Pembayaran</h1>
            <p>Informasi tagihan dan riwayat pembayaran Anda</p>
          </div>
          <Button variant="outline" className="btn-press text-xs h-9 shadow-sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Unduh Riwayat
          </Button>
        </div>
      </div>

      {/* Summary Banner */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="bg-institutional-banner p-6 sm:p-7 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/[0.08] shrink-0">
                <Wallet className="w-7 h-7 text-white/70" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-[0.18em] mb-1.5">
                  Total Tagihan
                </p>
                <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight">
                  {formatCurrency(totalTagihan)}
                </p>
                <div className="flex items-center gap-3 mt-2.5">
                  <Badge variant="outline" className="border-white/15 text-white/55 text-[10px] bg-white/[0.05]">
                    {user?.nama_lengkap}
                  </Badge>
                  <Badge variant="outline" className="border-white/15 text-white/55 text-[10px] bg-white/[0.05] font-mono">
                    {user?.nim}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="lg:w-80">
              <div className="flex items-center justify-between text-[11px] mb-2.5">
                <span className="text-white/40 font-medium">Progress Pembayaran</span>
                <span className="text-white/65 font-bold tabular-nums">{progressPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-white/20 via-white/40 to-white/55 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2.5 text-[11px]">
                <span className="text-white/35">Lunas: {formatCurrency(totalLunas)}</span>
                <span className="text-white/35">Sisa: {formatCurrency(totalBelumBayar)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { key: 'lunas', label: 'Lunas', count: countByStatus.lunas, icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/8' },
          { key: 'belum_lunas', label: 'Belum Lunas', count: countByStatus.belum_lunas, icon: XCircle, color: 'text-error', bgColor: 'bg-error/8' },
          { key: 'cicilan', label: 'Cicilan', count: countByStatus.cicilan, icon: Clock, color: 'text-warning', bgColor: 'bg-warning/8' },
          { key: 'jatuh_tempo', label: 'Jatuh Tempo', count: countByStatus.jatuh_tempo, icon: AlertCircle, color: 'text-error', bgColor: 'bg-error/8' },
        ].map(s => (
          <Card key={s.key} className="border border-border shadow-sm card-interactive animate-slide-up">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold mt-1.5 tabular-nums">{s.count}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${s.bgColor}`}>
                  <s.icon className={`w-[18px] h-[18px] ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment List */}
      <div className="space-y-4 stagger-children">
        <h2 className="section-title">Daftar Tagihan</h2>

        {data.length === 0 && (
          <Card className="border border-border shadow-sm">
            <CardContent className="py-20 text-center">
              <Receipt className="w-14 h-14 mx-auto mb-4 text-muted-foreground/12" />
              <p className="text-sm text-muted-foreground font-medium">Belum ada data pembayaran</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Data pembayaran Anda akan muncul di sini</p>
            </CardContent>
          </Card>
        )}

        {data.map((p) => {
          const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.belum_lunas;
          const StatusIcon = cfg.icon;
          const isOverdue = p.status !== 'lunas' && new Date(p.tanggal_jatuh_tempo) < new Date();

          return (
            <Card
              key={p.id}
              className={`border shadow-sm card-interactive overflow-hidden animate-slide-up ${
                isOverdue ? 'border-error/20 bg-error/[0.02]' : 'border-border'
              }`}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-xl ${cfg.bgColor} shrink-0`}>
                      <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <Badge variant="outline" className={`text-[10px] font-semibold ${cfg.color} ${cfg.borderColor}`}>
                          {cfg.label}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="outline" className="text-[10px] font-semibold text-error border-error/20">
                            <AlertCircle className="w-3 h-3 mr-1" /> Lewat Jatuh Tempo
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-[15px] font-semibold">{p.jenis}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[12px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Jatuh tempo: {formatDate(p.tanggal_jatuh_tempo)}
                        </span>
                        {p.tanggal_bayar && (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            Dibayar: {formatDate(p.tanggal_bayar)}
                          </span>
                        )}
                        {p.metode_pembayaran && (
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5" />
                            {p.metode_pembayaran}
                          </span>
                        )}
                      </div>
                      {p.keterangan && (
                        <p className="text-[12px] text-muted-foreground/60 mt-2 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {p.keterangan}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 sm:ml-4">
                    <p className="text-xl font-bold tabular-nums tracking-tight">{formatCurrency(p.jumlah)}</p>
                    {p.status !== 'lunas' && (
                      <Button size="sm" className="mt-3 bg-primary hover:bg-primary/90 btn-press text-[12px] h-9 px-4 shadow-sm">
                        <Banknote className="w-3.5 h-3.5 mr-1.5" /> Bayar
                      </Button>
                    )}
                    {p.status === 'lunas' && p.bukti_pembayaran_url && (
                      <Button variant="ghost" size="sm" className="mt-3 text-[12px] h-9 text-primary">
                        <Receipt className="w-3.5 h-3.5 mr-1.5" /> Bukti
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Box */}
      <Card className="border border-primary/10 shadow-sm bg-primary/[0.02]">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-primary/8 shrink-0">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <div className="text-[13px] text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground text-sm">Informasi Pembayaran</p>
              <ul className="space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Pembayaran dapat dilakukan melalui transfer bank atau langsung ke kantor administrasi</li>
                <li>Upload bukti pembayaran melalui tombol &quot;Bayar&quot; pada tagihan terkait</li>
                <li>Konfirmasi pembayaran akan diproses dalam 1×24 jam kerja</li>
                <li>Hubungi admin jika ada pertanyaan terkait tagihan</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
