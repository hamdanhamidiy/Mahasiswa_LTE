'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Anchor, ChevronRight, ChevronLeft, CheckCircle2, Loader2, User, Users, GraduationCap } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const totalSteps = 3;

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

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.tempat_lahir) return 'Tempat lahir wajib diisi';
      if (!form.tanggal_lahir) return 'Tanggal lahir wajib diisi';
      if (!form.jenis_kelamin) return 'Jenis kelamin wajib dipilih';
      if (!form.no_hp || form.no_hp.length < 10) return 'No. HP minimal 10 digit';
      if (!form.alamat_lengkap || form.alamat_lengkap.length < 10) return 'Alamat lengkap minimal 10 karakter';
      if (!form.kota_asal) return 'Kota asal wajib diisi';
      if (!form.provinsi_asal) return 'Provinsi wajib diisi';
    }
    if (step === 2) {
      if (!form.nama_wali) return 'Nama wali wajib diisi';
      if (!form.hubungan_wali) return 'Hubungan wali wajib diisi';
      if (!form.no_hp_wali || form.no_hp_wali.length < 10) return 'No. HP wali minimal 10 digit';
      if (!form.asal_sekolah) return 'Asal sekolah wajib diisi';
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep(prev => Math.min(totalSteps, prev + 1));
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-xl bg-primary items-center justify-center mb-3 shadow-lg shadow-primary/20">
            <Anchor className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Selamat Datang di LTE Cruise! 🎉
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Lengkapi biodata untuk melanjutkan
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
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive ? 'bg-primary text-white shadow-sm shadow-primary/20' : isCompleted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{stepNum}</span>
                </div>
                {i < stepLabels.length - 1 && <div className={`w-6 h-px transition-colors duration-200 ${step > stepNum ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Langkah {step} dari {totalSteps}</span>
            <span className="tabular-nums">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-5 sm:p-6">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-sm font-semibold">Data Pribadi</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Tempat Lahir <span className="text-error">*</span></Label>
                    <Input placeholder="Surabaya" value={form.tempat_lahir} onChange={e => update('tempat_lahir', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Tanggal Lahir <span className="text-error">*</span></Label>
                    <Input type="date" value={form.tanggal_lahir} onChange={e => update('tanggal_lahir', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Jenis Kelamin <span className="text-error">*</span></Label>
                    <Select value={form.jenis_kelamin} onValueChange={v => update('jenis_kelamin', v ?? '')}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">No. HP <span className="text-error">*</span></Label>
                    <Input placeholder="081234567890" value={form.no_hp} onChange={e => update('no_hp', e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Alamat Lengkap <span className="text-error">*</span></Label>
                  <Textarea placeholder="Jl. ..." value={form.alamat_lengkap} onChange={e => update('alamat_lengkap', e.target.value)} className="text-sm" rows={3} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Kota Asal <span className="text-error">*</span></Label>
                    <Input placeholder="Surabaya" value={form.kota_asal} onChange={e => update('kota_asal', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Provinsi <span className="text-error">*</span></Label>
                    <Input placeholder="Jawa Timur" value={form.provinsi_asal} onChange={e => update('provinsi_asal', e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-sm font-semibold">Data Keluarga & Pendidikan</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Nama Wali <span className="text-error">*</span></Label>
                    <Input placeholder="Nama orang tua/wali" value={form.nama_wali} onChange={e => update('nama_wali', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Hubungan Wali <span className="text-error">*</span></Label>
                    <Input placeholder="Ayah/Ibu/dll" value={form.hubungan_wali} onChange={e => update('hubungan_wali', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">No. HP Wali <span className="text-error">*</span></Label>
                    <Input placeholder="081234567890" value={form.no_hp_wali} onChange={e => update('no_hp_wali', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">No. HP Darurat</Label>
                    <Input placeholder="081234567890" value={form.no_hp_darurat} onChange={e => update('no_hp_darurat', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Asal Sekolah <span className="text-error">*</span></Label>
                    <Input placeholder="SMAN 1 Surabaya" value={form.asal_sekolah} onChange={e => update('asal_sekolah', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Tahun Lulus</Label>
                    <Input type="number" placeholder="2024" value={form.tahun_lulus} onChange={e => update('tahun_lulus', e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-sm font-semibold">Motivasi & Ukuran Seragam</h2>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Motivasi Bergabung di LTE Cruise</Label>
                  <Textarea placeholder="Ceritakan motivasi kamu..." rows={4} value={form.motivasi_bergabung} onChange={e => update('motivasi_bergabung', e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ukuran Seragam</Label>
                  <Select value={form.ukuran_seragam} onValueChange={v => update('ukuran_seragam', v ?? '')}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Pilih ukuran" /></SelectTrigger>
                    <SelectContent>
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">Penting untuk persiapan OJT internasional</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-error/5 border border-error/10 rounded-lg p-3 mt-4">
                <p className="text-xs text-error font-medium">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-4 border-t border-border">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => { setError(''); setStep(Math.max(1, step - 1)); }} disabled={step === 1}>
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Sebelumnya
              </Button>
              {step < totalSteps ? (
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs" onClick={nextStep}>
                  Selanjutnya <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Menyimpan...</> : <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Selesai</>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
