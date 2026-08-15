import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shalomClient } from '@/lib/vendeda/shalom';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 *
 * Health check del sistema — estado de todas las dependencias externas:
 *   - Database (Prisma + Supabase Postgres)
 *   - Shalom API (modo activo)
 *   - Gateway de pagos (env-based, no hace ping real)
 *   - Auth provider (Supabase, env-based)
 *
 * Status: 200 = healthy, 503 = degraded (algo fallando)
 */
export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error' | 'degraded'; detail?: string }> = {};

  // 1. Database ping
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok' };
  } catch (e) {
    checks.database = {
      status: 'error',
      detail: e instanceof Error ? e.message.slice(0, 100) : 'unknown',
    };
  }

  // 2. Shalom API
  try {
    const agencies = await shalomClient.listAgencies();
    checks.shalom = {
      status: 'ok',
      detail: `${shalomClient.mode} mode, ${agencies.length} agencies`,
    };
  } catch (e) {
    checks.shalom = {
      status: 'degraded',
      detail: e instanceof Error ? e.message.slice(0, 100) : 'unknown',
    };
  }

  // 3. Gateway (env-based)
  checks.gateway = {
    status: process.env.GATEWAY_ACCESS_TOKEN ? 'ok' : 'degraded',
    detail: process.env.GATEWAY_ACCESS_TOKEN
      ? `mode=${process.env.GATEWAY_MODE ?? 'production'}`
      : 'GATEWAY_ACCESS_TOKEN no configurado',
  };

  // 4. Supabase Auth
  checks.supabase = {
    status:
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
        ? 'ok'
        : 'degraded',
    detail: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not configured',
  };

  // Status global
  const allOk = Object.values(checks).every((c) => c.status === 'ok');
  const hasError = Object.values(checks).some((c) => c.status === 'error');
  const statusCode = hasError ? 503 : 200;

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : hasError ? 'unhealthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.0.0',
      environment: process.env.NODE_ENV,
      checks,
    },
    { status: statusCode }
  );
}
