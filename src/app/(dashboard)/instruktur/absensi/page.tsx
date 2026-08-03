'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Calendar, Loader2, Save, X, CheckCircle2, UserCheck, UserX, Clock, AlertTriangle, PlayCircle, StopCircle, Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchData } from '@/lib/api';

interface StudentAbsensi {
  id: string;
  nim: string;
  nama_lengkap: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  metode?: string;
}

const statusOpts = [
  { value: 'hadir', label: 'Hadir', icon: UserCheck, cls: 'text-success' },
  { value: 'izin', label: 'Izin', icon: Clock, cls: 'text-warning' },
  { value: 'sakit', label: 'Sakit', icon: AlertTriangle, cls: 'text-chart-3' },
  { value: 'alpha', label: 'Alpha', icon: UserX, cls: 'text-error' },
];

export default function InstrukturAbsensiPage() {
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<any>(null);
  const [students, setStudents] = useState<StudentAbsensi[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Live Session State
  const [duration, setDuration] = useState('15');
  const [sessionActionLoading, setSessionActionLoading] = useState(false);

  const fetchJadwalAndSessions = useCallback(async () => {
    try {
      const [jData, sData] = await Promise.all([
        fetchData('instruktur_jadwal'),
        fetchData('active_absensi_sessions')
      ]);
      setJadwal(jData || []);
      setActiveSessions(sData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJadwalAndSessions();
  }, [fetchJadwalAndSessions]);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayHari = days[new Date().getDay()];
  const todayJadwal = jadwal.filter((j: any) => j.hari === todayHari);

  const handleOpenAbsensi = useCallback(async (j: any) => {
    setSelectedJadwal(j);
    setIsOpen(true);
    setLoadingStudents(true);
    setSaveSuccess(false);

    try {
      // 1. Get all students for this class
      const res = await fetch(`/api/data?type=instruktur_mahasiswa_by_jadwal&jadwal_id=${j.id}`, { credentials: 'include' });
      const mhsData = await res.json();
      
      // 2. Get today's attendance records for this class (if any)
      const today = new Date().toISOString().split('T')[0];
      const resAbs = await fetch(`/api/data?type=absensi_by_jadwal_date&jadwal_id=${j.id}&tanggal=${today}`, { credentials: 'include' });
      const absData = await resAbs.json();
      
      const absMap = new Map((absData || []).map((a: any) => [a.mahasiswa_id, a]));

      setStudents((mhsData || []).map((s: any) => {
        const record: any = absMap.get(s.id);
        return {
          id: s.id, 
          nim: s.nim || '—', 
          nama_lengkap: s.nama_lengkap, 
          status: record ? record.status : 'alpha',
          metode: record ? record.metode : 'manual'
        };
      }));
    } catch (err) {
      console.error("Gagal mengambil data absensi", err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // Poll for live attendance if session is active
  useEffect(() => {
    let interval: any;
    if (isOpen && selectedJadwal) {
      const activeSess = activeSessions.find(s => s.jadwal_id === selectedJadwal.id);
      if (activeSess) {
        interval = setInterval(async () => {
          const today = new Date().toISOString().split('T')[0];
          const resAbs = await fetch(`/api/data?type=absensi_by_jadwal_date&jadwal_id=${selectedJadwal.id}&tanggal=${today}`, { credentials: 'include' });
          if (resAbs.ok) {
            const absData = await resAbs.json();
            const absMap = new Map((absData || []).map((a: any) => [a.mahasiswa_id, a]));
            setStudents(prev => prev.map(s => {
              const record: any = absMap.get(s.id);
              if (record && record.status === 'hadir' && s.status !== 'hadir') {
                return { ...s, status: record.status, metode: record.metode };
              }
              return s;
            }));
          }
        }, 5000); // poll every 5s
      }
    }
    return () => clearInterval(interval);
  }, [isOpen, selectedJadwal, activeSessions]);

  const updateStatus = (studentId: string, status: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: status as any, metode: 'manual' } : s));
  };

  const setAllStatus = (status: string) => {
    setStudents(prev => prev.map(s => ({ ...s, status: status as any, metode: 'manual' })));
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
      metode: s.metode || 'manual',
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

  const handleOpenSession = async () => {
    if (!selectedJadwal) return;
    setSessionActionLoading(true);
    const res = await fetch('/api/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ type: 'open_absensi_session', data: { jadwal_id: selectedJadwal.id, duration_minutes: parseInt(duration) } })
    });
    setSessionActionLoading(false);
    if (res.ok) {
      fetchJadwalAndSessions();
      // Reset all to alpha when opening a new session (optional, but logical)
      setStudents(prev => prev.map(s => ({ ...s, status: 'alpha', metode: 'manual' })));
    } else {
      alert("Gagal membuka sesi");
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    setSessionActionLoading(true);
    const res = await fetch('/api/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ type: 'close_absensi_session', data: { session_id: sessionId } })
    });
    setSessionActionLoading(false);
    if (res.ok) {
      fetchJadwalAndSessions();
    }
  };

  const statusCount = (status: string) => students.filter(s => s.status === status).length;
  
  const activeSess = selectedJadwal ? activeSessions.find(s => s.jadwal_id === selectedJadwal.id) : null;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="page-header">
        <h1>Input Absensi</h1>
        <p>Rekap kehadiran mahasiswa untuk kelas Anda secara Live Online</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-4 text-center">
            <ClipboardCheck className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{loading ? '—' : jadwal.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-1">Total Kelas</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive">
          <CardContent className="p-4 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-chart-4" />
            <p className="text-2xl font-bold">{loading ? '—' : todayJadwal.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-1">Hari Ini ({todayHari})</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-none card-interactive col-span-2 md:col-span-1 bg-primary/5">
          <CardContent className="p-4 text-center">
            <Timer className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">{loading ? '—' : activeSessions.length}</p>
            <p className="text-[10px] text-primary/70 uppercase tracking-wider font-medium mt-1">Sesi Aktif</p>
          </CardContent>
        </Card>
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
                    <TableHead>Mata Pelajaran</TableHead><TableHead>Kelas</TableHead><TableHead>Waktu</TableHead><TableHead>Status</TableHead><TableHead className="text-center">Aksi</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {todayJadwal.map((j: any) => {
                      const isActive = activeSessions.some(s => s.jadwal_id === j.id);
                      return (
                        <TableRow key={j.id} className="hover:bg-accent/40 group">
                          <TableCell><p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{j.mata_pelajaran?.nama_mapel || '—'}</p></TableCell>
                          <TableCell className="text-[12px]">{j.kelas || '—'}</TableCell>
                          <TableCell className="text-[12px] tabular-nums">{j.jam_mulai} - {j.jam_selesai}</TableCell>
                          <TableCell>
                            {isActive ? (
                              <Badge variant="outline" className="bg-success/10 text-success border-success/20 animate-pulse text-[10px] gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Live
                              </Badge>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">Tutup</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button size="sm" className="bg-primary text-[11px] h-7 px-4" onClick={() => handleOpenAbsensi(j)}>Kelola Absensi</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Input Absensi */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg">Absensi: {selectedJadwal?.mata_pelajaran?.nama_mapel}</DialogTitle>
            <p className="text-sm text-muted-foreground">{selectedJadwal?.kelas} • {selectedJadwal?.hari}, {selectedJadwal?.jam_mulai} - {selectedJadwal?.jam_selesai}</p>
          </DialogHeader>

          {loadingStudents ? (
            <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-sm text-muted-foreground">Memuat daftar mahasiswa...</p></div>
          ) : (
            <div className="space-y-4">
              {/* Live Session Controller */}
              <Card className={`border ${activeSess ? 'border-primary/50 bg-primary/5 shadow-md shadow-primary/5' : 'border-border shadow-none'}`}>
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      {activeSess ? (
                        <><span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Sesi Absensi Online Aktif</>
                      ) : (
                        <><Timer className="w-4 h-4 text-muted-foreground" /> Sesi Absensi Online</>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeSess 
                        ? "Mahasiswa dapat melakukan absen mandiri dari dashboard mereka. Layar ini akan ter-update otomatis."
                        : "Buka sesi agar mahasiswa dapat absen secara mandiri dari perangkat mereka."}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    {activeSess ? (
                      <Button size="sm" variant="destructive" className="w-full sm:w-auto h-8 text-xs" onClick={() => handleCloseSession(activeSess.id)} disabled={sessionActionLoading}>
                        {sessionActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <StopCircle className="w-3.5 h-3.5 mr-1.5" />}
                        Tutup Sesi
                      </Button>
                    ) : (
                      <>
                        <Select value={duration} onValueChange={(v) => { if (v) setDuration(v); }}>
                          <SelectTrigger className="h-8 text-xs w-[110px] bg-background">
                            <SelectValue placeholder="Durasi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15" className="text-xs">15 Menit</SelectItem>
                            <SelectItem value="30" className="text-xs">30 Menit</SelectItem>
                            <SelectItem value="60" className="text-xs">60 Menit</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90" onClick={handleOpenSession} disabled={sessionActionLoading}>
                          {sessionActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <PlayCircle className="w-3.5 h-3.5 mr-1.5" />}
                          Buka Sesi
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Data Table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-md bg-success/10 text-success font-semibold border border-success/20">Hadir: {statusCount('hadir')}</span>
                    <span className="text-[11px] px-2.5 py-1 rounded-md bg-warning/10 text-warning font-semibold border border-warning/20">Izin: {statusCount('izin')}</span>
                    <span className="text-[11px] px-2.5 py-1 rounded-md bg-chart-3/10 text-chart-3 font-semibold border border-chart-3/20">Sakit: {statusCount('sakit')}</span>
                    <span className="text-[11px] px-2.5 py-1 rounded-md bg-error/10 text-error font-semibold border border-error/20">Alpha: {statusCount('alpha')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline-block">Ubah Semua:</span>
                    {statusOpts.map(o => (
                      <Button key={o.value} variant="outline" size="sm" className={`text-[10px] h-6 px-2 ${o.cls} bg-background hover:bg-background/80`} onClick={() => setAllStatus(o.value)}>
                        {o.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[40vh]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs w-12 text-center">No</TableHead>
                        <TableHead className="text-xs">Mahasiswa</TableHead>
                        <TableHead className="text-xs w-[120px]">Metode</TableHead>
                        <TableHead className="text-xs w-[160px] text-right pr-4">Status Kehadiran</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground">Tidak ada mahasiswa terdaftar di kelas ini.</TableCell></TableRow>
                      ) : students.map((s, i) => (
                        <TableRow key={s.id} className="hover:bg-accent/30 group">
                          <TableCell className="text-[12px] text-muted-foreground tabular-nums text-center">{i + 1}</TableCell>
                          <TableCell>
                            <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">{s.nama_lengkap}</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{s.nim}</p>
                          </TableCell>
                          <TableCell>
                            {s.metode === 'online' ? (
                              <Badge variant="outline" className="text-[9px] bg-primary/5 text-primary border-primary/20">Online Click</Badge>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Manual</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Select value={s.status} onValueChange={(v) => { if (v) updateStatus(s.id, v); }}>
                              <SelectTrigger className={`h-8 text-[12px] w-[130px] ml-auto font-medium ${
                                s.status === 'hadir' ? 'border-success text-success bg-success/5' : 
                                s.status === 'izin' ? 'border-warning text-warning bg-warning/5' : 
                                s.status === 'sakit' ? 'border-chart-3 text-chart-3 bg-chart-3/5' : 
                                'border-error text-error bg-error/5'
                              }`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOpts.map(o => (
                                  <SelectItem key={o.value} value={o.value} className="text-[12px] font-medium">{o.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border">
                <p className="text-[12px] text-muted-foreground font-medium">Total: <span className="text-foreground">{students.length}</span> Mahasiswa</p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {saveSuccess && <span className="text-xs text-success font-medium flex items-center gap-1 animate-fade-in px-2"><CheckCircle2 className="w-4 h-4" /> Tersimpan</span>}
                  <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-semibold w-full sm:w-auto" onClick={() => setIsOpen(false)}>Batal</Button>
                  <Button size="sm" className="h-9 px-5 text-xs font-semibold bg-primary hover:bg-primary/90 w-full sm:w-auto shadow-md shadow-primary/20" onClick={handleSaveAbsensi} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Simpan Final
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
