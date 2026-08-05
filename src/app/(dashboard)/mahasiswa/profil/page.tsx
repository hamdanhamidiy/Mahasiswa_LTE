'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { fetchData, updateData, createData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, School, Calendar, Shield, Loader2, GraduationCap, Heart, Shirt, Edit2, Lock, Camera, Save, X, Eye, EyeOff, CheckCircle2, Sparkles, CreditCard } from 'lucide-react';
import { getProgramLabel, getJurusanLabel, formatDate } from '@/lib/utils/helpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

interface Profile { tempat_lahir: string | null; tanggal_lahir: string | null; jenis_kelamin: string | null; alamat_lengkap: string | null; kota_asal: string | null; provinsi_asal: string | null; no_hp: string | null; no_hp_darurat: string | null; nama_wali: string | null; hubungan_wali: string | null; no_hp_wali: string | null; asal_sekolah: string | null; tahun_lulus: number | null; ukuran_seragam: string | null; is_onboarded: boolean }

const Field = ({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ElementType }) => (
  <div className="group py-3.5 px-4 rounded-xl hover:bg-muted/30 transition-colors -mx-1">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 block mb-1">{label}</span>
    <span className="text-sm font-medium text-foreground flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-primary/40 shrink-0" />}
      {value || <span className="text-muted-foreground/30 italic text-xs flex items-center gap-1">— Belum diisi</span>}
    </span>
  </div>
);

