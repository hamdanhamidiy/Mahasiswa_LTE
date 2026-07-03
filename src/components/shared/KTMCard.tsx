'use client';

import { Ship, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface KTMCardProps {
  nama: string;
  nim: string;
  program: string;
  jurusan: string;
  angkatan: string;
  periodeBerlaku: string;
  fotoUrl?: string;
  isActive?: boolean;
}

export function KTMCard({
  nama,
  nim,
  program,
  jurusan,
  angkatan,
  periodeBerlaku,
  fotoUrl,
  isActive = true,
}: KTMCardProps) {
  return (
    <div className="ktm-card w-full max-w-[400px] aspect-[1.586/1] p-5 flex flex-col justify-between relative select-none">
      {/* Top section */}
      <div>
        <div className="flex items-start justify-between">
          {/* Logo and header */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Ship className="w-5 h-5 text-ocean-light" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-white/90">LTE CRUISE</p>
              <p className="text-[8px] text-ocean-light/80 tracking-wide">LEADING TOURISM EDUCATION</p>
            </div>
          </div>
          {/* Status badge */}
          {isActive ? (
            <Badge className="bg-success/20 text-success border-success/30 text-[9px] px-2 py-0.5">
              AKTIF
            </Badge>
          ) : (
            <Badge className="bg-error/20 text-error border-error/30 text-[9px] px-2 py-0.5">
              TIDAK AKTIF
            </Badge>
          )}
        </div>

        <p className="text-[9px] text-center text-ocean-light/70 font-semibold tracking-widest mt-2 uppercase">
          Kartu Tanda Mahasiswa
        </p>
      </div>

      {/* Middle section — student info */}
      <div className="flex items-end gap-4">
        {/* Photo */}
        <div className="w-16 h-20 rounded-lg bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
          {fotoUrl ? (
            <img src={fotoUrl} alt={nama} className="w-full h-full object-cover" />
          ) : (
            <div className="text-white/30 text-2xl font-bold">
              {nama.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-bold text-white truncate">{nama}</p>
          <p className="text-xs font-mono text-ocean-light">{nim}</p>
          <p className="text-[10px] text-white/70">{program}</p>
          <p className="text-[10px] text-white/70">{jurusan} • {angkatan}</p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[8px] text-white/40 uppercase tracking-wider">Berlaku s/d</p>
          <p className="text-[10px] text-white/70 font-mono">{periodeBerlaku}</p>
          <div className="mt-1">
            <p className="text-[7px] text-white/30 italic">Direktur: Nur Haidi, BA. IR.</p>
          </div>
        </div>
        <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center">
          <QrCode className="w-10 h-10 text-ocean" />
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <Ship className="w-48 h-48" />
      </div>

      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ocean-light to-transparent" />
    </div>
  );
}
