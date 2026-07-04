'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/validations/schemas';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Anchor, Eye, EyeOff, LogIn, Loader2, GraduationCap, Globe, Award } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    { text: 'LTE Cruise memberikan pengalaman belajar yang luar biasa. Sekarang saya bekerja di Royal Caribbean!', name: 'Dewi A.', role: 'Cabin Steward, Royal Caribbean', year: 'Alumni 2022' },
    { text: 'Dari Pare ke Dubai! Terima kasih LTE Cruise atas bimbingan dan pelatihan yang profesional.', name: 'Rudi H.', role: 'F&B Service, Hilton Dubai', year: 'Alumni 2023' },
    { text: 'Program OJT internasional membuka pintu karir global. The best decision I ever made!', name: 'Maya S.', role: 'Front Office, Four Seasons', year: 'Alumni 2023' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nim: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: lookupResult, error: lookupError } = await supabase
        .rpc('lookup_nim', { nim_input: data.nim });

      const userData = lookupResult?.[0];
      if (lookupError || !userData) {
        setError('NIM tidak ditemukan. Pastikan format NIM benar (LTE-YYYY-XXX).');
        setIsLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: data.password,
      });

      if (authError) {
        setError(`Login gagal: ${authError.message}`);
        setIsLoading(false);
        return;
      }

      const roleRoutes: Record<string, string> = {
        mahasiswa: '/mahasiswa/dashboard',
        instruktur: '/instruktur/dashboard',
        admin: '/admin/dashboard',
        headmaster: '/headmaster/dashboard',
      };
      window.location.href = roleRoutes[userData.role] || '/mahasiswa/dashboard';
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-institutional-banner relative items-center justify-center p-12 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23fff' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }} />

        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-gold/5 rounded-full blur-3xl" />

        {/* Wave decoration */}
        <div className="wave-decoration" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shadow-lg shadow-black/10 animate-float">
              <Anchor className="w-10 h-10 text-white/80" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">LTE CRUISE</h1>
          <p className="text-[9px] text-white/25 font-semibold mt-2 tracking-[0.3em] uppercase">Leading Tourism Education</p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-2.5">
            {[
              { value: '500+', label: 'Alumni', icon: GraduationCap },
              { value: '12+', label: 'Negara', icon: Globe },
              { value: '96%', label: 'Tersalurkan', icon: Award },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] group cursor-default">
                <stat.icon className="w-3.5 h-3.5 text-white/20 mx-auto mb-1.5" />
                <p className="text-lg font-bold text-white/80 tabular-nums">{stat.value}</p>
                <p className="text-[8px] text-white/25 mt-0.5 uppercase tracking-[0.15em] font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-8 rounded-xl bg-white/[0.04] border border-white/[0.06] p-5 min-h-[110px] flex flex-col justify-center">
            <div key={currentTestimonial} className="animate-fade-in">
              <p className="text-white/45 text-[13px] leading-relaxed italic">
                &ldquo;{testimonials[currentTestimonial].text}&rdquo;
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white/50">
                  {testimonials[currentTestimonial].name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-white/40 font-medium">{testimonials[currentTestimonial].name}</p>
                  <p className="text-[8px] text-white/20">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrentTestimonial(i)} className={`h-1 rounded-full transition-all duration-300 ${i === currentTestimonial ? 'bg-white/40 w-4' : 'bg-white/10 w-1 hover:bg-white/20'}`} />
              ))}
            </div>
          </div>

          {/* Bottom info */}
          <div className="mt-10 space-y-1 text-white/20 text-[9px]">
            <p className="font-semibold text-white/25">Sekolah Perhotelan & Kapal Pesiar</p>
            <p>Kampung Inggris, Pare — Kediri</p>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-10 bg-background relative">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.012]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="w-full max-w-[400px] space-y-7 animate-fade-in relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <div className="inline-flex w-14 h-14 rounded-xl bg-primary items-center justify-center mb-3 shadow-lg shadow-primary/20">
              <Anchor className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary tracking-tight">LTE CRUISE</h1>
            <p className="text-[9px] text-muted-foreground mt-1 tracking-[0.2em] uppercase font-semibold">Academic Information System</p>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Masuk ke Sistem</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sistem Informasi Akademik LTE Cruise</p>
          </div>

          <Card className="border border-border shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nim" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">NIM (Nomor Induk Mahasiswa)</Label>
                  <Input
                    id="nim"
                    placeholder="LTE-2024-001"
                    className="h-10 text-sm"
                    {...register('nim')}
                    disabled={isLoading}
                  />
                  {errors.nim && <p className="text-[11px] text-error font-medium mt-0.5">{errors.nim.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                    <button type="button" className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors">Lupa Password?</button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      className="h-10 text-sm pr-10"
                      {...register('password')}
                      disabled={isLoading}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] text-error font-medium mt-0.5">{errors.password.message}</p>}
                </div>

                {error && (
                  <div className="bg-error/5 border border-error/10 rounded-lg p-3">
                    <p className="text-[12px] text-error font-medium">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full h-10 text-xs font-semibold bg-primary hover:bg-primary/90 btn-press shadow-sm uppercase tracking-wider" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</> : <><LogIn className="w-4 h-4 mr-2" /> Masuk</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-1">
            <p className="text-[9px] text-muted-foreground font-semibold tracking-wider uppercase">LTE Cruise AIS v1.0</p>
            <p className="text-[9px] text-muted-foreground/40">Jl. Pancawarna, Perumahan Oasis Cluster, Tulungrejo, Pare, Kab. Kediri</p>
            <div className="flex items-center justify-center gap-3 text-[9px] text-muted-foreground/40">
              <a href="https://ltecruise.sch.id" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">ltecruise.sch.id</a>
              <span className="opacity-30">•</span>
              <a href="mailto:ltecruise@gmail.com" className="hover:text-primary transition-colors">ltecruise@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
