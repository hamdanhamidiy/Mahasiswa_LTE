'use client';

import { useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { createData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar, Shield, Loader2, Camera, Lock, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function InstrukturProfilPage() {
  const { user, updateAvatarUrl } = useAppStore();

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Password Change
  const [isPwdOpen, setIsPwdOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const supabase = createClient();

  const initials = user?.nama_lengkap?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) { alert('Hanya file gambar yang diperbolehkan.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2MB.'); return; }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Full = reader.result as string;
      const base64 = base64Full.split(',')[1];
      const mimeType = file.type;
      const { data, error } = await createData('upload_avatar', { base64, mimeType });
      setUploading(false);
      if (error) { alert('Gagal mengupload foto: ' + error); return; }
      if (data && (data as any).avatar_url) {
        updateAvatarUrl((data as any).avatar_url);
        alert('Foto profil berhasil diperbarui!');
      }
    };
    reader.onerror = () => { setUploading(false); alert('Gagal membaca file.'); };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { alert('Password tidak cocok!'); return; }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwdForm.newPassword });
    setPwdLoading(false);
    if (error) { alert('Gagal mengubah password: ' + error.message); }
    else { alert('Password berhasil diubah!'); setIsPwdOpen(false); setPwdForm({ newPassword: '', confirmPassword: '' }); }
  };

  const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="data-field">
      <span className="data-label">{label}</span>
      <span className="data-value">{value || <span className="text-muted-foreground/40 italic text-xs">Belum diisi</span>}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1>Profil Instruktur</h1>
          <p>Data pribadi dan informasi akun Anda</p>
        </div>
        <Dialog open={isPwdOpen} onOpenChange={setIsPwdOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2 text-xs" />}>
            <Lock className="w-4 h-4" /> Ubah Password
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Ubah Password</DialogTitle></DialogHeader>
            <form onSubmit={handlePasswordChange} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Password Baru</Label>
                <Input type="password" value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label>Konfirmasi Password</Label>
                <Input type="password" value={pwdForm.confirmPassword} onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={pwdLoading}>
                {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Simpan Password
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <Card className="border border-border shadow-none lg:col-span-1 overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f] to-[#2563eb]" />
          <CardContent className="pt-0 pb-5 text-center -mt-8">
            {/* Avatar with upload */}
            <div className="relative inline-block group">
              <Avatar className="w-16 h-16 mx-auto border-[3px] border-card shadow-sm">
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-white text-base font-bold">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <p className="text-[9px] text-muted-foreground mt-1.5">Klik foto untuk mengubah</p>

            <h2 className="text-sm font-bold mt-2 tracking-tight">{user?.nama_lengkap}</h2>
            <Badge className="mt-1.5 text-[9px]" variant="outline">Instruktur</Badge>

            <div className="mt-4 space-y-2 text-left px-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className={`text-[11px] font-semibold ${user?.status_aktif ? 'text-success' : 'text-error'}`}>
                  {user?.status_aktif ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px]">Bergabung {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '—'}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <div className={`status-indicator mx-auto w-fit ${user?.status_aktif ? 'status-aktif' : 'status-nonaktif'}`}>
                {user?.status_aktif ? 'Status Instruktur Aktif' : 'Status Nonaktif'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-0 px-5 pt-4">
              <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                <User className="w-3.5 h-3.5" /> Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="data-grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <Field label="Nama Lengkap" value={user?.nama_lengkap} />
                <Field label="Email" value={user?.email} />
                <Field label="Role" value="Instruktur" />
                <Field label="Status" value={user?.status_aktif ? 'Aktif' : 'Nonaktif'} />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-none">
            <CardHeader className="pb-0 px-5 pt-4">
              <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" /> Informasi Pengajaran
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="data-grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <Field label="Program" value={user?.program === 'diploma1' ? 'Diploma 1' : user?.program === 'executive' ? 'Executive' : user?.program === 'english_cruise' ? 'English Cruise' : user?.program || null} />
                <Field label="Jurusan" value={user?.jurusan === 'housekeeping' ? 'Housekeeping' : user?.jurusan === 'fnb_product' ? 'F&B Product' : user?.jurusan === 'fnb_service' ? 'F&B Service' : user?.jurusan === 'general' ? 'General' : user?.jurusan || null} />
                <Field label="Tanggal Terdaftar" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
