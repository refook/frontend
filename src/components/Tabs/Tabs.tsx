import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from './Tabs.module.css';

/**
 * Универсальный компонент вкладок с поддержкой вложенных саб‑вкладок и стандартной панели контента.
 *
 * @component
 * @description
 * Компонент предоставляет гибкую систему навигации с вкладками верхнего уровня и опциональными
 * подвкладками. Поддерживает сохранение состояния в localStorage для восстановления выбранной
 * вкладки при перезагрузке страницы.
 *
 * @features
 * - Верхние вкладки (tabs) с иконками и подписями
 * - Саб‑вкладки (subtabs) для активной вкладки
 * - Рендер стандартной «панели» с заголовком и содержимым (скругление, фон, тень из токенов)
 * - Опциональная поддержка колбэка onChange для синхронизации активной вкладки с внешним состоянием
 * - Автоматическое сохранение состояния в localStorage при указании storageKey
 * - Восстановление активной вкладки из localStorage при монтировании компонента
 * - Доступность (ARIA): role="tablist" и role="tab", aria-selected
 *
 * @structure
 * Структура данных задаётся через массив конфигов `tabs`, где каждый элемент может
 * иметь либо собственный контент (`title`/`content`/`render`), либо список `subtabs`.
 * Если присутствуют `subtabs`, отображается дополнительная панель навигации саб‑вкладок,
 * а контент берётся из активной саб‑вкладки.
 *
 * @storageBehavior
 * При указании `storageKey`:
 * - Активная вкладка сохраняется в localStorage по ключу `${storageKey}_active`
 * - Активная подвкладка сохраняется по ключу `${storageKey}_subtab_${tabId}`
 * - При монтировании компонента состояние восстанавливается из localStorage
 * - Если сохранённое значение невалидно (вкладка не существует), используется `initial` или первая вкладка
 *
 * @example
 * Пример (простые вкладки):
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: 'one', label: 'One', title: 'Раздел 1', content: <SectionOne/> },
 *     { id: 'two', label: 'Two', title: 'Раздел 2', render: () => <SectionTwo/> },
 *   ]}
 * />
 * ```
 *
 * @example
 * Пример (с саб‑вкладками):
 * ```tsx
 * <Tabs
 *   tabs={[
 *     {
 *       id: 'products',
 *       label: 'Продукты',
 *       subtabs: [
 *         { id: 'products:create', label: 'Создание', title: 'Создать', content: <CreateForm/> },
 *         { id: 'products:manage', label: 'Управление', title: 'Управление', render: () => <ManageList/> },
 *       ],
 *     },
 *     { id: 'settings', label: 'Настройки', title: 'Настройки', content: <Settings/> },
 *   ]}
 * />
 * ```
 *
 * @example
 * Пример (с сохранением состояния):
 * ```tsx
 * <Tabs
 *   initial="products"
 *   onChange={(tabId) => console.log('Активная вкладка:', tabId)}
 *   tabs={[...]}
 *   storageKey="my_app_tabs"
 * />
 * ```
 */

export type TabId = string;

/**
 * Конфигурация верхней вкладки.
 *
 * @interface TabConfig
 * @property {TabId} id - Уникальный идентификатор вкладки. Используется для определения активной вкладки и сохранения состояния.
 * @property {string} label - Текстовая метка вкладки, отображаемая в интерфейсе.
 * @property {React.ComponentType<any>} [Icon] - Опциональный компонент иконки из Heroicons или другой библиотеки.
 * @property {string} [title] - Заголовок панели контента. Отображается над содержимым вкладки.
 * @property {React.ReactNode} [content] - Готовый контент для отображения. Альтернатива `render`.
 * @property {() => React.ReactNode} [render] - Функция для динамического рендеринга контента. Альтернатива `content`.
 * @property {Array<SubTabConfig>} [subtabs] - Опциональный массив подвкладок. Если определен, компонент отрисует
 *   дополнительную панель саб‑вкладок и будет показывать контент активной саб‑вкладки. Иначе — отрисует контент самой вкладки.
 *
 * @note
 * Для каждой вкладки должен быть указан либо `content`, либо `render`. Если указаны оба, приоритет у `content`.
 * Если вкладка имеет `subtabs`, её собственный контент (`content`/`render`) игнорируется.
 */
export interface TabConfig {
  id: TabId;
  label: string;
  Icon?: React.ComponentType<any>;
  title?: string;
  content?: React.ReactNode;
  render?: () => React.ReactNode;
  subtabs?: Array<{
    id: TabId;
    label: string;
    Icon?: React.ComponentType<any>;
    title?: string;
    content?: React.ReactNode;
    render?: () => React.ReactNode;
  }>;
}

