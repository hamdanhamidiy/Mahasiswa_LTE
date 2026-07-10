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
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-white/95">LTE CRUISE</p>
              <p className="text-[8px] text-white/60 tracking-wide">LEADING TOURISM EDUCATION</p>
            </div>
          </div>
          {/* Status badge */}
          {isActive ? (
            <Badge className="bg-emerald-400/20 text-emerald-100 border-emerald-400/30 text-[9px] px-2 py-0.5">
              AKTIF
            </Badge>
          ) : (
            <Badge className="bg-red-400/20 text-red-200 border-red-400/30 text-[9px] px-2 py-0.5">
              TIDAK AKTIF
            </Badge>
          )}
        </div>

        <p className="text-[9px] text-center text-white/60 font-semibold tracking-widest mt-2 uppercase">
          Kartu Tanda Mahasiswa
        </p>
      </div>

      {/* Middle section — student info */}
      <div className="flex items-end gap-4">
        {/* Photo */}
        <div className="w-16 h-20 rounded-lg bg-white/15 border border-white/25 overflow-hidden shrink-0 flex items-center justify-center">
          {fotoUrl ? (
            <img src={fotoUrl} alt={nama} className="w-full h-full object-cover" />
          ) : (
            <div className="text-white/40 text-2xl font-bold">
              {nama.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-bold text-white truncate">{nama}</p>
          <p className="text-xs font-mono text-white/80">{nim}</p>
          <p className="text-[10px] text-white/75">{program}</p>
          <p className="text-[10px] text-white/75">{jurusan} • {angkatan}</p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[8px] text-white/45 uppercase tracking-wider">Berlaku s/d</p>
          <p className="text-[10px] text-white/75 font-mono">{periodeBerlaku}</p>
          <div className="mt-1">
            <p className="text-[7px] text-white/35 italic">Direktur: Nur Haidi, BA. IR.</p>
          </div>
        </div>
        <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center">
          <QrCode className="w-10 h-10 text-[#1e3a5f]" />
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <Ship className="w-48 h-48" />
      </div>

      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}
