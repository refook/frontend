import keycloak from './keycloak.ts';
import {removeLocalStorageTokens, updateLocalStorageTokens} from "../utils/localStorageUtils.ts";

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
  switch (response.status){
    case 401:
      try {
        console.log("Попытка обновить токен автоматом на 401 ответ")
        const refreshed = await keycloak.updateToken(3);
        console.log("Результат обновления", refreshed)
        if (refreshed && keycloak.token && keycloak.refreshToken && keycloak.idToken) {
          updateLocalStorageTokens(keycloak.token, keycloak.refreshToken, keycloak.idToken)
          headers.set('Authorization', `Bearer ${keycloak.token}`);
          console.log("делаем перезапрос")
          response = await doFetch();
        }
      } catch (e) {
          console.error("После попытки обновить токен и перезапроса не получилось получить ответ, разлогиним", e)
          removeLocalStorageTokens()
          keycloak.logout()
      }
      break;
    case 403:
      console.warn("Вы не имеете сюда доступа, пока")
  }
  return response;
}


