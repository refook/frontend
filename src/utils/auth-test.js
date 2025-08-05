// Утилита для тестирования авторизации
// Выполните в консоли браузера:

console.log('=== Тестирование авторизации ===');

// 1. Проверить текущий токен
const currentToken = localStorage.getItem('authToken');
console.log('Текущий токен:', currentToken || 'не установлен');

// 2. Функция для установки тестового токена
window.setTestToken = function(token) {
  localStorage.setItem('authToken', token);
  console.log('Токен установлен:', token);
  console.log('Теперь перезагрузите страницу для применения изменений');
};

// 3. Функция для очистки токена
window.clearToken = function() {
  localStorage.removeItem('authToken');
  console.log('Токен очищен');
  console.log('Перезагрузите страницу');
};

// 4. Инструкции
console.log(`
Инструкции по использованию:
1. Для установки токена: setTestToken("your-jwt-token-here")
2. Для очистки токена: clearToken()
3. После установки/очистки перезагрузите страницу
4. Проверьте Network вкладку в DevTools для проверки Authorization header
`);

console.log('=== Готово к тестированию ===');