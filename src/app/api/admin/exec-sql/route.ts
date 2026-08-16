import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/exec-sql
 * =====================================================================
 * Endpoint de diagnóstico para ejecutar SQL arbitrario en la BD de
 * Supabase (vía Prisma). Solo accesible con SUPABASE_SERVICE_ROLE_KEY.
 *
 * Body:
 *   { "sql": "SELECT * FROM pg_trigger WHERE ...", "params": [] }
 *   o
 *   { "sqlRaw": "DROP TRIGGER IF EXISTS ... " }  // usa $executeRawUnsafe
 *
 * Autorización (cualquiera de las dos):
 *   - Header: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *   - Body/x-admin-secret: <SUPABASE_SERVICE_ROLE_KEY>
 *   - APPLY_AUTH_FIX_SECRET (si está configurado)
 * =====================================================================
 */
export async function POST(req: NextRequest) {
  const expectedSecret = process.env.APPLY_AUTH_FIX_SECRET
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const body = await req.json().catch(() => ({}))
  const providedSecret = body?.secret ?? req.headers.get('x-admin-secret') ?? ''
  const authHeader = req.headers.get('authorization') ?? ''
  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : ''

  const authViaSecret =
    expectedSecret && providedSecret && providedSecret === expectedSecret
  const authViaServiceRole =
    serviceRoleKey &&
    (providedSecret === serviceRoleKey || bearerToken === serviceRoleKey)

  if (!authViaSecret && !authViaServiceRole) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = body?.sql as string | undefined
  const sqlRaw = body?.sqlRaw as string | undefined
  const params = Array.isArray(body?.params) ? body.params : []

  if (!sql && !sqlRaw) {
    return NextResponse.json(
      { error: 'Falta `sql` o `sqlRaw` en el body.' },
      { status: 400 }
    )
  }

  try {
    if (sqlRaw) {
      // Ejecutar sin parámetros (útil para DDL, statements múltiples separados)
      // Split por `;` para compatibilidad con pgbouncer
      const statements = sqlRaw
        .split(/\s*;\s*\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'))
      const results: any[] = []
      for (const stmt of statements) {
        try {
          const r = await db.$executeRawUnsafe(stmt)
          results.push({ sql: stmt.slice(0, 80), affected: r })
        } catch (e: any) {
          results.push({
            sql: stmt.slice(0, 80),
            error: e?.message ?? String(e),
          })
        }
      }
      return NextResponse.json({ ok: true, results })
    }

    // Consulta SELECT con parámetros seguros
    const sqlStr = sql as string
    if (params.length === 0) {
      const rows = await db.$queryRawUnsafe(sqlStr)
      return NextResponse.json({ ok: true, rows })
    }
    const rowsWithParams = await db.$queryRawUnsafe(sqlStr, ...params)
    return NextResponse.json({ ok: true, rows: rowsWithParams })
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message ?? String(e),
        code: e?.code,
        detail: e?.meta,
      },
      { status: 500 }
    )
  }
}
