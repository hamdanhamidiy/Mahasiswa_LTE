'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Calendar, Loader2, Save, X, CheckCircle2, UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchData, createData } from '@/lib/api';

interface StudentAbsensi {
  id: string;
  nim: string;
  nama_lengkap: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
}

const statusOpts = [
  { value: 'hadir', label: 'Hadir', icon: UserCheck, cls: 'text-success' },
  { value: 'izin', label: 'Izin', icon: Clock, cls: 'text-warning' },
  { value: 'sakit', label: 'Sakit', icon: AlertTriangle, cls: 'text-chart-3' },
  { value: 'alpha', label: 'Alpha', icon: UserX, cls: 'text-error' },
];

export default function InstrukturAbsensiPage() {
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<any>(null);
  const [students, setStudents] = useState<StudentAbsensi[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => { fetchData('instruktur_jadwal').then(d => { setJadwal(d || []); setLoading(false); }); }, []);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayHari = days[new Date().getDay()];
  const todayJadwal = jadwal.filter((j: any) => j.hari === todayHari);

  const handleOpenAbsensi = useCallback(async (j: any) => {
    setSelectedJadwal(j);
    setIsOpen(true);
    setLoadingStudents(true);
    setSaveSuccess(false);

    const res = await fetch(`/api/data?type=instruktur_mahasiswa_by_jadwal&jadwal_id=${j.id}`, { credentials: 'include' });
    const data = await res.json();
    setStudents((data || []).map((s: any) => ({
      id: s.id, nim: s.nim || '—', nama_lengkap: s.nama_lengkap, status: 'hadir' as const,
    })));
    setLoadingStudents(false);
  }, []);

  const updateStatus = (studentId: string, status: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: status as any } : s));
  };

  const setAllStatus = (status: string) => {
    setStudents(prev => prev.map(s => ({ ...s, status: status as any })));
  };

  const handleSaveAbsensi = async () => {
    if (!selectedJadwal || students.length === 0) return;
    setSaving(true);

    const today = new Date().toISOString().split('T')[0];
    const records = students.map(s => ({
      mahasiswa_id: s.id,
      jadwal_id: selectedJadwal.id,
      tanggal: today,
      status: s.status,
      metode: 'manual',
    }));

    const res = await fetch('/api/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ type: 'absensi_bulk', data: { records } }),
    });

    setSaving(false);
    if (res.ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      const err = await res.json();
      alert('Gagal menyimpan absensi: ' + (err.error || 'Unknown error'));
    }
  };

  const statusCount = (status: string) => students.filter(s => s.status === status).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header"><h1>Input Absensi</h1><p>Rekap kehadiran mahasiswa untuk kelas Anda</p></div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><ClipboardCheck className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{loading ? '—' : jadwal.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Total Kelas</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><Calendar className="w-4 h-4 mx-auto mb-1 text-chart-4" /><p className="text-xl font-bold">{loading ? '—' : todayJadwal.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Hari Ini ({todayHari})</p></CardContent></Card>
      </div>

      <div>
        <h2 className="section-title">Jadwal Hari Ini — {todayHari}</h2>
        <Card className="border border-border shadow-none overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat jadwal...</p></div>
            ) : todayJadwal.length === 0 ? (
              <div className="py-16 text-center"><Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">Tidak ada jadwal hari ini</p></div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="formal-table">
                  <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Mata Pelajaran</TableHead><TableHead>Kelas</TableHead><TableHead>Waktu</TableHead><TableHead>Ruangan</TableHead><TableHead className="text-center">Aksi</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {todayJadwal.map((j: any) => (
                      <TableRow key={j.id} className="hover:bg-accent/40 group">
                        <TableCell><p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{j.mata_pelajaran?.nama_mapel || '—'}</p></TableCell>
                        <TableCell className="text-[12px]">{j.kelas || '—'}</TableCell>
                        <TableCell className="text-[12px] tabular-nums">{j.jam_mulai} - {j.jam_selesai}</TableCell>
                        <TableCell className="text-[12px]">{j.ruangan || '—'}</TableCell>
                        <TableCell className="text-center">
                          <Button size="sm" className="bg-primary text-[10px] h-7" onClick={() => handleOpenAbsensi(j)}>Input Absensi</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All classes */}
      <div>
        <h2 className="section-title">Semua Kelas</h2>
        <Card className="border border-border shadow-none overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>
            ) : jadwal.length === 0 ? (
              <div className="py-12 text-center"><ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">Tidak ada kelas yang diampu</p></div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="formal-table">
                  <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Mata Pelajaran</TableHead><TableHead>Hari</TableHead><TableHead>Waktu</TableHead><TableHead>Kelas</TableHead><TableHead>Ruangan</TableHead><TableHead className="text-center">Aksi</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {jadwal.map((j: any) => (
                      <TableRow key={j.id} className="hover:bg-accent/40">
                        <TableCell className="text-[13px] font-medium">{j.mata_pelajaran?.nama_mapel || '—'}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{j.hari}</Badge></TableCell>
                        <TableCell className="text-[12px] tabular-nums">{j.jam_mulai} - {j.jam_selesai}</TableCell>
                        <TableCell className="text-[12px]">{j.kelas || '—'}</TableCell>
                        <TableCell className="text-[12px]">{j.ruangan || '—'}</TableCell>
                        <TableCell className="text-center">
                          <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => handleOpenAbsensi(j)}>Absensi</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Input Absensi */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Input Absensi — {selectedJadwal?.mata_pelajaran?.nama_mapel}</DialogTitle>
            <p className="text-xs text-muted-foreground">{selectedJadwal?.kelas} • {selectedJadwal?.hari}, {selectedJadwal?.jam_mulai} - {selectedJadwal?.jam_selesai} • {new Date().toLocaleDateString('id-ID')}</p>
          </DialogHeader>

          {loadingStudents ? (
            <div className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat daftar mahasiswa...</p></div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center"><p className="text-xs text-muted-foreground">Tidak ada mahasiswa</p></div>
          ) : (
            <>
              {/* Quick set all */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-muted-foreground font-medium">Set Semua:</span>
                {statusOpts.map(o => (
                  <Button key={o.value} variant="outline" size="sm" className={`text-[10px] h-6 px-2 ${o.cls}`} onClick={() => setAllStatus(o.value)}>
                    <o.icon className="w-3 h-3 mr-1" />{o.label}
                  </Button>
                ))}
              </div>

              {/* Summary chips */}
              <div className="flex gap-2 mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-success/10 text-success font-medium">Hadir: {statusCount('hadir')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-warning/10 text-warning font-medium">Izin: {statusCount('izin')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-chart-3/10 text-chart-3 font-medium">Sakit: {statusCount('sakit')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-error/10 text-error font-medium">Alpha: {statusCount('alpha')}</span>
              </div>

              <div className="overflow-x-auto border border-border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-[10px] w-8">No</TableHead>
                      <TableHead className="text-[10px]">Mahasiswa</TableHead>
                      <TableHead className="text-[10px] w-[160px]">Status Kehadiran</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s, i) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-[11px] text-muted-foreground tabular-nums">{i + 1}</TableCell>
                        <TableCell><p className="text-[12px] font-medium">{s.nama_lengkap}</p><p className="text-[9px] text-muted-foreground font-mono">{s.nim}</p></TableCell>
                        <TableCell>
                          <Select value={s.status} onValueChange={(v) => { if (v) updateStatus(s.id, v); }}>
                            <SelectTrigger className="h-7 text-[11px] w-[140px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {statusOpts.map(o => (
                                <SelectItem key={o.value} value={o.value} className="text-[11px]">{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-[10px] text-muted-foreground">{students.length} mahasiswa</p>
                <div className="flex items-center gap-2">
                  {saveSuccess && <span className="text-xs text-success flex items-center gap-1 animate-fade-in"><CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan</span>}
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setIsOpen(false)}><X className="w-3 h-3 mr-1" />Batal</Button>
                  <Button size="sm" className="text-xs bg-primary" onClick={handleSaveAbsensi} disabled={saving}>
                    {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}Simpan Absensi
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
