'use client'

/**
 * useProfile — Hook to fetch REAL client profile data from /api/me
 * =====================================================================
 * Returns the authenticated user's full profile:
 *   - profile (public stats: rating, sales, verification, KYC, etc.)
 *   - addresses (shipping addresses)
 *   - paymentMethods (cards, Yape, Plin)
 *   - securityLog (recent login events)
 *   - sessions (active devices)
 *   - notificationPrefs
 *
 * Falls back to AuthProvider's basic user when Supabase isn't reachable
 * (demo mode or network error).
 *
 * Usage:
 *   const { data, loading, error, refresh } = useProfile()
 * =====================================================================
 */
import * as React from 'react'
import { useAuth } from '@/components/vendeda/AuthProvider'

export interface ProfileData {
  user: {
    id: string
    email: string | null
    phone: string | null
    displayName: string
    avatarUrl: string | null
    isEmailVerified: boolean
    createdAt: string | null
    lastSignInAt: string | null
    appMetadata: Record<string, unknown>
    userMetadata: Record<string, unknown>
  }
  profile: {
    username: string
    bio: string | null
    role: 'buyer' | 'seller' | 'admin' | 'moderator'
    rating: number
    ratingsCount: number
    salesCount: number
    isVerified: boolean
    isLiveSeller: boolean
    totalRevenue: number
    followerCount: number
    isBanned: boolean
    bannedReason: string | null
    locale: string
    department: string | null
    province: string | null
    district: string | null
    whatsapp: string | null
    createdAt: string
    updatedAt: string
    lastSeenAt: string
  } | null
  kyc: {
    status: 'unverified' | 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired'
    isVerified: boolean
    dniVerifiedAt: string | null
    selfieUploadedAt: string | null
    rejectionReason: string | null
    updatedAt: string | null
  }
  addresses: Array<{
    id: string
    label: string
    recipient: string
    phone: string | null
    addressLine: string
    reference: string | null
    district: string
    province: string
    department: string
    postalCode: string | null
    isDefault: boolean
  }>
  paymentMethods: Array<{
    id: string
    type: 'yape' | 'plin' | 'pagoefectivo' | 'card' | 'mercado_pago' | 'transfer'
    label: string | null
    phone: string | null
    cardLast4: string | null
    cardBrand: string | null
    cardExpMonth: number | null
    cardExpYear: number | null
    walletBalance: number
    isDefault: boolean
    isVerified: boolean
    createdAt: string
  }>
  securityLog: Array<{
    id: string
    eventType: string
    ipAddress: string | null
    userAgent: string | null
    deviceType: string | null
    os: string | null
    browser: string | null
    country: string | null
    city: string | null
    success: boolean
    failureReason: string | null
    createdAt: string
  }>
  notificationPrefs: Record<string, boolean> | null
  sessions: Array<{
    id: string
    deviceType: string | null
    os: string | null
    browser: string | null
    ipAddress: string | null
    country: string | null
    city: string | null
    isCurrent: boolean
    lastSeenAt: string
    createdAt: string
  }>
  summary: {
    totalAddresses: number
    totalPaymentMethods: number
    defaultPaymentMethod: ProfileData['paymentMethods'][0] | null
    defaultAddress: ProfileData['addresses'][0] | null
    lastLogin: ProfileData['securityLog'][0] | null
    activeSessionsCount: number
  }
}

interface UseProfileResult {
  data: ProfileData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useProfile(): UseProfileResult {
  const { user, authedFetch, isDemoMode } = useAuth()
  const [data, setData] = React.useState<ProfileData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchProfile = React.useCallback(async () => {
    if (!user) {
      setData(null)
      setLoading(false)
      return
    }

    // In demo mode, build a minimal mock from the AuthProvider user
    if (isDemoMode) {
      setData({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          isEmailVerified: false,
          createdAt: null,
          lastSignInAt: null,
          appMetadata: {},
          userMetadata: {},
        },
        profile: {
          username: user.displayName.toLowerCase().replace(/\s+/g, '.'),
          bio: null,
          role: 'buyer',
          rating: 0,
          ratingsCount: 0,
          salesCount: 0,
          isVerified: false,
          isLiveSeller: false,
          totalRevenue: 0,
          followerCount: 0,
          isBanned: false,
          bannedReason: null,
          locale: 'es-PE',
          department: null,
          province: null,
          district: null,
          whatsapp: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
        kyc: {
          status: 'unverified',
          isVerified: false,
          dniVerifiedAt: null,
          selfieUploadedAt: null,
          rejectionReason: null,
          updatedAt: null,
        },
        addresses: [],
        paymentMethods: [],
        securityLog: [],
        notificationPrefs: null,
        sessions: [],
        summary: {
          totalAddresses: 0,
          totalPaymentMethods: 0,
          defaultPaymentMethod: null,
          defaultAddress: null,
          lastLogin: null,
          activeSessionsCount: 0,
        },
      })
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await authedFetch('/api/me', { method: 'GET' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message ?? 'No se pudo cargar el perfil')
    } finally {
      setLoading(false)
    }
  }, [user, isDemoMode, authedFetch])

  React.useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { data, loading, error, refresh: fetchProfile }
}
