import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://62761a7a8c00.ngrok-free.app';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function apiRequest<T = any>(
  path: string,
  method: HttpMethod = 'GET',
  body?: object,
  withAuth: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      };

  if (withAuth) {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

  const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

  console.log(`[API] ${method} ${path}`);
  console.log('Status:', response.status);
  console.log('Headers:', response.headers);
  console.log('Authorization:', headers['Authorization']);
  console.log('Body:', body);

  const contentType = response.headers.get('content-type');

    let responseData;
    if (contentType?.includes('application/json')) {
        responseData = await response.text();
    } else {
        responseData = await response.json();
    }

    if (!response.ok) {
      throw new Error(typeof responseData === 'string' ? responseData : responseData.error || 'Unknown error');
    }

    return responseData;
  }
