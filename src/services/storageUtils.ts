import { ingredientsService } from './ingredientsService';
import { realRecipesService } from './realRecipesService';

export class StorageUtils {
  
  /**
   * Очистка всех данных приложения (для отладки)
   */
  static clearAllData(): void {
    try {
      console.log('🗑️ Очистка всех данных приложения...');
      
      // Очищаем localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('refook_') || key.startsWith('mock_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Очищаем sessionStorage
      sessionStorage.clear();
      
      console.log('✅ Все данные приложения очищены');
      console.log('💡 Перезагрузите страницу для полного сброса');
      
    } catch (error) {
      console.error('❌ Ошибка при очистке данных:', error);
    }
  }

  /**
   * Получение статистики использования памяти
   */
  static getStorageInfo(): { 
    localStorage: number; 
    sessionStorage: number; 
    total: number;
    items: Record<string, number>;
  } {
    try {
      const getStorageSize = (storage: Storage) => {
        let total = 0;
        for (let key in storage) {
          if (storage.hasOwnProperty(key)) {
            total += storage[key].length + key.length;
          }
        }
        return total;
      };

      const localStorageSize = getStorageSize(localStorage);
      const sessionStorageSize = getStorageSize(sessionStorage);
      
      // Детальная информация по ключам
      const items: Record<string, number> = {};
      Object.keys(localStorage).forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          items[key] = new Blob([value]).size;
        }
      });

      return {
        localStorage: localStorageSize,
        sessionStorage: sessionStorageSize,
        total: localStorageSize + sessionStorageSize,
        items
      };
      
    } catch (error) {
      console.error('Ошибка при получении информации о хранилище:', error);
      return { localStorage: 0, sessionStorage: 0, total: 0, items: {} };
    }
  }

  /**
   * Очистка устаревших данных (старше 30 дней)
   */
  static clearExpiredData(): void {
    try {
      console.log('🧹 Очистка устаревших данных...');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      Object.keys(localStorage).forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.timestamp && new Date(data.timestamp) < thirtyDaysAgo) {
              localStorage.removeItem(key);
              console.log(`🗑️ Удален устаревший ключ: ${key}`);
            }
          }
        } catch (error) {
          // Игнорируем ошибки парсинга
        }
      });
      
      console.log('✅ Очистка устаревших данных завершена');
      
    } catch (error) {
      console.error('❌ Ошибка при очистке устаревших данных:', error);
    }
  }

  /**
   * Экспорт пользовательских настроек
   */
  static exportUserSettings(): string {
    try {
      const userSettings: Record<string, any> = {};
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('refook_user_') || key.startsWith('refook_settings_')) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              userSettings[key] = JSON.parse(value);
            } catch {
              userSettings[key] = value;
            }
          }
        }
      });
      
      return JSON.stringify(userSettings, null, 2);
      
    } catch (error) {
      console.error('Ошибка при экспорте настроек:', error);
      return '{}';
    }
  }

  /**
   * Импорт пользовательских настроек
   */
  static importUserSettings(settingsJson: string): boolean {
    try {
      const settings = JSON.parse(settingsJson);
      
      Object.entries(settings).forEach(([key, value]) => {
        if (key.startsWith('refook_user_') || key.startsWith('refook_settings_')) {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });
      
      console.log('✅ Настройки успешно импортированы');
      return true;
      
    } catch (error) {
      console.error('❌ Ошибка при импорте настроек:', error);
      return false;
    }
  }

  /**
   * Получение статистики API
   */
  static async getApiStats(): Promise<{
    ingredients: { total: number; byMeasure: Record<string, number> };
    recipes: { total: number; byDifficulty: Record<string, number>; byCuisine: Record<string, number> };
  }> {
    try {
      console.log('📊 Получение статистики API...');
      
      const [ingredientsStats, recipesStats] = await Promise.all([
        ingredientsService.getIngredientsStats(),
        realRecipesService.getRecipesStats()
      ]);
      
      return {
        ingredients: ingredientsStats,
        recipes: recipesStats
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении статистики API:', error);
      return {
        ingredients: { total: 0, byMeasure: {} },
        recipes: { total: 0, byDifficulty: {}, byCuisine: {} }
      };
    }
  }

  /**
   * Валидация целостности данных
   */
  static validateDataIntegrity(): { 
    isValid: boolean; 
    errors: string[]; 
    warnings: string[] 
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Проверяем доступность API
      console.log('🔍 Проверка целостности данных...');
      
      // Проверяем localStorage
      if (!window.localStorage) {
        errors.push('LocalStorage недоступен');
      }
      
      // Проверяем размер хранилища
      const storageInfo = this.getStorageInfo();
      if (storageInfo.total > 5 * 1024 * 1024) { // 5MB
        warnings.push('Размер данных в хранилище превышает 5MB');
      }
      
      // Проверяем формат данных
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('refook_') || key.startsWith('mock_')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              JSON.parse(value);
            }
          } catch (error) {
            errors.push(`Некорректный JSON в ключе: ${key}`);
          }
        }
      });
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
      
    } catch (error) {
      errors.push(`Ошибка валидации: ${error instanceof Error ? error.message : String(error)}`);
      return { isValid: false, errors, warnings };
    }
  }
}

// Добавляем утилиты в глобальную область для отладки
if (typeof window !== 'undefined') {
  (window as any).StorageUtils = StorageUtils;
  (window as any).ingredientsService = ingredientsService;
  (window as any).realRecipesService = realRecipesService;
  
  console.log('🔧 StorageUtils и API сервисы доступны в консоли:');
  console.log('  - StorageUtils.clearAllData()');
  console.log('  - StorageUtils.getStorageInfo()');
  console.log('  - StorageUtils.getApiStats()');
  console.log('  - ingredientsService.getAllIngredients()');
  console.log('  - realRecipesService.getAllRecipes()');
} 