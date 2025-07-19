import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://46.62.142.0:8080';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function apiRequest<T = any>(
  path: string,
  method: HttpMethod = 'GET',
  body?: object,
  options: { token?: string } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log(`[API] ${method} ${path}`);
  console.log('Status:', response.status);
  console.log('Headers:', response.headers);
  console.log('Auth Header:', headers['Authorization']);
  console.log('Body:', body);

  const contentType = response.headers.get('content-type');
  let responseData;

  try {
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
  } catch (e) {
    responseData = 'Invalid response body';
  }

  if (response.status === 401 || response.status === 403) {
    Alert.alert('Session Expired', 'Please log in again.');
    throw new Error('Unauthorized. Token may be expired.');
  }

  if (!response.ok) {
    throw new Error(
      typeof responseData === 'string'
        ? responseData
        : responseData?.error || 'Unknown server error'
    );
  }

  return responseData;
}
