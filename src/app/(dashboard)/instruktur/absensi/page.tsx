'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, CheckCircle2, XCircle, AlertCircle, Clock, Calendar, Save, Loader2 } from 'lucide-react';

type Status = 'hadir' | 'izin' | 'sakit' | 'alpha';
interface StudentAbsensi { id: string; nama: string; nim: string; status: Status }

export default function InstrukturAbsensiPage() {
  const [selectedKelas, setSelectedKelas] = useState('D1-ALL-25A');
  const [selectedMapel, setSelectedMapel] = useState('english-hospitality');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const demoKelas = ['D1-ALL-25A', 'D1-FS-25A', 'D1-FS-24A'];
  const demoMapel = [
    { value: 'english-hospitality', label: 'English for Hospitality' },
    { value: 'restaurant-service', label: 'Restaurant Service' },
    { value: 'bartending', label: 'Bartending & Mixology' },
  ];

  const [students, setStudents] = useState<StudentAbsensi[]>([
    { id: '1', nama: 'Rina Maharani', nim: 'LTE-2025-001', status: 'hadir' },
    { id: '2', nama: 'Dimas Pratama', nim: 'LTE-2025-002', status: 'hadir' },
    { id: '3', nama: 'Siti Nurhaliza', nim: 'LTE-2025-003', status: 'hadir' },
    { id: '4', nama: 'Fajar Nugroho', nim: 'LTE-2025-004', status: 'izin' },
    { id: '5', nama: 'Anisa Putri', nim: 'LTE-2025-005', status: 'hadir' },
    { id: '6', nama: 'Budi Setiawan', nim: 'LTE-2025-006', status: 'sakit' },
    { id: '7', nama: 'Citra Dewi', nim: 'LTE-2025-007', status: 'hadir' },
    { id: '8', nama: 'Dwi Lestari', nim: 'LTE-2025-008', status: 'hadir' },
  ]);

  const statusCfg: Record<Status, { label: string; cls: string; bg: string; icon: typeof CheckCircle2 }> = {
    hadir: { label: 'Hadir', cls: 'text-success', bg: 'bg-success/10 border-success/20 hover:bg-success/20', icon: CheckCircle2 },
    izin: { label: 'Izin', cls: 'text-primary', bg: 'bg-primary/10 border-primary/20 hover:bg-primary/20', icon: Clock },
    sakit: { label: 'Sakit', cls: 'text-warning', bg: 'bg-warning/10 border-warning/20 hover:bg-warning/20', icon: AlertCircle },
    alpha: { label: 'Alpha', cls: 'text-error', bg: 'bg-error/10 border-error/20 hover:bg-error/20', icon: XCircle },
  };

  const updateStatus = (id: string, status: Status) => { setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s)); setSaved(false); };
  const counts = students.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const handleSave = async () => { setSaving(true); await new Promise(r => setTimeout(r, 1000)); setSaving(false); setSaved(true); };

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Input Absensi</h1>
            <p>Catat kehadiran mahasiswa per sesi pelajaran</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedKelas} onValueChange={(v) => setSelectedKelas(v ?? '')}>
          <SelectTrigger className="w-full sm:w-48 h-10 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{demoKelas.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={selectedMapel} onValueChange={(v) => setSelectedMapel(v ?? '')}>
          <SelectTrigger className="w-full sm:w-64 h-10 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{demoMapel.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        {(['hadir', 'izin', 'sakit', 'alpha'] as Status[]).map(s => {
          const c = statusCfg[s];
          return (
            <Card key={s} className="border border-border shadow-sm card-metric animate-slide-up">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{c.label}</p>
                    <p className={`text-2xl font-bold mt-1.5 metric-value ${c.cls}`}>{counts[s] || 0}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${s === 'hadir' ? 'bg-success/8' : s === 'izin' ? 'bg-primary/8' : s === 'sakit' ? 'bg-warning/8' : 'bg-error/8'}`}>
                    <c.icon className={`w-[18px] h-[18px] ${c.cls}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-muted-foreground" /> Daftar Hadir — {selectedKelas}
            </CardTitle>
            <div className="flex items-center gap-2">
              {saved && <span className="text-xs text-success flex items-center gap-1 animate-fade-in"><CheckCircle2 className="w-3 h-3" /> Tersimpan</span>}
              <Button size="sm" className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Menyimpan</> : <><Save className="w-3.5 h-3.5 mr-1.5" /> Simpan</>}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider w-8">#</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Mahasiswa</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Status Kehadiran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s, i) => (
                  <TableRow key={s.id} className="hover:bg-accent/50 group">
                    <TableCell className="text-xs text-muted-foreground tabular-nums py-3.5">{i + 1}</TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">{s.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{s.nama}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{s.nim}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5">
                        {(['hadir', 'izin', 'sakit', 'alpha'] as Status[]).map(status => {
                          const cfg = statusCfg[status];
                          const isActive = s.status === status;
                          return (
                            <button key={status} onClick={() => updateStatus(s.id, status)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all duration-200 ${isActive ? cfg.bg + ' ' + cfg.cls : 'border-transparent text-muted-foreground hover:bg-muted/60'}`}>
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
