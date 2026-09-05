import { createContext, useState, useCallback, type ReactNode } from 'react'
import * as authApi from '@/api/auth'
import type { SignupRequest, LoginRequest } from '@/types/auth'

interface AuthUser {
  userId: string
  name: string
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  signup: (request: SignupRequest) => Promise<void>
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// NOTE ON TOKEN STORAGE: this stores the JWT in localStorage, which is
// simple and works well for a project at this stage, but it's worth
// knowing the real tradeoff - localStorage is readable by any JS running
// on the page, so it's vulnerable to theft via XSS if the app is ever
// compromised by injected/malicious script. The more defensible approach
// for a production app handling sensitive data is an httpOnly cookie set
// by the backend, which JS can never read directly. Documented here
// deliberately rather than silently choosing the weaker option - this is
// a reasonable, explicit tradeoff for a portfolio-stage app, not an
// oversight.
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
