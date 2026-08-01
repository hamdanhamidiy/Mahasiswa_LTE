'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { fetchData, createData } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Wallet, CheckCircle2, Clock, AlertCircle, Calendar,
  Receipt, Download, CreditCard, Loader2, Banknote,
  XCircle, Info, Upload, Image as ImageIcon, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/export';

interface PembayaranItem {
  id: string;
  jenis: string;
  jumlah: number;
  status: 'lunas' | 'belum_lunas' | 'cicilan' | 'jatuh_tempo' | 'menunggu_verifikasi';
  tanggal_bayar: string | null;
  tanggal_jatuh_tempo: string;
  metode_pembayaran: string | null;
  keterangan: string | null;
  bukti_pembayaran_url: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof CheckCircle2 }> = {
  lunas: { label: 'Lunas', color: 'text-success', bgColor: 'bg-success/8', borderColor: 'border-success/15', icon: CheckCircle2 },
  belum_lunas: { label: 'Belum Lunas', color: 'text-error', bgColor: 'bg-error/8', borderColor: 'border-error/15', icon: XCircle },
  cicilan: { label: 'Cicilan', color: 'text-warning', bgColor: 'bg-warning/8', borderColor: 'border-warning/15', icon: Clock },
  jatuh_tempo: { label: 'Jatuh Tempo', color: 'text-error', bgColor: 'bg-error/8', borderColor: 'border-error/15', icon: AlertCircle },
  menunggu_verifikasi: { label: 'Menunggu Verifikasi', color: 'text-primary', bgColor: 'bg-primary/8', borderColor: 'border-primary/15', icon: Clock },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PembayaranPage() {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PembayaranItem[]>([]);
  const [payItem, setPayItem] = useState<PembayaranItem | null>(null);
  const [buktiItem, setBuktiItem] = useState<PembayaranItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData<PembayaranItem[]>('pembayaran').then(d => { setData(d || []); setLoading(false); });
  }, []);

  const handleExportCSV = () => {
    exportToCSV(data, [
      { header: 'Jenis Pembayaran', accessor: p => p.jenis },
      { header: 'Jumlah', accessor: p => p.jumlah },
      { header: 'Status', accessor: p => STATUS_CONFIG[p.status]?.label || p.status },
      { header: 'Jatuh Tempo', accessor: p => p.tanggal_jatuh_tempo },
      { header: 'Tanggal Bayar', accessor: p => p.tanggal_bayar || '-' },
      { header: 'Metode', accessor: p => p.metode_pembayaran || '-' },
    ], `riwayat-pembayaran-${new Date().toISOString().split('T')[0]}`);
    toast.success('Riwayat pembayaran berhasil diunduh');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran file maksimal 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadBukti = async () => {
    if (!payItem || !previewUrl) return;
    setUploading(true);
    try {
      const base64 = previewUrl.split(',')[1];
      const mimeType = previewUrl.split(';')[0].split(':')[1];
      const { error } = await createData('upload_bukti_pembayaran', {
        pembayaran_id: payItem.id, base64, mimeType,
      });
      if (error) { toast.error('Gagal mengupload: ' + error); }
      else {
        toast.success('Bukti pembayaran berhasil dikirim! Menunggu verifikasi admin.');
        setData(prev => prev.map(p => p.id === payItem.id ? { ...p, status: 'menunggu_verifikasi' as const, bukti_pembayaran_url: previewUrl } : p));
        setPayItem(null); setPreviewUrl(null);
      }
    } catch { toast.error('Terjadi kesalahan'); }
    finally { setUploading(false); }
  };

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
          <Button variant="outline" className="btn-press text-xs h-9 shadow-sm" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5 mr-2" /> Unduh Riwayat
          </Button>
        </div>
      </div>

      {/* Summary Banner */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#2563eb] p-6 sm:p-7 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/[0.08] shrink-0">
                <Wallet className="w-7 h-7 text-white/70" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-[0.18em] mb-1.5">Total Tagihan</p>
                <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight">{formatCurrency(totalTagihan)}</p>
                <div className="flex items-center gap-3 mt-2.5">
                  <Badge variant="outline" className="border-white/15 text-white/55 text-[10px] bg-white/[0.05]">{user?.nama_lengkap}</Badge>
                  <Badge variant="outline" className="border-white/15 text-white/55 text-[10px] bg-white/[0.05] font-mono">{user?.nim}</Badge>
                </div>
              </div>
            </div>
            <div className="lg:w-80">
              <div className="flex items-center justify-between text-[11px] mb-2.5">
                <span className="text-white/40 font-medium">Progress Pembayaran</span>
                <span className="text-white/65 font-bold tabular-nums">{progressPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-white/20 via-white/40 to-white/55 transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }} />
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
          const isOverdue = p.status !== 'lunas' && p.status !== 'menunggu_verifikasi' && new Date(p.tanggal_jatuh_tempo) < new Date();

          return (
            <Card key={p.id} className={`border shadow-sm card-interactive overflow-hidden animate-slide-up ${isOverdue ? 'border-error/20 bg-error/[0.02]' : 'border-border'}`}>
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-xl ${cfg.bgColor} shrink-0`}>
                      <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <Badge variant="outline" className={`text-[10px] font-semibold ${cfg.color} ${cfg.borderColor}`}>{cfg.label}</Badge>
                        {isOverdue && (
                          <Badge variant="outline" className="text-[10px] font-semibold text-error border-error/20">
                            <AlertCircle className="w-3 h-3 mr-1" /> Lewat Jatuh Tempo
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-[15px] font-semibold">{p.jenis}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[12px] text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Jatuh tempo: {formatDate(p.tanggal_jatuh_tempo)}</span>
                        {p.tanggal_bayar && <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" />Dibayar: {formatDate(p.tanggal_bayar)}</span>}
                        {p.metode_pembayaran && <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />{p.metode_pembayaran}</span>}
                      </div>
                      {p.keterangan && (
                        <p className="text-[12px] text-muted-foreground/60 mt-2 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />{p.keterangan}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 sm:ml-4">
                    <p className="text-xl font-bold tabular-nums tracking-tight">{formatCurrency(p.jumlah)}</p>
                    {p.status !== 'lunas' && p.status !== 'menunggu_verifikasi' && (
                      <Button size="sm" className="mt-3 bg-primary hover:bg-primary/90 btn-press text-[12px] h-9 px-4 shadow-sm" onClick={() => { setPayItem(p); setPreviewUrl(null); }}>
                        <Banknote className="w-3.5 h-3.5 mr-1.5" /> Bayar
                      </Button>
                    )}
                    {p.status === 'menunggu_verifikasi' && (
                      <Badge variant="outline" className="mt-3 text-[11px] text-primary border-primary/20">Menunggu Verifikasi</Badge>
                    )}
                    {p.status === 'lunas' && p.bukti_pembayaran_url && (
                      <Button variant="ghost" size="sm" className="mt-3 text-[12px] h-9 text-primary" onClick={() => setBuktiItem(p)}>
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
            <div className="p-2 rounded-lg bg-primary/8 shrink-0"><Info className="w-4 h-4 text-primary" /></div>
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

      {/* Modal Bayar — Upload Bukti */}
      <Dialog open={!!payItem} onOpenChange={(open) => { if (!open) { setPayItem(null); setPreviewUrl(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2"><Upload className="w-4 h-4 text-primary" /> Upload Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          {payItem && (
            <div className="space-y-5 pt-2">
              {/* Payment info */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                <p className="text-sm font-semibold">{payItem.jenis}</p>
                <p className="text-lg font-bold text-primary tabular-nums">{formatCurrency(payItem.jumlah)}</p>
                <p className="text-xs text-muted-foreground">Jatuh tempo: {formatDate(payItem.tanggal_jatuh_tempo)}</p>
              </div>

              {/* Upload area */}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Bukti" className="w-full rounded-xl border border-border max-h-[300px] object-contain bg-muted/20" />
                  <Button variant="outline" size="sm" className="absolute top-2 right-2 h-7 text-xs" onClick={() => { setPreviewUrl(null); if (fileRef.current) fileRef.current.value = ''; }}>
                    <X className="w-3 h-3 mr-1" /> Ganti
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImageIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">Klik untuk memilih foto bukti pembayaran</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Format: JPG, PNG • Maks: 5MB</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => { setPayItem(null); setPreviewUrl(null); }}>Batal</Button>
                <Button size="sm" className="bg-primary" onClick={handleUploadBukti} disabled={!previewUrl || uploading}>
                  {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />}
                  {uploading ? 'Mengirim...' : 'Kirim Bukti'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Bukti Pembayaran */}
      <Dialog open={!!buktiItem} onOpenChange={(open) => !open && setBuktiItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4 text-success" /> Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          {buktiItem && (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <p className="text-sm font-semibold">{buktiItem.jenis}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(buktiItem.jumlah)} • Dibayar: {buktiItem.tanggal_bayar ? formatDate(buktiItem.tanggal_bayar) : '-'}</p>
              </div>
              {buktiItem.bukti_pembayaran_url && (
                <img src={buktiItem.bukti_pembayaran_url} alt="Bukti Pembayaran" className="w-full rounded-xl border border-border max-h-[400px] object-contain bg-muted/20" />
              )}
              <Button variant="outline" className="w-full" onClick={() => setBuktiItem(null)}>Tutup</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
