/**
 * Auth fetch utility: adds Authorization header and on 401 clears token and redirects to login.
 */

export function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('authToken')
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  return headers
}

function handleSessionExpired(): never {
  localStorage.removeItem('authToken')
  window.location.href = `${window.location.origin}/login`
  throw new Error('Session expired')
}

/**
 * Fetch with auth headers. On 401, clears token, redirects to /login, and throws.
 */
export async function authFetch(url: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const auth = getAuthHeaders() as Record<string, string>
  const headers = new Headers(init.headers)
  Object.entries(auth).forEach(([k, v]) => headers.set(k, v))
  const res = await fetch(url, { ...init, headers })
  if (res.status === 401) handleSessionExpired()
  return res
}

/**
 * Auth fetch for uploads (no Content-Type; browser sets multipart boundary). On 401, redirects to login.
 */
export async function authFetchForUpload(url: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('authToken')
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(url, { ...init, headers })
  if (res.status === 401) handleSessionExpired()
  return res
}
