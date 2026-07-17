'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { fetchData, updateData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, School, Calendar, Shield, Loader2, GraduationCap, Heart, Shirt, Edit2, Lock } from 'lucide-react';
import { getProgramLabel, getJurusanLabel, formatDate } from '@/lib/utils/helpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

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

  // States for Edit Profile
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const [isSaving, setIsSaving] = useState(false);

  // States for Password Change
  const [isPwdOpen, setIsPwdOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => { 
    fetchData<Profile>('profile').then(d => { 
      if (d) {
        setProfile(d); 
        setEditForm(d);
      }
      setLoading(false); 
    }); 
  }, []);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    const { data, error } = await updateData('profile', user.id, editForm);
    setIsSaving(false);
    if (!error && data) {
      setProfile(data);
      setIsEditOpen(false);
      alert('Profil berhasil diperbarui!');
    } else {
      alert('Gagal memperbarui profil: ' + error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      alert('Password tidak cocok!');
      return;
    }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwdForm.newPassword });
    setPwdLoading(false);
    
    if (error) {
      alert('Gagal mengubah password: ' + error.message);
    } else {
      alert('Password berhasil diubah!');
      setIsPwdOpen(false);
      setPwdForm({ newPassword: '', confirmPassword: '' });
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  const initials = user?.nama_lengkap?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1>Profil Mahasiswa</h1>
          <p>Data pribadi dan informasi akademik Anda</p>
        </div>
        <div className="flex gap-2">
          {/* Ubah Password Dialog */}
          <Dialog open={isPwdOpen} onOpenChange={setIsPwdOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2 text-xs" />}>
              <Lock className="w-4 h-4" /> Ubah Password
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Ubah Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePasswordChange} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Password Baru</Label>
                  <Input 
                    type="password" 
                    value={pwdForm.newPassword} 
                    onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Konfirmasi Password</Label>
                  <Input 
                    type="password" 
                    value={pwdForm.confirmPassword} 
                    onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={pwdLoading}>
                  {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Simpan Password
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Profil Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger render={<Button size="sm" className="gap-2 text-xs" />}>
              <Edit2 className="w-4 h-4" /> Edit Profil
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Data Pribadi</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tempat Lahir</Label>
                    <Input name="tempat_lahir" value={editForm.tempat_lahir || ''} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Lahir</Label>
                    <Input type="date" name="tanggal_lahir" value={editForm.tanggal_lahir || ''} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>No. HP</Label>
                    <Input name="no_hp" value={editForm.no_hp || ''} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Kota Asal</Label>
                    <Input name="kota_asal" value={editForm.kota_asal || ''} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Alamat Lengkap</Label>
                    <Input name="alamat_lengkap" value={editForm.alamat_lengkap || ''} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Wali</Label>
                    <Input name="nama_wali" value={editForm.nama_wali || ''} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>No. HP Wali</Label>
                    <Input name="no_hp_wali" value={editForm.no_hp_wali || ''} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Asal Sekolah</Label>
                    <Input name="asal_sekolah" value={editForm.asal_sekolah || ''} onChange={handleEditChange} />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Simpan Perubahan
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
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

            <div className="mt-4 pt-3 border-t border-border">
              <div className={`status-indicator mx-auto w-fit ${user?.status_aktif ? 'status-aktif' : 'status-nonaktif'}`}>
                {user?.status_aktif ? 'Status Mahasiswa Aktif' : 'Status Nonaktif'}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
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
