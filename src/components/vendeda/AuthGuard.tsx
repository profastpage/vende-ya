'use client'

/**
 * VENDE YA — AuthGuard
 * Wraps protected pages. If user is not signed in, redirects to /login.
 * Shows a loading skeleton while auth state is being restored.
 */
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/lib/vendeda/routes'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md w-full space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    )
  }

  if (!user) {
    // Will redirect in effect — render null meanwhile
    return null
  }

  return <>{children}</>
}
