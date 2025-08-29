import React, {createContext, useEffect, useState} from 'react';
import keycloak from "../services/keycloak.ts";
import Keycloak from "keycloak-js";
import type {ComponentWithChildren} from "../types";
import {apiService} from "../services/api";

interface KeycloakContextType {
    keycloak: Keycloak | null;
    authenticated: boolean;
    user: KeycloakUserInfo | null; // Можно уточнить тип, например, KeycloakUser
    login: () => void;
    logout: () => void;
    register: () => void;
    manageAccount: () => void;
    isInitialized: boolean;
}

interface KeycloakUserInfo {
    name: string,
    email: string,
    photoUrl?: string,
    username: string
}

// eslint-disable-next-line react-refresh/only-export-components
export const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);


export const KeycloakProvider: React.FC<ComponentWithChildren> = ({children}) => {
        const [authenticated, setAuthenticated] = useState<boolean>(false);
        const [user, setUser] = useState<KeycloakUserInfo | null>(null);
        const [keycloakInstance, setKeycloakInstance] = useState<Keycloak | null>(null);
        const [isInitialized, setIsInitialized] = useState<boolean>(false);

        useEffect(() => {
                const initKeycloak = async () => {
                    console.log('Initializing Keycloak...');
                    console.warn(keycloak)
                    await keycloak
                        .init({
                            onLoad: 'check-sso',
                            pkceMethod: 'S256',
                            checkLoginIframe: false,
                            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
                        })
                        .then((auth: boolean) => {
                            console.log('Keycloak initialized, authenticated:', auth);
                            if (auth) {
                                setAuthenticated(true);
                                saveUser();
                                // Сохраняем токен для API
                                if (keycloak.token && keycloak.refreshToken) {
                                    apiService.setAuthToken(keycloak.token);
                                    try { console.log('Swagger bearer token:', `Bearer ${keycloak.token}`); } catch {}
                                }
                                // Обновляем токен перед истечением
                                keycloak.onTokenExpired = () => {
                                    keycloak.updateToken(keycloak.tokenParsed!.auth_time! - keycloak.tokenParsed!.exp!).then(
                                        (refreshed) => {
                                            if (refreshed && keycloak.token && keycloak.refreshToken) {
                                                console.log("Токен обновлен")
                                                try { console.log('Swagger bearer token (refreshed):', `Bearer ${keycloak.token}`); } catch {}
                                            }
                                        }
                                    ).catch((e) => {
                                        console.error('Не удалось обновить токен Keycloak', e);
                                        keycloak.logout()
                                    });
                                };
                            } else {
                                console.error('Не удалось обновить токен Keycloak');
                                setAuthenticated(false);
                            }
                            setKeycloakInstance(keycloak);
                            setIsInitialized(true)
                        })
                        .catch((error: any) => {
                            console.error('Keycloak init failed:', error);
                        });
                }
                initKeycloak()
            }, []
        ); // Пустой массив зависимостей гарантирует вызов только при монтировании

        const saveUser= () => {
            if (keycloak.tokenParsed) {
                const user: KeycloakUserInfo = {
                    name: keycloak.tokenParsed.name,
                    email: keycloak.tokenParsed.email,
                    photoUrl: keycloak.tokenParsed.photo,
                    username: keycloak.tokenParsed.preferred_username
                }
                setUser(user)
            }
        }

        const login = () => {
            keycloakInstance?.login({
                // scope: 'offline_access',
                redirectUri: import.meta.env.DEV ? 'http://localhost:5173' : 'https://refook.ru', // Убедитесь, что URI разрешен в Keycloak
            });

        };

        const logout = () => {
            // Чистим axios заголовки заранее
            apiService.removeAuthTokens();
            keycloakInstance?.logout();
        };

        const register = () => {
            keycloakInstance?.register()
        }

        // Убрано: сохранение токенов в localStorage. Всегда используем keycloak.token напрямую.

        const manageAccount = () => {
            // Открыть страницу управления аккаунтом Keycloak (редактирование профиля)
            // Keycloak сам обработает редирект обратно, если настроен в клиенте
            keycloakInstance?.accountManagement();
        }

        if (!isInitialized) {
            return <div>Loading authentication...</div>; // или спиннер
        }
        return (
            <KeycloakContext.Provider value={{keycloak: keycloakInstance, authenticated, user, login, logout, register, manageAccount, isInitialized}}>
                {children}
            </KeycloakContext.Provider>
        );
    }
;