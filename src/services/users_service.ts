// API base URL - adjust this to match your backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api/v1'

// User type constants matching backend
export const UserType = {
  Admin: 1,
  Seller: 2,
  Buyer: 3
} as const

export type UserType = typeof UserType[keyof typeof UserType]

// User interface matching backend User model
export interface User {
  FirstName: string
  LastName: string
  Email: string
  Password: string
  Type: UserType
  Contact: string
  City: string
  State: string
  Zip: string
  Country: string
}

// Signup form data interface (frontend form structure)
export interface SignupFormData {
  firstName: string
  lastName: string
  email: string
  type: string | number
  city: string
  state: string
  zip: string
  country: string
  contact: string
  password: string
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
    // Map frontend form data to backend User model structure
    const userType: UserType = (typeof formData.type === 'string' 
      ? parseInt(formData.type, 10) 
      : formData.type) as UserType
    
    const userPayload: User = {
      FirstName: String(formData.firstName || ''),
      LastName: String(formData.lastName || ''),
      Email: String(formData.email || ''),
      Contact: String(formData.contact || ''),
      Password: String(formData.password || ''),
      Type: userType,
      City: String(formData.city || ''),
      State: String(formData.state || ''),
      Zip: String(formData.zip || ''),
      Country: String(formData.country || '')
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

