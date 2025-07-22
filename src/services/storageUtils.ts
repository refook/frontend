import { mockApi } from './mockApi';

/**
 * Утилиты для управления localStorage в приложении
 */
export class StorageUtils {
  /**
   * Полный сброс всех данных и инициализация с начальными значениями
   */
  static resetAllData(): void {
    mockApi.resetData();
    console.log('✅ Все данные сброшены и инициализированы заново');
  }

  /**
   * Очистка всех данных без инициализации
   */
  static clearAllData(): void {
    mockApi.clearAllData();
    console.log('🗑️ Все данные очищены');
  }

  /**
   * Очистка только пользовательских данных (рецепты, избранное, холодильник)
   */
  static clearUserData(): void {
    mockApi.clearUserData();
    console.log('👤 Пользовательские данные очищены');
  }

  /**
   * Очистка только избранного
   */
  static clearFavorites(): void {
    mockApi.clearFavorites();
    console.log('❤️ Избранное очищено');
  }

  /**
   * Очистка только холодильника
   */
  static clearFridge(): void {
    mockApi.clearFridge();
    console.log('🧊 Холодильник очищен');
  }

  /**
   * Получение информации о размере данных
   */
  static getStorageInfo() {
    return mockApi.getStorageInfo();
  }

  /**
   * Вывод информации о localStorage в консоль
   */
  static logStorageInfo(): void {
    const info = this.getStorageInfo();
    console.log('📊 Информация о localStorage:');
    console.log(`Общий размер: ${(info.totalSize / 1024).toFixed(2)} KB`);
    Object.entries(info.items).forEach(([key, size]) => {
      console.log(`  ${key}: ${(size / 1024).toFixed(2)} KB`);
    });
  }

  /**
   * Отладка данных холодильника
   */
  static debugFridge(): void {
    const fridgeData = localStorage.getItem('mock_fridge');
    console.log('🧊 Отладка холодильника:');
    if (!fridgeData) {
      console.log('  Данные холодильника отсутствуют');
      return;
    }
    
    try {
      const items = JSON.parse(fridgeData);
      console.log(`  Всего элементов: ${items.length}`);
      const userItems = items.filter((item: any) => item.userId === 'current-user');
      console.log(`  Элементов для current-user: ${userItems.length}`);
      
      if (userItems.length > 0) {
        console.log('  Первые 3 элемента:');
        userItems.slice(0, 3).forEach((item: any, index: number) => {
          console.log(`    ${index + 1}. ${item.ingredient.name} - ${item.amount} ${item.unit}`);
        });
      }
      
      // Показываем уникальных пользователей
      const uniqueUsers = [...new Set(items.map((item: any) => item.userId))];
      console.log(`  Пользователи в данных: ${uniqueUsers.join(', ')}`);
      
    } catch (error) {
      console.error('  Ошибка парсинга данных холодильника:', error);
    }
  }

  /**
   * Очистка через браузерное API (альтернативный способ)
   */
  static clearViaBrowserAPI(): void {
    // Очищаем только ключи, связанные с нашим приложением
    const keys = [
      'mock_recipes',
      'mock_ingredients', 
      'mock_categories',
      'mock_users',
      'mock_favorites',
      'mock_fridge'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log('🌐 Данные очищены через браузерное API');
  }

  /**
   * Полная очистка localStorage (все данные)
   */
  static clearAllLocalStorage(): void {
    localStorage.clear();
    console.log('💥 Весь localStorage очищен');
  }
}

// Экспортируем для удобного использования в консоли браузера
if (typeof window !== 'undefined') {
  (window as any).StorageUtils = StorageUtils;
  (window as any).mockApi = mockApi;
  console.log('🔧 StorageUtils и mockApi доступны в консоли:');
  console.log('  - window.StorageUtils.resetAllData()');
  console.log('  - window.StorageUtils.debugFridge()');
  console.log('  - window.mockApi.resetData()');
} 