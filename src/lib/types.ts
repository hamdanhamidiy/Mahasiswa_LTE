export type UserRole = 'mahasiswa' | 'instruktur' | 'admin' | 'headmaster';
export type ProgramStudi = 'diploma1' | 'executive' | 'english_cruise';
export type JurusanType = 'housekeeping' | 'fnb_product' | 'fnb_service' | 'general';
export type JenisKelamin = 'L' | 'P';
export type UkuranSeragam = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type FaseAkademik = 'fase_kelas' | 'fase_ojt' | 'fase_akhir';
export type HariType = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
export type StatusAbsensi = 'hadir' | 'izin' | 'sakit' | 'alpha';
export type MetodeAbsensi = 'qr_scan' | 'manual' | 'online';
export type StatusLaporanOJT = 'belum_mulai' | 'sedang_berjalan' | 'laporan_dikirim' | 'disetujui' | 'ditolak';
export type PredikatKelulusan = 'Memuaskan' | 'Sangat_Memuaskan' | 'Dengan_Pujian';
export type StatusPenyaluran = 'belum_disalurkan' | 'proses_interview' | 'sudah_bekerja';
export type KategoriPengumuman = 'umum' | 'akademik' | 'ojt' | 'wisuda' | 'interview_kapal' | 'lowongan_kerja';
export type JenisInterview = 'kapal_pesiar' | 'hotel_luar_negeri';
export type StatusInterview = 'akan_datang' | 'sedang_berlangsung' | 'selesai';

export interface User {
  id: string;
  nim: string | null;
  nama_lengkap: string;
  email: string;
  role: UserRole;
  program: ProgramStudi | null;
  jurusan: JurusanType;
  angkatan: string | null;
  periode_masuk: string | null;
  status_aktif: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MahasiswaProfile {
  id: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: JenisKelamin | null;
  alamat_lengkap: string | null;
  kota_asal: string | null;
  provinsi_asal: string | null;
  no_hp: string | null;
  no_hp_darurat: string | null;
  nama_wali: string | null;
  hubungan_wali: string | null;
  no_hp_wali: string | null;
  asal_sekolah: string | null;
  tahun_lulus: number | null;
  motivasi_bergabung: string | null;
  ukuran_seragam: UkuranSeragam | null;
  foto_ktp_url: string | null;
  foto_ijazah_url: string | null;
  is_onboarded: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface MataPelajaran {
  id: string;
  kode_mapel: string;
  nama_mapel: string;
  program: ProgramStudi;
  jurusan: JurusanType;
  fase: FaseAkademik;
  sks: number;
  deskripsi: string | null;
  instruktur_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Jadwal {
  id: string;
  mata_pelajaran_id: string;
  instruktur_id: string;
  kelas: string;
  hari: HariType;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string | null;
  tanggal_efektif_mulai: string;
  tanggal_efektif_selesai: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  mata_pelajaran?: MataPelajaran;
  instruktur?: User;
}

export interface Absensi {
  id: string;
  mahasiswa_id: string;
  jadwal_id: string;
  tanggal: string;
  status: StatusAbsensi;
  metode: MetodeAbsensi;
  keterangan: string | null;
  dicatat_oleh: string | null;
  created_at: string;
  updated_at: string;
}

export interface Nilai {
  id: string;
  mahasiswa_id: string;
  mata_pelajaran_id: string;
  semester: string;
  nilai_teori: number | null;
  nilai_praktek: number | null;
  nilai_attitude: number | null;
  nilai_bahasa_inggris: number | null;
  nilai_akhir: number | null;
  grade: string | null;
  keterangan_instruktur: string | null;
  instruktur_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  mata_pelajaran?: MataPelajaran;
}

export interface OJTRecord {
  id: string;
  mahasiswa_id: string;
  nama_hotel_tempat_magang: string;
  bintang_hotel: number | null;
  kota: string | null;
  negara: string;
  posisi_magang: string | null;
  tanggal_mulai: string;
  tanggal_selesai: string;
  nama_supervisor: string | null;
  kontak_supervisor: string | null;
  nilai_ojt_hotel: number | null;
  nilai_ojt_instruktur: number | null;
  nilai_ojt_akhir: number | null;
  status_laporan: StatusLaporanOJT;
  catatan_instruktur: string | null;
  dokumen_surat_penerimaan_url: string | null;
  dokumen_laporan_mingguan_url: string[];
  dokumen_laporan_akhir_url: string | null;
  foto_kegiatan_urls: string[];
  instruktur_pembimbing_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SertifikatAlumni {
  id: string;
  mahasiswa_id: string;
  nomor_sertifikat: string;
  tanggal_lulus: string;
  ipk_akhir: number | null;
  predikat: PredikatKelulusan;
  tempat_ojt_terakhir: string | null;
  status_penyaluran: StatusPenyaluran;
  nama_kapal_hotel_kerja: string | null;
  perusahaan_agensi: string | null;
  negara_kerja: string | null;
  posisi_kerja: string | null;
  tanggal_berangkat_kerja: string | null;
  gaji_estimasi: number | null;
  issued_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  konten: string;
  kategori: KategoriPengumuman;
  target_program: ProgramStudi[];
  target_jurusan: JurusanType[];
  penulis_id: string;
  is_pinned: boolean;
  publish_at: string;
  expired_at: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  penulis?: User;
}

export interface KTMDigital {
  id: string;
  mahasiswa_id: string;
  qr_payload: string;
  is_active: boolean;
  generated_at: string;
  expired_at: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewSession {
  id: string;
  nama_perusahaan_agensi: string;
  jenis: JenisInterview;
  tanggal_interview: string;
  lokasi: string | null;
  kuota: number;
  deskripsi: string | null;
  requirements: string | null;
  dokumen_yang_dibutuhkan: string[];
  pendaftar_ids: string[];
  approved_ids: string[];
  rejected_ids: string[];
  status: StatusInterview;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// Dashboard stat types
export interface DashboardStats {
  totalMahasiswa: number;
  mahasiswaOJT: number;
  mahasiswaFaseAkhir: number;
  totalAlumniBekerja: number;
  persentaseKehadiran: number;
  rataRataNilai: number;
}

// Fase timeline helper
export interface FaseInfo {
  fase: FaseAkademik;
  label: string;
  startMonth: number;
  endMonth: number;
  progress: number;
  isActive: boolean;
}
