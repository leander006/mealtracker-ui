import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

// Small wrapper so components never import useContext + AuthContext
// separately, and get a clear error if used outside the provider instead
// of a confusing "undefined" bug at the call site.
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
