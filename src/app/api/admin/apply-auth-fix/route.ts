import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/apply-auth-fix
 * =====================================================================
 * Recrea el trigger `handle_new_user()` en Supabase para que el alta de
 * usuarios con Google OAuth funcione correctamente.
 *
 * Problema: el error `Database error saving new user` ocurre cuando el
 * trigger `on_auth_user_created` falla al insertar en `public.profiles`.
 * Causas comunes:
 *   - El trigger no existe
 *   - La función no tiene `SECURITY DEFINER` y la RLS bloquea el insert
 *   - La función no tiene `search_path = ''` (inyección)
 *   - Conflictos de unicidad en `username` (mismos emails con diferente case)
 *   - Inserts no idempotentes (reintentos rompen en `ON CONFLICT` mal definido)
 *
 * Este endpoint ejecuta el SQL de fix **una sola vez** y queda operativo.
 * Llámalo desde el navegador o con curl:
 *   curl -X POST https://vende-ya-phi.vercel.app/api/admin/apply-auth-fix \
 *     -H "Content-Type: application/json" -d '{"secret":"vendeya-admin-fix"}'
 *
 * El `secret` se configura en Vercel como APPLY_AUTH_FIX_SECRET.
 * Si no está configurado, el endpoint acepta cualquier cosa en modo DEV
 * (no se recomienda en producción).
 * =====================================================================
 */
