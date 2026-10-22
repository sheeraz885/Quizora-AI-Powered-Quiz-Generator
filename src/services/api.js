const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let accessToken = localStorage.getItem('quiz_access_token');

export function setAccessToken(token) {
  accessToken = token;
  if (token) localStorage.setItem('quiz_access_token', token);
  else localStorage.removeItem('quiz_access_token');
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...((options.headers) || {}),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection and try again.', 0);
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      typeof data === 'object' && data && 'message' in data
        ? String(data.message)
        : typeof data === 'string'
        ? data
        : 'Request failed. Please try again.';
    throw new ApiError(message, res.status);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
