import { jwtDecode } from 'jwt-decode'

export interface DecodedToken {
  sub?: string
  email?: string
  type?: number
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
