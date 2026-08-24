const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres.qkfgcynfzhjghtsrmdxs:Wafla0523129500@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    const sql = fs.readFileSync('create_tables.sql', 'utf8');
    await client.query(sql);
    console.log("ALL TABLES CREATED SUCCESSFULLY!");
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();