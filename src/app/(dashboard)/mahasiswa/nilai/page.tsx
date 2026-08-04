'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, TrendingUp, Award, BarChart3, Loader2, BookOpen, Star } from 'lucide-react';

interface NilaiItem { id: string; nilai_teori: number; nilai_praktek: number; nilai_attitude: number; nilai_bahasa_inggris: number; nilai_akhir: number; grade: string; semester: string; mata_pelajaran: { nama_mapel: string; kode_mapel: string; sks: number } }

export default function NilaiPage() {
  const [loading, setLoading] = useState(true);
  const [nilaiData, setNilaiData] = useState<NilaiItem[]>([]);

  useEffect(() => {
    fetchData<NilaiItem[]>('nilai').then(data => { if (data) setNilaiData(data); setLoading(false); });
  }, []);

  const gradeColors: Record<string, { text: string; bg: string; border: string; ring: string }> = {
    A: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', ring: 'ring-emerald-500/20' },
    B: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', ring: 'ring-blue-500/20' },
    C: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', ring: 'ring-amber-500/20' },
    D: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20', ring: 'ring-orange-500/20' },
    E: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/20', ring: 'ring-red-500/20' },
  };

  const avg = nilaiData.length > 0 ? (nilaiData.reduce((a, n) => a + n.nilai_akhir, 0) / nilaiData.length).toFixed(1) : '—';
  const totalSKS = nilaiData.reduce((a, n) => a + (n.mata_pelajaran?.sks || 0), 0);
  const gradeDist = nilaiData.reduce((a, n) => { a[n.grade] = (a[n.grade] || 0) + 1; return a; }, {} as Record<string, number>);
  const bestGrade = Object.keys(gradeDist).sort()[0] || '—';

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground animate-pulse">Memuat data nilai...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h1 className="text-2xl font-bold tracking-tight">Nilai Akademik</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-[18px]">Teori 30% · Praktek 40% · Attitude 15% · B.Inggris 15%</p>
        </div>
        <Badge variant="outline" className="text-xs font-medium px-3 h-8 flex items-center gap-1.5 bg-background w-fit">
          <BookOpen className="w-3.5 h-3.5 text-primary" /> {nilaiData.length} Mata Pelajaran
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
        {[
          { label: 'Rata-rata Nilai', value: avg, desc: 'Nilai akhir', icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
          { label: 'Grade Terbaik', value: bestGrade, desc: 'Pencapaian tertinggi', icon: Award, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
          { label: 'Total Mapel', value: `${nilaiData.length}`, desc: 'Telah dievaluasi', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' },
          { label: 'Total SKS', value: `${totalSKS}`, desc: 'Kredit semester', icon: BarChart3, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
        ].map((stat, i) => (
          <div key={i} className={`group relative bg-card p-5 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up hover:-translate-y-1 overflow-hidden`}>
            <stat.icon className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.color} opacity-5 group-hover:scale-110 transition-transform duration-500`} />
            <div className="relative z-10">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} w-fit mb-4`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums mb-1">{stat.value}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grade Distribution */}
      {nilaiData.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden animate-slide-up">
          <div className="p-5 border-b border-border/50 flex items-center gap-2.5 bg-muted/10">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm">Distribusi Grade</h3>
          </div>
          <div className="p-6 bg-background/50">
            <div className="flex gap-4">
              {['A', 'B', 'C', 'D', 'E'].map(g => {
                const count = gradeDist[g] || 0;
                const pct = nilaiData.length > 0 ? (count / nilaiData.length) * 100 : 0;
                const gc = gradeColors[g];
                return (
                  <div key={g} className="flex-1 group">
                    <div className="relative h-28 bg-muted/20 rounded-xl overflow-hidden flex flex-col justify-end transition-all duration-200 group-hover:bg-muted/30">
                      <div 
                        className={`rounded-t-lg transition-all duration-700 ease-out ${g === 'A' ? 'bg-emerald-500' : g === 'B' ? 'bg-blue-500' : g === 'C' ? 'bg-amber-500' : g === 'D' ? 'bg-orange-500' : 'bg-red-500'}`} 
                        style={{ height: `${Math.max(pct, 6)}%` }} 
                      />
                    </div>
                    <div className="text-center mt-3">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border text-sm font-bold ${gc.text} ${gc.bg} ${gc.border}`}>
                        {g}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 font-semibold tabular-nums">{count}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Nilai Cards — Modern List */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden animate-slide-up">
        <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm">Daftar Nilai</h3>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">{nilaiData.length} mapel</span>
        </div>
        
        <div className="bg-background/50">
          {nilaiData.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center space-y-3 py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-semibold text-sm">Belum ada data nilai</p>
                <p className="text-xs text-muted-foreground mt-1">Nilai akan muncul setelah diinput oleh instruktur</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {nilaiData.map((n, i) => {
                const gc = gradeColors[n.grade] || gradeColors.E;
                return (
                  <div key={n.id} className="group px-5 py-4 hover:bg-muted/20 transition-colors animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Subject Info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 ${gc.text} ${gc.bg} ${gc.border}`}>
                          {n.grade}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{n.mata_pelajaran?.nama_mapel}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                            {n.mata_pelajaran?.kode_mapel && <span className="font-mono">{n.mata_pelajaran.kode_mapel}</span>}
                            <span>•</span>
                            <span>{n.mata_pelajaran?.sks || 0} SKS</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Scores */}
                      <div className="hidden sm:flex items-center gap-3 shrink-0">
                        {[
                          { label: 'T', value: n.nilai_teori },
                          { label: 'P', value: n.nilai_praktek },
                          { label: 'A', value: n.nilai_attitude },
                          { label: 'BI', value: n.nilai_bahasa_inggris },
                        ].map((s) => (
                          <div key={s.label} className="text-center min-w-[36px]">
                            <p className="text-[9px] text-muted-foreground/60 uppercase font-semibold">{s.label}</p>
                            <p className="text-xs font-bold tabular-nums mt-0.5">{s.value}</p>
                          </div>
                        ))}
                        <div className="w-px h-8 bg-border/60 mx-1" />
                        <div className="text-center min-w-[44px]">
                          <p className="text-[9px] text-muted-foreground/60 uppercase font-semibold">Akhir</p>
                          <p className="text-sm font-bold tabular-nums mt-0.5 text-primary">{n.nilai_akhir}</p>
                        </div>
                      </div>

                      {/* Mobile: Final Score */}
                      <div className="sm:hidden text-right shrink-0">
                        <p className="text-lg font-bold tabular-nums text-primary">{n.nilai_akhir}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
