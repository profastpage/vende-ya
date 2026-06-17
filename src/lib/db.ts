import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Vende Ya — Prisma client singleton.
 *
 * In dev (SQLite), logs all queries.
 * In prod (Supabase Postgres), silent + pgbouncer-compatible.
 * The client is lazy — it only connects when a query is made,
 * so importing this file in a server route does NOT cause a
 * connection at module load time.
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
