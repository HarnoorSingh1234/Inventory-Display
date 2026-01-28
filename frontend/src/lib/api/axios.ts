'use client';

import { useCallback, useState } from 'react';
import { getToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export interface ApiClientOptions {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | Record<string, unknown> | null;
}

export interface UseApiClientReturn {
  callApi: <T>(endpoint: string, options?: ApiClientOptions) => Promise<T>;
  callApiRaw: (endpoint: string, options?: ApiClientOptions) => Promise<Response>;
  isReady: boolean;
}

/**
 * Hook for making authenticated API calls with JWT Bearer tokens
 * Automatically handles token injection from localStorage
 */
export function useApiClient(): UseApiClientReturn {
  const [isReady] = useState(true);

  const callApiRaw = useCallback(async (
    endpoint: string,
    options: ApiClientOptions = {}
  ): Promise<Response> => {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${normalizedEndpoint}`;

    // Get fresh token from localStorage on each request
    const token = getToken();
    
    // Prepare headers
    const headers = new Headers(options.headers);

    // Add authorization header if token exists
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Handle body serialization
    let body: BodyInit | null = null;
    if (options.body) {
      if (options.body instanceof FormData) {
        // Let browser set Content-Type with boundary for FormData
        body = options.body;
      } else if (typeof options.body === 'string') {
        body = options.body;
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }
      } else if (options.body instanceof Blob) {
        body = options.body;
      } else {
        // Assume it's a plain object that needs JSON serialization
        body = JSON.stringify(options.body);
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }
      }
    }

    // Log API call for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${options.method || 'GET'} ${url}`, {
        token: token ? `${token.substring(0, 10)}...` : 'none',
        hasBody: !!body,
      });
    }

    const response = await fetch(url, {
      ...options,
      headers,
      body,
    });

    return response;
  }, []);

  const callApi = useCallback(async <T,>(
    endpoint: string,
    options: ApiClientOptions = {}
  ): Promise<T> => {
    const response = await callApiRaw(endpoint, options);

    // Handle non-ok responses
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        // Try to parse error response body
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }
      } catch {
        // If we can't parse the error, use the default message
      }

      throw new Error(errorMessage);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    // Parse JSON response
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    // For non-JSON responses, return the response object itself
    return response as unknown as T;
  }, [callApiRaw]);

  return {
    callApi,
    callApiRaw,
    isReady,
  };
}

/**
 * Build a descriptive error from an API error
 */
export function buildApiError(action: string, error: unknown): Error {
  if (error instanceof Error) {
    return new Error(`Failed to ${action}: ${error.message}`);
  }
  return new Error(`Failed to ${action}: Unknown error`);
}
