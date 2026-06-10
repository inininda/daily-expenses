import { apiRequest, setTokens, clearTokens, getRefreshToken } from './client';
import type { User, Session } from '../types';

interface AuthData {
  user: User;
  session: Session | null;
}

export async function signup(email: string, password: string, name?: string): Promise<AuthData> {
  const data = await apiRequest<AuthData>('/auth/signup', {
    method: 'POST',
    body: { email, password, ...(name ? { name } : {}) },
    auth: false,
  });
  if (data.session) {
    setTokens(data.session.access_token, data.session.refresh_token);
  }
  return data;
}

export async function login(email: string, password: string): Promise<AuthData> {
  const data = await apiRequest<AuthData>('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  setTokens(data.session!.access_token, data.session!.refresh_token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<null>('/auth/logout', { method: 'POST' });
  } finally {
    clearTokens();
  }
}

export async function getMe(): Promise<User> {
  return apiRequest<User>('/auth/me');
}

export async function refreshToken(): Promise<AuthData> {
  const refresh_token = getRefreshToken();
  if (!refresh_token) throw new Error('No refresh token');
  const data = await apiRequest<AuthData>('/auth/refresh', {
    method: 'POST',
    body: { refresh_token },
    auth: false,
  });
  setTokens(data.session!.access_token, data.session!.refresh_token);
  return data;
}
