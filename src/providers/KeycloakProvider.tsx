import React, {createContext, useEffect, useState} from 'react';
import keycloak from "../services/keycloak.ts";
import Keycloak from "keycloak-js";
import type {ComponentWithChildren} from "../types";

interface KeycloakContextType {
    keycloak: Keycloak | null;
    authenticated: boolean;
    user: any | null; // Можно уточнить тип, например, KeycloakUser
    login: () => void;
    logout: () => void;
    register: () => void;
    isInitialized: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);


export const KeycloakProvider: React.FC<ComponentWithChildren> = ({children}) => {
        const [authenticated, setAuthenticated] = useState<boolean>(false);
        const [user, setUser] = useState<any | null>(null);
        const [keycloakInstance, setKeycloakInstance] = useState<Keycloak | null>(null);
        const [isInitialized, setIsInitialized] = useState<boolean>(false);

        useEffect(() => {
                const initKeycloak = async () => {
                    console.log('Initializing Keycloak...');
                    await keycloak
                        .init({
                            onLoad: 'check-sso',
                            pkceMethod: 'S256',
                            // enableLogging: true,
                            // checkLoginIframe: false,
                            // silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                        }) // Включаем логи для отладки
                        .then((auth: boolean) => {
                            console.log('Keycloak initialized, authenticated:', auth);
                            if (auth) {
                                setAuthenticated(true);
                                setUser(keycloak.tokenParsed);
                            } else {
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
        )
        ; // Пустой массив зависимостей гарантирует вызов только при монтировании

        const login = () => {
            keycloakInstance?.login({
                redirectUri: import.meta.env.DEV ? 'http://localhost:5173' : 'https://refook.ru', // Убедитесь, что URI разрешен в Keycloak
            });

        };

        const logout = () => {
            keycloakInstance?.logout();
        };

        const register = () => {
            keycloakInstance?.register()
        }

        if (!isInitialized) {
            return <div>Loading authentication...</div>; // или спиннер
        }
        return (
            <KeycloakContext.Provider value={{keycloak: keycloakInstance, authenticated, user, login, logout, register, isInitialized}}>
                {children}
            </KeycloakContext.Provider>
        );
    }
;