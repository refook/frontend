import React, {createContext, useEffect, useState, ReactNode, useRef} from 'react';
import keycloak from "../services/keycloak.ts";
import Keycloak from "keycloak-js";

interface KeycloakContextType {
    keycloak: Keycloak | null;
    authenticated: boolean;
    user: any | null; // Можно уточнить тип, например, KeycloakUser
    login: () => void;
    logout: () => void;
}

export const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

interface KeycloakProviderProps {
    children: ReactNode;
}

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({children}) => {
        const [authenticated, setAuthenticated] = useState<boolean>(false);
        const [user, setUser] = useState<any | null>(null);
        const [keycloakInstance, setKeycloakInstance] = useState<Keycloak | null>(null);

        useEffect(() => {
                console.log('Initializing Keycloak...');
                keycloak
                    .init({
                        onLoad: 'check-sso',
                        pkceMethod: 'S256',
                        enableLogging: true,
                        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                    }) // Включаем логи для отладки
                    .then((auth: boolean) => {
                        console.log('Keycloak initialized, authenticated:', auth);
                        if (auth) {
                            setAuthenticated(true);
                            setUser(keycloak.tokenParsed);
                            setKeycloakInstance(keycloak);
                            console.log(keycloak)
                        } else {
                            setAuthenticated(false);
                            setKeycloakInstance(keycloak);
                        }
                    })
                    .catch((error: any) => {
                        console.error('Keycloak init failed:', error);
                    });

            }, []
        )
        ; // Пустой массив зависимостей гарантирует вызов только при монтировании

        const login = () => {
            keycloakInstance.login({
                redirectUri: 'https://refook.ru', // Убедитесь, что URI разрешен в Keycloak
            });

        };

        const logout = () => {
            keycloakInstance.logout();
        };

        return (
            <KeycloakContext.Provider value={{keycloak: keycloakInstance, authenticated, user, login, logout}}>
                {children}
            </KeycloakContext.Provider>
        );
    }
;