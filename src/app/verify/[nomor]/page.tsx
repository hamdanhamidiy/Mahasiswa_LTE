import { Ship, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VerifyPageProps {
  params: Promise<{ nomor: string }>;
}

export default async function VerifySertifikatPage({ params }: VerifyPageProps) {
  const { nomor } = await params;
  // URL format: LTE-CERT-2024-001 → internal: LTE/CERT/2024/001
  const nomorFormatted = decodeURIComponent(nomor).replace(/-/g, '/');

  // In production, query Supabase with service role key
  // const supabase = createServiceRoleClient();
  // const { data } = await supabase.from('sertifikat_alumni').select('*, users(*)').eq('nomor_sertifikat', nomorFormatted).single();

  // Demo data
  const isValid = nomorFormatted.startsWith('LTE/CERT/');
  const sertifikat = isValid ? {
    nomor_sertifikat: nomorFormatted,
    nama: 'Rina Maharani',
    jurusan: 'Housekeeping',
    program: 'Diploma 1 (D1)',
    tanggal_lulus: '15 Desember 2024',
    predikat: 'Sangat Memuaskan',
    ipk_akhir: 3.67,
  } : null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4 shadow-lg">
            <Ship className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Verifikasi Sertifikat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            LTE Cruise — Leading Tourism Education
          </p>
        </div>

        {/* Result */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {sertifikat ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-success">Sertifikat Valid</p>
                    <p className="text-xs text-success/70">Sertifikat ini terdaftar dan diakui</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nomor Sertifikat</span>
                    <span className="font-mono font-semibold">{sertifikat.nomor_sertifikat}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nama</span>
                    <span className="font-semibold">{sertifikat.nama}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Program</span>
                    <span>{sertifikat.program}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Jurusan</span>
                    <span>{sertifikat.jurusan}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tanggal Lulus</span>
                    <span>{sertifikat.tanggal_lulus}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Predikat</span>
                    <Badge className="bg-primary/10 text-primary border-primary/20">{sertifikat.predikat}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <XCircle className="w-12 h-12 text-error mx-auto mb-3" />
                <p className="text-lg font-semibold text-error">Sertifikat Tidak Ditemukan</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Nomor sertifikat &ldquo;{nomorFormatted}&rdquo; tidak terdaftar dalam sistem.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          Diverifikasi oleh LTE Cruise Academic Information System
        </div>
      </div>
    </div>
  );
}
