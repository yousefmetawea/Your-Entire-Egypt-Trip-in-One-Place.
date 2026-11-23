import { ServiceError, type ServiceErrorCode } from '../errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApiClientOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    // Crucial requirement: Include cookies on all requests for httpOnly auth
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let code: ServiceErrorCode = 'UNAVAILABLE';
      let message = 'An unexpected error occurred';

      if (response.status === 404) {
        code = 'NOT_FOUND';
        message = data?.error?.message || 'Resource not found';
      } else if (response.status === 400 || response.status === 422) {
        code = 'VALIDATION';
        message = data?.error?.message || 'Validation failed';
      } else if (response.status === 401) {
        code = 'UNAVAILABLE'; // Or custom auth code, mapped cleanly to ServiceError
        message = data?.error?.message || 'Authentication required';
      } else if (response.status === 403) {
        code = 'UNAVAILABLE';
        message = data?.error?.message || 'Access denied';
      } else if (response.status === 409) {
        code = 'VALIDATION';
        message = data?.error?.message || 'A conflicting change occurred. Please reload.';
      } else {
        message = data?.error?.message || `Server error (${response.status})`;
      }

      throw new ServiceError(code, message);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(
      'UNAVAILABLE',
      error instanceof Error ? error.message : 'Unable to connect to the server',
    );
  }
}
