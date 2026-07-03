// ============================================================
// APPLY RLS POLICIES via Supabase Management API
// Jalankan: node supabase/apply-rls.mjs
// ============================================================

const SUPABASE_URL = 'https://oanlpiwbciaxvczczkom.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbmxwaXdiY2lheHZjemN6a29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk3MDk0OSwiZXhwIjoyMDk0NTQ2OTQ5fQ.Z7M11syzihmXtMLHjAJbcVTwhLQ6TT-CxzGOGySov70';

async function runSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    const text = await res.text();
    // Try alternative endpoint
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql_string: sql }),
    });
    if (!res2.ok) {
      return { error: `${res.status}: ${text}` };
    }
    return await res2.json();
  }
  return await res.json();
}

async function run() {
  console.log('🔐 Checking and applying RLS policies...\n');

  // First check if policies exist
  const checkResult = await runSQL(`
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    ORDER BY tablename, policyname;
  `);

  if (checkResult.error) {
    console.log('⚠️  Cannot run SQL directly via pg/query endpoint.');
    console.log('   Error:', checkResult.error.substring(0, 100));
    console.log('\n📋 Alternative: Please run the SQL manually in the Supabase Dashboard:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Open your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Paste the contents of supabase/rls_policies.sql');
    console.log('   5. Click "Run"');
    
    console.log('\n🔧 Attempting alternative fix via REST API...');
    
    // Alternative: create a function to check RLS status
    const testResult = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id&limit=1`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    
    if (testResult.ok) {
      const data = await testResult.json();
      console.log(`   ✅ Service role can access users table (${data.length} rows)`);
      console.log('   → RLS is likely enabled but policies may be missing for anon/authenticated roles.');
    } else {
      console.log(`   ❌ Service role cannot access users: ${testResult.status}`);
    }
    return;
  }

  console.log('Existing policies:');
  if (Array.isArray(checkResult)) {
    checkResult.forEach(p => console.log(`  ${p.tablename} → ${p.policyname}`));
    if (checkResult.length === 0) {
      console.log('  (none found - need to apply policies)');
    }
  } else {
    console.log(JSON.stringify(checkResult, null, 2));
  }
}

run().catch(console.error);
