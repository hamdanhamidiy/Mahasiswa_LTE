'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Shield, Bell, Database, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { exportToJSON } from '@/lib/export';
import { fetchData } from '@/lib/api';

interface SiteSettings {
  nama_institusi: string;
  alamat: string;
  email: string;
  website: string;
  password_default: string;
  masa_sesi: string;
  masa_ktm: string;
  notif_pengumuman: boolean;
  notif_interview: boolean;
  notif_nilai: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  nama_institusi: 'LTE Cruise',
  alamat: 'Jl. Pancawarna, Perumahan Oasis Cluster, Tulungrejo, Pare, Kab. Kediri',
  email: 'ltecruise@gmail.com',
  website: 'ltecruise.sch.id',
  password_default: 'ltecruise2025',
  masa_sesi: '120',
  masa_ktm: '12',
  notif_pengumuman: true,
  notif_interview: true,
  notif_nilai: true,
};

export default function AdminPengaturanPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [backingUp, setBackingUp] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lte_cruise_settings');
      if (stored) setSettings(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('lte_cruise_settings', JSON.stringify(settings));
      toast.success('Pengaturan berhasil disimpan');
    } catch {
      toast.error('Gagal menyimpan pengaturan');
    }
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      // Fetch all major data for backup
      const [mahasiswa, mapel, jadwal, instruktur] = await Promise.all([
        fetchData('admin_mahasiswa'),
        fetchData('admin_mata_pelajaran'),
        fetchData('admin_jadwal'),
        fetchData('admin_instruktur'),
      ]);

      const backupData = {
        metadata: {
          tanggal_backup: new Date().toISOString(),
          institusi: settings.nama_institusi,
          versi: '1.0',
        },
        pengaturan: settings,
        data: { mahasiswa, mata_pelajaran: mapel, jadwal, instruktur },
      };

      exportToJSON(backupData, `backup-lte-cruise-${new Date().toISOString().split('T')[0]}`);
      toast.success('Backup berhasil diunduh');
    } catch {
      toast.error('Gagal membuat backup');
    } finally {
      setBackingUp(false);
    }
  };

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div><h1>Pengaturan Sistem</h1><p>Konfigurasi sistem informasi akademik LTE Cruise</p></div>
          <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15" onClick={handleSave}><Save className="w-3.5 h-3.5 mr-1.5" /> Simpan Pengaturan</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 stagger-children">
        <Card className="border border-border shadow-sm animate-slide-up">
          <CardHeader className="pb-3 px-5 pt-5"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Settings className="w-4 h-4 text-muted-foreground" /> Informasi Umum</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nama Institusi</Label><Input value={settings.nama_institusi} onChange={e => updateSetting('nama_institusi', e.target.value)} className="h-10 text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Alamat</Label><Input value={settings.alamat} onChange={e => updateSetting('alamat', e.target.value)} className="h-10 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email</Label><Input value={settings.email} onChange={e => updateSetting('email', e.target.value)} className="h-10 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Website</Label><Input value={settings.website} onChange={e => updateSetting('website', e.target.value)} className="h-10 text-sm" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm animate-slide-up">
          <CardHeader className="pb-3 px-5 pt-5"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /> Keamanan</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Password Default Mahasiswa Baru</Label><Input type="password" value={settings.password_default} onChange={e => updateSetting('password_default', e.target.value)} className="h-10 text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Masa Berlaku Sesi (menit)</Label><Input type="number" value={settings.masa_sesi} onChange={e => updateSetting('masa_sesi', e.target.value)} className="h-10 text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Masa Berlaku KTM (bulan)</Label><Input type="number" value={settings.masa_ktm} onChange={e => updateSetting('masa_ktm', e.target.value)} className="h-10 text-sm" /></div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm animate-slide-up">
          <CardHeader className="pb-3 px-5 pt-5"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-muted-foreground" /> Notifikasi</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {[
              { key: 'notif_pengumuman' as const, label: 'Notifikasi Pengumuman Baru', desc: 'Kirim notifikasi saat pengumuman diterbitkan' },
              { key: 'notif_interview' as const, label: 'Notifikasi Interview', desc: 'Kirim notifikasi untuk sesi interview baru' },
              { key: 'notif_nilai' as const, label: 'Notifikasi Nilai', desc: 'Kirim notifikasi saat nilai diinput' },
            ].map((n) => (
              <div key={n.key} className="flex items-start justify-between p-3.5 rounded-xl border border-border hover:border-primary/20 transition-all card-interactive">
                <div><p className="text-[13px] font-semibold">{n.label}</p><p className="text-[11px] text-muted-foreground mt-0.5">{n.desc}</p></div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked={settings[n.key]} onChange={e => updateSetting(n.key, e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm animate-slide-up">
          <CardHeader className="pb-3 px-5 pt-5"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Database className="w-4 h-4 text-muted-foreground" /> Database & Backup</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
              <p className="text-[13px] font-semibold">Status Database</p>
              <p className="text-[11px] text-success mt-1 flex items-center gap-1.5"><span className="online-dot" /> Terhubung — Supabase</p>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
              <p className="text-[13px] font-semibold">Backup Terakhir</p>
              <p className="text-[11px] text-muted-foreground mt-1">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <Button variant="outline" className="w-full btn-press text-xs h-10" onClick={handleBackup} disabled={backingUp}>
              {backingUp ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Database className="w-3.5 h-3.5 mr-1.5" />}
              {backingUp ? 'Membuat Backup...' : 'Backup Manual'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
