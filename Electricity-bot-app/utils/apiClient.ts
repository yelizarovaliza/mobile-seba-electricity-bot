import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://62761a7a8c00.ngrok-free.app';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function apiRequest<T = any>(
  path: string,
  method: HttpMethod = 'GET',
  body?: object,
  authRequired: boolean = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authRequired) {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const contentType = response.headers.get('content-type');

  let responseData;
  if (contentType?.includes('application/json')) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    const error = typeof responseData === 'string' ? { message: responseData } : responseData;
    throw new Error(error?.error || error?.message || 'Request failed');
  }

  return responseData;
}
