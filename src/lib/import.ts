/**
 * CSV Import Utility
 * Parses CSV files and provides column mapping helpers.
 */

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
}

/**
 * Parse a CSV string into headers and rows.
 * Handles quoted fields, commas inside quotes, and various line endings.
 */
export function parseCSV(text: string): ParsedCSV {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  
  // Parse a single CSV line respecting quoted fields
  function parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++; // skip escaped quote
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',' || char === ';' || char === '\t') {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(current.trim());
    return result;
  }

  // Filter out empty lines
  const nonEmpty = lines.filter(l => l.trim().length > 0);
  if (nonEmpty.length === 0) return { headers: [], rows: [], rawRows: [] };

  const headers = parseLine(nonEmpty[0]);
  const rawRows: string[][] = [];
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < nonEmpty.length; i++) {
    const values = parseLine(nonEmpty[i]);
    rawRows.push(values);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return { headers, rows, rawRows };
}

/**
 * Read a File object as text (handles UTF-8 BOM).
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      let text = reader.result as string;
      // Strip UTF-8 BOM
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      resolve(text);
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Target field definition for Smart Mapping UI.
 */
export interface TargetField {
  key: string;        // internal field name (e.g. 'nama_lengkap')
  label: string;      // display label (e.g. 'Nama Lengkap')
  required: boolean;  // whether this field must be mapped
  defaultValue?: string; // fallback if not mapped
  aliases?: string[]; // auto-match aliases (e.g. ['nama', 'name', 'nama siswa'])
}

/**
 * Auto-match CSV headers to target fields based on aliases.
 * Returns a mapping: targetFieldKey -> csvHeaderName (or '' if not matched).
 */
export function autoMatchColumns(
  csvHeaders: string[],
  targetFields: TargetField[]
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedHeaders = new Set<string>();

  for (const field of targetFields) {
    // Check exact match first
    const exactMatch = csvHeaders.find(
      h => h.toLowerCase() === field.key.toLowerCase() && !usedHeaders.has(h)
    );
    if (exactMatch) {
      mapping[field.key] = exactMatch;
      usedHeaders.add(exactMatch);
      continue;
    }

    // Check aliases
    if (field.aliases) {
      const aliasMatch = csvHeaders.find(h => {
        const lower = h.toLowerCase().trim();
        return field.aliases!.some(a => a.toLowerCase() === lower) && !usedHeaders.has(h);
      });
      if (aliasMatch) {
        mapping[field.key] = aliasMatch;
        usedHeaders.add(aliasMatch);
        continue;
      }
    }

    // No match
    mapping[field.key] = '';
  }

  return mapping;
}

/**
 * Apply column mapping to transform raw CSV rows into target-shaped objects.
 */
export function applyMapping(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
  targetFields: TargetField[]
): Record<string, string>[] {
  return rows.map(row => {
    const result: Record<string, string> = {};
    for (const field of targetFields) {
      const csvCol = mapping[field.key];
      if (csvCol && row[csvCol] !== undefined && row[csvCol] !== '') {
        result[field.key] = row[csvCol];
      } else {
        result[field.key] = field.defaultValue || '';
      }
    }
    return result;
  });
}

// ============================================================
// Target field presets per entity
// ============================================================

export const MAHASISWA_FIELDS: TargetField[] = [
  { key: 'nama_lengkap', label: 'Nama Lengkap', required: true, aliases: ['nama', 'name', 'nama siswa', 'nama mahasiswa', 'nama_lengkap', 'full_name', 'fullname'] },
  { key: 'nim', label: 'NIM', required: false, aliases: ['nim', 'no_induk', 'nomor_induk', 'nomor induk', 'student_id'] },
  { key: 'email', label: 'Email', required: true, aliases: ['email', 'e-mail', 'email_address', 'alamat_email'] },
  { key: 'password', label: 'Password', required: false, defaultValue: 'ltecruise2025', aliases: ['password', 'pass', 'kata_sandi', 'sandi'] },
  { key: 'program', label: 'Program Studi', required: false, defaultValue: 'diploma1', aliases: ['program', 'program_studi', 'prodi', 'jenjang'] },
  { key: 'jurusan', label: 'Jurusan', required: false, defaultValue: 'general', aliases: ['jurusan', 'department', 'dept', 'major', 'konsentrasi'] },
  { key: 'kelas', label: 'Kelas', required: false, defaultValue: 'CLASS A', aliases: ['kelas', 'class', 'kelompok', 'group'] },
  { key: 'angkatan', label: 'Angkatan', required: false, defaultValue: `Angkatan ${new Date().getFullYear()}`, aliases: ['angkatan', 'batch', 'tahun_masuk', 'tahun masuk', 'year'] },
];

export const INSTRUKTUR_FIELDS: TargetField[] = [
  { key: 'nama_lengkap', label: 'Nama Lengkap', required: true, aliases: ['nama', 'name', 'nama_lengkap', 'nama_tutor', 'nama tutor', 'nama instruktur', 'full_name'] },
  { key: 'email', label: 'Email', required: true, aliases: ['email', 'e-mail', 'email_address'] },
  { key: 'password', label: 'Password', required: false, defaultValue: 'tutor2025', aliases: ['password', 'pass', 'kata_sandi'] },
];

export const JADWAL_FIELDS: TargetField[] = [
  { key: 'kode_mapel', label: 'Kode Mata Pelajaran', required: true, aliases: ['kode_mapel', 'kode', 'kode_mk', 'kode mk', 'code', 'kode mata pelajaran', 'mapel'] },
  { key: 'email_instruktur', label: 'Email Instruktur', required: true, aliases: ['email_instruktur', 'email_tutor', 'email tutor', 'instruktur', 'tutor', 'pengajar'] },
  { key: 'kelas', label: 'Kelas', required: false, defaultValue: 'A', aliases: ['kelas', 'class', 'group', 'kelompok'] },
  { key: 'hari', label: 'Hari', required: true, aliases: ['hari', 'day', 'hari_kuliah'] },
  { key: 'jam_mulai', label: 'Jam Mulai', required: true, aliases: ['jam_mulai', 'mulai', 'start', 'waktu_mulai', 'start_time', 'jam mulai'] },
  { key: 'jam_selesai', label: 'Jam Selesai', required: true, aliases: ['jam_selesai', 'selesai', 'end', 'waktu_selesai', 'end_time', 'jam selesai'] },
  { key: 'ruangan', label: 'Ruangan', required: false, defaultValue: '-', aliases: ['ruangan', 'room', 'ruang', 'tempat', 'lokasi'] },
];

export const PEMBAYARAN_FIELDS: TargetField[] = [
  { key: 'nim', label: 'NIM Mahasiswa', required: true, aliases: ['nim', 'no_induk', 'nomor_induk', 'nomor induk', 'student_id'] },
  { key: 'jenis', label: 'Jenis Pembayaran', required: true, aliases: ['jenis', 'jenis_pembayaran', 'type', 'tagihan', 'keterangan', 'deskripsi'] },
  { key: 'jumlah', label: 'Jumlah (Rp)', required: true, aliases: ['jumlah', 'amount', 'nominal', 'total', 'biaya', 'harga'] },
  { key: 'tanggal_jatuh_tempo', label: 'Jatuh Tempo', required: true, aliases: ['tanggal_jatuh_tempo', 'jatuh_tempo', 'deadline', 'due_date', 'batas_bayar', 'tenggat'] },
  { key: 'status', label: 'Status', required: false, defaultValue: 'belum_lunas', aliases: ['status', 'status_pembayaran'] },
];
