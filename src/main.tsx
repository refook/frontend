import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StorageUtils, mockApi } from './services'

// Инициализируем глобальные утилиты для разработки
if (import.meta.env.DEV) {
  (window as any).StorageUtils = StorageUtils;
  (window as any).mockApi = mockApi;
  console.log('🔧 Dev tools доступны в консоли:');
  console.log('  - StorageUtils.resetAllData()');
  console.log('  - mockApi.resetData()');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
