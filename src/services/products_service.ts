import type { Product } from "../types/product"
import { API_BASE_URL } from '../config/api'
import { authFetch, authFetchForUpload } from '../utils/authFetch'

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

export const getProducts = async (filters?: {
  category?: string
  sellerId?: string
  search?: string
  isAvailable?: boolean
  condition?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  page?: number
  limit?: number
}): Promise<ProductsResponse> => {
  try {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.sellerId) params.append('sellerId', filters.sellerId)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.isAvailable !== undefined) params.append('isAvailable', String(filters.isAvailable))
    if (filters?.condition) params.append('condition', filters.condition)
    if (filters?.minPrice !== undefined && filters.minPrice > 0) params.append('minPrice', String(filters.minPrice))
    if (filters?.maxPrice !== undefined && filters.maxPrice > 0) params.append('maxPrice', String(filters.maxPrice))
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))

    const url = `${API_BASE_URL}/products${params.toString() ? '?' + params.toString() : ''}`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`)
    }
    const data: ProductsResponse = await res.json()
    return data
  } catch (error) {
    console.error(error)
    return { products: [], total: 0, page: 1, limit: 0 }
  }
}

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`)
    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch product: ${res.statusText}`)
    }
    const data: Product = await res.json()
    return data
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getProductsBySeller = async (sellerId: string): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/seller/${sellerId}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch seller products: ${res.statusText}`)
    }
    const data: Product[] = await res.json()
    return data
  } catch (error) {
    console.error(error)
    return []
  }
}

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  try {
    const res = await authFetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(product),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || `Failed to create product: ${res.statusText}`)
    }
    const data: Product = await res.json()
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const updateProduct = async (productId: string, product: Partial<Product>): Promise<void> => {
  const url = `${API_BASE_URL}/products/${productId}`
  console.log('[products_service] updateProduct called', { productId, url, method: 'PUT' })
  try {
    const res = await authFetch(url, {
      method: 'PUT',
      body: JSON.stringify(product),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || `Failed to update product: ${res.statusText}`)
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const res = await authFetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || `Failed to delete product: ${res.statusText}`)
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const uploadProductImages = async (files: File[]): Promise<string[]> => {
  try {
    if (files.length === 0) {
      throw new Error('No files provided')
    }

    if (files.length > 5) {
      throw new Error('Maximum 5 images allowed')
    }

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
    })

    const res = await authFetchForUpload(`${API_BASE_URL}/products/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || `Failed to upload images: ${res.statusText}`)
    }

    const data = await res.json()
    return data.urls || []
  } catch (error) {
    console.error(error)
    throw error
  }
}