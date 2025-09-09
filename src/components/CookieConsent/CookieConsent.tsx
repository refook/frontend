/**
 * CookieConsent — компонент модального согласия на использование файлов куки.
 *
 * Отображается пользователю до тех пор, пока не будет зафиксировано согласие/отказ
 * в localStorage. Хранение осуществляется под ключом `cookieConsent` с версией `v1`.
 * При изменении текста/политики необходимо обновлять версию, чтобы повторно
 * запросить согласие у всех пользователей.
 *
 * Особенности:
 * - Хранение состояния в `localStorage` (ключ: `cookieConsent`).
 * - Версионирование согласия через константу `STORAGE_VERSION`.
 * - Режим отладки для принудительного показа:
 *   - Query-параметр: `?alwaysAskCookies=1`
 *   - LocalStorage-флаг: `DEBUG_COOKIE_ALWAYS = '1'`
 * - Доступность: роль `dialog`, лайв-объявления `aria-live="polite"`.
 * - Стили: CSS-модуль `CookieConsent.module.css` на базе дизайн-токенов из `src/styles`.
 *
 * Пример использования:
 *
 * ```tsx
 * import CookieConsent from './components/CookieConsent';
 *
 * export function App() {
 *   return (
 *     <>
 *       <CookieConsent />
 *     </>
 *   );
 * }
 * ```
 *
 * @component
 * @since 1.0.0
 * @see /src/components/CookieConsent/CookieConsent.module.css
 */
import { useEffect, useState } from 'react';
import styles from './CookieConsent.module.css';

const STORAGE_KEY = 'cookieConsent';
const STORAGE_VERSION = 'v1';

/**
 * Значение, сохраняемое в localStorage для фиксации решения пользователя.
 * @property accepted Флаг согласия (true — согласен, false — отказ)
 * @property version Версия согласия (используется для инвалидации старых решений)
 * @property timestamp Метка времени (мс) момента принятия решения
 */
type ConsentValue = {
  accepted: boolean;
  version: string;
  timestamp: number;
};

/**
 * Считать сохранённое согласие из localStorage.
 * Безопасно парсит JSON и возвращает null при ошибке/отсутствии значения.
 */
function readConsent(): ConsentValue | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentValue;
  } catch {
    return null;
  }
}

/**
 * Записать решение о согласии/отказе в localStorage с актуальной версией.
 * @param accepted Решение пользователя (true — согласен, false — отказ)
 */
function writeConsent(accepted: boolean) {
  const value: ConsentValue = {
    accepted,
    version: STORAGE_VERSION,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

/**
 * Компонент модального окна с запросом согласия на использование куки.
 * По умолчанию отображается, если ранее не было сохранено согласие
 * или версия согласия изменилась. В режиме отладки всегда показывается,
 * если включён query-флаг `alwaysAskCookies=1` либо localStorage-флаг `DEBUG_COOKIE_ALWAYS`.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const debugAlways = (search?.get('alwaysAskCookies') === '1') || (typeof window !== 'undefined' && localStorage.getItem('DEBUG_COOKIE_ALWAYS') === '1');

    if (debugAlways) {
      setVisible(true);
      return;
    }

    const consent = readConsent();
    if (!consent || consent.version !== STORAGE_VERSION) setVisible(true);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    writeConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    writeConsent(false);
    setVisible(false);
  };

  return (
    <div className={styles.backdrop} role="presentation" aria-hidden>
      <div className={styles.container} role="dialog" aria-live="polite" aria-label="Cookie consent">
        <h2 className={styles.title}>Мы используем файлы куки</h2>
        <p className={styles.desc}>
          Мы применяем куки для обеспечения работы сайта, аналитики и улучшения пользовательского опыта. Подробнее см. нашу
          {' '}<a className={styles.link} href="/privacy" target="_blank" rel="noopener noreferrer">Политику конфиденциальности</a>.
        </p>
        <div className={styles.actions}>
          <button className="ui-btn ui-btn--primary" onClick={handleAcceptAll}>
            Принять все
          </button>
          <button className="ui-btn ui-btn--ghost" onClick={handleDecline}>
            Отклонить
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;


