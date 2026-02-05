const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9001/api/v1'

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('authToken')
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  return headers
}

import type { OrderReturnDto } from '../types/return'

/** Get my return requests (buyer: their returns; seller: returns for their orders). */
export async function getMyReturns(): Promise<OrderReturnDto[]> {
  const res = await fetch(`${API_BASE_URL}/returns`, { headers: getAuthHeaders() })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to get returns: ${res.statusText}`)
  }
  const data = await res.json()
  return data.returns ?? []
}

/** Update return status (seller: APPROVED or REJECTED). */
export async function updateReturnStatus(returnId: string, status: string): Promise<OrderReturnDto> {
  const res = await fetch(`${API_BASE_URL}/returns/${returnId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to update return: ${res.statusText}`)
  }
  const data = await res.json()
  return data.return
}
