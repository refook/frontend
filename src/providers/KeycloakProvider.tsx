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
                    const token = localStorage.getItem("authToken");
                    const refreshToken = localStorage.getItem("refreshToken");

                    console.warn(keycloak)

                    if (token && refreshToken) {
                        keycloak.token = token;
                        keycloak.refreshToken = refreshToken;
                    }
                    console.log(token, refreshToken);
                    await keycloak
                        .init({
                            onLoad: 'check-sso',
                            pkceMethod: 'S256',
                            checkLoginIframe: false,
                            idToken: localStorage.getItem("idToken") ?? undefined,
                            token: localStorage.getItem("authToken") ?? undefined,
                            refreshToken: localStorage.getItem("refreshToken") ?? undefined,
                            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                            //@ts-ignore
                            tokenStorage: "localStorage"
                        }) // Включаем логи для отладки
                        .then((auth: boolean) => {
                            console.log('Keycloak initialized, authenticated:', auth);
                            if (auth) {
                                setAuthenticated(true);
                                saveUser();
                                // Сохраняем токен для API
                                if (keycloak.token && keycloak.refreshToken) {
                                    updateLocalstorageTokens()
                                    apiService.setAuthToken(keycloak.token);
                                    try { console.log('Swagger bearer token:', `Bearer ${keycloak.token}`); } catch {}
                                }
                                // Обновляем токен перед истечением
                                keycloak.onTokenExpired = () => {
                                    keycloak.updateToken(keycloak.tokenParsed!.auth_time! - keycloak.tokenParsed!.exp!).then(
                                        (refreshed) => {
                                            if (refreshed && keycloak.token && keycloak.refreshToken) {
                                                updateLocalstorageTokens()
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
            // Чистим localStorage и axios заголовки заранее
            apiService.removeAuthTokens();
            keycloakInstance?.logout();
        };

        const register = () => {
            keycloakInstance?.register()
        }

        const updateLocalstorageTokens = () => {
            localStorage.setItem('authToken', keycloak.token!);
            localStorage.setItem('idToken', keycloak.idToken!);
            localStorage.setItem('refreshToken', keycloak.refreshToken!);
        };

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