'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, TrendingUp, Award, BarChart3, Loader2, BookOpen } from 'lucide-react';

interface NilaiItem { id: string; nilai_teori: number; nilai_praktek: number; nilai_attitude: number; nilai_bahasa_inggris: number; nilai_akhir: number; grade: string; semester: string; mata_pelajaran: { nama_mapel: string; kode_mapel: string; sks: number } }

export default function NilaiPage() {
  const [loading, setLoading] = useState(true);
  const [nilaiData, setNilaiData] = useState<NilaiItem[]>([]);

  useEffect(() => {
    fetchData<NilaiItem[]>('nilai').then(data => { if (data) setNilaiData(data); setLoading(false); });
  }, []);

  const gradeCls: Record<string, string> = { A: 'text-success', B: 'text-primary', C: 'text-warning', D: 'text-error', E: 'text-error' };
  const gradeBg: Record<string, string> = { A: 'bg-success/8', B: 'bg-primary/8', C: 'bg-warning/8', D: 'bg-error/8', E: 'bg-error/8' };

  const avg = nilaiData.length > 0 ? (nilaiData.reduce((a, n) => a + n.nilai_akhir, 0) / nilaiData.length).toFixed(1) : '—';
  const totalSKS = nilaiData.reduce((a, n) => a + (n.mata_pelajaran?.sks || 0), 0);
  const gradeDist = nilaiData.reduce((a, n) => { a[n.grade] = (a[n.grade] || 0) + 1; return a; }, {} as Record<string, number>);
  const bestGrade = Object.keys(gradeDist).sort()[0] || '—';

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center space-y-3">
        <Loader2 className="w-7 h-7 animate-spin text-primary/40 mx-auto" />
        <p className="text-xs text-muted-foreground">Memuat data nilai...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1>Nilai Akademik</h1>
        <p>Teori 30% · Praktek 40% · Attitude 15% · B.Inggris 15%</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="border border-border shadow-sm bg-primary text-white animate-slide-up">
          <CardContent className="p-5 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 opacity-50" />
            <p className="text-3xl font-bold tabular-nums">{avg}</p>
            <p className="text-xs text-white/55 mt-1.5 font-medium">Rata-rata</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-interactive animate-slide-up">
          <CardContent className="p-5 text-center">
            <Award className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{bestGrade}</p>
            <p className="text-xs text-muted-foreground mt-1.5">Grade Terbaik</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-interactive animate-slide-up">
          <CardContent className="p-5 text-center">
            <BookOpen className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{nilaiData.length}</p>
            <p className="text-xs text-muted-foreground mt-1.5">Mata Pelajaran</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm card-interactive animate-slide-up">
          <CardContent className="p-5 text-center">
            <BarChart3 className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{totalSKS}</p>
            <p className="text-xs text-muted-foreground mt-1.5">Total SKS</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      {nilaiData.length > 0 && (
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3 px-5 pt-5">
            <CardTitle className="text-sm font-semibold">Distribusi Grade</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex gap-3">
              {['A', 'B', 'C', 'D', 'E'].map(g => {
                const count = gradeDist[g] || 0;
                const pct = nilaiData.length > 0 ? (count / nilaiData.length) * 100 : 0;
                return (
                  <div key={g} className="flex-1 text-center group">
                    <div className="relative h-24 bg-muted/30 rounded-lg overflow-hidden flex flex-col justify-end transition-all duration-200 group-hover:bg-muted/50">
                      <div className={`rounded-t-md transition-all duration-700 ${g === 'A' ? 'bg-success' : g === 'B' ? 'bg-primary' : g === 'C' ? 'bg-warning' : 'bg-error'}`} style={{ height: `${Math.max(pct, 5)}%` }} />
                    </div>
                    <p className="text-sm font-bold mt-2">{g}</p>
                    <p className="text-[11px] text-muted-foreground">{count}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" /> Daftar Nilai
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {nilaiData.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/12" />
              <p className="text-sm text-muted-foreground font-medium">Belum ada data nilai</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Nilai Anda akan muncul di sini setelah input oleh instruktur</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Mata Pelajaran</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Teori</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Praktek</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Attitude</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">B.Inggris</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Akhir</TableHead>
                    <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wider">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nilaiData.map(n => (
                    <TableRow key={n.id} className="hover:bg-accent/50">
                      <TableCell className="py-3.5">
                        <p className="text-[13px] font-semibold">{n.mata_pelajaran?.nama_mapel}</p>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{n.mata_pelajaran?.kode_mapel}</p>
                      </TableCell>
                      <TableCell className="text-center tabular-nums text-[13px]">{n.nilai_teori}</TableCell>
                      <TableCell className="text-center tabular-nums text-[13px] font-medium">{n.nilai_praktek}</TableCell>
                      <TableCell className="text-center tabular-nums text-[13px]">{n.nilai_attitude}</TableCell>
                      <TableCell className="text-center tabular-nums text-[13px]">{n.nilai_bahasa_inggris}</TableCell>
                      <TableCell className="text-center tabular-nums text-[13px] font-bold text-primary">{n.nilai_akhir}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-bold ${gradeCls[n.grade] || ''} ${gradeBg[n.grade] || ''}`}>{n.grade}</span>
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
  );
}
