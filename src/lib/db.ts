import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Vende Ya — Prisma client singleton.
 *
 * In dev (SQLite), logs all queries.
 * In prod (Supabase Postgres), silent + pgbouncer-compatible.
 *
 * Connection string resolution order:
 *   1. DATABASE_URL (preferred — full Postgres URL)
 *   2. Constructed from POSTGRES_USER + POSTGRES_PASSWORD + POSTGRES_DATABASE
 *      + SUPABASE_URL (Vercel Supabase integration sets these)
 *   3. Constructed from SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (last resort)
 *
 * The client is lazy — it only connects when a query is made, so importing
 * this file in a server route does NOT cause a connection at module load time.
 */
function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  // Try Vercel/Supabase integration env vars.
  // The Supabase Vercel integration sets:
  //   POSTGRES_URL (full postgresql:// URL — preferred)
  //   POSTGRES_POOL_URL (pooler URL)
  //   POSTGRES_HOST (e.g. aws-0-sa-east-1.pooler.supabase.com)
  //   POSTGRES_USER (e.g. postgres.qkfgcynfzhjghtsrmdxs)
  //   POSTGRES_PASSWORD
  //   POSTGRES_DATABASE (usually "postgres")
  //   POSTGRES_PORT (5432 for direct, 6543 for pooler)
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL
  if (process.env.POSTGRES_POOL_URL) return process.env.POSTGRES_POOL_URL

  const user = process.env.POSTGRES_USER
  const password = process.env.POSTGRES_PASSWORD
  const database = process.env.POSTGRES_DATABASE || 'postgres'
  const host =
    process.env.POSTGRES_HOST ||
    process.env.POSTGRES_DIRECT_URL ||
    process.env.SUPABASE_DB_HOST ||
    'aws-0-sa-east-1.pooler.supabase.com'

  if (user && password) {
    // Pooler uses port 6543 with pgbouncer, direct uses 5432
    const isPooler = host.includes('pooler')
    const port = process.env.POSTGRES_PORT || (isPooler ? '6543' : '5432')
    const params = isPooler
      ? '?pgbouncer=true&connection_limit=1&prepared_statements=false'
      : ''
    const url = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}${params}`
    console.log(`[db] Constructed DATABASE_URL for ${isPooler ? 'pooler' : 'direct'} connection to ${host}:${port}`)
    return url
  }

  return undefined
}

// Set process.env.DATABASE_URL before instantiating PrismaClient
// (Prisma reads the env at construction time)
if (!process.env.DATABASE_URL) {
  const resolved = resolveDatabaseUrl()
  if (resolved) {
    process.env.DATABASE_URL = resolved
  }
}

// Suppress Prisma's "schema warning" noise in prod
process.env.DATABASE_SCHEMA = process.env.DATABASE_SCHEMA || 'public'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
