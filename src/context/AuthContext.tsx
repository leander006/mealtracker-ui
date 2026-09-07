import { createContext, useState, useCallback, type ReactNode } from 'react'
import * as authApi from '@/api/auth'
import type { SignupRequest, LoginRequest } from '@/types/auth'

interface AuthUser { userId: string; name: string }

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  signup: (request: SignupRequest) => Promise<void>
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedName = localStorage.getItem('authUserName')
    const storedUserId = localStorage.getItem('authUserId')
    return storedName && storedUserId ? { name: storedName, userId: storedUserId } : null
  })

  const persistSession = useCallback((token: string, userId: string, name: string) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('authUserId', userId)
    localStorage.setItem('authUserName', name)
    setUser({ userId, name })
  }, [])

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authApi.login(request)
    persistSession(response.token, response.userId, response.name)
  }, [persistSession])

  const signup = useCallback(async (request: SignupRequest) => {
    const response = await authApi.signup(request)
    persistSession(response.token, response.userId, response.name)
  }, [persistSession])

  const logout = useCallback(() => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUserId')
    localStorage.removeItem('authUserName')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
