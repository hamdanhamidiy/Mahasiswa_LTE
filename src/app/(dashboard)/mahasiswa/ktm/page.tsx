'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { KTMCard } from '@/components/shared/KTMCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, CreditCard, Loader2 } from 'lucide-react';
import { getProgramLabel, getJurusanLabel, formatDate } from '@/lib/utils/helpers';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function KTMPage() {
  const { user } = useAppStore();
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const ktmRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!ktmRef.current) return;
    try {
      setDownloadingPng(true);
      const canvas = await html2canvas(ktmRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `KTM_${user?.nim || 'Digital'}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to download PNG', error);
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!ktmRef.current) return;
    try {
      setDownloadingPdf(true);
      const canvas = await html2canvas(ktmRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`KTM_${user?.nim || 'Digital'}.pdf`);
    } catch (error) {
      console.error('Failed to download PDF', error);
    } finally {
      setDownloadingPdf(false);
    }
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
          <div ref={ktmRef} className="rounded-xl w-fit shadow-xl">
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
          <div className="flex gap-3">
            <Button onClick={handleDownloadPNG} disabled={downloadingPng} className="bg-primary hover:bg-primary/90 btn-press">
              {downloadingPng ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} 
              Unduh PNG
            </Button>
            <Button onClick={handleDownloadPDF} disabled={downloadingPdf} variant="outline" className="btn-press">
              {downloadingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />} 
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
