import type { UserType } from "../types/user_types"

// Re-export UserType for convenience
export type { UserType } from "../types/user_types"

// API base URL - adjust this to match your backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9001/api/v1'

// User interface matching backend User model
export interface User {
  id?: string
  FirstName: string
  LastName: string
  Email: string
  Password?: string
  Type: UserType
  Contact: string
  /** Profile photo URL (e.g. from Supabase Storage users bucket) */
  avatarUrl?: string
  Address?: {
    City: string
    State: string
    Zip: string
    Country: string
  }
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

export async function loginUser(formData: LoginFormData): Promise<void> {
  try {
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
      console.error('Login failed:', data)
      return
    }

    // Assuming the API returns { token: '...' } or just a string
    const token = typeof data === 'string' ? data : data.token

    if (token) {
      // Store token in localStorage
      localStorage.setItem('authToken', token)
      console.log('Login successful, token saved:', token)
    } else {
      console.warn('Login successful but no token returned:', data)
    }

  } catch (error) {
    console.error('Login error:', error)
  }
}


/**
 * Creates a new user by calling the POST /users endpoint
 * @param formData - The signup form data
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
  const token = localStorage.getItem('authToken')
  if (!token) return []

  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return []
  const data = await response.json().catch(() => [])
  return Array.isArray(data) ? data : []
}

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
  'Content-Type': 'application/json',
})

/**
 * Fetches current user profile (auth required).
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('authToken')
  if (!token) return null

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: authHeaders(),
  })
  if (!response.ok) return null
  return response.json().catch(() => null)
}

/**
 * Updates current user profile (auth required). Only FirstName, LastName, Contact, Address.
 */
export async function updateUser(
  id: string,
  data: Partial<Pick<User, 'FirstName' | 'LastName' | 'Contact' | 'Address'>>
): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Update failed' }))
    return { error: err.error || String(response.status) }
  }
  const user = await response.json()
  return { data: user }
}
