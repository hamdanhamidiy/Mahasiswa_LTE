'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Shield, Bell, Database, Save, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminPengaturanPage() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div><h1>Pengaturan Sistem</h1><p>Konfigurasi sistem informasi akademik LTE Cruise</p></div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-success flex items-center gap-1 animate-fade-in"><CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan</span>}
            <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15" onClick={handleSave}><Save className="w-3.5 h-3.5 mr-1.5" /> Simpan Pengaturan</Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 stagger-children">
        <Card className="border border-border shadow-sm animate-slide-up">
          <CardHeader className="pb-3 px-5 pt-5"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Settings className="w-4 h-4 text-muted-foreground" /> Informasi Umum</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nama Institusi</Label><Input defaultValue="LTE Cruise" className="h-10 text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Alamat</Label><Input defaultValue="Jl. Pancawarna, Perumahan Oasis Cluster, Tulungrejo, Pare, Kab. Kediri" className="h-10 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email</Label><Input defaultValue="ltecruise@gmail.com" className="h-10 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Website</Label><Input defaultValue="ltecruise.sch.id" className="h-10 text-sm" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm animate-slide-up">
          <CardHeader className="pb-3 px-5 pt-5"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /> Keamanan</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Password Default Mahasiswa Baru</Label><Input type="password" defaultValue="ltecruise2025" className="h-10 text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Masa Berlaku Sesi (menit)</Label><Input type="number" defaultValue="120" className="h-10 text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Masa Berlaku KTM (bulan)</Label><Input type="number" defaultValue="12" className="h-10 text-sm" /></div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm animate-slide-up">
          <CardHeader className="pb-3 px-5 pt-5"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-muted-foreground" /> Notifikasi</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {[
              { label: 'Notifikasi Pengumuman Baru', desc: 'Kirim notifikasi saat pengumuman diterbitkan' },
              { label: 'Notifikasi Interview', desc: 'Kirim notifikasi untuk sesi interview baru' },
              { label: 'Notifikasi Nilai', desc: 'Kirim notifikasi saat nilai diinput' },
            ].map((n, i) => (
              <div key={i} className="flex items-start justify-between p-3.5 rounded-xl border border-border hover:border-primary/20 transition-all card-interactive">
                <div><p className="text-[13px] font-semibold">{n.label}</p><p className="text-[11px] text-muted-foreground mt-0.5">{n.desc}</p></div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
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
              <p className="text-[11px] text-muted-foreground mt-1">21 Mei 2026, 00:00 WIB (Otomatis)</p>
            </div>
            <Button variant="outline" className="w-full btn-press text-xs h-10"><Database className="w-3.5 h-3.5 mr-1.5" /> Backup Manual</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
