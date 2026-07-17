import * as fs from 'fs';
import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEFAULT_PASSWORD = 'LteCruise2026!';

async function importStudents() {
  console.log('Reading Excel file...');
  const workbook = xlsx.readFile('./data/DATABASE SISWA LTE TAHUN 2020-2026.xlsx');
  
  // Choose the first sheet for now
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Read data
  const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  const headers = rawData[0];
  
  // Data starts from index 1
  let processed = 0;
  let errors = 0;

  for (let i = 2; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    const nama_lengkap = row[1]?.toString().trim();
    const programRaw = row[2]?.toString().trim();
    const jurusanRaw = row[3]?.toString().trim();
    const card_no = row[4]?.toString().trim();
    const dob = row[5]?.toString().trim();
    const asal_sekolah = row[7]?.toString().trim();
    const kota = row[8]?.toString().trim();
    const no_hp = row[12]?.toString().trim();
    const nama_ortu = row[13]?.toString().trim();
    const hp_ortu = row[14]?.toString().trim();
    const ojt_hotel = row[16]?.toString().trim();
    
    if (!nama_lengkap || !card_no) {
      continue; // Skip empty or invalid rows
    }

    // Process mapping
    let programEnum = null;
    if (programRaw?.toLowerCase().includes('diploma') || programRaw?.toLowerCase().includes('regular')) {
      programEnum = 'diploma1';
    } else if (programRaw?.toLowerCase().includes('executive')) {
      programEnum = 'executive';
    } else if (programRaw?.toLowerCase().includes('cruise')) {
      programEnum = 'english_cruise';
    }

    let jurusanEnum = 'general';
    if (jurusanRaw?.toLowerCase().includes('housekeeping')) jurusanEnum = 'housekeeping';
    else if (jurusanRaw?.toLowerCase().includes('product')) jurusanEnum = 'fnb_product';
    else if (jurusanRaw?.toLowerCase().includes('service')) jurusanEnum = 'fnb_service';

    const email = `${card_no.toLowerCase()}@student.ltecruise.sch.id`;

    // Parse DOB DD.MM.YYYY to YYYY-MM-DD (e.g. 15.01.1991)
    let parsedDob = null;
    if (dob && dob.includes('.')) {
        const parts = dob.split('.');
        if (parts.length === 3) parsedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    try {
      // 1. Create user in Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'mahasiswa' }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
            console.log(`[SKIP] User already exists: ${email}`);
            continue;
        }
        throw new Error(`Auth Error: ${authError.message}`);
      }

      const userId = authData.user.id;

      // 2. Insert into users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          nim: card_no,
          nama_lengkap: nama_lengkap,
          email: email,
          role: 'mahasiswa',
          program: programEnum,
          jurusan: jurusanEnum,
          angkatan: 'Angkatan 2020-2026',
          status_aktif: true
        });

      if (userError) throw new Error(`Users Table Error: ${userError.message}`);

      // 3. Insert into mahasiswa_profile
      const { error: profileError } = await supabase
        .from('mahasiswa_profile')
        .insert({
          id: userId,
          tanggal_lahir: parsedDob,
          kota_asal: kota,
          no_hp: no_hp,
          nama_wali: nama_ortu,
          no_hp_wali: hp_ortu,
          asal_sekolah: asal_sekolah
        });

      if (profileError) throw new Error(`Profile Table Error: ${profileError.message}`);

      // 4. Optionally insert OJT records
      if (ojt_hotel && ojt_hotel.trim() !== '' && ojt_hotel.trim() !== '-') {
          await supabase.from('ojt_records').insert({
              mahasiswa_id: userId,
              nama_hotel_tempat_magang: ojt_hotel,
              status_laporan: 'sedang_berjalan',
              tanggal_mulai: '2020-01-01',
              tanggal_selesai: '2020-06-01'
          });
      }

      processed++;
      console.log(`[SUCCESS] Imported: ${nama_lengkap} (${card_no})`);

    } catch (err) {
      errors++;
      console.error(`[ERROR] Failed to import ${nama_lengkap} (${card_no}):`, err.message);
    }
  }

  console.log(`\nImport Completed!`);
  console.log(`Total Processed: ${processed}`);
  console.log(`Total Errors: ${errors}`);
}

importStudents();
