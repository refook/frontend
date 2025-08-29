/** Добавить токены в localStorage (только для keycloak.init) */
export function updateLocalStorageTokens(token: string, refreshToken: string, idToken: string) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('idToken', idToken);
    localStorage.setItem('refreshToken', refreshToken);
}

/** Удалить токены из localStorage */
export function removeLocalStorageTokens() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
}
