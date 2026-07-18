'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { KTMCard } from '@/components/shared/KTMCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, CreditCard, Loader2 } from 'lucide-react';
import { getProgramLabel, getJurusanLabel, formatDate } from '@/lib/utils/helpers';
import * as htmlToImage from 'html-to-image';

export default function KTMPage() {
  const { user } = useAppStore();
  const [downloadingPng, setDownloadingPng] = useState(false);
  const ktmRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!ktmRef.current) return;
    try {
      setDownloadingPng(true);
      const dataUrl = await htmlToImage.toPng(ktmRef.current, {
        quality: 1,
        pixelRatio: 3,
        style: { transform: 'scale(1)', margin: '0' }
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `KTM_${user?.nim || 'Digital'}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to download PNG', error);
      alert('Gagal mengunduh gambar. Silakan coba lagi.');
    } finally {
      setDownloadingPng(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div>
          <h1>KTM Digital</h1>
          <p>Kartu Tanda Mahasiswa digital Anda</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col items-center gap-5">
          <div ref={ktmRef} className="p-1">
            <div className="rounded-xl w-[360px] h-[227px] sm:w-[400px] sm:h-[252px] shadow-xl overflow-hidden flex items-stretch">
              <KTMCard
                nama={user?.nama_lengkap || 'Nama Mahasiswa'}
                nim={user?.nim || 'LTE-2025-001'}
              program={user?.program ? getProgramLabel(user.program) : 'Diploma 1 (D1)'}
              jurusan={user?.jurusan ? getJurusanLabel(user.jurusan) : 'Housekeeping'}
              angkatan={user?.angkatan || 'Angkatan 25'}
              periodeBerlaku={user?.periode_masuk ? formatDate(
                new Date(new Date(user.periode_masuk).setFullYear(
                  new Date(user.periode_masuk).getFullYear() + 1
                )).toISOString()
              ) : '13 Januari 2026'}
              fotoUrl={user?.avatar_url || undefined}
              isActive={user?.status_aktif ?? true}
            />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleDownloadPNG} disabled={downloadingPng} className="bg-primary hover:bg-primary/90 btn-press">
              {downloadingPng ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} 
              Unduh PNG
            </Button>
            <Button onClick={handlePrintPDF} variant="outline" className="btn-press">
              <Printer className="w-4 h-4 mr-2" /> 
              Cetak PDF
            </Button>
          </div>
        </div>

        <Card className="border border-border/60 shadow-none">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" /> Informasi KTM
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-0 text-sm">
              {[
                { label: 'Status', value: user?.status_aktif ? 'Aktif' : 'Nonaktif', cls: user?.status_aktif ? 'text-success font-medium' : 'text-error' },
                { label: 'NIM', value: user?.nim, cls: 'font-mono' },
                { label: 'Program', value: user?.program ? getProgramLabel(user.program) : '—' },
                { label: 'Jurusan', value: user?.jurusan ? getJurusanLabel(user.jurusan) : '—' },
                { label: 'Diterbitkan', value: user?.periode_masuk ? formatDate(user.periode_masuk) : '—' },
                { label: 'Berlaku Sampai', value: '1 tahun sejak diterbitkan' },
              ].map((r, i) => (
                <div key={i} className="flex justify-between py-2.5 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground text-xs">{r.label}</span>
                  <span className={`text-xs ${r.cls || ''}`}>{r.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-muted/40 p-3.5 rounded-lg text-[11px] text-muted-foreground space-y-1.5 mt-4">
              <p className="font-medium text-foreground text-xs">Catatan</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>QR Code berisi data terenkripsi</li>
                <li>Dapat diverifikasi menggunakan scanner resmi</li>
                <li>Simpan gambar KTM di HP untuk ditunjukkan saat diperlukan</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
