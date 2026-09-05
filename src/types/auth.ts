// Mirrors AuthDtos.java on the backend - keep these in sync manually
// whenever the backend DTOs change. In a larger org this would be
// generated from an OpenAPI spec instead of hand-maintained.

export interface SignupRequest {
  email: string
  password: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  userId: string
  name: string
  token: string
}
