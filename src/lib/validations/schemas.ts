import { z } from 'zod';

export const loginSchema = z.object({
  nim: z
    .string()
    .min(1, 'NIM wajib diisi')
    .regex(/^LTE-\d{4}-\d{3}$/, 'Format NIM harus LTE-YYYY-XXX (contoh: LTE-2024-001)'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const staffLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter'),
});

export type StaffLoginFormValues = z.infer<typeof staffLoginSchema>;

export const onboardingSchema = z.object({
  tempat_lahir: z.string().min(1, 'Tempat lahir wajib diisi'),
  tanggal_lahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenis_kelamin: z.enum(['L', 'P'], { message: 'Jenis kelamin wajib dipilih' }),
  alamat_lengkap: z.string().min(10, 'Alamat lengkap minimal 10 karakter'),
  kota_asal: z.string().min(1, 'Kota asal wajib diisi'),
  provinsi_asal: z.string().min(1, 'Provinsi wajib diisi'),
  no_hp: z.string().min(10, 'Nomor HP minimal 10 digit').max(15),
  no_hp_darurat: z.string().min(10, 'Nomor HP darurat minimal 10 digit').max(15),
  nama_wali: z.string().min(1, 'Nama wali wajib diisi'),
  hubungan_wali: z.string().min(1, 'Hubungan wali wajib diisi'),
  no_hp_wali: z.string().min(10, 'Nomor HP wali minimal 10 digit').max(15),
  asal_sekolah: z.string().min(1, 'Asal sekolah wajib diisi'),
  tahun_lulus: z.coerce.number().min(2000).max(2030),
  motivasi_bergabung: z.string().min(20, 'Motivasi minimal 20 karakter'),
  ukuran_seragam: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'], { message: 'Ukuran seragam wajib dipilih' }),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export const nilaiSchema = z.object({
  mahasiswa_id: z.string().uuid(),
  mata_pelajaran_id: z.string().uuid(),
  semester: z.string().min(1),
  nilai_teori: z.coerce.number().min(0).max(100),
  nilai_praktek: z.coerce.number().min(0).max(100),
  nilai_attitude: z.coerce.number().min(0).max(100),
  nilai_bahasa_inggris: z.coerce.number().min(0).max(100),
  keterangan_instruktur: z.string().optional(),
});

export type NilaiFormValues = z.infer<typeof nilaiSchema>;

export const pengumumanSchema = z.object({
  judul: z.string().min(5, 'Judul minimal 5 karakter'),
  konten: z.string().min(10, 'Konten minimal 10 karakter'),
  kategori: z.enum(['umum', 'akademik', 'ojt', 'wisuda', 'interview_kapal', 'lowongan_kerja']),
  target_program: z.array(z.enum(['diploma1', 'executive', 'english_cruise'])),
  target_jurusan: z.array(z.enum(['housekeeping', 'fnb_product', 'fnb_service', 'general'])),
  is_pinned: z.boolean().default(false),
  publish_at: z.string(),
  expired_at: z.string().optional(),
});

export type PengumumanFormValues = z.infer<typeof pengumumanSchema>;
