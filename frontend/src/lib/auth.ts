/**
 * Authentication utilities for JWT-based admin authentication
 */

const TOKEN_KEY = 'admin_token';
const TOKEN_EXPIRY_KEY = 'admin_token_expiry';

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface VerifyResponse {
  email: string;
  valid: boolean;
}

interface AdminCreateRequest {
  email: string;
  password: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

/**
 * Store JWT token and expiry time in localStorage and cookies
 */
export function setToken(token: string, expiresIn: number): void {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage for client-side access
  localStorage.setItem(TOKEN_KEY, token);
  
  // Calculate expiry timestamp (current time + expires_in seconds)
  const expiryTime = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  
  // Also store in cookies for middleware access
  const expiryDate = new Date(expiryTime);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
  document.cookie = `${TOKEN_EXPIRY_KEY}=${expiryTime}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  // Check if token exists and is not expired
  if (token && expiry) {
    const expiryTime = parseInt(expiry, 10);
    if (Date.now() < expiryTime) {
      return token;
    }
    // Token expired, remove it
    removeToken();
  }
  
  return null;
}

/**
 * Remove JWT token from localStorage and cookies
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  
  // Remove cookies
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${TOKEN_EXPIRY_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Login user and store JWT token
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let errorMessage = 'Login failed';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // If we can't parse the error, use default message
    }
    
    throw new Error(errorMessage);
  }

  const data: LoginResponse = await response.json();
  
  // Store token
  setToken(data.access_token, data.expires_in);
  
  return data;
}

/**
 * Logout user and remove token
 */
export function logout(): void {
  removeToken();
}

/**
 * Verify JWT token with backend
 */
export async function verifyToken(): Promise<VerifyResponse> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/admin/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    removeToken();
    throw new Error('Token verification failed');
  }

  const data: VerifyResponse = await response.json();
  
  if (!data.valid) {
    removeToken();
    throw new Error('Invalid token');
  }
  
  return data;
}

/**
 * Create a new admin user
 */
export async function createAdmin(email: string, password: string): Promise<VerifyResponse> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add token if available (for creating additional admins)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestData: AdminCreateRequest = { email, password };

  const response = await fetch(`${API_BASE_URL}/admin/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to create admin';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // If we can't parse the error, use default message
    }
    
    throw new Error(errorMessage);
  }

  const data: VerifyResponse = await response.json();
  return data;
}

/**
 * Get current user info from verified token
 */
export async function getCurrentUser(): Promise<{ email: string } | null> {
  try {
    const verified = await verifyToken();
    return { email: verified.email };
  } catch {
    return null;
  }
}