export default function ProfilPage() {
  const { user, updateAvatarUrl } = useAppStore();
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
  const [showPwd, setShowPwd] = useState(false);

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB.');
      return;
    }

    setUploading(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Full = reader.result as string;
      const base64 = base64Full.split(',')[1]; // Remove data:image/...;base64, prefix
      const mimeType = file.type;

      const { data, error } = await createData('upload_avatar', { base64, mimeType });
      setUploading(false);

      if (error) {
        alert('Gagal mengupload foto: ' + error);
        return;
      }

      if (data && (data as any).avatar_url) {
        updateAvatarUrl((data as any).avatar_url);
        alert('Foto profil berhasil diperbarui!');
      }
    };
    reader.onerror = () => {
      setUploading(false);
      alert('Gagal membaca file.');
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground animate-pulse">Memuat profil...</p>
    </div>
  );

  const initials = user?.nama_lengkap?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  const completedFields = profile ? [
    profile.tempat_lahir, profile.tanggal_lahir, profile.jenis_kelamin,
    profile.no_hp, profile.kota_asal, profile.alamat_lengkap,
    profile.nama_wali, profile.asal_sekolah
  ].filter(Boolean).length : 0;
  const totalFields = 8;
  const completionPct = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Modern Profile Header */}
      <div className="bg-card rounded-[2rem] border border-border/60 shadow-sm overflow-hidden mb-8 animate-slide-up">
        
        {/* Cover Photo - Smaller and matched to dashboard gradient */}
        <div className="relative h-24 sm:h-32 w-full overflow-hidden" style={{background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 25%, #2563eb 50%, #1e3a8a 75%, #172554 100%)'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-blue-950/60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-950/50 to-transparent pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px'}} />
        </div>

        {/* Profile Content */}
        <div className="px-6 sm:px-10 pb-6">
          <div className="flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-end -mt-10 sm:-mt-12 relative z-10">
            
            {/* Avatar & Identity */}
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end flex-1 min-w-0 w-full">
              
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="ring-4 ring-card rounded-full bg-card shadow-xl">
                  <Avatar className="w-20 h-20 sm:w-28 sm:h-28 border-2 border-border/50 bg-muted">
                    <AvatarImage src={user?.avatar_url || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">{initials}</AvatarFallback>
                  </Avatar>
                </div>
                {/* Status dot */}
                <div className={`absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-4 border-card ${user?.status_aktif ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300 cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
              </div>

              {/* Identity Details */}
              <div className="flex-1 min-w-0 space-y-1.5 pt-3 sm:pt-0 pb-1 w-full text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate">
                    {user?.nama_lengkap}
                  </h1>
                  <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 gap-1.5 px-2.5 py-0.5">
                    <Sparkles className="w-3.5 h-3.5" /> Mahasiswa LTE
                  </Badge>
                </div>
                
                ${/* Badges/Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {user?.nim && (
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 border border-border/50 px-2.5 py-1 rounded-md text-xs font-medium">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="font-mono">{user.nim}</span>
                    </div>
                  )}
                  {user?.email && (
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 border border-border/50 px-2.5 py-1 rounded-md text-xs font-medium">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{user.email}</span>
                    </div>
                  )}
                  {user?.program && (
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 border border-border/50 px-2.5 py-1 rounded-md text-xs font-medium">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{getProgramLabel(user.program)}</span>
                    </div>
                  )}
                  {user?.jurusan && (
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 border border-border/50 px-2.5 py-1 rounded-md text-xs font-medium">
                      <School className="w-3.5 h-3.5" />
                      <span>{getJurusanLabel(user.jurusan)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side Actions & Completion */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0 pt-2 lg:pt-0">
               <div className="bg-muted/30 border border-border/50 rounded-xl p-3.5 flex-1 lg:flex-none flex flex-col justify-center items-center lg:items-end min-w-[200px]">
                 <div className="flex items-center gap-2 mb-2.5 w-full justify-between">
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                     <CheckCircle2 className="w-3 h-3 text-primary" /> Kelengkapan
                   </span>
                   <span className="text-xs font-extrabold text-foreground">{completionPct}%</span>
                 </div>
                 <div className="h-2 w-full bg-border/60 rounded-full overflow-hidden">
                   <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden" style={{ width: `\${completionPct}%` }}>
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-[shimmer_2.5s_ease-in-out_infinite]" />
                   </div>
                 </div>
               </div>
               
               <div className="flex gap-2 w-full">
                  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger>
                      <Button variant="outline" className="flex-1 bg-background hover:bg-muted border-border/60 shadow-sm h-10 gap-2 transition-all">
                        <Edit2 className="w-4 h-4" /> Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                          <Edit2 className="w-5 h-5 text-primary" />
                          Edit Data Pribadi
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">Lengkapi informasi pribadi Anda di bawah ini</p>
                      </DialogHeader>
                      <form onSubmit={handleSaveProfile} className="space-y-6 pt-4">
                        {/* Personal Info Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <User className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Identitas</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground">Tempat Lahir</Label>
                              <Input name="tempat_lahir" value={editForm.tempat_lahir || ''} onChange={handleEditChange} placeholder="Contoh: Jakarta" className="h-10 rounded-xl bg-muted/30 border-border/60 focus:bg-background transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground">Tanggal Lahir</Label>
                              <Input type="date" name="tanggal_lahir" value={editForm.tanggal_lahir || ''} onChange={handleEditChange} className="h-10 rounded-xl bg-muted/30 border-border/60 focus:bg-background transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground">Jenis Kelamin</Label>
                              <select name="jenis_kelamin" value={editForm.jenis_kelamin || ''} onChange={handleEditChange as any} className="flex h-10 w-full rounded-xl border border-border/60 bg-muted/30 px-3 text-sm focus:bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors">
                                <option value="">Pilih...</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground">No. HP</Label>
                              <Input name="no_hp" value={editForm.no_hp || ''} onChange={handleEditChange} placeholder="08xxxxxxxxxx" className="h-10 rounded-xl bg-muted/30 border-border/60 focus:bg-background transition-colors" />
                            </div>
                          </div>
                        </div>

                        {/* Address Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Alamat</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground">Kota Asal</Label>
                              <Input name="kota_asal" value={editForm.kota_asal || ''} onChange={handleEditChange} placeholder="Contoh: Kediri" className="h-10 rounded-xl bg-muted/30 border-border/60 focus:bg-background transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground">Provinsi</Label>
                              <Input name="provinsi_asal" value={editForm.provinsi_asal || ''} onChange={handleEditChange} placeholder="Contoh: Jawa Timur" className="h-10 rounded-xl bg-muted/30 border-border/60 focus:bg-background transition-colors" />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <Label className="text-xs font-semibold text-muted-foreground">Alamat Lengkap</Label>
                              <Input name="alamat_lengkap" value={editForm.alamat_lengkap || ''} onChange={handleEditChange} placeholder="Jl. ..." className="h-10 rounded-xl bg-muted/30 border-border/60 focus:bg-background transition-colors" />
                            </div>
                          </div>
                        </div>

                        {/* Guardian Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <Heart className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Data Wali & Pendidikan</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground">Nama Wali</Label>
                              <Input name="nama_wali" value={editForm.nama_wali || ''} onChange={handleEditChange} className="h-10 rounded-xl bg-muted/30 border-border/60 focus:bg-background transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground">No. HP Wali</Label>
                              <Input name="no_hp_wali" value={editForm.no_hp_wali || ''} onChange={handleEditChange} className="h-10 rounded-xl bg-muted/30 border-border/60 focus:bg-background transition-colors" />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <Label className="text-xs font-semibold text-muted-foreground">Asal Sekolah</Label>
                              <Input name="asal_sekolah" value={editForm.asal_sekolah || ''} onChange={handleEditChange} className="h-10 rounded-xl bg-muted/30 border-border/60 focus:bg-background transition-colors" />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl gap-2" onClick={() => setIsEditOpen(false)}>
                            <X className="w-4 h-4" /> Batal
                          </Button>
                          <Button type="submit" className="flex-1 h-11 rounded-xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan Perubahan
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isPwdOpen} onOpenChange={setIsPwdOpen}>
                    <DialogTrigger>
                      <Button variant="outline" className="flex-1 bg-background hover:bg-muted border-border/60 shadow-sm h-10 gap-2 transition-all">
                        <Lock className="w-4 h-4" /> Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                          <Lock className="w-5 h-5 text-primary" />
                          Ubah Password
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handlePasswordChange} className="space-y-5 pt-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground">Password Baru</Label>
                          <div className="relative">
                            <Input 
                              type={showPwd ? "text" : "password"} 
                              value={pwdForm.newPassword} 
                              onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})}
                              required
                              minLength={6}
                              placeholder="Minimal 6 karakter"
                              className="h-11 rounded-xl bg-muted/30 border-border/60 pr-10"
                            />
                            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground">Konfirmasi Password</Label>
                          <Input 
                            type={showPwd ? "text" : "password"} 
                            value={pwdForm.confirmPassword} 
                            onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})}
                            required
                            minLength={6}
                            placeholder="Ulangi password baru"
                            className="h-11 rounded-xl bg-muted/30 border-border/60"
                          />
                        </div>
                        <Button type="submit" className="w-full h-11 rounded-xl gap-2 text-primary-foreground" disabled={pwdLoading}>
                          {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                          Simpan Password
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
               </div>
            </div>
            
          </div>
        </div>
      </div>
      {/* Data Sections — Modern Cards */}
      <div className="grid lg:grid-cols-2 gap-6 stagger-children">
        
        {/* Data Akademik */}
        <div className="bg-card rounded-[2rem] border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-500 overflow-hidden animate-slide-up flex flex-col">
          <div className="p-6 border-b border-border/40 flex items-center gap-3 bg-muted/5">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Data Akademik</h3>
          </div>
          <div className="p-6 bg-background/30 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <Field label="NIM" value={user?.nim} />
              <Field label="Program Studi" value={user?.program ? getProgramLabel(user.program) : null} />
              <Field label="Jurusan" value={user?.jurusan ? getJurusanLabel(user.jurusan) : null} />
              <Field label="Angkatan" value={user?.angkatan} />
              <Field label="Periode Masuk" value={user?.periode_masuk ? formatDate(user.periode_masuk) : null} icon={Calendar} />
              <Field label="Status" value={user?.status_aktif ? 'Aktif' : 'Nonaktif'} icon={Shield} />
            </div>
          </div>
        </div>

        {/* Data Pribadi */}
        <div className="bg-card rounded-[2rem] border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-500 overflow-hidden animate-slide-up flex flex-col">
          <div className="p-6 border-b border-border/40 flex items-center gap-3 bg-muted/5">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Data Pribadi</h3>
          </div>
          <div className="p-6 bg-background/30 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tempat Lahir" value={profile?.tempat_lahir} icon={MapPin} />
              <Field label="Tanggal Lahir" value={profile?.tanggal_lahir ? formatDate(profile.tanggal_lahir) : null} icon={Calendar} />
              <Field label="Jenis Kelamin" value={profile?.jenis_kelamin === 'L' ? 'Laki-laki' : profile?.jenis_kelamin === 'P' ? 'Perempuan' : null} />
              <Field label="No. HP" value={profile?.no_hp} icon={Phone} />
              <Field label="Kota Asal" value={profile?.kota_asal} icon={MapPin} />
              <Field label="Provinsi" value={profile?.provinsi_asal} />
              <Field label="Alamat Lengkap" value={profile?.alamat_lengkap} />
              <Field label="No. HP Darurat" value={profile?.no_hp_darurat} icon={Phone} />
            </div>
          </div>
        </div>

        {/* Data Wali & Pendidikan */}
        {profile && (
          <div className="bg-card rounded-[2rem] border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-500 overflow-hidden lg:col-span-2 animate-slide-up">
            <div className="p-6 border-b border-border/40 flex items-center gap-3 bg-muted/5">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">Data Wali & Pendidikan</h3>
            </div>
            <div className="p-6 bg-background/30">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Nama Wali" value={profile.nama_wali} />
                <Field label="Hubungan" value={profile.hubungan_wali} />
                <Field label="No. HP Wali" value={profile.no_hp_wali} icon={Phone} />
                <Field label="Asal Sekolah" value={profile.asal_sekolah} icon={School} />
                <Field label="Tahun Lulus" value={profile.tahun_lulus?.toString()} />
                <Field label="Ukuran Seragam" value={profile.ukuran_seragam} icon={Shirt} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
