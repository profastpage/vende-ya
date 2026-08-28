const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('media', { public: true });
  console.log(data, error);
}
createBucket();