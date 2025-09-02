import React, { useState } from 'react';
import styles from './Tabs.module.css';

/**
 * Универсальный компонент вкладок с поддержкой вложенных саб‑вкладок и стандартной панели контента.
 *
 * Возможности:
 * - Верхние вкладки (tabs) с иконками и подписями
 * - Саб‑вкладки (subtabs) для активной вкладки
 * - Рендер стандартной «панели» с заголовком и содержимым (скругление, фон, тень из токенов)
 * - Опциональная поддержка колбэка onChange для синхронизации активной вкладки с внешним состоянием
 * - Доступность (ARIA): role="tablist" и role="tab", aria-selected
 *
 * Структура данных задаётся через массив конфигов `tabs`, где каждый элемент может
 * иметь либо собственный контент (`title`/`content`/`render`), либо список `subtabs`.
 * Если присутствуют `subtabs`, отображается дополнительная панель навигации саб‑вкладок,
 * а контент берётся из активной саб‑вкладки.
 *
 * Пример (простые вкладки):
 * ```tsx
 * <Tabs
 *   tabs=[
 *     { id: 'one', label: 'One', title: 'Раздел 1', content: <SectionOne/> },
 *     { id: 'two', label: 'Two', title: 'Раздел 2', render: () => <SectionTwo/> },
 *   ]
 * />
 * ```
 *
 * Пример (с саб‑вкладками):
 * ```tsx
 * <Tabs
 *   tabs=[
 *     {
 *       id: 'products',
 *       label: 'Продукты',
 *       subtabs: [
 *         { id: 'products:create', label: 'Создание', title: 'Создать', content: <CreateForm/> },
 *         { id: 'products:manage', label: 'Управление', title: 'Управление', render: () => <ManageList/> },
 *       ],
 *     },
 *     { id: 'settings', label: 'Настройки', title: 'Настройки', content: <Settings/> },
 *   ]
 * />
 * ```
 */

export type TabId = string;

/**
 * Конфигурация верхней вкладки.
 * Если определены `subtabs`, компонент отрисует дополнительную панель саб‑вкладок
 * и будет показывать контент активной саб‑вкладки. Иначе — отрисует контент самой вкладки.
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
 * - initial: ID активной вкладки по умолчанию
 * - onChange: колбэк при смене активной вкладки (верхнего уровня)
 * - tabs: массив конфигураций вкладок
 * - ariaLabel: подпись для контейнера вкладок (доступность)
 */
export interface TabsProps {
  initial?: TabId;
  onChange?: (tab: TabId) => void;
  tabs: Array<TabConfig>;
  ariaLabel?: string;
}

/**
 * Компонент вкладок с поддержкой саб‑вкладок и стандартной панели контента.
 */
const Tabs: React.FC<TabsProps> = ({ initial, onChange, tabs, ariaLabel = 'Tabs' }) => {
  const [active, setActive] = useState<TabId>(initial ?? (tabs[0]?.id ?? ''));
  const activeTab = tabs.find(t => t.id === active);
  const hasSubtabs = Boolean(activeTab?.subtabs && activeTab.subtabs.length > 0);
  const [activeSub, setActiveSub] = useState<TabId>(activeTab?.subtabs?.[0]?.id ?? '');

  const handleSelect = (id: TabId) => {
    setActive(id);
    onChange?.(id);
    const nextActive = tabs.find(t => t.id === id);
    if (nextActive?.subtabs?.length) {
      setActiveSub(nextActive.subtabs[0].id);
    }
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
              onClick={() => setActiveSub(id)}
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


