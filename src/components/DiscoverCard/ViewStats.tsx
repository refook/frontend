import React from 'react';
import { EyeIcon, ClockIcon, HeartIcon } from '@heroicons/react/24/outline';
import styles from './ViewStats.module.css';

interface ViewStatsProps {
  totalRecipes: number;
  viewedRecipes: number;
  averageTime: number;
  favoriteCount: number;
}

const ViewStats: React.FC<ViewStatsProps> = ({
  totalRecipes,
  viewedRecipes,
  averageTime,
  favoriteCount
}) => {
  const viewPercentage = totalRecipes > 0 ? (viewedRecipes / totalRecipes) * 100 : 0;

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsHeader}>
        <h3>Статистика просмотра</h3>
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <EyeIcon className={styles.icon} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{viewedRecipes}</span>
            <span className={styles.statLabel}>Просмотрено</span>
          </div>
          <div className={styles.statProgress}>
            <div 
              className={styles.progressBar}
              style={{ width: `${viewPercentage}%` }}
            />
          </div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <ClockIcon className={styles.icon} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{averageTime}м</span>
            <span className={styles.statLabel}>Среднее время</span>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <HeartIcon className={styles.icon} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{favoriteCount}</span>
            <span className={styles.statLabel}>В избранном</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStats; 