'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, School, Calendar, Shield, Loader2, GraduationCap, Heart, Shirt } from 'lucide-react';
import { getProgramLabel, getJurusanLabel, formatDate } from '@/lib/utils/helpers';

interface Profile { tempat_lahir: string | null; tanggal_lahir: string | null; jenis_kelamin: string | null; alamat_lengkap: string | null; kota_asal: string | null; provinsi_asal: string | null; no_hp: string | null; no_hp_darurat: string | null; nama_wali: string | null; hubungan_wali: string | null; no_hp_wali: string | null; asal_sekolah: string | null; tahun_lulus: number | null; ukuran_seragam: string | null; is_onboarded: boolean }

const Field = ({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ElementType }) => (
  <div className="data-field">
    <span className="data-label">{label}</span>
    <span className="data-value flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/40" />}
      {value || <span className="text-muted-foreground/40 italic text-xs">Belum diisi</span>}
    </span>
  </div>
);

export default function ProfilPage() {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => { fetchData<Profile>('profile').then(d => { if (d) setProfile(d); setLoading(false); }); }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  const initials = user?.nama_lengkap?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1>Profil Mahasiswa</h1>
        <p>Data pribadi dan informasi akademik Anda</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left Panel — Identity Card */}
        <Card className="border border-border shadow-none lg:col-span-1 overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f] to-[#2563eb]" />
          <CardContent className="pt-0 pb-5 text-center -mt-8">
            <Avatar className="w-16 h-16 mx-auto border-[3px] border-card shadow-sm">
              <AvatarFallback className="bg-primary text-white text-base font-bold">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="text-sm font-bold mt-2.5 tracking-tight">{user?.nama_lengkap}</h2>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{user?.nim}</p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
              <Badge variant="outline" className="text-[9px] font-medium">{user?.program ? getProgramLabel(user.program) : 'D1'}</Badge>
              <Badge variant="outline" className="text-[9px] font-medium">{user?.jurusan ? getJurusanLabel(user.jurusan) : '—'}</Badge>
            </div>

            {/* Quick info */}
            <div className="mt-4 space-y-2 text-left px-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px]">{user?.angkatan}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className={`text-[11px] font-semibold ${user?.status_aktif ? 'text-success' : 'text-error'}`}>
                  {user?.status_aktif ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div className="mt-4 pt-3 border-t border-border">
              <div className={`status-indicator mx-auto w-fit ${user?.status_aktif ? 'status-aktif' : 'status-nonaktif'}`}>
                {user?.status_aktif ? 'Status Mahasiswa Aktif' : 'Status Nonaktif'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel — Detail Data */}
        <div className="lg:col-span-2 space-y-4">
          {/* Data Akademik */}
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-0 px-5 pt-4">
              <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                <GraduationCap className="w-3.5 h-3.5" /> Data Akademik
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="data-grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <Field label="NIM" value={user?.nim} />
                <Field label="Program Studi" value={user?.program ? getProgramLabel(user.program) : null} />
                <Field label="Jurusan" value={user?.jurusan ? getJurusanLabel(user.jurusan) : null} />
                <Field label="Angkatan" value={user?.angkatan} />
                <Field label="Periode Masuk" value={user?.periode_masuk ? formatDate(user.periode_masuk) : null} />
                <Field label="Status" value={user?.status_aktif ? 'Aktif' : 'Nonaktif'} />
              </div>
            </CardContent>
          </Card>

          {/* Data Pribadi */}
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-0 px-5 pt-4">
              <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                <User className="w-3.5 h-3.5" /> Data Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="data-grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <Field label="Tempat Lahir" value={profile?.tempat_lahir} icon={MapPin} />
                <Field label="Tanggal Lahir" value={profile?.tanggal_lahir ? formatDate(profile.tanggal_lahir) : null} icon={Calendar} />
                <Field label="Jenis Kelamin" value={profile?.jenis_kelamin === 'L' ? 'Laki-laki' : profile?.jenis_kelamin === 'P' ? 'Perempuan' : null} />
                <Field label="No. HP" value={profile?.no_hp} icon={Phone} />
                <Field label="Kota Asal" value={profile?.kota_asal} icon={MapPin} />
                <Field label="Provinsi" value={profile?.provinsi_asal} />
                <Field label="Alamat Lengkap" value={profile?.alamat_lengkap} />
                <Field label="No. HP Darurat" value={profile?.no_hp_darurat} icon={Phone} />
              </div>
            </CardContent>
          </Card>

          {/* Wali & Pendidikan */}
          {profile && (
            <Card className="border border-border shadow-none">
              <CardHeader className="pb-0 px-5 pt-4">
                <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                  <Heart className="w-3.5 h-3.5" /> Data Wali & Pendidikan
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <div className="data-grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <Field label="Nama Wali" value={profile.nama_wali} />
                  <Field label="Hubungan" value={profile.hubungan_wali} />
                  <Field label="No. HP Wali" value={profile.no_hp_wali} icon={Phone} />
                  <Field label="Asal Sekolah" value={profile.asal_sekolah} icon={School} />
                  <Field label="Tahun Lulus" value={profile.tahun_lulus?.toString()} />
                  <Field label="Ukuran Seragam" value={profile.ukuran_seragam} icon={Shirt} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
