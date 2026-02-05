const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9001/api/v1'

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('authToken')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export interface WatchlistResponse {
  productIds: string[]
}

/** Get current user's watchlist product IDs (requires auth). Returns [] if not logged in or on error. */
export async function getWatchlist(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/watchlist`, { headers: getAuthHeaders() })
    if (!res.ok) {
      if (res.status === 401) return []
      throw new Error(`Failed to fetch watchlist: ${res.statusText}`)
    }
    const data: WatchlistResponse = await res.json()
    return data.productIds ?? []
  } catch (error) {
    console.error(error)
    return []
  }
}

/** Add product to watchlist (requires auth). */
export async function addToWatchlist(productId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/watchlist`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || `Failed to add to watchlist: ${res.statusText}`)
  }
}

/** Remove product from watchlist (requires auth). */
export async function removeFromWatchlist(productId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/watchlist/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || `Failed to remove from watchlist: ${res.statusText}`)
  }
}
