import { apiBaseUrl } from '../config/env';
import { clearSession, readSession } from './authSession';

export class ApiError extends Error {
  public readonly status: number
  public readonly validationErrors?: Record<string, string[]>

  constructor(
    status: number,
    message: string,
    validationErrors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.validationErrors = validationErrors
  }
}

export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${apiBaseUrl}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body instanceof URLSearchParams === false && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = readSession()?.token;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData: unknown = await response.json().catch(() => null);
    const details = typeof errorData === 'object' && errorData !== null
      ? errorData as Record<string, unknown>
      : null;
    const title = typeof details?.title === 'string' ? details.title : undefined;
    const legacyMessage = typeof details?.message === 'string' ? details.message : undefined;
    const validationErrors = typeof details?.errors === 'object' && details.errors !== null
      ? details.errors as Record<string, string[]>
      : undefined;

    if (response.status === 401) {
      clearSession();
    }

    throw new ApiError(
      response.status,
      title || legacyMessage || `API request failed with status ${response.status}`,
      validationErrors,
    );
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
};
