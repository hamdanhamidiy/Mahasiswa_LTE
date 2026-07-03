'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  mahasiswa: 'Mahasiswa',
  instruktur: 'Instruktur',
  admin: 'Administrator',
  headmaster: 'Direktur',
  dashboard: 'Dashboard',
  profil: 'Profil',
  jadwal: 'Jadwal',
  absensi: 'Absensi',
  nilai: 'Nilai',
  ojt: 'OJT Tracker',
  ktm: 'KTM Digital',
  pengumuman: 'Pengumuman',
  interview: 'Interview',
  pembayaran: 'Pembayaran',
  transkrip: 'Transkrip Nilai',
  'mitra-kerja': 'Mitra Kerja',
  'mata-pelajaran': 'Mata Pelajaran',
  sertifikat: 'Sertifikat',
  alumni: 'Alumni',
  pengaturan: 'Pengaturan',
  statistik: 'Statistik',
  laporan: 'Laporan',
  daftar: 'Pendaftaran',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  // Build breadcrumb items, skipping the role segment in the label
  const items = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    const isLast = index === segments.length - 1;
    return { label, href, isLast };
  });

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <Link href={`/${segments[0]}/dashboard`} className="flex items-center">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.slice(1).map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 breadcrumb-separator" />
          {item.isLast ? (
            <span className="breadcrumb-current">{item.label}</span>
          ) : (
            <Link href={item.href}>{item.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
