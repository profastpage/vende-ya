/**
 * /api/me — Full client profile data
 * =====================================================================
 * Returns the authenticated user's complete profile data:
 *   - auth user (id, email, phone, displayName, avatarUrl)
 *   - profile row (username, bio, role, stats, department, etc.)
 *   - kyc status (DNI verification level)
 *   - addresses (shipping addresses, default first)
 *   - payment_methods (Yape/Plin/cards with last4 + brand, no PAN)
 *   - security_log (last 10 events: login, OAuth, password changes)
 *   - notification_prefs (channel opt-ins)
 *   - sessions (active devices)
 *
 * Uses SERVICE_ROLE_KEY to bypass RLS for reads (more efficient than
 * per-table RLS-qualified queries). The endpoint itself is gated by
 * `getAuthenticatedUser` which validates the JWT bearer token.
 * =====================================================================
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser, isSupabaseServerConfigured } from '@/lib/vendeda/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export async function GET(request: Request) {
  if (!isSupabaseServerConfigured || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Servicio no configurado.' },
      { status: 503 }
    )
  }

  const { user, error } = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: error ?? 'No autorizado' }, { status: 401 })
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Run all queries in parallel for fast response
  const [authResp, profileResp, kycResp, addrResp, payResp, secResp, prefsResp, sessResp] = await Promise.all([
    admin.auth.admin.getUserById(user.id),
    admin.from('profiles').select('*').eq('auth_id', user.id).maybeSingle(),
    admin.from('user_kyc').select('status, dni_verified_at, selfie_uploaded_at, rejection_reason, updated_at').eq('user_id', user.id).maybeSingle(),
    admin.from('user_addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false }),
    admin.from('user_payment_methods').select('id, type, label, phone, card_last4, card_brand, card_exp_month, card_exp_year, wallet_balance, is_default, is_verified, created_at').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false }),
    admin.from('user_security_log').select('id, event_type, ip_address, user_agent, device_type, os, browser, country, city, success, failure_reason, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    admin.from('user_notification_prefs').select('*').eq('user_id', user.id).maybeSingle(),
    admin.from('user_sessions').select('id, device_type, os, browser, ip_address, country, city, is_current, last_seen_at, created_at').eq('user_id', user.id).order('last_seen_at', { ascending: false }).limit(5),
  ])

  // Assemble the response
  const authUser = authResp.data?.user
  const profile = profileResp.data
  const kyc = kycResp.data
  const addresses = addrResp.data ?? []
  const paymentMethods = payResp.data ?? []
  const securityLog = secResp.data ?? []
  const notificationPrefs = prefsResp.data
  const sessions = sessResp.data ?? []

  // Compute derived fields
  const kycStatus = (kyc?.status as string) ?? 'unverified'
  const isKycVerified = kycStatus === 'approved'
  const isEmailVerified = authUser?.email_confirmed_at != null

  return NextResponse.json({
    user: {
      id: authUser?.id ?? user.id,
      email: authUser?.email ?? user.email,
      phone: authUser?.phone ?? null,
      displayName: authUser?.user_metadata?.display_name
        ?? authUser?.user_metadata?.name
        ?? profile?.display_name
        ?? (authUser?.email ? authUser.email.split('@')[0] : 'Usuario'),
      avatarUrl: authUser?.user_metadata?.avatar_url
        ?? authUser?.user_metadata?.picture
        ?? profile?.avatar_url
        ?? null,
      isEmailVerified,
      createdAt: authUser?.created_at ?? null,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
      appMetadata: authUser?.app_metadata ?? {},
      userMetadata: authUser?.user_metadata ?? {},
    },
    profile: profile
      ? {
          username: profile.username,
          bio: profile.bio,
          role: profile.role,
          rating: Number(profile.rating ?? 0),
          ratingsCount: profile.ratings_count ?? 0,
          salesCount: profile.sales_count ?? 0,
          isVerified: profile.is_verified ?? false,
          isLiveSeller: profile.is_live_seller ?? false,
          totalRevenue: Number(profile.total_revenue ?? 0),
          followerCount: profile.follower_count ?? 0,
          isBanned: profile.is_banned ?? false,
          bannedReason: profile.banned_reason ?? null,
          locale: profile.locale ?? 'es-PE',
          department: profile.department,
          province: profile.province,
          district: profile.district,
          whatsapp: profile.whatsapp,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
          lastSeenAt: profile.last_seen_at,
        }
      : null,
    kyc: {
      status: kycStatus,
      isVerified: isKycVerified,
      dniVerifiedAt: kyc?.dni_verified_at ?? null,
      selfieUploadedAt: kyc?.selfie_uploaded_at ?? null,
      rejectionReason: kyc?.rejection_reason ?? null,
      updatedAt: kyc?.updated_at ?? null,
    },
    addresses: addresses.map((a: any) => ({
      id: a.id,
      label: a.label,
      recipient: a.recipient,
      phone: a.phone,
      addressLine: a.address_line,
      reference: a.reference,
      district: a.district,
      province: a.province,
      department: a.department,
      postalCode: a.postal_code,
      isDefault: a.is_default,
    })),
    paymentMethods: paymentMethods.map((p: any) => ({
      id: p.id,
      type: p.type,
      label: p.label,
      phone: p.phone,
      cardLast4: p.card_last4,
      cardBrand: p.card_brand,
      cardExpMonth: p.card_exp_month,
      cardExpYear: p.card_exp_year,
      walletBalance: Number(p.wallet_balance ?? 0),
      isDefault: p.is_default,
      isVerified: p.is_verified,
      createdAt: p.created_at,
    })),
    securityLog: securityLog.map((s: any) => ({
      id: s.id,
      eventType: s.event_type,
      ipAddress: s.ip_address,
      userAgent: s.user_agent,
      deviceType: s.device_type,
      os: s.os,
      browser: s.browser,
      country: s.country,
      city: s.city,
      success: s.success,
      failureReason: s.failure_reason,
      createdAt: s.created_at,
    })),
    notificationPrefs: notificationPrefs ?? {
      // Default values if no row yet
      push_bids: true, push_outbid: true, push_won: true,
      push_followers: true, push_live_starts: true, push_messages: true,
      push_marketing: false,
      email_bids: true, email_won: true, email_receipts: true, email_marketing: false,
      sms_critical: true,
    },
    sessions: sessions.map((s: any) => ({
      id: s.id,
      deviceType: s.device_type,
      os: s.os,
      browser: s.browser,
      ipAddress: s.ip_address,
      country: s.country,
      city: s.city,
      isCurrent: s.is_current,
      lastSeenAt: s.last_seen_at,
      createdAt: s.created_at,
    })),
    // Summary stats for quick display
    summary: {
      totalAddresses: addresses.length,
      totalPaymentMethods: paymentMethods.length,
      defaultPaymentMethod: paymentMethods.find((p: any) => p.is_default) ?? null,
      defaultAddress: addresses.find((a: any) => a.is_default) ?? null,
      lastLogin: securityLog.find((s: any) => s.event_type === 'login' || s.event_type === 'oauth_login') ?? null,
      activeSessionsCount: sessions.length,
    },
  })
}
