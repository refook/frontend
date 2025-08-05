/**
 * Утилита для логирования JSON данных, отправляемых на API
 */

interface ApiLogData {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: string;
}

class ApiLogger {
  private logs: ApiLogData[] = [];

  /**
   * Логирует данные запроса к API
   */
  logRequest(url: string, method: string, headers: Record<string, string>, body?: any) {
    const logData: ApiLogData = {
      url,
      method,
      headers,
      body,
      timestamp: new Date().toISOString()
    };

    this.logs.push(logData);
    
    console.group(`🌐 API Request: ${method} ${url}`);
    console.log('Headers:', headers);
    if (body) {
      console.log('Body:', JSON.stringify(body, null, 2));
    }
    console.groupEnd();

    // Сохраняем в localStorage для отладки
    this.saveToStorage();
  }

  /**
   * Получить все логи
   */
  getLogs(): ApiLogData[] {
    return [...this.logs];
  }

  /**
   * Получить логи для конкретного URL
   */
  getLogsForUrl(url: string): ApiLogData[] {
    return this.logs.filter(log => log.url.includes(url));
  }

  /**
   * Получить последний запрос к API
   */
  getLastRequest(): ApiLogData | null {
    return this.logs.length > 0 ? this.logs[this.logs.length - 1] : null;
  }

  /**
   * Очистить логи
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('api_logs');
  }

  /**
   * Сохранить логи в localStorage
   */
  private saveToStorage() {
    try {
      localStorage.setItem('api_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Не удалось сохранить логи в localStorage:', error);
    }
  }

  /**
   * Загрузить логи из localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('api_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Не удалось загрузить логи из localStorage:', error);
    }
  }

  /**
   * Экспортировать логи в JSON файл
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Получить статистику запросов
   */
  getStats() {
    const stats = {
      total: this.logs.length,
      byMethod: {} as Record<string, number>,
      byUrl: {} as Record<string, number>
    };

    this.logs.forEach(log => {
      stats.byMethod[log.method] = (stats.byMethod[log.method] || 0) + 1;
      stats.byUrl[log.url] = (stats.byUrl[log.url] || 0) + 1;
    });

    return stats;
  }
}

// Создаем глобальный экземпляр
export const apiLogger = new ApiLogger();

// Загружаем сохраненные логи при инициализации
apiLogger.loadFromStorage();

// Добавляем в глобальный объект для отладки
if (typeof window !== 'undefined') {
  (window as any).apiLogger = apiLogger;
} 