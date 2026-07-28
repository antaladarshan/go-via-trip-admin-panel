import { API_BASE } from './api-base';
import { type AuthUser } from './auth-api';
import { apiFetch } from './api-client';

const BASE_URL = API_BASE;

export interface UpdateProfilePayload {
  language?: string;
  currency?: string;
}

export async function updateProfileApi(
  userId: string,
  payload: UpdateProfilePayload
): Promise<{ user: AuthUser }> {
  const res = await apiFetch(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update profile');
  return data;
}
