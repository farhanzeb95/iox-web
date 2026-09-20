import { API_BASE_URL } from '../config/api'
import { authFetch } from '../utils/authFetch'
import type { OrderReturnDto } from '../types/return'

/** Get my return requests (buyer: their returns; seller: returns for their orders). */
export async function getMyReturns(): Promise<OrderReturnDto[]> {
  const res = await authFetch(`${API_BASE_URL}/returns`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to get returns: ${res.statusText}`)
  }
  const data = await res.json()
  return data.returns ?? []
}

/** Update return status (seller: APPROVED or REJECTED). */
export async function updateReturnStatus(returnId: string, status: string): Promise<OrderReturnDto> {
  const res = await authFetch(`${API_BASE_URL}/returns/${returnId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Failed to update return: ${res.statusText}`)
  }
  const data = await res.json()
  return data.return
}
