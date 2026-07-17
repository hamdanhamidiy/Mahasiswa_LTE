'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, Loader2 } from 'lucide-react';
import { fetchData } from '@/lib/api';

interface ReportItem {
  title: string;
  type: string;
  date: string;
  description: string;
}

const typeCfg: Record<string, string> = {
  Akademik: 'text-primary border-primary/20', Absensi: 'text-chart-3 border-chart-3/20',
  Alumni: 'text-chart-5 border-chart-5/20', OJT: 'text-warning border-warning/20',
  Statistik: 'text-success border-success/20', Interview: 'text-chart-2 border-chart-2/20',
};

export default function HeadmasterLaporanPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);

  useEffect(() => {
    fetchData('headmaster_stats').then(d => {
      setStats(d);
      // Generate dynamic reports based on real data
      const today = new Date();
      const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const monthYear = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      
      const dynamicReports: ReportItem[] = [
        { 
          title: `Rekap Mahasiswa Aktif — ${monthYear}`, 
          type: 'Akademik', 
          date: dateStr, 
          description: `Total ${d?.totalMahasiswa || 0} mahasiswa aktif terdaftar di sistem` 
        },
        { 
          title: `Laporan Kehadiran — ${monthYear}`, 
          type: 'Absensi', 
          date: dateStr, 
          description: `Rata-rata kehadiran: ${d?.avgKehadiran || 0}%` 
        },
        { 
          title: `Status OJT Mahasiswa — ${monthYear}`, 
          type: 'OJT', 
          date: dateStr, 
          description: `${d?.totalOJT || 0} mahasiswa sedang menjalani OJT di ${d?.uniqueCountries || 0} negara` 
        },
        { 
          title: `Rekap Alumni & Penyaluran Kerja`, 
          type: 'Alumni', 
          date: dateStr, 
          description: `Total ${d?.totalAlumni || 0} alumni bersertifikat terdaftar` 
        },
        { 
          title: `Statistik Instruktur — ${monthYear}`, 
          type: 'Statistik', 
          date: dateStr, 
          description: `${d?.totalInstruktur || 0} instruktur aktif mengajar` 
        },
      ];
      setReports(dynamicReports);
      setLoading(false);
    });
  }, []);

  const handleDownload = (report: ReportItem) => {
    // Generate a simple text report for download
    const content = `LAPORAN ${report.type.toUpperCase()}\nLTE Cruise — Kampung Inggris, Pare, Kediri\n${'='.repeat(50)}\n\nJudul: ${report.title}\nTanggal: ${report.date}\n\n${report.description}\n\n${'='.repeat(50)}\nGenerated: ${new Date().toLocaleString('id-ID')}\n`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${report.type.toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickStats = [
    { label: 'Total Laporan', value: reports.length.toString(), icon: FileText },
    { label: 'Bulan Ini', value: reports.length.toString(), icon: Calendar },
    { label: 'Unduhan', value: '—', icon: Download },
  ];

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-xl font-semibold tracking-tight">Laporan</h1><p className="text-muted-foreground text-sm mt-0.5">Unduh dan tinjau laporan institusi</p></div>
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
                    <p className="text-[11px] text-muted-foreground mt-1">{r.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={`text-[10px] ${typeCfg[r.type] || ''}`}>{r.type}</Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{r.date}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="btn-press shrink-0" onClick={() => handleDownload(r)}>
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