export async function POST(req: NextRequest) {
  // Authorization check — accepts either:
  //   1. APPLY_AUTH_FIX_SECRET env var (preferred, set in Vercel)
  //   2. Supabase SERVICE_ROLE_KEY as Authorization Bearer or x-admin-secret
  //      (useful for first-time setup when APPLY_AUTH_FIX_SECRET isn't configured yet)
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
    if (expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: secret inválido.' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      {
        error:
          'No autorizado. Pasa el SUPABASE_SERVICE_ROLE_KEY en el header ' +
          '`Authorization: Bearer xxx` o en el body `{ "secret": "xxx" }`, ' +
          'o configura `APPLY_AUTH_FIX_SECRET` en Vercel.',
      },
      { status: 401 }
    )
  }

  const results: Array<{ step: string; status: 'ok' | 'skipped' | 'error'; detail?: string }> = []

  // ============================================================
  // 1. Verificar que la tabla `profiles` existe y tiene columnas
  // ============================================================
  try {
    const cols = await db.$queryRaw<Array<{ column_name: string; data_type: string }>>`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles'
      ORDER BY ordinal_position;
    `
    if (cols.length === 0) {
      results.push({
        step: 'check_profiles_table',
        status: 'error',
        detail: 'Tabla `public.profiles` no existe. Ejecuta scripts/supabase-profile-tables.sql primero.',
      })
      return NextResponse.json({ ok: false, results }, { status: 500 })
    }
    results.push({
      step: 'check_profiles_table',
      status: 'ok',
      detail: `${cols.length} columnas: ${cols.map((c) => c.column_name).join(', ')}`,
    })
  } catch (e: any) {
    results.push({
      step: 'check_profiles_table',
      status: 'error',
      detail: e?.message ?? String(e),
    })
    return NextResponse.json({ ok: false, results }, { status: 500 })
  }

  // ============================================================
  // 2. Asegurar columna `email` en profiles (falta en el SQL original)
  // ============================================================
  try {
    await db.$executeRawUnsafe(`
      ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS email text;
    `)
    results.push({ step: 'add_email_column', status: 'ok' })
  } catch (e: any) {
    results.push({
      step: 'add_email_column',
      status: 'error',
      detail: e?.message ?? String(e),
    })
  }

  // ============================================================
  // 3. Asegurar índice único en auth_id (idempotente)
  // ============================================================
  try {
    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS profiles_auth_id_key
      ON public.profiles(auth_id);
    `)
    results.push({ step: 'ensure_auth_id_unique', status: 'ok' })
  } catch (e: any) {
    results.push({
      step: 'ensure_auth_id_unique',
      status: 'error',
      detail: e?.message ?? String(e),
    })
  }

  // ============================================================
  // 4. Dropear trigger viejo y función vieja (idempotente)
  // ============================================================
  try {
    await db.$executeRawUnsafe(`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`)
    await db.$executeRawUnsafe(`DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;`)
    results.push({ step: 'drop_old_trigger', status: 'ok' })
  } catch (e: any) {
    results.push({
      step: 'drop_old_trigger',
      status: 'error',
      detail: e?.message ?? String(e),
    })
  }

  // ============================================================
  // 5. Recrear función handle_new_user (SECURITY DEFINER + search_path='')
  //    - Insert idempotente (ON CONFLICT DO NOTHING)
  //    - Username único generado a partir del email + sufijo aleatorio
  //    - display_name fallback al nombre de Google metadata
  //    - email siempre seteado desde NEW.email
  //    - Maneja usernames duplicados con sufijo aleatorio corto
  // ============================================================
  try {
    await db.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''
      AS $$
      DECLARE
        v_username text;
        v_display text;
        v_avatar text;
        v_attempt int := 0;
      BEGIN
        -- 1. Display name: Google metadata -> username metadata -> email prefix
        v_display := COALESCE(
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'name',
          NEW.raw_user_meta_data->>'display_name',
          NEW.raw_user_meta_data->>'user_name',
          split_part(NEW.email, '@', 1)
        );

        -- 2. Avatar: Google/Facebook/Apple metadata -> fallback none
        v_avatar := COALESCE(
          NEW.raw_user_meta_data->>'avatar_url',
          NEW.raw_user_meta_data->>'picture',
          NEW.raw_user_meta_data->>'photo',
          NULL
        );

        -- 3. Username: from metadata or email prefix; ensure uniqueness
        v_username := COALESCE(
          NEW.raw_user_meta_data->>'username',
          lower(translate(
            split_part(NEW.email, '@', 1),
            'ABCDEFGHIJKLMNOPQRSTUVWXYZáéíóúÁÉÍÓÚñÑ ',
            'abcdefghijklmnopqrstuvwxyzaeiounn_'
          )),
          'user'
        );
        -- Sanitize: keep only [a-z0-9_.-]
        v_username := regexp_replace(v_username, '[^a-z0-9_.-]', '', 'g');
        IF v_username = '' OR v_username IS NULL THEN
          v_username := 'user';
        END IF;

        -- 4. Try insert; retry up to 3 times with random suffix if username conflict
        LOOP
          BEGIN
            INSERT INTO public.profiles (
              auth_id, username, display_name, email, avatar_url, created_at, updated_at, last_seen_at
            ) VALUES (
              NEW.id,
              v_username,
              v_display,
              NEW.email,
              v_avatar,
              now(),
              now(),
              now()
            )
            ON CONFLICT (auth_id) DO UPDATE
              SET email = EXCLUDED.email,
                  avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
                  updated_at = now();
            EXIT;
          EXCEPTION
            WHEN unique_violation THEN
              v_attempt := v_attempt + 1;
              IF v_attempt > 3 THEN
                -- Last resort: append a random 8-char suffix
                v_username := 'u' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
                -- try once more, then give up
                BEGIN
                  INSERT INTO public.profiles (
                    auth_id, username, display_name, email, avatar_url, created_at, updated_at, last_seen_at
                  ) VALUES (
                    NEW.id, v_username, v_display, NEW.email, v_avatar, now(), now(), now()
                  )
                  ON CONFLICT (auth_id) DO NOTHING;
                  EXIT;
                EXCEPTION
                  WHEN OTHERS THEN
                    RAISE WARNING 'handle_new_user: failed to insert profile for user %', NEW.id;
                    EXIT;
                END;
              END IF;
              v_username := v_username || '_' || v_attempt::text;
            WHEN OTHERS THEN
              RAISE WARNING 'handle_new_user: error inserting profile for user %: %', NEW.id, SQLERRM;
              EXIT;
          END;
        END LOOP;

        RETURN NEW;
      END;
      $$;
    `)
    results.push({ step: 'create_function', status: 'ok' })
  } catch (e: any) {
    results.push({
      step: 'create_function',
      status: 'error',
      detail: e?.message ?? String(e),
    })
    return NextResponse.json({ ok: false, results }, { status: 500 })
  }

  // ============================================================
  // 5b. FIX CRÍTICO — arreglar handle_new_user_profile_extras()
  //     Existe otro trigger on_auth_user_created_extras que ejecuta
  //     handle_new_user_profile_extras(), la cual hace INSERTs a
  //     user_notification_prefs y user_kyc SIN manejo de errores.
  //     Si esas tablas tienen algún problema, revienta toda la
  //     transacción de auth.users → "Database error creating new user".
  //     Lo reescribimos con EXCEPTION WHEN OTHERS THEN para que sea
  //     a prueba de fallos.
  // ============================================================
  try {
    await db.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.handle_new_user_profile_extras()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        BEGIN
          INSERT INTO public.user_notification_prefs (user_id)
          VALUES (NEW.id)
          ON CONFLICT (user_id) DO NOTHING;
        EXCEPTION
          WHEN OTHERS THEN
            RAISE WARNING 'handle_new_user_profile_extras: user_notification_prefs insert failed: %', SQLERRM;
        END;

        BEGIN
          INSERT INTO public.user_kyc (user_id, status)
          VALUES (NEW.id, 'unverified')
          ON CONFLICT (user_id) DO NOTHING;
        EXCEPTION
          WHEN OTHERS THEN
            RAISE WARNING 'handle_new_user_profile_extras: user_kyc insert failed: %', SQLERRM;
        END;

        RETURN NEW;
      END;
      $$;
    `)
    results.push({ step: 'fix_extras_trigger', status: 'ok' })
  } catch (e: any) {
    results.push({
      step: 'fix_extras_trigger',
      status: 'error',
      detail: e?.message ?? String(e),
    })
  }

  // ============================================================
  // 6. Crear trigger on_auth_user_created
  // ============================================================
  try {
    await db.$executeRawUnsafe(`
      CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `)
    results.push({ step: 'create_trigger', status: 'ok' })
  } catch (e: any) {
    // Trigger ya existe (ignoramos si ya estaba)
    try {
      await db.$executeRawUnsafe(`
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `)
      results.push({ step: 'create_trigger', status: 'ok', detail: 'recreated' })
    } catch (e2: any) {
      results.push({
        step: 'create_trigger',
        status: 'error',
        detail: e2?.message ?? String(e2),
      })
    }
  }

  // ============================================================
  // 7. Garantizar RLS policies en profiles (defensa en profundidad)
  //    Aunque el trigger use SECURITY DEFINER (bypass RLS), damos permisos
  //    para que el propio usuario pueda leer/actualizar su perfil.
  //    Nota: pgbouncer (pooler Supabase) no soporta múltiples statements
  //    en una sola llamada prepared statement, así que los separamos.
  // ============================================================
  const rlsStatements = [
    `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles`,
    `CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = auth_id)`,
    `DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles`,
    `CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = auth_id)`,
    `DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles`,
    `CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id)`,
    `DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles`,
    `CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT TO anon, authenticated USING (true)`,
  ]
  let rlsOk = true
  const rlsErrors: string[] = []
  for (const stmt of rlsStatements) {
    try {
      await db.$executeRawUnsafe(stmt)
    } catch (e: any) {
      rlsOk = false
      rlsErrors.push(`${stmt.slice(0, 60)}...: ${e?.message ?? String(e)}`)
    }
  }
  results.push({
    step: 'setup_rls',
    status: rlsOk ? 'ok' : 'error',
    detail: rlsOk ? undefined : rlsErrors.join(' | '),
  })

  // ============================================================
  // 8. Garantizar tabla seller_wallets (no siempre existe)
  //    Separamos statements por compatibilidad con pgbouncer.
  // ============================================================
  const walletStatements = [
    `CREATE TABLE IF NOT EXISTS public.seller_wallets (id uuid references auth.users not null primary key, gateway_seller_id text, is_verified boolean default false not null, status text check (status in ('active', 'suspended', 'banned')) default 'active' not null, store_name text, store_slug text, updated_at timestamp with time zone default timezone('utc'::text, now()) not null)`,
    `ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "wallets_self_select" ON public.seller_wallets`,
    `CREATE POLICY "wallets_self_select" ON public.seller_wallets FOR SELECT TO authenticated USING (auth.uid() = id)`,
    `DROP POLICY IF EXISTS "wallets_self_update" ON public.seller_wallets`,
    `CREATE POLICY "wallets_self_update" ON public.seller_wallets FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`,
  ]
  let walletOk = true
  const walletErrors: string[] = []
  for (const stmt of walletStatements) {
    try {
      await db.$executeRawUnsafe(stmt)
    } catch (e: any) {
      // ignore "policy already exists" or "table already exists" errors
      const msg = e?.message ?? String(e)
      if (msg.includes('already exists') || msg.includes('already_enabled')) {
        continue
      }
      walletOk = false
      walletErrors.push(`${stmt.slice(0, 60)}...: ${msg}`)
    }
  }
  results.push({
    step: 'ensure_seller_wallets',
    status: walletOk ? 'ok' : 'error',
    detail: walletOk ? undefined : walletErrors.join(' | '),
  })

  // ============================================================
  // 9. Verificación final: contar triggers y políticas
  // ============================================================
  try {
    const verify = await db.$queryRaw<
      Array<{ name: string; exists: boolean }>
    >`
      SELECT 'trigger_on_auth_user' AS name,
        EXISTS(
          SELECT 1 FROM pg_trigger
          WHERE tgname = 'on_auth_user_created'
            AND tgrelid = 'auth.users'::regclass
        ) AS exists
      UNION ALL
      SELECT 'function_handle_new_user',
        EXISTS(
          SELECT 1 FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE p.proname = 'handle_new_user' AND n.nspname = 'public'
        )
      UNION ALL
      SELECT 'table_profiles',
        EXISTS(SELECT 1 FROM information_schema.tables
               WHERE table_schema='public' AND table_name='profiles')
      UNION ALL
      SELECT 'table_seller_wallets',
        EXISTS(SELECT 1 FROM information_schema.tables
               WHERE table_schema='public' AND table_name='seller_wallets')
    `
    results.push({
      step: 'verify',
      status: 'ok',
      detail: verify.map((v) => `${v.name}=${v.exists ? '✓' : '✗'}`).join(' | '),
    })
  } catch (e: any) {
    results.push({
      step: 'verify',
      status: 'error',
      detail: e?.message ?? String(e),
    })
  }

  const allOk = results.every((r) => r.status !== 'error')
  return NextResponse.json(
    { ok: allOk, results },
    { status: allOk ? 200 : 500 }
  )
}

/**
 * GET /api/admin/apply-auth-fix
 * Devuelve el estado actual sin modificar nada (solo lectura).
 */
export async function GET() {
  try {
    const status = await db.$queryRaw<
      Array<{ name: string; exists: boolean }>
    >`
      SELECT 'trigger_on_auth_user' AS name,
        EXISTS(
          SELECT 1 FROM pg_trigger
          WHERE tgname = 'on_auth_user_created'
            AND tgrelid = 'auth.users'::regclass
        ) AS exists
      UNION ALL
      SELECT 'function_handle_new_user',
        EXISTS(
          SELECT 1 FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE p.proname = 'handle_new_user' AND n.nspname = 'public'
        )
      UNION ALL
      SELECT 'table_profiles',
        EXISTS(SELECT 1 FROM information_schema.tables
               WHERE table_schema='public' AND table_name='profiles')
      UNION ALL
      SELECT 'table_seller_wallets',
        EXISTS(SELECT 1 FROM information_schema.tables
               WHERE table_schema='public' AND table_name='seller_wallets')
      UNION ALL
      SELECT 'rls_profiles_enabled',
        EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace=n.oid
               WHERE n.nspname='public' AND c.relname='profiles' AND c.relrowsecurity = true)
    `
    return NextResponse.json({ ok: true, status })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 }
    )
  }
}
