// One-time script: clear all user data & storage
// Run: node scripts/reset.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  console.log('Clearing generations...');
  await supabase.from('generations').delete().neq('id', 0);

  console.log('Clearing users...');
  await supabase.from('users').delete().neq('clerk_id', '');

  console.log('Clearing storage...');
  const { data: files } = await supabase.storage.from('generations').list();
  const paths = (files || []).map((f: any) => f.name);
  if (paths.length > 0) {
    await supabase.storage.from('generations').remove(paths);
  }

  console.log('Done — database & storage cleared.');
}

main();
