import type { UserType } from "../types/user_types"
import { API_BASE_URL } from '../config/api'
import { authFetch } from '../utils/authFetch'

// Re-export UserType for convenience
export type { UserType } from "../types/user_types"

// User interface matching backend User model
export interface User {
  id?: string
  FirstName: string
  LastName: string
  Email: string
  Password?: string
  Type: UserType
  Contact: string
  /** ACTIVE, IN_REVIEW, REJECTED, SUSPENDED - account status */
  status?: string
  businessRegistrationUrl?: string
  idCardFrontUrl?: string
  idCardBackUrl?: string
  /** Profile photo URL (e.g. from Supabase Storage users bucket) */
  avatarUrl?: string
  Address?: {
    City: string
    State: string
    Zip: string
    Country: string
  }
  createdAt?: string
  updatedAt?: string
}

// Signup form data interface (frontend form structure)
export interface SignupFormData {
  firstName: string
  lastName: string
  email: string
  type: string
  contact: string
  password: string
  address: {
    city: string
    state: string
    zip: string
    country: string
  }
  /** Set after uploading document; required for BUSINESS_SELLER */
  businessRegistrationUrl?: string
  /** Set after uploading; required for PRIVATE_SELLER */
  idCardFrontUrl?: string
  idCardBackUrl?: string
}

export interface LoginFormData {
  email: string
  password: string
}

// API response interface
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export async function loginUser(formData: LoginFormData): Promise<string> {
  const loginPayload = {
    Email: formData.email,
    Password: formData.password
  }

  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginPayload)
  })

  // Parse JSON safely
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMessage = typeof data === 'object' && data !== null && 'error' in data
      ? String((data as { error?: string }).error || 'Login failed')
      : 'Login failed'
    throw new Error(errorMessage)
  }

  // Assuming the API returns { token: '...' } or just a string
  const token = typeof data === 'string' ? data : (data as { token?: string }).token
  if (!token) {
    throw new Error('Login succeeded but no token was returned')
  }

  localStorage.setItem('authToken', token)
  return token
}


/**
 * Upload a signup document (identity/business doc). Returns the public URL.
 */
export async function uploadSignupDocument(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('document', file)
  const res = await fetch(`${API_BASE_URL}/users/upload-signup-document`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || 'Upload failed')
  }
  const data = await res.json()
  return (data as { url: string }).url
}

/**
 * Creates a new user by calling the POST /users endpoint
 * @param formData - The signup form data (include businessRegistrationUrl / idCardFrontUrl / idCardBackUrl for sellers)
 * @returns Promise with the created user or error
 */
export async function createUser(formData: SignupFormData): Promise<ApiResponse<User>> {
  try {
    const userPayload: User = {
      FirstName: String(formData.firstName || ''),
      LastName: String(formData.lastName || ''),
      Email: String(formData.email || ''),
      Contact: String(formData.contact || ''),
      Password: String(formData.password || ''),
      Type: (formData.type || '') as UserType,
      Address: {
        City: String(formData.address.city || ''),
        State: String(formData.address.state || ''),
        Zip: String(formData.address.zip || ''),
        Country: String(formData.address.country || '')
      }
    }
    if (formData.businessRegistrationUrl) {
      userPayload.businessRegistrationUrl = formData.businessRegistrationUrl
    }
    if (formData.idCardFrontUrl) {
      userPayload.idCardFrontUrl = formData.idCardFrontUrl
    }
    if (formData.idCardBackUrl) {
      userPayload.idCardBackUrl = formData.idCardBackUrl
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userPayload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
      return {
        error: errorData.error || `HTTP error! status: ${response.status}`
      }
    }

    const createdUser = await response.json()
    return {
      data: createdUser
    }
  } catch (error) {
    // Handle network errors (CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        error: `Unable to connect to the server. Please ensure the backend is running on ${API_BASE_URL}`
      }
    }
    return {
      error: error instanceof Error ? error.message : 'Failed to create user'
    }
  }
}

/**
 * Fetches all users (admin). Requires auth token.
 */
export async function getUsers(): Promise<User[]> {
  try {
    const response = await authFetch(`${API_BASE_URL}/users`)
    if (!response.ok) return []
    const data = await response.json().catch(() => [])
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function updateSellerStatus(
  id: string,
  status: 'ACTIVE' | 'REJECTED' | 'IN_REVIEW' | 'SUSPENDED',
): Promise<ApiResponse<User>> {
  const response = await authFetch(`${API_BASE_URL}/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { error: (data as { error?: string }).error || 'Failed to update seller status' }
  }
  return { data: data as User }
}

/**
 * Fetches current user profile (auth required).
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await authFetch(`${API_BASE_URL}/users/me`)
    if (!response.ok) return null
    return response.json().catch(() => null)
  } catch {
    return null
  }
}

/**
 * Updates current user profile (auth required). Only FirstName, LastName, Contact, Address.
 */
export async function updateUser(
  id: string,
  data: Partial<Pick<User, 'FirstName' | 'LastName' | 'Contact' | 'Address'>>
): Promise<ApiResponse<User>> {
  const response = await authFetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Update failed' }))
    return { error: err.error || String(response.status) }
  }
  const user = await response.json()
  return { data: user }
}
