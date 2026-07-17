import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixRoles() {
  console.log('Fetching users to fix...');
  let { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  // listUsers is paginated by default. 
  // Wait, let's fetch from the `users` table where role='mahasiswa' and then update their auth user
  const { data: dbUsers, error: dbError } = await supabase
    .from('users')
    .select('id, role')
    .eq('role', 'mahasiswa');
    
  if (dbError) {
     console.error('Error fetching db users:', dbError);
     return;
  }
  
  console.log(`Found ${dbUsers.length} mahasiswa to update...`);
  let fixed = 0;
  for (const u of dbUsers) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(u.id, {
      app_metadata: { role: 'mahasiswa' }
    });
    if (!updateError) {
      fixed++;
    }
  }
  console.log(`Fixed ${fixed}/${dbUsers.length} users!`);
}

fixRoles();
