import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, FunnelIcon } from '@heroicons/react/24/outline';
import type { FilterType } from './FilterSettings';
import styles from './FilterInfo.module.css';

interface FilterInfoProps {
  filter: FilterType;
  recipeCount: number;
}

const FilterInfo: React.FC<FilterInfoProps> = ({ filter, recipeCount }) => {
  const getFilterIcon = () => {
    switch (filter) {
      case 'all':
        return <FunnelIcon className={styles.icon} />;
      case 'available':
        return <CheckCircleIcon className={styles.icon} />;
      case 'partial':
      case 'missing':
        return <ExclamationTriangleIcon className={styles.icon} />;
      default:
        return <FunnelIcon className={styles.icon} />;
    }
  };

  const getFilterLabel = () => {
    switch (filter) {
      case 'all':
        return 'Все рецепты';
      case 'available':
        return 'Доступные';
      case 'partial':
        return 'Частично';
      case 'missing':
        return 'Недостающие';
      default:
        return 'Все рецепты';
    }
  };

  const getFilterColor = () => {
    switch (filter) {
      case 'all':
        return styles.neutral;
      case 'available':
        return styles.success;
      case 'partial':
        return styles.warning;
      case 'missing':
        return styles.danger;
      default:
        return styles.neutral;
    }
  };

  return (
    <div className={`${styles.filterInfo} ${getFilterColor()}`}>
      <div className={styles.filterIconContainer}>
        {getFilterIcon()}
      </div>
      <div className={styles.filterText}>
        <span className={styles.filterLabel}>{getFilterLabel()}</span>
        <span className={styles.recipeCount}>{recipeCount} рецептов</span>
      </div>
    </div>
  );
};

export default FilterInfo; 