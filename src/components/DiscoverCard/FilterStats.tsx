import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';
import styles from './FilterStats.module.css';

interface FilterStatsProps {
  totalRecipes: number;
  availableRecipes: number;
  partialRecipes: number;
  missingRecipes: number;
  currentFilter: string;
}

const FilterStats: React.FC<FilterStatsProps> = ({
  totalRecipes,
  availableRecipes,
  partialRecipes,
  missingRecipes,
  currentFilter
}) => {
  const stats = [
    {
      label: 'Всего',
      count: totalRecipes,
      icon: <FunnelIcon className={styles.icon} />,
      color: styles.neutral,
      filter: 'all'
    },
    {
      label: 'Доступные',
      count: availableRecipes,
      icon: <CheckCircleIcon className={styles.icon} />,
      color: styles.success,
      filter: 'available'
    },
    {
      label: 'Частично',
      count: partialRecipes,
      icon: <ExclamationTriangleIcon className={styles.icon} />,
      color: styles.warning,
      filter: 'partial'
    },
    {
      label: 'Недостающие',
      count: missingRecipes,
      icon: <XCircleIcon className={styles.icon} />,
      color: styles.danger,
      filter: 'missing'
    }
  ];

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsHeader}>
        <h4>Статистика рецептов</h4>
      </div>
      
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div 
            key={stat.filter}
            className={`${styles.statItem} ${stat.color} ${currentFilter === stat.filter ? styles.active : ''}`}
          >
            <div className={styles.statIcon}>
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statCount}>{stat.count}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterStats; 