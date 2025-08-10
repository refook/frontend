import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: 'https://keycloak.refook.ru', // Замените на URL вашего Keycloak сервера
    // url: 'http://localhost:8888', // Замените на URL вашего Keycloak сервера
    realm: 'prod-realm',
    clientId: 'refook-front',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;