/**
 * Свойства компонента Tabs.
 *
 * @interface TabsProps
 * @property {TabId} [initial] - ID активной вкладки по умолчанию. Используется только если `storageKey` не указан
 *   или если в localStorage нет сохранённого значения. По умолчанию выбирается первая вкладка из массива `tabs`.
 * @property {(tab: TabId) => void} [onChange] - Колбэк, вызываемый при смене активной вкладки (верхнего уровня).
 *   Также вызывается при первом рендере, если используется `storageKey`, для синхронизации внешнего состояния.
 *   Параметр `tab` содержит ID выбранной вкладки.
 * @property {Array<TabConfig>} tabs - Массив конфигураций вкладок. Должен содержать хотя бы один элемент.
 * @property {string} [ariaLabel] - Подпись для контейнера вкладок (ARIA атрибут). Используется для доступности.
 *   По умолчанию: `'Tabs'`.
 * @property {string} [storageKey] - Опциональный ключ для сохранения состояния в localStorage.
 *   Если указан:
 *   - Активная вкладка сохраняется как `${storageKey}_active`
 *   - Активная подвкладка сохраняется как `${storageKey}_subtab_${tabId}`
 *   - При монтировании компонента состояние восстанавливается из localStorage
 *   - Состояние автоматически сохраняется при каждом изменении
 *
 * @example
 * ```tsx
 * <Tabs
 *   initial="products"
 *   onChange={(tabId) => setActiveTab(tabId)}
 *   tabs={tabs}
 *   ariaLabel="Навигация по разделам"
 *   storageKey="admin_panel"
 * />
 * ```
 */
export interface TabsProps {
  initial?: TabId;
  onChange?: (tab: TabId) => void;
  tabs: Array<TabConfig>;
  ariaLabel?: string;
  storageKey?: string;
}

/**
 * Компонент вкладок с поддержкой саб‑вкладок и стандартной панели контента.
 *
 * @component
 * @param {TabsProps} props - Свойства компонента
 * @returns {JSX.Element} Разметка компонента с навигацией по вкладкам и контентом
 *
 * @remarks
 * - Компонент автоматически синхронизирует активную вкладку с localStorage при указании `storageKey`
 * - При изменении пропса `initial` компонент синхронизирует внутреннее состояние (если `storageKey` не указан)
 * - При первом рендере с `storageKey` вызывается `onChange` для синхронизации внешнего состояния
 * - Ошибки при работе с localStorage обрабатываются без прерывания работы компонента
 */
