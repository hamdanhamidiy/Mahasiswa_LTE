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
ICAgICAgey8qIE1vZGVybiBQcm9maWxlIEhlYWRlciAqL30KICAgICAgPGRpdiBjbGFzc05hbWU9ImJnLWNhcmQgcm91bmRlZC1bMnJlbV0gYm9yZGVyIGJvcmRlci1ib3JkZXIvNjAgc2hhZG93LXNtIG92ZXJmbG93LWhpZGRlbiBtYi04IGFuaW1hdGUtc2xpZGUtdXAiPgogICAgICAgIAogICAgICAgIHsvKiBDb3ZlciBQaG90byAqL30KICAgICAgICA8ZGl2IGNsYXNzTmFtZT0icmVsYXRpdmUgaC0zMiBzbTpoLTQ4IHctZnVsbCBvdmVyZmxvdy1oaWRkZW4iIHN0eWxlPXt7YmFja2dyb3VuZDogJ2xpbmVhci1ncmFkaWVudCgxMzVkZWcsICMxZTQwYWYgMCUsICMxZDRlZDggMjUlLCAjMjU2M2ViIDUwJSwgIzFlM2E4YSA3NSUsICMxNzI1NTQgMTAwJSknfX0+CiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0iYWJzb2x1dGUgaW5zZXQtMCBiZy1ncmFkaWVudC10by1iIGZyb20tdHJhbnNwYXJlbnQgdG8tYmxhY2svMjAgcG9pbnRlci1ldmVudHMtbm9uZSIgLz4KICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJhYnNvbHV0ZSAtdG9wLTE2IC1yaWdodC0xNiB3LTY0IGgtNjQgcm91bmRlZC1mdWxsIGJnLXdoaXRlLzUgYmx1ci0yemwgcG9pbnRlci1ldmVudHMtbm9uZSIgLz4KICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJhYnNvbHV0ZSBpbnNldC0wIG9wYWNpdHktWzAuMDRdIiBzdHlsZT0re2JhY2tncm91bmRJbWFnZTogJ3JhZGlhbC1ncmFkaWVudChjaXJjbGUsICNmZmYgMXB4LCB0cmFuc3BhcmVudCAxcHgpJywgYmFja2dyb3VuZFNpemU6ICcyOHB4IDI4cHgnfX0gLz4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgey8qIFByb2ZpbGUgQ29udGVudCAqL30KICAgICAgICA8ZGl2IGNsYXNzTmFtZT0icHgtNiBzbTpweC0xMCBwYi04Ij4KICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJmbGV4IGZsZXgtY29sIGxnOmZsZXgtcm93IGdhcC02IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1zdGFydCBsZzppdGVtcy1lbmQgLW10LTEyIHNtOi1tdC0xNiByZWxhdGl2ZSB6LTEwIj4KICAgICAgICAgICAgCiAgICAgICAgICAgIHsvKiBBdmF0YXIgJiBJZGVudGl0eSAqL30KICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggZmxleC1jb2wgc206ZmxleC1yb3cgZ2FwLTUgaXRlbXMtc3RhcnQgc206aXRlbXMtZW5kIGZsZXgtMSBtaW4tdy0wIHctZnVsbCI+CiAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgey8qIEF2YXRhciAqL30KICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0icmVsYXRpdmUgZ3JvdXAgc2hyaW5rLTAiPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9InJpbmctNCByaW5nLWNhcmQgcm91bmRlZC1mdWxsIGJnLWNhcmQgc2hhZG93LXhsIj4KICAgICAgICAgICAgICAgICAgPEF2YXRhciBjbGFzc05hbWU9InctMjQgaC0yNCBzbTp3LTMyIHNtOmgtMzIgYm9yZGVyLTIgYm9yZGVyLWJvcmRlci81MCBiZy1tdXRlZCI+CiAgICAgICAgICAgICAgICAgICAgPEF2YXRhckltYWdlIHNyYz17dXNlcj8uYXZhdGFyX3VybCB8fCB1bmRlZmluZWR9IGNsYXNzTmFtZT0ib2JqZWN0LWNvdmVyIiAvPgogICAgICAgICAgICAgICAgICAgIDxBdmF0YXJGYWxsYmFjayBjbGFzc05hbWU9ImJnLXByaW1hcnkvNSB0ZXh0LXByaW1hcnkgdGV4dC0zeGwgZm9udC1ib2xkIj57aW5pdGlhbHN9PC9BdmF0YXJGYWxsYmFjaz4KICAgICAgICAgICAgICAgICAgPC9BdmF0YXI+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIHsvKiBTdGF0dXMgZG90ICovfQogICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BhYnNvbHV0ZSBib3R0b20tMSByaWdodC0xIHctNSBoLTUgcm91bmRlZC1mdWxsIGJvcmRlci00IGJvcmRlci1jYXJkICR7dXNlcj8uc3RhdHVzX2FrdGlmID8gJ2JnLWVtZXJhbGQtNTAwIHNoYWRvdS1bMF8wXzEwcHhfcmdiYSgxNiwxODUsMTI5LDAuNCldJyA6ICdiZy1yZWQtNTAwIHNoYWRvdS1bMF8wXzEwcHhfcmdiYSgyMzksNjgsNjgsMC40KV0nfWB9IC8+CiAgICAgICAgICAgICAgICA8YnV0dG9uCiAgICAgICAgICAgICAgICAgIHR5cGU9ImJ1dHRvbiIKICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZmlsZUlucHV0UmVmLmN1cnJlbnQ/LmNsaWNrKCl9CiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt1cGxvYWRpbmd9CiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0iYWJzb2x1dGUgaW5zZXQtMCByb3VuZGVkLWZ1bGwgYmctYmxhY2svMCBncm91cC1ob3ZlcjpiZy1ibGFjay80MCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgY3Vyc29yLXBvaW50ZXIiCiAgICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICAgIHt1cGxvYWRpbmcgPyAoCiAgICAgICAgICAgICAgICAgICAgPExvYWRlcjIgY2xhc3NOYW1lPSJ3LTYgaC02IHRleHQtd2hpdGUgYW5pbWF0ZS1zcGluIiAvPgogICAgICAgICAgICAgICAgICApIDogKAogICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJvcGFjaXR5LTAgZ3JvdXAtaG92ZXI6b3BhY2l0eS0xMDAgdHJhbnNpdGlvbi1vcGFjaXR5IGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC0xIj4KICAgICAgICAgICAgICAgICAgICAgIDxDYW1lcmEgY2xhc3NOYW1lPSJ3LTYgaC02IHRleHQtd2hpdGUiIC8+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICl9CiAgICAgICAgICAgICAgICA8L2J1dHRvbj4KICAgICAgICAgICAgICAgIDxpbnB1dCByZWY9e2ZpbGVJbnB1dFJlZn0gdHlwZT0iZmlsZSIgYWNjZXB0PSJpbWFnZS9qcGVnLGltYWdlL3BuZyxpbWFnZS93ZWJwIiBjbGFzc05hbWU9ImhpZGRlbiIgb25DaGFuZ2U9e2hhbmRsZUF2YXRhclVwbG9hZH0gLz4KICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgey8qIElkZW50aXR5IERldGFpbHMgKi99CiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXgtMSBtaW4tdy0wIHNwYWNlLXktMi41IHB0LTMgc206cHQtMCBwYi0xIHctZnVsbCB0ZXh0LWxlZnQiPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggZmxleC1jb2wgc206ZmxleC1yb3cgc206aXRlbXMtY2VudGVyIGdhcC0yIHNtOmdhcC0zIj4KICAgICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT0idGV4dC0yeGwgc206dGV4dC0zeGwgZm9udC1leHRyYWJvbGQgdHJhY2tpbmctdGlnaHQgdGV4dC1mb3JlZ3JvdW5kIHRydW5jYXRlIj4KICAgICAgICAgICAgICAgICAgICB7dXNlcj8ubmFtYV9sZW5na2FwfQogICAgICAgICAgICAgICAgICA8L2gxPgogICAgICAgICAgICAgICAgICA8QmFkZ2UgdmFyaWFudD0ib3V0bGluZSIgY2xhc3NOYW1lPSJ3LWZpdCBiZy1wcmltYXJ5LzUgdGV4dC1wcmltYXJ5IGJvcmRlci1wcmltYXJ5LzIwIGdhcC0xLjUgcHgtMi41IHB5LTAuNSI+CiAgICAgICAgICAgICAgICAgICAgPFNwYXJrbGVzIGNsYXNzTmFtZT0idy0zLjUgaC0zLjUiIC8+IE1haGFzaXN3YSBMVEUKICAgICAgICAgICAgICAgICAgPC9CYWRnZT4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAkey8qIEJhZGdlcy9UYWdzICovfQogICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBnYXAtMiBwdC0xIj4KICAgICAgICAgICAgICAgICAge3VzZXI/Lm5pbSAmJiAoCiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGJnLW11dGVkLzUwIGJvcmRlciBib3JkZXItYm9yZGVyLzUwIHB4LTIuNSBweS0xIHJvdW5kZWQtbWQgdGV4dC14cyBmb250LW1lZGl1bSI+CiAgICAgICAgICAgICAgICAgICAgICA8Q3JlZGl0Q2FyZCBjbGFzc05hbWU9InctMy41IGgtMy41IiAvPgogICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSJmb250LW1vbm8iPnt1c2VyLm5pbX08L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICl9CiAgICAgICAgICAgICAgICAgIHt1c2VyPy5lbWFpbCAmJiAoCiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGJnLW11dGVkLzUwIGJvcmRlciBib3JkZXItYm9yZGVyLzUwIHB4LTIuNSBweS0xIHJvdW5kZWQtbWQgdGV4dC14cyBmb250LW1lZGl1bSI+CiAgICAgICAgICAgICAgICAgICAgICA8TWFpbCBjbGFzc05hbWU9InctMy41IGgtMy41IiAvPgogICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSJ0cnVuY2F0ZSBtYXgtdy1bMjAwcHhdIj57dXNlci5lbWFpbH08L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICl9CiAgICAgICAgICAgICAgICAgIHt1c2VyPy5wcm9ncmFtICYmICgKICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0iZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNSB0ZXh0LW11dGVkLWZvcmVncm91bmQgYmctbXV0ZWQvNTAgYm9yZGVyIGJvcmRlci1ib3JkZXIvNTAgcHgtMi41IHB5LTEgcm91bmRlZC1tZCB0ZXh0LXhzIGZvbnQtbWVkaXVtIj4KICAgICAgICAgICAgICAgICAgICAgIDxHcmFkdWF0aW9uQ2FwIGNsYXNzTmFtZT0idy0zLjUgaC0zLjUiIC8+CiAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57Z2V0UHJvZ3JhbUxhYmVsKHVzZXIucHJvZ3JhbSl9PC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICApfQogICAgICAgICAgICAgICAgICB7dXNlcj8uanVydXNhbiAmJiAoCiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGJnLW11dGVkLzUwIGJvcmRlciBib3JkZXItYm9yZGVyLzUwIHB4LTIuNSBweS0xIHJvdW5kZWQtbWQgdGV4dC14cyBmb250LW1lZGl1bSI+CiAgICAgICAgICAgICAgICAgICAgICA8U2Nob29sIGNsYXNzTmFtZT0idy0zLjUgaC0zLjUiIC8+CiAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57Z2V0SnVydXNhbkxhYmVsKHVzZXIuanVydXNhbil9PC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICApfQogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgey8qIFJpZ2h0IFNpZGUgQWN0aW9ucyAmIENvbXBsZXRpb24gKi99CiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJ3LWZ1bGwgbGc6dy1hdXRvIGZsZXggZmxleC1jb2wgc206ZmxleC1yb3cgbGc6ZmxleC1jb2wgZ2FwLTQgc2hyaW5rLTAgcHQtMiBsZzpwdC0wIj4KICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImJnLW11dGVkLzMwIGJvcmRlciBib3JkZXItYm9yZGVyLzUwIHJvdW5kZWQteGwgcC0zLjUgZmxleC0xIGxnOmZsZXgtbm9uZSBmbGV4IGZsZXgtY29sIGp1c3RpZnktY2VudGVyIGl0ZW1zLWNlbnRlciBsZzppdGVtcy1lbmQgbWluLXctWzIyMHB4XSI+CiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIG1iLTIuNSB3LWZ1bGwganVzdGlmeS1iZXR3ZWVuIj4KICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0idGV4dC14cyBmb250LWJvbGQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41Ij4KICAgICAgICAgICAgICAgICAgICAgPENoZWNrQ2lyY2xlMiBjbGFzc05hbWU9InctMy41IGgtMy41IHRleHQtcHJpbWFyeSIgLz4gS2VsZW5na2FwYW4KICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4KICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0idGV4dC1zbSBmb250LWV4dHJhYm9sZCB0ZXh0LWZvcmVncm91bmQiPntjb21wbGV0aW9uUGN0fSU8L3NwYW4+CiAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImgtMiB3LWZ1bGwgYmctYm9yZGVyLzYwIHJvdW5kZWQtZnVsbCBvdmVyZmxvdy1oaWRkZW4iPgogICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImgtZnVsbCBiZy1wcmltYXJ5IHJvdW5kZWQtZnVsbCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0xMDAwIGVhc2Utb3V0IHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlbiIgc3R5bGU9e3sgd2lkdGg6IGBcJHtjb21wbGV0aW9uUGN0fSVgIH19PgogICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0iYWJzb2x1dGUgaW5zZXQtMCBiZy1ncmFkaWVudC10by1yIGZyb20tdHJhbnNwYXJlbnQgdmlhLXdoaXRlLzMwIHRvLXRyYW5zcGFyZW50IC1za2V3LXgtMTIgYW5pbWF0ZS1bc2hpbW1lcl8yLjVzX2Vhc2UtaW4tb3V0X2luZmluaXRlXSIgLz4KICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJmbGV4IGdhcC0yIHctZnVsbCI+CiAgICAgICAgICAgICAgICAgIDxEaWFsb2cgb3Blbj17aXNFZGl0T3Blbn0gb25PcGVuQ2hhbmdlPXtzZXRJc0VkaXRPcGVufT4KICAgICAgICAgICAgICAgICAgICA8RGlhbG9nVHJpZ2dlciBhc0NoaWxkPgogICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvbiB2YXJpYW50PSJvdXRsaW5lIiBjbGFzc05hbWU9ImZsZXgtMSBiZy1iYWNrZ3JvdW5kIGhvdmVyOmJnLW11dGVkIGJvcmRlci1ib3JkZXIvNjAgc2hhZG93LXNtIGgtMTAgZ2FwLTIgdHJhbnNpdGlvbi1hbGwiPgogICAgICAgICAgICAgICAgICAgICAgICA8RWRpdDIgY2xhc3NOYW1lPSJ3LTQgaC00IiAvPiBFZGl0IFByb2ZpbGUKICAgICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPgogICAgICAgICAgICAgICAgICAgIDwvRGlhbG9nVHJpZ2dlcj4KICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQ29udGVudCBjbGFzc05hbWU9InNtOm1heC13LTJ4bCBtYXgtaC1bODV2aF0gb3ZlcmZsb3cteS1hdXRvIj4KICAgICAgICAgICAgICAgICAgICAgIDxEaWFsb2dIZWFkZXI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxEaWFsb2dUaXRsZSBjbGFzc05hbWU9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQtbGciPgogICAgICAgICAgICAgICAgICAgICAgICAgIDxFZGl0MiBjbGFzc05hbWU9InctNSBoLTUgdGV4dC1wcmltYXJ5IiAvPgogICAgICAgICAgICAgICAgICAgICAgICAgIEVkaXQgRGF0YSBQcmliYWRpCiAgICAgICAgICAgICAgICAgICAgICAgIDwvRGlhbG9nVGl0bGU+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT0idGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQgbXQtMSI+TGVuZ2thcGkgaW5mb3JtYXNpIHByaWJhZGkgQW5kYSBkaSBiYXdhaCBpbmk8L3A+CiAgICAgICAgICAgICAgICAgICAgICA8L0RpYWxvZ0hlYWRlcj4KICAgICAgICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXtoYW5kbGVTYXZlUHJvZmlsZX0gY2xhc3NOYW1lPSJzcGFjZS15LTYgcHQtNCI+CiAgICAgICAgICAgICAgICAgICAgICAgIHsvKiBQZXJzb25hbCBJbmZvIFNlY3Rpb24gKi99CiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJzcGFjZS15LTQiPgogICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBwYi0yIGJvcmRlci1iIGJvcmRlci1ib3JkZXIiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPFVzZXIgY2xhc3NOYW1lPSJ3LTQgaC00IHRleHQtcHJpbWFyeSIgLz4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0idGV4dC14cyBmb250LWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtZm9yZWdyb3VuZCI+SWRlbnRpdGFzPC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJncmlkIGdyaWQtY29scy0xIHNtOmdyaWQtY29scy0yIGdhcC00Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJzcGFjZS15LTEuNSI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMYWJlbCBjbGFzc05hbWU9InRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LW11dGVkLWZvcmVncm91bmQiPlRlbXBhdCBMYWhpcjwvTGFiZWw+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxJbnB1dCBuYW1lPSJ0ZW1wYXRfbGFoaXIiIHZhbHVlPXtlZGl0Rm9ybS50ZW1wYXRfbGFoaXIgfHwgJyd9IG9uQ2hhbmdlPXtoYW5kbGVFZGl0Q2hhbmdlfSBwbGFjZWhvbGRlcj0iQ29udG9oOiBKYWthcnRhIiBjbGFzc05hbWU9ImgtMTAgcm91bmRlZC14bCBiZy1tdXRlZC8zMCBib3JkZXItYm9yZGVyLzYwIGZvY3VzOmJnLWJhY2tncm91bmQgdHJhbnNpdGlvbi1jb2xvcnMiIC8+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJzcGFjZS15LTEuNSI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMYWJlbCBjbGFzc05hbWU9InRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LW11dGVkLWZvcmVncm91bmQiPlRhbmdnYWwgTGFoaXI8L0xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SW5wdXQgdHlwZT0iZGF0ZSIgbmFtZT0idGFuZ2dhbF9sYWhpciIgdmFsdWU9e2VkaXRGb3JtLnRhbmdnYWxfbGFoaXIgfHwgJyd9IG9uQ2hhbmdlPXtoYW5kbGVFZGl0Q2hhbmdlfSBjbGFzc05hbWU9ImgtMTAgcm91bmRlZC14bCBiZy1tdXRlZC8zMCBib3JkZXItYm9yZGVyLzYwIGZvY3VzOmJnLWJhY2tncm91bmQgdHJhbnNpdGlvbi1jb2xvcnMiIC8+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJzcGFjZS15LTEuNSI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMYWJlbCBjbGFzc05hbWU9InRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LW11dGVkLWZvcmVncm91bmQiPkplbmlzIEtlbGFtaW48L0xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IG5hbWU9ImplbmlzX2tlbGFtaW4iIHZhbHVlPXtlZGl0Rm9ybS5qZW5pc19rZWxhbWluIHx8ICcnfSBvbkNoYW5nZT17aGFuZGxlRWRpdENoYW5nZSBhcyBhbnl9IGNsYXNzTmFtZT0iZmxleCBoLTEwIHctZnVsbCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItYm9yZGVyLzYwIGJnLW11dGVkLzMwIHB4LTMgdGV4dC1zbSBmb2N1czpiZy1iYWNrZ3JvdW5kIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXJpbmcgZm9jdXM6cmluZy1vZmZzZXQtMiB0cmFuc2l0aW9uLWNvbG9ycyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iIj5QaWxpaC4uLjwvb3B0aW9uPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkwiPkxha2ktbGFraTwvb3B0aW9uPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IlAiPlBlcmVtcHVhbjwvb3B0aW9uPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9InNwYWNlLXktMS41Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExhYmVsIGNsYXNzTmFtZT0idGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCI+Tm8uIEhQPC9MYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPElucHV0IG5hbWU9Im5vX2hwIiB2YWx1ZT0te2VkaXRGb3JtLm5vX2hwIHx8ICcnfSBvbkNoYW5nZT17aGFuZGxlRWRpdENoYW5nZX0gcGxhY2Vob2xkZXI9IjA4eHh4eHh4eHh4eCIgY2xhc3NOYW1lPSJoLTEwIHJvdW5kZWQteGwgYmctbXV0ZWQvMzAgYm9yZGVyLWJvcmRlci82MCBmb2N1czpiZy1iYWNrZ3JvdW5kIHRyYW5zaXRpb24tY29sb3JzIiAvPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgICAgICAgICAgey8qIEFkZHJlc3MgU2VjdGlvbiAqL30KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9InNwYWNlLXktNCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHBiLTIgYm9yZGVyLWIgYm9yZGVyLWJvcmRlciI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TWFwUGluIGNsYXNzTmFtZT0idy00IGgtNCB0ZXh0LXByaW1hcnkiIC8+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9InRleHQteHMgZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LWZvcmVncm91bmQiPkFsYW1hdDwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0iZ3JpZCBncmlkLWNvbHMtMSBzbTpncmlkLWNvbHMtMiBnYXAtNCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ic3BhY2UteS0xLjUiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGFiZWwgY2xhc3NOYW1lPSJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIj5Lb3RhIEFzYWw8L0xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SW5wdXQgbmFtZT0ia290YV9hc2FsIiB2YWx1ZT0te2VkaXRGb3JtLmtvdGFfYXNhbCB8fCAnJ30gb25DaGFuZ2U9e2hhbmRsZUVkaXRDaGFuZ2V9IHBsYWNlaG9sZGVyPSJDb250b2g6IEtlZGlyaSIgY2xhc3NOYW1lPSJoLTEwIHJvdW5kZWQteGwgYmctbXV0ZWQvMzAgYm9yZGVyLWJvcmRlci82MCBmb2N1czpiZy1iYWNrZ3JvdW5kIHRyYW5zaXRpb24tY29sb3JzIiAvPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ic3BhY2UteS0xLjUiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGFiZWwgY2xhc3NOYW1lPSJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIj5Qcm92aW5zaTwvTGFiZWw+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxJbnB1dCBuYW1lPSJwcm92aW5zaV9hc2FsIiB2YWx1ZT0te2VkaXRGb3JtLnByb3ZpbnNpX2FzYWwgfHwgJyd9IG9uQ2hhbmdlPXtoYW5kbGVFZGl0Q2hhbmdlfSBwbGFjZWhvbGRlcj0iQ29udG9oOiBKYXdhIFRpbXVyIiBjbGFzc05hbWU9ImgtMTAgcm91bmRlZC14bCBiZy1tdXRlZC8zMCBib3JkZXItYm9yZGVyLzYwIGZvY3VzOmJnLWJhY2tncm91bmQgdHJhbnNpdGlvbi1jb2xvcnMiIC8+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJzcGFjZS15LTEuNSBzbTpjb2wtc3Bhbi0yIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExhYmVsIGNsYXNzTmFtZT0idGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCI+QWxhbWF0IExlbmdrYXA8L0xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SW5wdXQgbmFtZT0iYWxhbWF0X2xlbmdrYXAiIHZhbHVlPXtlZGl0Rm9ybS5hbGFtYXRfbGVuZ2thcCB8fCAnJ30gb25DaGFuZ2U9e2hhbmRsZUVkaXRDaGFuZ2V9IHBsYWNlaG9sZGVyPSJKbC4gLi4uIiBjbGFzc05hbWU9ImgtMTAgcm91bmRlZC14bCBiZy1tdXRlZC8zMCBib3JkZXItYm9yZGVyLzYwIGZvY3VzOmJnLWJhY2tncm91bmQgdHJhbnNpdGlvbi1jb2xvcnMiIC8+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICAgICAgICB7LyogR3VhcmRpYW4gU2VjdGlvbiAqL30KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9InNwYWNlLXktNCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHBiLTIgYm9yZGVyLWIgYm9yZGVyLWJvcmRlciI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SGVhcnQgY2xhc3NOYW1lPSJ3LTQgaC00IHRleHQtcHJpbWFyeSIgLz4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0idGV4dC14cyBmb250LWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtZm9yZWdyb3VuZCI+RGF0YSBXYWxpICYgUGVuZGlkaWthbjwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0iZ3JpZCBncmlkLWNvbHMtMSBzbTpncmlkLWNvbHMtMiBnYXAtNCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ic3BhY2UteS0xLjUiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGFiZWwgY2xhc3NOYW1lPSJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIj5OYW1hIFdhbGk8L0xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SW5wdXQgbmFtZT0ibmFtYV93YWxpIiB2YWx1ZT0te2VkaXRGb3JtLm5hbWFfd2FsaSB8fCAnJ30gb25DaGFuZ2U9e2hhbmRsZUVkaXRDaGFuZ2V9IGNsYXNzTmFtZT0iaC0xMCByb3VuZGVkLXhsIGJnLW11dGVkLzMwIGJvcmRlci1ib3JkZXIvNjAgZm9jdXM6YmctYmFja2dyb3VuZCB0cmFuc2l0aW9uLWNvbG9ycyIgLz4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9InNwYWNlLXktMS41Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExhYmVsIGNsYXNzTmFtZT0idGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCI+Tm8uIEhQIFdhbGk8L0xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SW5wdXQgbmFtZT0ibm9faHBfd2FsaSIgdmFsdWU9e2VkaXRGb3JtLm5vX2hwX3dhbGkgfHwgJyd9IG9uQ2hhbmdlPXtoYW5kbGVFZGl0Q2hhbmdlfSBjbGFzc05hbWU9ImgtMTAgcm91bmRlZC14bCBiZy1tdXRlZC8zMCBib3JkZXItYm9yZGVyLzYwIGZvY3VzOmJnLWJhY2tncm91bmQgdHJhbnNpdGlvbi1jb2xvcnMiIC8+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJzcGFjZS15LTEuNSBzbTpjb2wtc3Bhbi0yIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExhYmVsIGNsYXNzTmFtZT0idGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCI+QXNhbCBTZWtvbGFoPC9MYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPElucHV0IG5hbWU9ImFzYWxfc2Vrb2xhaCIgdmFsdWU9e2VkaXRGb3JtLmFzYWxfc2Vrb2xhaCB8fCAnJ30gb25DaGFuZ2U9e2hhbmRsZUVkaXRDaGFuZ2V9IGNsYXNzTmFtZT0iaC0xMCByb3VuZGVkLXhsIGJnLW11dGVkLzMwIGJvcmRlci1ib3JkZXIvNjAgZm9jdXM6YmctYmFja2dyb3VuZCB0cmFuc2l0aW9uLWNvbG9ycyIgLz4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJmbGV4IGdhcC0zIHB0LTIiPgogICAgICAgICAgICAgICAgICAgICAgICAgIDxCdXR0b24gdHlwZT0iYnV0dG9uIiB2YXJpYW50PSJvdXRsaW5lIiBjbGFzc05hbWU9ImZsZXgtMSBoLTExIHJvdW5kZWQteGwgZ2FwLTIiIG9uQ2xpY2s9eygpID0+IHNldElzRWRpdE9wZW4oZmFsc2UpfT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxYIGNsYXNzTmFtZT0idy00IGgtNCIgLz4gQmF0YWwKICAgICAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8QnV0dG9uIHR5cGU9InN1Ym1pdCIgY2xhc3NOYW1lPSJmbGV4LTEgaC0xMSByb3VuZGVkLXhsIGdhcC0yIGJnLXByaW1hcnkgaG92ZXI6YmctcHJpbWFyeS85MCB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCIgZGlzYWJsZWQ9e2lzU2F2aW5nfT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtpc1NhdmluZyA/IDxMb2FkZXIyIGNsYXNzTmFtZT0idy00IGgtNCBhbmltYXRlLXNwaW4iIC8+IDogPFNhdmUgY2xhc3NOYW1lPSJ3LTQgaC00IiAvPn0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNpbXBhbiBQZXJ1YmFoYW4KICAgICAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+CiAgICAgICAgICAgICAgICAgICAgPC9EaWFsb2dDb250ZW50PgogICAgICAgICAgICAgICAgICA8L0RpYWxvZz4KICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgIDxEaWFsb2cgb3Blbj17aXNQd2RPcGVufSBvbk9wZW5DaGFuZ2U9e3NldElzUHdkT3Blbn0+CiAgICAgICAgICAgICAgICAgICAgPERpYWxvZ1RyaWdnZXIgYXNDaGlsZD4KICAgICAgICAgICAgICAgICAgICAgIDxCdXR0b24gdmFyaWFudD0ib3V0bGluZSIgY2xhc3NOYW1lPSJmbGV4LTEgYmctYmFja2dyb3VuZCBob3ZlcjpiZy1tdXRlZCBib3JkZXItYm9yZGVyLzYwIHNoYWRvdy1zbSBoLTEwIGdhcC0yIHRyYW5zaXRpb24tYWxsIj4KICAgICAgICAgICAgICAgICAgICAgICAgPExvY2sgY2xhc3NOYW1lPSJ3LTQgaC00IiAvPiBQYXNzd29yZAogICAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+CiAgICAgICAgICAgICAgICAgICAgPC9EaWFsb2dUcmlnZ2VyPgogICAgICAgICAgICAgICAgICAgIDxEaWFsb2dDb250ZW50IGNsYXNzTmFtZT0ic206bWF4LXctbWQiPgogICAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0hlYWRlcj4KICAgICAgICAgICAgICAgICAgICAgICAgPERpYWxvZ1RpdGxlIGNsYXNzTmFtZT0iZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgdGV4dC1sZyI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPExvY2sgY2xhc3NOYW1lPSJ3LTUgaC01IHRleHQtcHJpbWFyeSIgLz4KICAgICAgICAgICAgICAgICAgICAgICAgICBVYmFoIFBhc3N3b3JkCiAgICAgICAgICAgICAgICAgICAgICAgIDwvRGlhbG9nVGl0bGU+CiAgICAgICAgICAgICAgICAgICAgICA8L0RpYWxvZ0hlYWRlcj4KICAgICAgICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXtoYW5kbGVQYXNzd29yZENoYW5nZX0gY2xhc3NOYW1lPSJzcGFjZS15LTUgcHQtNCI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJzcGFjZS15LTEuNSI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPExhYmVsIGNsYXNzTmFtZT0idGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCI+UGFzc3dvcmQgQmFydTwvTGFiZWw+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9InJlbGF0aXZlIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxJbnB1dCAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT17c2hvd1B3ZCA/ICJ0ZXh0IiA6ICJwYXNzd29yZCJ9IAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cHdkRm9ybS5uZXdQYXNzd29yZH0gCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtlID0+IHNldFB3ZEZvcm0oey4uLnB3ZEZvcm0sIG5ld1Bhc3N3b3JkOiBlLnRhcmdldC52YWx1ZX0pfQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg9ezZ9CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPSJNaW5pbWFsIDYga2FyYWt0ZXIiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0iaC0xMSByb3VuZGVkLXhsIGJnLW11dGVkLzMwIGJvcmRlci1ib3JkZXIvNjAgcHItMTAiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIG9uQ2xpY2s9eCgpID0+IHNldFNob3dQd2QoIXNob3dQd2QpfSBjbGFzc05hbWU9ImFic29sdXRlIHJpZ2h0LTMgdG9wLTEvMiAtdHJhbnNsYXRlLXktMS8yIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3Zlcjp0ZXh0LWZvcmVncm91bmQgdHJhbnNpdGlvbi1jb2xvcnMiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd1B3ZCA/IDxFeWVPZmYgY2xhc3NOYW1lPSJ3LTQgaC00IiAvPiA6IDxFeWUgY2xhc3NOYW1lPSJ3LTQgaC00IiAvPn0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9InNwYWNlLXktMS41Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICA8TGFiZWwgY2xhc3NOYW1lPSJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIj5Lb25maXJtYXNpIFBhc3N3b3JkPC9MYWJlbD4KICAgICAgICAgICAgICAgICAgICAgICAgICA8SW5wdXQgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPXtzaG93UHdkID8gInRleHQiIDogInBhc3N3b3JkIn0gCiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cHdkRm9ybS5jb25maXJtUGFzc3dvcmR9IAogICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4gc2V0UHdkRm9ybSh7Li4ucHdkRm9ybSwgY29uZmlybVBhc3N3b3JkOiBlLnRhcmdldC52YWx1ZX0pfQogICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQKICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aD17Nn0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPSJVbGFuZ2kgcGFzc3dvcmQgYmFydSIKICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0iaC0xMSByb3VuZGVkLXhsIGJnLW11dGVkLzMwIGJvcmRlci1ib3JkZXIvNjAiCiAgICAgICAgICAgICAgICAgICAgICAgICAgLz4KICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICAgIDxCdXR0b24gdHlwZT0ic3VibWl0IiBjbGFzc05hbWU9InctZnVsbCBoLTExIHJvdW5kZWQteGwgZ2FwLTIgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQiIGRpc2FibGVkPXtwd2RMb2FkaW5nfT4KICAgICAgICAgICAgICAgICAgICAgICAgICB7cHdkTG9hZGluZyA/IDxMb2FkZXIyIGNsYXNzTmFtZT0idy00IGgtNCBhbmltYXRlLXNwaW4iIC8+IDogPExvY2sgY2xhc3NOYW1lPSJ3LTQgaC00IiAvPn0KICAgICAgICAgICAgICAgICAgICAgICAgICBTaW1wYW4gUGFzc3dvcmQKICAgICAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+CiAgICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+CiAgICAgICAgICAgICAgICAgICAgPC9EaWFsb2dDb250ZW50PgogICAgICAgICAgICAgICAgICA8L0RpYWxvZz4KICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAKICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj4K      {/* Data Sections — Modern Cards */}
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
