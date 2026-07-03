'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, ChevronRight, ChevronLeft, CheckCircle2, Loader2, User, Users, GraduationCap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const totalSteps = 3;

  // Form state
  const [form, setForm] = useState({
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    no_hp: '',
    alamat_lengkap: '',
    kota_asal: '',
    provinsi_asal: '',
    nama_wali: '',
    hubungan_wali: '',
    no_hp_wali: '',
    no_hp_darurat: '',
    asal_sekolah: '',
    tahun_lulus: '',
    motivasi_bergabung: '',
    ukuran_seragam: '',
  });

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Sesi tidak ditemukan. Silakan login ulang.'); setIsSubmitting(false); return; }

      const { error: upsertError } = await supabase
        .from('mahasiswa_profile')
        .upsert({
          id: user.id,
          tempat_lahir: form.tempat_lahir,
          tanggal_lahir: form.tanggal_lahir || null,
          jenis_kelamin: form.jenis_kelamin || null,
          no_hp: form.no_hp,
          alamat_lengkap: form.alamat_lengkap,
          kota_asal: form.kota_asal,
          provinsi_asal: form.provinsi_asal,
          nama_wali: form.nama_wali,
          hubungan_wali: form.hubungan_wali,
          no_hp_wali: form.no_hp_wali,
          no_hp_darurat: form.no_hp_darurat,
          asal_sekolah: form.asal_sekolah,
          tahun_lulus: form.tahun_lulus ? parseInt(form.tahun_lulus) : null,
          motivasi_bergabung: form.motivasi_bergabung,
          ukuran_seragam: form.ukuran_seragam || null,
          is_onboarded: true,
        });

      if (upsertError) {
        setError(`Gagal menyimpan data: ${upsertError.message}`);
        setIsSubmitting(false);
        return;
      }

      router.push('/mahasiswa/dashboard');
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  const stepIcons = [User, Users, GraduationCap];
  const stepLabels = ['Data Pribadi', 'Keluarga & Pendidikan', 'Motivasi & Seragam'];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-xl bg-primary items-center justify-center mb-4">
            <Ship className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Selamat Datang di LTE Cruise! 🎉
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Lengkapi biodata kamu untuk melanjutkan
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {stepLabels.map((label, i) => {
            const StepIcon = stepIcons[i];
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive ? 'bg-primary text-white' : isCompleted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{stepNum}</span>
                </div>
                {i < stepLabels.length - 1 && <div className={`w-8 h-px ${step > stepNum ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Langkah {step} dari {totalSteps}</span>
            <span className="tabular-nums">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-1.5" />
        </div>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-base font-semibold">Data Pribadi</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tempat Lahir</Label>
                    <Input placeholder="Surabaya" value={form.tempat_lahir} onChange={e => update('tempat_lahir', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tanggal Lahir</Label>
                    <Input type="date" value={form.tanggal_lahir} onChange={e => update('tanggal_lahir', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Jenis Kelamin</Label>
                    <Select value={form.jenis_kelamin} onValueChange={v => update('jenis_kelamin', v ?? '')}>
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">No. HP</Label>
                    <Input placeholder="081234567890" value={form.no_hp} onChange={e => update('no_hp', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Alamat Lengkap</Label>
                  <Textarea placeholder="Jl. ..." value={form.alamat_lengkap} onChange={e => update('alamat_lengkap', e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Kota Asal</Label>
                    <Input placeholder="Surabaya" value={form.kota_asal} onChange={e => update('kota_asal', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Provinsi</Label>
                    <Input placeholder="Jawa Timur" value={form.provinsi_asal} onChange={e => update('provinsi_asal', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-base font-semibold">Data Keluarga & Pendidikan</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nama Wali</Label>
                    <Input placeholder="Nama orang tua/wali" value={form.nama_wali} onChange={e => update('nama_wali', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Hubungan Wali</Label>
                    <Input placeholder="Ayah/Ibu/dll" value={form.hubungan_wali} onChange={e => update('hubungan_wali', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">No. HP Wali</Label>
                    <Input placeholder="081234567890" value={form.no_hp_wali} onChange={e => update('no_hp_wali', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">No. HP Darurat</Label>
                    <Input placeholder="081234567890" value={form.no_hp_darurat} onChange={e => update('no_hp_darurat', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Asal Sekolah</Label>
                    <Input placeholder="SMAN 1 Surabaya" value={form.asal_sekolah} onChange={e => update('asal_sekolah', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tahun Lulus</Label>
                    <Input type="number" placeholder="2024" value={form.tahun_lulus} onChange={e => update('tahun_lulus', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-base font-semibold">Motivasi & Ukuran Seragam</h2>
                <div className="space-y-1.5">
                  <Label className="text-xs">Motivasi Bergabung di LTE Cruise</Label>
                  <Textarea placeholder="Ceritakan motivasi kamu..." rows={4} value={form.motivasi_bergabung} onChange={e => update('motivasi_bergabung', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Ukuran Seragam</Label>
                  <Select value={form.ukuran_seragam} onValueChange={v => update('ukuran_seragam', v ?? '')}>
                    <SelectTrigger><SelectValue placeholder="Pilih ukuran" /></SelectTrigger>
                    <SelectContent>
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Penting untuk persiapan OJT internasional</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-error/5 border border-error/10 rounded-lg p-3 mt-4">
                <p className="text-xs text-error">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button variant="outline" className="btn-press" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
              </Button>
              {step < totalSteps ? (
                <Button className="bg-primary hover:bg-primary/90 btn-press" onClick={() => setStep(step + 1)}>
                  Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button className="bg-primary hover:bg-primary/90 btn-press" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Selesai</>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
