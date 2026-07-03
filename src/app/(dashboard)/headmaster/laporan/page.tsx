'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, BarChart3, TrendingUp, Users, Briefcase, Award } from 'lucide-react';

export default function HeadmasterLaporanPage() {
  const reports = [
    { title: 'Laporan Akademik Semester Ganjil 2024/2025', type: 'Akademik', date: '15 Jan 2025', size: '2.4 MB' },
    { title: 'Rekap Kehadiran Mahasiswa Semester Ganjil', type: 'Absensi', date: '10 Jan 2025', size: '1.8 MB' },
    { title: 'Laporan Penyaluran Alumni 2024', type: 'Alumni', date: '28 Des 2024', size: '3.1 MB' },
    { title: 'Evaluasi Program OJT Batch 24', type: 'OJT', date: '20 Des 2024', size: '4.2 MB' },
    { title: 'Laporan Keuangan Q4 2024', type: 'Keuangan', date: '5 Des 2024', size: '1.5 MB' },
    { title: 'Laporan Interview Kapal Pesiar 2024', type: 'Interview', date: '15 Nov 2024', size: '2.0 MB' },
  ];

  const typeCfg: Record<string, string> = {
    Akademik: 'text-primary border-primary/20', Absensi: 'text-chart-3 border-chart-3/20',
    Alumni: 'text-chart-5 border-chart-5/20', OJT: 'text-warning border-warning/20',
    Keuangan: 'text-success border-success/20', Interview: 'text-chart-2 border-chart-2/20',
  };

  const quickStats = [
    { label: 'Total Laporan', value: reports.length.toString(), icon: FileText },
    { label: 'Bulan Ini', value: '2', icon: Calendar },
    { label: 'Terunduh', value: '45', icon: Download },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-xl font-semibold tracking-tight">Laporan</h1><p className="text-muted-foreground text-sm mt-0.5">Unduh dan tinjau laporan institusi</p></div>
        <Button className="bg-primary btn-press"><FileText className="w-4 h-4 mr-2" /> Generate Laporan</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 stagger-children">
        {quickStats.map((s, i) => (
          <Card key={i} className={`border border-border/60 shadow-none card-interactive animate-slide-up ${i === 0 ? 'bg-primary text-white' : ''}`}>
            <CardContent className="p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${i === 0 ? 'opacity-60' : 'text-muted-foreground'}`} />
              <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
              <p className={`text-[10px] mt-0.5 ${i === 0 ? 'text-white/60' : 'text-muted-foreground'}`}>{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3 stagger-children">
        {reports.map((r, i) => (
          <Card key={i} className="border border-border/60 shadow-none card-glow animate-slide-up">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-muted/60 shrink-0">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold leading-snug">{r.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={`text-[10px] ${typeCfg[r.type] || ''}`}>{r.type}</Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{r.date}</span>
                      <span className="text-[11px] text-muted-foreground">{r.size}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="btn-press shrink-0">
                  <Download className="w-3 h-3 mr-1.5" /> Unduh
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
