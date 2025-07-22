import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';
import type { FilterType } from './FilterSettings';
import styles from './QuickFilterTabs.module.css';

interface QuickFilterTabsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  stats: {
    total: number;
    available: number;
    partial: number;
    missing: number;
  };
}

const QuickFilterTabs: React.FC<QuickFilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  stats
}) => {
  const tabs = [
    {
      id: 'all' as FilterType,
      label: 'Все',
      icon: <FunnelIcon className={styles.tabIcon} />,
      count: stats.total,
      color: styles.neutral
    },
    {
      id: 'available' as FilterType,
      label: 'Доступные',
      icon: <CheckCircleIcon className={styles.tabIcon} />,
      count: stats.available,
      color: styles.success
    },
    {
      id: 'partial' as FilterType,
      label: 'Частично',
      icon: <ExclamationTriangleIcon className={styles.tabIcon} />,
      count: stats.partial,
      color: styles.warning
    },
    {
      id: 'missing' as FilterType,
      label: 'Недостающие',
      icon: <XCircleIcon className={styles.tabIcon} />,
      count: stats.missing,
      color: styles.danger
    }
  ];

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsList}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${tab.color} ${currentFilter === tab.id ? styles.active : ''}`}
            onClick={() => onFilterChange(tab.id)}
            disabled={tab.count === 0}
          >
            <div className={styles.tabContent}>
              <div className={styles.tabIconContainer}>
                {tab.icon}
              </div>
              <div className={styles.tabInfo}>
                <span className={styles.tabLabel}>{tab.label}</span>
                <span className={styles.tabCount}>{tab.count}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickFilterTabs; 