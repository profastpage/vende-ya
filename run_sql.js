const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ 
  datasources: { 
    db: { url: "postgresql://postgres:Wafla0523129500@db.qkfgcynfzhjghtsrmdxs.supabase.co:5432/postgres" } 
  } 
});

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "public"."LiveStream" ADD COLUMN IF NOT EXISTS "kickUsername" text;');
    console.log("Columna agregada exitosamente.");
    
    // Convert to standard SQL single quotes, no backticks needed for JS
    await prisma.$executeRawUnsafe('UPDATE "public"."LiveStream" SET "kickUsername" = \'xqc\' WHERE "title" = \'@Vende Ya Oficial\' OR "kickUsername" IS NULL;');
    console.log("Stream actualizado con el demo de Kick.");
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();