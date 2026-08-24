const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:Wafla0523129500@db.qkfgcynfzhjghtsrmdxs.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  console.log(res.rows);
  await client.end();
}
run();