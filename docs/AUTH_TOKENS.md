## Централизованная работа с токенами

Файл: `src/services/auth.ts`

В этом модуле собрана единая логика доступа к токенам Keycloak и формирования авторизационных заголовков, а также обёртка над `fetch` с авто-рефрешем токена.

### Экспорты

- `getAuthHeaders(): Record<string, string>`
  - Возвращает заголовки с `Content-Type: application/json` и (если есть) `Authorization: Bearer <keycloak.token>`.

- `authorizedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>`
  - Делает запрос с подстановкой `getAuthHeaders()`.
  - При ответе `401` пытается обновить токен через `keycloak.updateToken(0)` и повторяет запрос.

### Использование

Пример сервиса:

```ts
import { API_BASE_URL } from '../services/api';
import { getAuthHeaders, authorizedFetch } from '../services/auth';

async function loadData() {
  const headers = getAuthHeaders();
  const res = await authorizedFetch(`${API_BASE_URL}/some/endpoint`, { method: 'GET', headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

Пример POST-запроса:

```ts
const headers = getAuthHeaders();
const res = await authorizedFetch(`${API_BASE_URL}/items`, {
  method: 'POST',
  headers,
  body: JSON.stringify(payload),
});
```

### Правила

- Не читать токены из `localStorage`; всегда использовать `keycloak.token` через `auth.ts`.
- Для любых сетевых вызовов предпочтительно использовать `authorizedFetch`.
- Если используется сторонняя библиотека (например, `axios`), убедиться, что заголовок `Authorization` берётся из `keycloak.token` (см. `src/services/api.ts`).

### Миграция

1. Заменить ручное формирование заголовков на `getAuthHeaders()`.
2. Заменить `fetch(...)` на `authorizedFetch(...)` там, где нужно авто-обновление токена.
3. Удалить обращения к `localStorage` для токенов.


