'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Download, TrendingUp, Award, BookOpen, Users } from 'lucide-react';

export default function AdminNilaiPage() {
  const rekapKelas = [
    { kelas: 'D1-ALL-25A', mapel: 'English for Hospitality', rataRata: 82.5, gradeA: 8, gradeB: 15, gradeC: 7, gradeD: 2, total: 32 },
    { kelas: 'D1-HK-25A', mapel: 'Housekeeping Management', rataRata: 78.3, gradeA: 5, gradeB: 8, gradeC: 5, gradeD: 2, total: 20 },
    { kelas: 'D1-FP-25A', mapel: 'F&B Product', rataRata: 85.1, gradeA: 10, gradeB: 9, gradeC: 4, gradeD: 1, total: 24 },
    { kelas: 'D1-FS-25A', mapel: 'Restaurant Service', rataRata: 80.7, gradeA: 6, gradeB: 7, gradeC: 4, gradeD: 1, total: 18 },
    { kelas: 'D1-FS-24A', mapel: 'Bartending & Mixology', rataRata: 87.2, gradeA: 12, gradeB: 8, gradeC: 2, gradeD: 0, total: 22 },
  ];
  const overallAvg = (rekapKelas.reduce((a, r) => a + r.rataRata, 0) / rekapKelas.length).toFixed(1);

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Rekap Nilai</h1>
            <p>Ringkasan nilai seluruh kelas LTE Cruise</p>
          </div>
          <Button variant="outline" className="btn-press text-xs h-9"><Download className="w-3.5 h-3.5 mr-1.5" /> Export Raport</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="border border-border shadow-sm card-stat-highlight animate-slide-up">
          <CardContent className="p-5 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1.5 opacity-50" />
            <p className="stat-value">{overallAvg}</p>
            <p className="stat-label mt-1">Rata-rata Keseluruhan</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Total Grade A</p>
                <p className="text-2xl font-bold mt-1.5 text-success metric-value">{rekapKelas.reduce((a, r) => a + r.gradeA, 0)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-success/8"><Award className="w-[18px] h-[18px] text-success" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Mata Pelajaran</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{rekapKelas.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-chart-4/8"><BookOpen className="w-[18px] h-[18px] text-chart-4" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-metric animate-slide-up">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Total Mahasiswa</p>
                <p className="text-2xl font-bold mt-1.5 metric-value">{rekapKelas.reduce((a, r) => a + r.total, 0)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-chart-5/8"><Users className="w-[18px] h-[18px] text-chart-5" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4 text-muted-foreground" /> Rekap per Kelas</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Mata Pelajaran</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Kelas</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Rata-rata</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">A</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">B</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">C</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">D</TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rekapKelas.map((r, i) => (
                  <TableRow key={i} className="hover:bg-accent/50 group">
                    <TableCell className="py-3.5">
                      <p className="text-[13px] font-semibold group-hover:text-primary transition-colors">{r.mapel}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] font-medium">{r.kelas}</Badge></TableCell>
                    <TableCell className="text-center text-sm font-bold text-primary tabular-nums">{r.rataRata}</TableCell>
                    <TableCell className="text-center text-sm text-success tabular-nums font-semibold">{r.gradeA}</TableCell>
                    <TableCell className="text-center text-sm text-primary tabular-nums font-medium">{r.gradeB}</TableCell>
                    <TableCell className="text-center text-sm text-warning tabular-nums font-medium">{r.gradeC}</TableCell>
                    <TableCell className="text-center text-sm text-error tabular-nums font-medium">{r.gradeD}</TableCell>
                    <TableCell className="text-center text-sm tabular-nums font-medium">{r.total}</TableCell>
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
