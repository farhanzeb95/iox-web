import { API_BASE_URL } from '../config/api'
import { authFetch } from '../utils/authFetch'

export interface WatchlistResponse {
  productIds: string[]
}

/** Get current user's watchlist product IDs (requires auth). Returns [] on error. */
export async function getWatchlist(): Promise<string[]> {
  try {
    const res = await authFetch(`${API_BASE_URL}/watchlist`)
    if (!res.ok) throw new Error(`Failed to fetch watchlist: ${res.statusText}`)
    const data: WatchlistResponse = await res.json()
    return data.productIds ?? []
  } catch (error) {
    console.error(error)
    return []
  }
}

/** Add product to watchlist (requires auth). */
export async function addToWatchlist(productId: string): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/watchlist`, {
    method: 'POST',
    body: JSON.stringify({ productId }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || `Failed to add to watchlist: ${res.statusText}`)
  }
}

/** Remove product from watchlist (requires auth). */
export async function removeFromWatchlist(productId: string): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/watchlist/${productId}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || `Failed to remove from watchlist: ${res.statusText}`)
  }
}
