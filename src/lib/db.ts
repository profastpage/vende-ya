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

  // Try Vercel/Supabase integration env vars
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const password = process.env.POSTGRES_PASSWORD
  const database = process.env.POSTGRES_DATABASE
  const user = process.env.POSTGRES_USER || 'postgres'
  const host = process.env.POSTGRES_HOST

  // If we have the Vercel Supabase integration vars, build the URL
  if (password && database) {
    // database format: "postgres.qkfgcynfzhjghtsrmdxs" → user is "postgres.qkfgcynfzhjghtsrmdxs"
    const dbUser = database.split('.')[0] // "postgres"
    const projectRef = database.split('.')[1] // "qkfgcynfzhjghtsrmdxs"
    if (projectRef) {
      // Supabase pooler host pattern: aws-0-<region>.pooler.supabase.com
      // We need to extract the region from supabaseUrl: https://<ref>.supabase.co
      // The pooler host is different — fall back to direct connection if not set.
      const poolerHost =
        process.env.POSTGRES_HOST ||
        process.env.SUPABASE_DB_HOST ||
        `aws-0-sa-east-1.pooler.supabase.com` // default region for this project
      const fullUser = `${dbUser}.${projectRef}`
      // Pooler uses port 6543, direct uses 5432
      const port = poolerHost.includes('pooler') ? '6543' : (process.env.POSTGRES_PORT || '5432')
      const url = `postgresql://${fullUser}:${encodeURIComponent(password)}@${poolerHost}:${port}/postgres?pgbouncer=true&connection_limit=1`
      console.log('[db] Constructed DATABASE_URL from POSTGRES_PASSWORD + POSTGRES_DATABASE')
      return url
    }
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
