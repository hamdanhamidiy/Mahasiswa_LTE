import xlsx from 'xlsx';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const files = [
  'data/DIPLOMA 1 AGUSTUS 2026.xlsx',
  'data/EXECUTIVE EFC AGUSTUS 2026.xlsx'
];

const hariMap = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

async function getOrCreateInstruktur(name) {
  const { data } = await supabase.from('users').select('id, nama_lengkap').eq('role', 'instruktur').ilike('nama_lengkap', `%${name}%`).limit(1);
  if (data && data.length > 0) return data[0].id;
  
  // Create dummy instruktur
  const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@ltecruise.sch.id`;
  console.log(`Creating instruktur: ${name} (${email})`);
  const authRes = await supabase.auth.admin.createUser({
    email,
    password: 'ltecruise2025',
    email_confirm: true,
  });
  
  let userId = authRes.data?.user?.id;
  if (!userId) {
     const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
     if (existing) return existing.id;
     // Fallback to first admin
     const { data: admin } = await supabase.from('users').select('id').eq('role', 'admin').limit(1);
     return admin[0].id;
  }
  
  await supabase.from('users').update({
    nama_lengkap: name,
    role: 'instruktur'
  }).eq('id', userId);
  
  return userId;
}

async function getOrCreateMapel(name, programName) {
  const { data } = await supabase.from('mata_pelajaran').select('id').ilike('nama_mapel', `%${name}%`).limit(1);
  if (data && data.length > 0) return data[0].id;
  
  let pStudi = 'diploma1';
  if (programName.toLowerCase().includes('executive')) pStudi = 'executive';
  
  const { data: newMapel, error } = await supabase.from('mata_pelajaran').insert({
    nama_mapel: name,
    kode_mapel: `MP-${name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
    program: pStudi,
    jurusan: 'general',
    fase: 'fase_kelas'
  }).select().single();
  
  if (error) console.error("Error creating mapel:", error);
  return newMapel?.id;
}

async function parseSchedules() {
  const result = [];
  const studentsClassMap = [];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    
    const wb = xlsx.readFile(file);
    for (const sheetName of wb.SheetNames) {
      if (sheetName.toLowerCase().startsWith('class') || sheetName.toLowerCase().startsWith('kelas')) {
        const ws = wb.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
        
        let subjectRow = -1;
        let timeRow = -1;
        let teacherRow = -1;
        let roomRow = -1;
        
        for (let i = 0; i < Math.min(20, data.length); i++) {
          const row = data[i] || [];
          const firstCell = String(row[0] || '').toUpperCase().trim();
          
          if (firstCell === 'SUBJECT') subjectRow = i;
          if (firstCell === 'TIME') timeRow = i;
          if (firstCell === 'TEACHER') teacherRow = i;
          if (firstCell === 'CLASS' || firstCell === 'ROOM') roomRow = i;
        }
        
        if (subjectRow > -1) {
          const subjects = data[subjectRow];
          const times = timeRow > -1 ? data[timeRow] : [];
          const teachers = teacherRow > -1 ? data[teacherRow] : [];
          const rooms = roomRow > -1 ? data[roomRow] : [];
          
          for (let col = 1; col < subjects.length; col++) {
            const subject = String(subjects[col] || '').trim();
            if (!subject) continue;
            
            const timeRaw = String(times[col] || '').trim();
            const teacher = String(teachers[col] || '').trim();
            const room = String(rooms[col] || '').trim();
            
            let jam_mulai = '08:00';
            let jam_selesai = '10:00';
            if (timeRaw.includes('-')) {
               const parts = timeRaw.split('-');
               jam_mulai = parts[0].trim().replace('.', ':');
               jam_selesai = parts[1].trim().replace('.', ':');
            }
            
            result.push({
              file,
              kelas: sheetName.trim(),
              hari: hariMap[(col - 1) % 7],
              mata_pelajaran: subject,
              instruktur: teacher,
              jam_mulai,
              jam_selesai,
              ruangan: room
            });
          }
        }
        
        for (let i = Math.max(roomRow, teacherRow, timeRow, subjectRow) + 1; i < data.length; i++) {
           const row = data[i];
           const studentName = row[1];
           if (studentName && typeof studentName === 'string' && studentName.trim().length > 3) {
              studentsClassMap.push({
                 nama: studentName.trim(),
                 kelas: sheetName.trim()
              });
           }
        }
      }
    }
  }

  // UPDATE STUDENTS
  console.log(`Updating ${studentsClassMap.length} students...`);
  let updatedCount = 0;
  for (const s of studentsClassMap) {
     const { data } = await supabase.from('users').select('id').ilike('nama_lengkap', `%${s.nama}%`).eq('role', 'mahasiswa').limit(1);
     if (data && data.length > 0) {
        await supabase.from('users').update({ kelas: s.kelas }).eq('id', data[0].id);
        updatedCount++;
     }
  }
  console.log(`Successfully mapped ${updatedCount} students to their kelas.`);

  // INSERT SCHEDULES
  console.log(`Inserting ${result.length} schedules...`);
  // Clear old schedules first to avoid duplicates
  await supabase.from('jadwal').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  for (const r of result) {
    const instId = await getOrCreateInstruktur(r.instruktur || 'Tutor Unknown');
    const mapelId = await getOrCreateMapel(r.mata_pelajaran, r.file);
    
    const { error } = await supabase.from('jadwal').insert({
      mata_pelajaran_id: mapelId,
      instruktur_id: instId,
      kelas: r.kelas,
      hari: r.hari,
      jam_mulai: r.jam_mulai + ':00',
      jam_selesai: r.jam_selesai + ':00',
      ruangan: r.ruangan,
      tanggal_efektif_mulai: '2026-08-01',
      tanggal_efektif_selesai: '2026-08-31'
    });
    if (error) console.error("Error inserting schedule:", error);
  }
  
  console.log("Seeding complete!");
}

parseSchedules().catch(console.error);
