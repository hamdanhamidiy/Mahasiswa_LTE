'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FileText, Download, Printer, GraduationCap, TrendingUp,
  Award, BookOpen, Loader2, CheckCircle2, BarChart3,
} from 'lucide-react';
import { getProgramLabel, getJurusanLabel } from '@/lib/utils/helpers';

interface NilaiItem {
  id: string;
  nilai_teori: number;
  nilai_praktek: number;
  nilai_attitude: number;
  nilai_bahasa_inggris: number;
  nilai_akhir: number;
  grade: string;
  semester: string;
  mata_pelajaran: {
    nama_mapel: string;
    kode_mapel: string;
    sks: number;
    jurusan: string;
  };
}

const BOBOT_GRADE: Record<string, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, E: 0.0 };
const GRADE_COLORS: Record<string, string> = {
  A: 'text-success bg-success/8 border-success/15',
  B: 'text-primary bg-primary/8 border-primary/15',
  C: 'text-warning bg-warning/8 border-warning/15',
  D: 'text-error bg-error/8 border-error/15',
  E: 'text-error bg-error/8 border-error/15',
};

export default function TranskripPage() {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [nilaiData, setNilaiData] = useState<NilaiItem[]>([]);

  useEffect(() => {
    fetchData<NilaiItem[]>('nilai').then(data => {
      if (data) setNilaiData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Calculations
  const totalSKS = nilaiData.reduce((a, n) => a + (n.mata_pelajaran?.sks || 0), 0);
  const totalBobotSKS = nilaiData.reduce((a, n) => {
    const bobot = BOBOT_GRADE[n.grade] ?? 0;
    return a + bobot * (n.mata_pelajaran?.sks || 0);
  }, 0);
  const ipk = totalSKS > 0 ? (totalBobotSKS / totalSKS).toFixed(2) : '0.00';
  const avgNilai = nilaiData.length > 0
    ? (nilaiData.reduce((a, n) => a + n.nilai_akhir, 0) / nilaiData.length).toFixed(1)
    : '—';
  const gradeDist = nilaiData.reduce((a, n) => {
    a[n.grade] = (a[n.grade] || 0) + 1;
    return a;
  }, {} as Record<string, number>);

  // Group by semester
  const bySemester: Record<string, NilaiItem[]> = {};
  for (const n of nilaiData) {
    const sem = n.semester || 'Semester 1';
    if (!bySemester[sem]) bySemester[sem] = [];
    bySemester[sem].push(n);
  }
  const semesterKeys = Object.keys(bySemester).sort();

  // Predicate
  const ipkNum = parseFloat(ipk);
  const predikat = ipkNum >= 3.5 ? 'Dengan Pujian' : ipkNum >= 3.0 ? 'Sangat Memuaskan' : ipkNum >= 2.5 ? 'Memuaskan' : 'Belum Memenuhi';
  const predikatColor = ipkNum >= 3.5 ? 'text-success' : ipkNum >= 3.0 ? 'text-primary' : ipkNum >= 2.5 ? 'text-warning' : 'text-error';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Transkrip Nilai</h1>
            <p>Rekap akademik lengkap — seluruh mata pelajaran</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-primary hover:bg-primary/90 btn-press text-xs h-9">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Unduh PDF
            </Button>
            <Button variant="outline" className="btn-press text-xs h-9">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Cetak
            </Button>
          </div>
        </div>
      </div>

      {/* Identity Strip */}
      <Card className="border border-border shadow-none overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#1e3a5f] to-[#2563eb]" />
        <CardContent className="p-4 sm:p-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="data-label block">Nama Lengkap</span>
              <span className="font-semibold">{user?.nama_lengkap || '—'}</span>
            </div>
            <div>
              <span className="data-label block">NIM</span>
              <span className="font-mono font-semibold">{user?.nim || '—'}</span>
            </div>
            <div>
              <span className="data-label block">Program Studi</span>
              <span className="font-medium">{user?.program ? getProgramLabel(user.program) : '—'}</span>
            </div>
            <div>
              <span className="data-label block">Jurusan</span>
              <span className="font-medium">{user?.jurusan ? getJurusanLabel(user.jurusan) : '—'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 stagger-children">
        <Card className="border border-border/60 shadow-none bg-primary text-white col-span-2 lg:col-span-1 animate-slide-up">
          <CardContent className="p-5 text-center">
            <Award className="w-5 h-5 mx-auto mb-1.5 opacity-60" />
            <p className="text-3xl font-bold tabular-nums">{ipk}</p>
            <p className="text-[10px] text-white/60 mt-0.5 uppercase tracking-wider font-medium">IPK</p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xl font-bold tabular-nums">{avgNilai}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rata-rata</p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xl font-bold tabular-nums">{nilaiData.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mata Pelajaran</p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xl font-bold tabular-nums">{totalSKS}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total SKS</p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-none card-interactive animate-slide-up">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className={`text-sm font-bold ${predikatColor}`}>{predikat}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Predikat</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      {nilaiData.length > 0 && (
        <Card className="border border-border/60 shadow-none">
          <CardHeader className="pb-2 px-5 pt-4">
            <CardTitle className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
              <BarChart3 className="w-3.5 h-3.5" /> Distribusi Grade
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex gap-3">
              {['A', 'B', 'C', 'D', 'E'].map(g => {
                const count = gradeDist[g] || 0;
                const pct = nilaiData.length > 0 ? (count / nilaiData.length) * 100 : 0;
                return (
                  <div key={g} className="flex-1 text-center group">
                    <div className="relative h-24 bg-muted/40 rounded-md overflow-hidden flex flex-col justify-end">
                      <div
                        className={`rounded-t transition-all duration-700 ${
                          g === 'A' ? 'bg-success' : g === 'B' ? 'bg-primary' : g === 'C' ? 'bg-warning' : 'bg-error'
                        }`}
                        style={{ height: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <p className="text-xs font-bold mt-2">{g}</p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">
                      {count} ({Math.round(pct)}%)
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transkrip Table — Per Semester */}
      {semesterKeys.length === 0 && (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/15" />
            <p className="text-sm text-muted-foreground font-medium">Belum ada data transkrip nilai</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Nilai akan muncul setelah diinput oleh instruktur</p>
          </CardContent>
        </Card>
      )}

      {semesterKeys.map(semester => {
        const items = bySemester[semester];
        const semSKS = items.reduce((a, n) => a + (n.mata_pelajaran?.sks || 0), 0);
        const semBobot = items.reduce((a, n) => a + (BOBOT_GRADE[n.grade] ?? 0) * (n.mata_pelajaran?.sks || 0), 0);
        const semIPK = semSKS > 0 ? (semBobot / semSKS).toFixed(2) : '0.00';
        const semAvg = items.length > 0
          ? (items.reduce((a, n) => a + n.nilai_akhir, 0) / items.length).toFixed(1)
          : '—';

        return (
          <Card key={semester} className="border border-border/60 shadow-none overflow-hidden animate-slide-up">
            <CardHeader className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {semester}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {items.length} Mapel · {semSKS} SKS
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-medium text-primary border-primary/20">
                    IPS: {semIPK}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground tabular-nums hidden sm:inline">
                    Avg: {semAvg}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider w-10">#</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Kode</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Mata Pelajaran</TableHead>
                      <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider">SKS</TableHead>
                      <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider">Teori</TableHead>
                      <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider">Praktek</TableHead>
                      <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider">Attitude</TableHead>
                      <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider">B.Ing</TableHead>
                      <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider">Akhir</TableHead>
                      <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((n, idx) => (
                      <TableRow key={n.id} className="hover:bg-accent/50">
                        <TableCell className="text-xs text-muted-foreground tabular-nums">{idx + 1}</TableCell>
                        <TableCell className="text-[11px] font-mono text-muted-foreground">{n.mata_pelajaran?.kode_mapel}</TableCell>
                        <TableCell>
                          <p className="text-[13px] font-medium">{n.mata_pelajaran?.nama_mapel}</p>
                        </TableCell>
                        <TableCell className="text-center text-xs tabular-nums">{n.mata_pelajaran?.sks}</TableCell>
                        <TableCell className="text-center text-xs tabular-nums">{n.nilai_teori}</TableCell>
                        <TableCell className="text-center text-xs tabular-nums font-medium">{n.nilai_praktek}</TableCell>
                        <TableCell className="text-center text-xs tabular-nums">{n.nilai_attitude}</TableCell>
                        <TableCell className="text-center text-xs tabular-nums">{n.nilai_bahasa_inggris}</TableCell>
                        <TableCell className="text-center text-xs tabular-nums font-semibold text-primary">{n.nilai_akhir}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold border ${GRADE_COLORS[n.grade] || ''}`}>
                            {n.grade}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Footer Summary */}
      {nilaiData.length > 0 && (
        <Card className="border border-primary/15 shadow-none bg-primary/[0.02]">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/8">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Ringkasan Transkrip</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {nilaiData.length} mata pelajaran · {totalSKS} SKS total · IPK: {ipk}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Predikat</p>
                  <p className={`font-bold ${predikatColor}`}>{predikat}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">IPK Kumulatif</p>
                  <p className="text-2xl font-bold text-primary tabular-nums">{ipk}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
