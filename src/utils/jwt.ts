import { jwtDecode } from 'jwt-decode'

export interface DecodedToken {
  sub?: string
  email?: string
  user_id?: string // Backend uses 'user_id' for email
  type?: string
  exp?: number
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token)
  } catch (err) {
    console.error('Invalid token', err)
    return null
  }
}
