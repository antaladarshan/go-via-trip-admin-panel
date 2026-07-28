import { API_BASE } from './api-base';
import { apiFetch } from './api-client';

const BASE_URL = API_BASE;

export interface AuthUser {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  phone: string | null;
  country: string | null;
  avatar_url: string | null;
  language: string | null;
  currency: string | null;
  email_verified?: boolean;
}

export async function loginApi(email: string, password: string): Promise<{ user: AuthUser }> {
  const res = await apiFetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Login failed');
  return data;
}

export async function logoutApi(): Promise<void> {
  await apiFetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function meApi(): Promise<{ user: AuthUser } | null> {
  try {
    const res = await apiFetch(`${BASE_URL}/auth/me`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
