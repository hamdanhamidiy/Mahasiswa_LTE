'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Save, Loader2, CheckCircle2, Search, Award, Users } from 'lucide-react';

interface StudentNilai { id: string; nama: string; nim: string; nilai_teori: number; nilai_praktek: number; nilai_attitude: number; nilai_bahasa_inggris: number; nilai_akhir: number; grade: string }

function calcGrade(n: number): string { if (n >= 85) return 'A'; if (n >= 75) return 'B'; if (n >= 65) return 'C'; if (n >= 55) return 'D'; return 'E'; }
function calcFinal(t: number, p: number, a: number, b: number): number { return Math.round(t * 0.3 + p * 0.4 + a * 0.15 + b * 0.15); }

export default function InstrukturNilaiPage() {
  const [selectedMapel, setSelectedMapel] = useState('english-hospitality');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const demoMapel = [
    { value: 'english-hospitality', label: 'English for Hospitality' },
    { value: 'restaurant-service', label: 'Restaurant Service' },
    { value: 'bartending', label: 'Bartending & Mixology' },
  ];

  const [students, setStudents] = useState<StudentNilai[]>([
    { id: '1', nama: 'Rina Maharani', nim: 'LTE-2025-001', nilai_teori: 88, nilai_praktek: 92, nilai_attitude: 90, nilai_bahasa_inggris: 85, nilai_akhir: 0, grade: '' },
    { id: '2', nama: 'Dimas Pratama', nim: 'LTE-2025-002', nilai_teori: 75, nilai_praktek: 82, nilai_attitude: 85, nilai_bahasa_inggris: 78, nilai_akhir: 0, grade: '' },
    { id: '3', nama: 'Siti Nurhaliza', nim: 'LTE-2025-003', nilai_teori: 80, nilai_praktek: 88, nilai_attitude: 82, nilai_bahasa_inggris: 90, nilai_akhir: 0, grade: '' },
    { id: '4', nama: 'Fajar Nugroho', nim: 'LTE-2025-004', nilai_teori: 70, nilai_praktek: 75, nilai_attitude: 80, nilai_bahasa_inggris: 72, nilai_akhir: 0, grade: '' },
    { id: '5', nama: 'Anisa Putri', nim: 'LTE-2025-005', nilai_teori: 85, nilai_praktek: 90, nilai_attitude: 88, nilai_bahasa_inggris: 82, nilai_akhir: 0, grade: '' },
    { id: '6', nama: 'Budi Setiawan', nim: 'LTE-2025-006', nilai_teori: 62, nilai_praktek: 68, nilai_attitude: 75, nilai_bahasa_inggris: 65, nilai_akhir: 0, grade: '' },
  ].map(s => { const akhir = calcFinal(s.nilai_teori, s.nilai_praktek, s.nilai_attitude, s.nilai_bahasa_inggris); return { ...s, nilai_akhir: akhir, grade: calcGrade(akhir) }; }));

  const updateNilai = (id: string, field: keyof Pick<StudentNilai, 'nilai_teori' | 'nilai_praktek' | 'nilai_attitude' | 'nilai_bahasa_inggris'>, value: number) => {
    setStudents(prev => prev.map(s => { if (s.id !== id) return s; const updated = { ...s, [field]: value }; const akhir = calcFinal(updated.nilai_teori, updated.nilai_praktek, updated.nilai_attitude, updated.nilai_bahasa_inggris); return { ...updated, nilai_akhir: akhir, grade: calcGrade(akhir) }; }));
    setSaved(false);
  };

  const gradeCls: Record<string, string> = { A: 'text-success', B: 'text-primary', C: 'text-warning', D: 'text-error', E: 'text-error' };
  const filtered = students.filter(s => s.nama.toLowerCase().includes(search.toLowerCase()) || s.nim.toLowerCase().includes(search.toLowerCase()));
  const handleSave = async () => { setSaving(true); await new Promise(r => setTimeout(r, 1000)); setSaving(false); setSaved(true); };
  const avg = students.length > 0 ? (students.reduce((a, s) => a + s.nilai_akhir, 0) / students.length).toFixed(1) : '0';

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Input Nilai</h1>
            <p>Teori 30% · Praktek 40% · Attitude 15% · B.Inggris 15%</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-success flex items-center gap-1 animate-fade-in"><CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan</span>}
            <Button className="bg-primary btn-press text-xs h-9 shadow-md shadow-primary/15" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Menyimpan</> : <><Save className="w-3.5 h-3.5 mr-1.5" /> Simpan Nilai</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedMapel} onValueChange={(v) => setSelectedMapel(v ?? '')}>
          <SelectTrigger className="w-full sm:w-64 h-10 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{demoMapel.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari mahasiswa..." className="pl-10 h-10 text-sm bg-muted/30" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-stat-highlight animate-slide-up">
          <CardContent className="p-5 text-center"><p className="stat-value">{avg}</p><p className="stat-label mt-1">Rata-rata Kelas</p></CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Mahasiswa</p><p className="text-2xl font-bold mt-1.5 metric-value">{students.length}</p></div><div className="p-2.5 rounded-xl bg-chart-4/8"><Users className="w-[18px] h-[18px] text-chart-4" /></div></div></CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Grade A</p><p className="text-2xl font-bold mt-1.5 text-success metric-value">{students.filter(s => s.grade === 'A').length}</p></div><div className="p-2.5 rounded-xl bg-success/8"><Award className="w-[18px] h-[18px] text-success" /></div></div></CardContent>
        </Card>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4 text-muted-foreground" /> Input Nilai — {demoMapel.find(m => m.value === selectedMapel)?.label}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider w-8">#</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Mahasiswa</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider w-20">Teori</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider w-20">Praktek</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider w-20">Attitude</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider w-20">B.Inggris</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider w-16">Akhir</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider w-14">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s, i) => (
                  <TableRow key={s.id} className="hover:bg-accent/50 group">
                    <TableCell className="text-xs text-muted-foreground tabular-nums py-3.5">{i + 1}</TableCell>
                    <TableCell className="py-3.5">
                      <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{s.nama}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{s.nim}</p>
                    </TableCell>
                    {(['nilai_teori', 'nilai_praktek', 'nilai_attitude', 'nilai_bahasa_inggris'] as const).map(field => (
                      <TableCell key={field} className="text-center">
                        <Input type="number" min={0} max={100} value={s[field]} onChange={e => updateNilai(s.id, field, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-16 h-8 text-center text-sm mx-auto tabular-nums border-border" />
                      </TableCell>
                    ))}
                    <TableCell className="text-center tabular-nums text-sm font-bold text-primary">{s.nilai_akhir}</TableCell>
                    <TableCell className="text-center"><span className={`text-sm font-bold ${gradeCls[s.grade] || ''}`}>{s.grade}</span></TableCell>
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
