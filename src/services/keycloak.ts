import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: import.meta.env.MODE == "back" ? 'http://localhost:8888' : 'https://keycloak.refook.ru',
    realm: 'prod-realm',
    clientId: 'refook-front',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;