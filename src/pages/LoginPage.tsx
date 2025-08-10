import React, {useContext} from 'react';
import {KeycloakContext} from "../providers/KeycloakProvider.tsx";

const LoginPage: React.FC = () => {
    const context = useContext(KeycloakContext);

    if (context == null) {
        throw new Error('KeycloakContext must be used within a KeycloakProvider');
    }

    const {authenticated, user, logout, keycloak} = context;

    const handleLogin = () => {
        console.log(context)
        if (keycloak != null) {
            keycloak.login()
        } else {
            console.warn("ПОЧЕМУ ОН null????")
        }
    };

    return (<>
            {authenticated ?
                <div className="container" onClick={logout}><h1>Нажми для выхода</h1></div>
                :
                <div className="container" onClick={handleLogin}><h1>нажми для входа</h1></div>
            }
        </>
    );
};

export default LoginPage;