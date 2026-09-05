import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// Wraps any route tree that requires authentication. Unauthenticated
// users are redirected to /login instead of ever rendering the
// protected page - this is a UX/routing concern only, NOT a security
// boundary by itself (the real security is the backend's JwtAuthFilter
// rejecting requests without a valid token; this just avoids showing an
// empty/broken page while that happens).
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
