import React, { useState } from 'react';
import styles from './Tabs.module.css';

export type TabId = string;

export interface TabsProps {
  initial?: TabId;
  onChange?: (tab: TabId) => void;
  tabs: Array<{ id: TabId; label: string; Icon?: React.ComponentType<any> }>;
  ariaLabel?: string;
}

const Tabs: React.FC<TabsProps> = ({ initial, onChange, tabs, ariaLabel = 'Tabs' }) => {
  const [active, setActive] = useState<TabId>(initial ?? (tabs[0]?.id ?? ''));

  const handleSelect = (id: TabId) => {
    setActive(id);
    onChange?.(id);
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
    </div>
  );
};

export default Tabs;