const Tabs: React.FC<TabsProps> = ({ initial, onChange, tabs, ariaLabel = 'Tabs', storageKey }) => {
  // Используем ref для отслеживания инициализации и предотвращения циклов
  const isInitializing = useRef(true);

  // Загружаем сохраненную активную вкладку из localStorage если есть storageKey
  // Используем useMemo только для начального значения, без tabs в зависимостях
  const initialActive = useMemo(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`${storageKey}_active`);
        if (saved) {
          // Проверяем валидность сохраненного значения позже в useEffect
          return saved;
        }
      } catch {
        // Игнорируем ошибки при чтении localStorage
      }
    }
    return initial ?? (tabs[0]?.id ?? '');
  }, [storageKey, initial]); // Убрали tabs из зависимостей

  const [active, setActive] = useState<TabId>(initialActive);
  const activeTab = tabs.find(t => t.id === active);
  const hasSubtabs = Boolean(activeTab?.subtabs && activeTab.subtabs.length > 0);

  // Инициализация: проверяем валидность сохраненного значения и синхронизируем состояние
  useEffect(() => {
    if (isInitializing.current) {
      isInitializing.current = false;
      
      if (storageKey) {
        // Проверяем валидность сохраненного значения из localStorage
        try {
          const saved = localStorage.getItem(`${storageKey}_active`);
          if (saved && tabs.some(t => t.id === saved)) {
            // Сохраненное значение валидно, используем его
            setActive(saved);
            onChange?.(saved);
            return;
          }
        } catch {
          // Игнорируем ошибки
        }
      }
      
      // Если storageKey не указан или сохраненное значение невалидно, используем initial или первую вкладку
      const fallback = initial ?? (tabs[0]?.id ?? '');
      if (fallback && fallback !== active && tabs.some(t => t.id === fallback)) {
        setActive(fallback);
        onChange?.(fallback);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Выполняем только один раз при монтировании

  // Синхронизируем активную вкладку с изменением initial (только если storageKey не используется)
  useEffect(() => {
    if (!storageKey && initial && initial !== active && tabs.some(t => t.id === initial)) {
      setActive(initial);
      onChange?.(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]); // Только для initial, не для storageKey

  // Инициализируем состояние подвкладки
  const getInitialSubtab = (tabId: TabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (storageKey && tab?.subtabs) {
      try {
        const saved = localStorage.getItem(`${storageKey}_subtab_${tabId}`);
        if (saved && tab.subtabs.some(s => s.id === saved)) {
          return saved;
        }
      } catch {
        // Игнорируем ошибки при чтении localStorage
      }
    }
    return tab?.subtabs?.[0]?.id ?? '';
  };

  const [activeSub, setActiveSub] = useState<TabId>(() => getInitialSubtab(initialActive));
  
  // Используем ref для отслеживания предыдущей активной вкладки
  const prevActiveRef = useRef<TabId>(initialActive);

  // Инициализация подвкладки при первом рендере
  useEffect(() => {
    if (isInitializing.current) {
      const initialSub = getInitialSubtab(active);
      setActiveSub(initialSub);
      prevActiveRef.current = active;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Выполняем только один раз при монтировании

  // Синхронизируем активную подвкладку при изменении активной вкладки
  useEffect(() => {
    // Обновляем только если активная вкладка действительно изменилась
    if (prevActiveRef.current === active || isInitializing.current) {
      return;
    }
    
    prevActiveRef.current = active;
    const currentTab = tabs.find(t => t.id === active);
    const currentHasSubtabs = Boolean(currentTab?.subtabs && currentTab.subtabs.length > 0);
    
    if (currentHasSubtabs && currentTab?.subtabs) {
      // Пытаемся загрузить сохраненную подвкладку для текущей вкладки
      const savedSub = storageKey ? (() => {
        try {
          const saved = localStorage.getItem(`${storageKey}_subtab_${active}`);
          if (saved && currentTab.subtabs.some(s => s.id === saved)) {
            return saved;
          }
        } catch {
          // Игнорируем ошибки
        }
        return null;
      })() : null;
      
      // Устанавливаем сохраненную подвкладку или первую доступную
      const newSub = savedSub ?? currentTab.subtabs[0]?.id ?? '';
      setActiveSub(newSub);
    } else {
      // Если нет подвкладок, сбрасываем состояние
      setActiveSub('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, storageKey]); // Убрали tabs из зависимостей, чтобы избежать циклов

  // Сохраняем активную вкладку при изменении (только если не идет инициализация)
  useEffect(() => {
    if (storageKey && !isInitializing.current) {
      try {
        localStorage.setItem(`${storageKey}_active`, active);
      } catch (err) {
        console.error('Не удалось сохранить активную вкладку:', err);
      }
    }
  }, [active, storageKey]);

  // Сохраняем активную подвкладку при изменении (только если не идет инициализация)
  useEffect(() => {
    if (storageKey && activeSub && hasSubtabs && !isInitializing.current) {
      try {
        localStorage.setItem(`${storageKey}_subtab_${active}`, activeSub);
      } catch (err) {
        console.error('Не удалось сохранить активную подвкладку:', err);
      }
    }
  }, [activeSub, active, storageKey, hasSubtabs]);

  const handleSelect = (id: TabId) => {
    setActive(id);
    onChange?.(id);
    const nextActive = tabs.find(t => t.id === id);
    if (nextActive?.subtabs?.length) {
      // Пытаемся загрузить сохраненную подвкладку для новой вкладки
      const savedSub = storageKey ? (() => {
        try {
          const saved = localStorage.getItem(`${storageKey}_subtab_${id}`);
          if (saved && nextActive.subtabs.some(s => s.id === saved)) {
            return saved;
          }
        } catch {
          // Игнорируем ошибки
        }
        return null;
      })() : null;
      setActiveSub(savedSub ?? nextActive.subtabs[0].id);
    }
  };

  const handleSubSelect = (id: TabId) => {
    setActiveSub(id);
  };

  const renderPanel = (title?: string, node?: React.ReactNode, renderCb?: () => React.ReactNode) => {
    const content = node ?? renderCb?.();
    if (content == null) return null;
    return (
      <div className={styles.panel}>
        {title ? <div className={styles.panelTitle}>{title}</div> : null}
        {content}
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar} role="tablist" aria-label={ariaLabel}>
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={active === id}
            className={`${styles.tab} ${active === id ? styles.tabActive : ''}`}
            onClick={() => handleSelect(id)}
          >
            {Icon ? <Icon className={styles.icon} /> : null}
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </div>

      {hasSubtabs && (
        <div className={styles.subbar} role="tablist" aria-label={`${activeTab?.label} subtabs`}>
          {activeTab!.subtabs!.map(({ id, label, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeSub === id}
              className={`${styles.tab} ${activeSub === id ? styles.tabActive : ''}`}
              onClick={() => handleSubSelect(id)}
            >
              {Icon ? <Icon className={styles.icon} /> : null}
              <span className={styles.label}>{label}</span>
            </button>
          ))}
        </div>
      )}

      {hasSubtabs
        ? (() => {
            const sub = activeTab!.subtabs!.find(s => s.id === activeSub);
            return renderPanel(sub?.title, sub?.content, sub?.render);
          })()
        : renderPanel(activeTab?.title, activeTab?.content, activeTab?.render)}
    </div>
  );
};

export default Tabs;


