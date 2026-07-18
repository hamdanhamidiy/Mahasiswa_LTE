'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Search, Loader2, BookOpen, Save, X, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchData, createData } from '@/lib/api';

interface StudentNilai {
  id: string;
  nim: string;
  nama_lengkap: string;
  nilai_teori: string;
  nilai_praktek: string;
  nilai_attitude: string;
  nilai_bahasa_inggris: string;
}

function calcNilaiAkhir(t: number, p: number, a: number, e: number) {
  return +(t * 0.3 + p * 0.4 + a * 0.15 + e * 0.15).toFixed(1);
}

function getGrade(nilai: number): string {
  if (nilai >= 90) return 'A';
  if (nilai >= 80) return 'B';
  if (nilai >= 70) return 'C';
  if (nilai >= 60) return 'D';
  return 'E';
}

export default function InstrukturNilaiPage() {
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchStudent, setSearchStudent] = useState('');

  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState<any>(null);
  const [students, setStudents] = useState<StudentNilai[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => { fetchData('instruktur_jadwal').then(d => { setJadwal(d || []); setLoading(false); }); }, []);

  const classes = Array.from(new Map(jadwal.map((j: any) => [
    j.mata_pelajaran_id,
    { mapelId: j.mata_pelajaran_id, mapel: j.mata_pelajaran?.nama_mapel || '—', kode: j.mata_pelajaran?.kode_mapel || '—', kelas: j.kelas || '—', sks: j.mata_pelajaran?.sks || 0 }
  ])).values());

  const filtered = classes.filter(c => !search || c.mapel.toLowerCase().includes(search.toLowerCase()));

  const handleOpenDialog = useCallback(async (cls: any) => {
    setSelectedMapel(cls);
    setIsOpen(true);
    setLoadingStudents(true);
    setSaveSuccess(false);
    setSearchStudent('');

    const res = await fetch(`/api/data?type=instruktur_mahasiswa_by_jadwal&mapel_id=${cls.mapelId}`, { credentials: 'include' });
    const data = await res.json();
    setStudents((data || []).map((s: any) => ({
      id: s.id, nim: s.nim || '—', nama_lengkap: s.nama_lengkap,
      nilai_teori: '', nilai_praktek: '', nilai_attitude: '', nilai_bahasa_inggris: '',
    })));
    setLoadingStudents(false);
  }, []);

  const updateStudentNilai = (studentId: string, field: keyof StudentNilai, value: string) => {
    const num = value === '' ? '' : Math.min(100, Math.max(0, Number(value) || 0)).toString();
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, [field]: num } : s));
  };

  const handleSaveAll = async () => {
    if (!selectedMapel) return;
    setSaving(true);

    const toSave = students.filter(s => s.nilai_teori || s.nilai_praktek || s.nilai_attitude || s.nilai_bahasa_inggris);
    let successCount = 0;
    for (const s of toSave) {
      const t = Number(s.nilai_teori) || 0;
      const p = Number(s.nilai_praktek) || 0;
      const a = Number(s.nilai_attitude) || 0;
      const e = Number(s.nilai_bahasa_inggris) || 0;
      const nilaiAkhir = calcNilaiAkhir(t, p, a, e);
      const grade = getGrade(nilaiAkhir);

      const { error } = await createData('nilai', {
        mahasiswa_id: s.id, mata_pelajaran_id: selectedMapel.mapelId, semester: '1',
        nilai_teori: t, nilai_praktek: p, nilai_attitude: a, nilai_bahasa_inggris: e,
        nilai_akhir: nilaiAkhir, grade,
      });
      if (!error) successCount++;
    }

    setSaving(false);
    if (successCount > 0) { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }
    if (successCount < toSave.length) alert(`${successCount} dari ${toSave.length} nilai berhasil disimpan. Beberapa mungkin sudah ada sebelumnya.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header"><h1>Input Nilai</h1><p>Kelola nilai mahasiswa untuk mata pelajaran Anda</p></div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><GraduationCap className="w-4 h-4 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{loading ? '—' : classes.length}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Mata Pelajaran</p></CardContent></Card>
        <Card className="border border-border shadow-none card-interactive"><CardContent className="p-3.5 text-center"><BookOpen className="w-4 h-4 mx-auto mb-1 text-chart-3" /><p className="text-xl font-bold">{loading ? '—' : classes.reduce((a, c) => a + c.sks, 0)}</p><p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Total SKS</p></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Cari mata pelajaran..." className="pl-9 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat data...</p></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><GraduationCap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" /><p className="text-xs text-muted-foreground font-medium">{classes.length === 0 ? 'Tidak ada kelas yang diampu' : 'Tidak ada hasil'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="formal-table">
                <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Mata Pelajaran</TableHead><TableHead>Kelas</TableHead><TableHead className="text-center">SKS</TableHead><TableHead className="text-center">Aksi</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map((c, i) => (
                    <TableRow key={i} className="hover:bg-accent/40 group">
                      <TableCell><p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{c.mapel}</p><p className="text-[10px] text-muted-foreground font-mono">{c.kode}</p></TableCell>
                      <TableCell className="text-[12px]">{c.kelas}</TableCell>
                      <TableCell className="text-center"><span className="text-sm font-bold tabular-nums text-primary">{c.sks}</span></TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => handleOpenDialog(c)}>Input Nilai</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Input Nilai */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Input Nilai — {selectedMapel?.mapel}</DialogTitle>
            <p className="text-xs text-muted-foreground">{selectedMapel?.kode} • {selectedMapel?.kelas}</p>
          </DialogHeader>

          {loadingStudents ? (
            <div className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /><p className="text-xs text-muted-foreground">Memuat daftar mahasiswa...</p></div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center"><p className="text-xs text-muted-foreground">Tidak ada mahasiswa untuk kelas ini</p></div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="text-[10px] text-muted-foreground">Bobot: Teori 30% • Praktek 40% • Attitude 15% • Bahasa Inggris 15%</div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input placeholder="Cari nama atau NIM..." className="pl-8 h-8 text-xs w-full sm:w-[250px]" value={searchStudent} onChange={e => setSearchStudent(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto border border-border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-[10px] w-[180px]">Mahasiswa</TableHead>
                      <TableHead className="text-[10px] text-center w-[80px]">Teori</TableHead>
                      <TableHead className="text-[10px] text-center w-[80px]">Praktek</TableHead>
                      <TableHead className="text-[10px] text-center w-[80px]">Attitude</TableHead>
                      <TableHead className="text-[10px] text-center w-[80px]">B.Inggris</TableHead>
                      <TableHead className="text-[10px] text-center w-[70px]">Akhir</TableHead>
                      <TableHead className="text-[10px] text-center w-[50px]">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.filter(s => !searchStudent || s.nama_lengkap.toLowerCase().includes(searchStudent.toLowerCase()) || s.nim.toLowerCase().includes(searchStudent.toLowerCase())).map(s => {
                      const t = Number(s.nilai_teori) || 0, p = Number(s.nilai_praktek) || 0;
                      const a = Number(s.nilai_attitude) || 0, e = Number(s.nilai_bahasa_inggris) || 0;
                      const hasAny = !!(s.nilai_teori || s.nilai_praktek || s.nilai_attitude || s.nilai_bahasa_inggris);
                      const akhir = hasAny ? calcNilaiAkhir(t, p, a, e) : 0;
                      const grade = hasAny ? getGrade(akhir) : '—';
                      return (
                        <TableRow key={s.id}>
                          <TableCell><p className="text-[12px] font-medium">{s.nama_lengkap}</p><p className="text-[9px] text-muted-foreground font-mono">{s.nim}</p></TableCell>
                          <TableCell className="p-1.5"><Input type="number" min="0" max="100" className="h-7 text-xs text-center" placeholder="0" value={s.nilai_teori} onChange={e => updateStudentNilai(s.id, 'nilai_teori', e.target.value)} /></TableCell>
                          <TableCell className="p-1.5"><Input type="number" min="0" max="100" className="h-7 text-xs text-center" placeholder="0" value={s.nilai_praktek} onChange={e => updateStudentNilai(s.id, 'nilai_praktek', e.target.value)} /></TableCell>
                          <TableCell className="p-1.5"><Input type="number" min="0" max="100" className="h-7 text-xs text-center" placeholder="0" value={s.nilai_attitude} onChange={e => updateStudentNilai(s.id, 'nilai_attitude', e.target.value)} /></TableCell>
                          <TableCell className="p-1.5"><Input type="number" min="0" max="100" className="h-7 text-xs text-center" placeholder="0" value={s.nilai_bahasa_inggris} onChange={e => updateStudentNilai(s.id, 'nilai_bahasa_inggris', e.target.value)} /></TableCell>
                          <TableCell className="text-center"><span className={`text-sm font-bold tabular-nums ${hasAny ? 'text-primary' : 'text-muted-foreground/30'}`}>{hasAny ? akhir : '—'}</span></TableCell>
                          <TableCell className="text-center"><Badge variant="outline" className={`text-[10px] ${grade === 'A' ? 'border-success/30 text-success' : grade === 'B' ? 'border-primary/30 text-primary' : grade === 'C' ? 'border-warning/30 text-warning' : grade === 'D' || grade === 'E' ? 'border-error/30 text-error' : ''}`}>{grade}</Badge></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-[10px] text-muted-foreground">{students.filter(s => s.nilai_teori || s.nilai_praktek).length} dari {students.length} mahasiswa diisi</p>
                <div className="flex items-center gap-2">
                  {saveSuccess && <span className="text-xs text-success flex items-center gap-1 animate-fade-in"><CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan</span>}
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setIsOpen(false)}><X className="w-3 h-3 mr-1" />Batal</Button>
                  <Button size="sm" className="text-xs bg-primary" onClick={handleSaveAll} disabled={saving}>
                    {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}Simpan Nilai
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
