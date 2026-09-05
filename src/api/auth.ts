import { apiClient } from './client'
import type { SignupRequest, LoginRequest, AuthResponse } from '@/types/auth'

export async function signup(request: SignupRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/signup', request)
  return data
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', request)
  return data
}
