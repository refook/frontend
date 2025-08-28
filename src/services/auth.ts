import keycloak from './keycloak.ts';

export function getAuthHeaders(): Record<string, string> {
  const token = keycloak.token;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers as HeadersInit | undefined);
  const baseHeaders = getAuthHeaders();
  Object.entries(baseHeaders).forEach(([k, v]) => headers.set(k, v));

  const doFetch = () => fetch(input, { ...init, headers });

  let response = await doFetch();
  if (response.status === 401) {
    try {
      const refreshed = await keycloak.updateToken(0);
      if (refreshed && keycloak.token) {
        headers.set('Authorization', `Bearer ${keycloak.token}`);
        response = await doFetch();
      }
    } catch {
      // ignore, просто вернём исходный 401
    }
  }
  return response;
}


