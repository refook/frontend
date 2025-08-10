import React from 'react'
import ReactDOM from 'react-dom/client'
import {HashRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import {store} from './store'
import {StorageUtils} from './services'
import App from './App'
import './index.css'
import {KeycloakProvider} from "./providers/KeycloakProvider.tsx";

// Добавляем утилиты в глобальную область для отладки
if (import.meta.env.DEV) {
    (window as any).StorageUtils = StorageUtils;
    console.log('🔧 Инструменты разработки доступны в консоли:');
    console.log('  - StorageUtils.clearAllData() - очистить все данные');
    console.log('  - StorageUtils.getStorageInfo() - информация о хранилище');
    console.log('  - StorageUtils.getApiStats() - статистика API');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
        <KeycloakProvider>
            <Provider store={store}>
                <HashRouter>
                    <App/>
                </HashRouter>
            </Provider>
        </KeycloakProvider>
    ,
)
