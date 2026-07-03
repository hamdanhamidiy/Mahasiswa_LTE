import type { FaseAkademik, FaseInfo, ProgramStudi, JurusanType, StatusLaporanOJT, StatusPenyaluran, PredikatKelulusan, KategoriPengumuman } from '@/lib/types';

/**
 * Calculate academic phase based on enrollment date
 * D1: 3 months class → 6 months OJT → 3 months final
 */
export function calculateFase(periodeMasuk: string): FaseInfo[] {
  const start = new Date(periodeMasuk);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);

  const fases: FaseInfo[] = [
    {
      fase: 'fase_kelas',
      label: 'Fase Kelas',
      startMonth: 0,
      endMonth: 3,
      progress: 0,
      isActive: false,
    },
    {
      fase: 'fase_ojt',
      label: 'Fase OJT',
      startMonth: 3,
      endMonth: 9,
      progress: 0,
      isActive: false,
    },
    {
      fase: 'fase_akhir',
      label: 'Fase Akhir',
      startMonth: 9,
      endMonth: 12,
      progress: 0,
      isActive: false,
    },
  ];

  for (const fase of fases) {
    if (diffMonths >= fase.endMonth) {
      fase.progress = 100;
    } else if (diffMonths >= fase.startMonth) {
      fase.isActive = true;
      fase.progress = Math.min(
        100,
        ((diffMonths - fase.startMonth) / (fase.endMonth - fase.startMonth)) * 100
      );
    }
  }

  return fases;
}

/**
 * Get current active phase
 */
export function getCurrentFase(periodeMasuk: string): FaseAkademik {
  const start = new Date(periodeMasuk);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);

  if (diffMonths < 3) return 'fase_kelas';
  if (diffMonths < 9) return 'fase_ojt';
  return 'fase_akhir';
}

/**
 * Get label for fase
 */
export function getFaseLabel(fase: FaseAkademik): string {
  const labels: Record<FaseAkademik, string> = {
    fase_kelas: 'Fase Kelas',
    fase_ojt: 'Fase OJT / Magang',
    fase_akhir: 'Fase Akhir',
  };
  return labels[fase];
}

/**
 * Get label for program
 */
export function getProgramLabel(program: ProgramStudi): string {
  const labels: Record<ProgramStudi, string> = {
    diploma1: 'Diploma 1 (D1)',
    executive: 'Executive',
    english_cruise: 'English for Cruise Ship',
  };
  return labels[program];
}

/**
 * Get label for jurusan
 */
export function getJurusanLabel(jurusan: JurusanType): string {
  const labels: Record<JurusanType, string> = {
    housekeeping: 'Housekeeping',
    fnb_product: 'F&B Product',
    fnb_service: 'F&B Service',
    general: 'Umum',
  };
  return labels[jurusan];
}

/**
 * Get label for OJT status
 */
export function getStatusOJTLabel(status: StatusLaporanOJT): string {
  const labels: Record<StatusLaporanOJT, string> = {
    belum_mulai: 'Belum Mulai',
    sedang_berjalan: 'Sedang Berjalan',
    laporan_dikirim: 'Laporan Dikirim',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
  };
  return labels[status];
}

/**
 * Get label for penyaluran status
 */
export function getStatusPenyaluranLabel(status: StatusPenyaluran): string {
  const labels: Record<StatusPenyaluran, string> = {
    belum_disalurkan: 'Belum Disalurkan',
    proses_interview: 'Proses Interview',
    sudah_bekerja: 'Sudah Bekerja',
  };
  return labels[status];
}

/**
 * Get label for predikat
 */
export function getPredikatLabel(predikat: PredikatKelulusan): string {
  const labels: Record<PredikatKelulusan, string> = {
    Memuaskan: 'Memuaskan',
    Sangat_Memuaskan: 'Sangat Memuaskan',
    Dengan_Pujian: 'Dengan Pujian',
  };
  return labels[predikat];
}

/**
 * Get label for kategori pengumuman
 */
export function getKategoriLabel(kategori: KategoriPengumuman): string {
  const labels: Record<KategoriPengumuman, string> = {
    umum: 'Umum',
    akademik: 'Akademik',
    ojt: 'OJT',
    wisuda: 'Wisuda',
    interview_kapal: 'Interview Kapal',
    lowongan_kerja: 'Lowongan Kerja',
  };
  return labels[kategori];
}

/**
 * Calculate grade from score
 */
export function calculateGrade(nilaiAkhir: number): string {
  if (nilaiAkhir >= 85) return 'A';
  if (nilaiAkhir >= 75) return 'B';
  if (nilaiAkhir >= 65) return 'C';
  if (nilaiAkhir >= 55) return 'D';
  return 'E';
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date short
 */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format time
 */
export function formatTime(timeStr: string): string {
  return timeStr.substring(0, 5); // "08:00"
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get overall 1-year progress percentage
 */
export function getOverallProgress(periodeMasuk: string): number {
  const start = new Date(periodeMasuk);
  const now = new Date();
  const totalDays = 365;
  const elapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(100, Math.max(0, (elapsed / totalDays) * 100));
}

/**
 * Generate star rating display
 */
export function getStarRating(stars: number): string {
  return '⭐'.repeat(Math.min(5, Math.max(1, stars)));
}
