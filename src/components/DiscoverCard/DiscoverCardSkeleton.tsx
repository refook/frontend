import React from 'react';
import styles from './DiscoverCardSkeleton.module.css';

const DiscoverCardSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonDescription} />
        <div className={styles.skeletonStats}>
          <div className={styles.skeletonStat} />
          <div className={styles.skeletonStat} />
          <div className={styles.skeletonStat} />
        </div>
        <div className={styles.skeletonAvailability} />
      </div>
      <div className={styles.skeletonActions}>
        <div className={styles.skeletonActionButton} />
        <div className={styles.skeletonActionButton} />
        <div className={styles.skeletonActionButton} />
      </div>
    </div>
  );
};

export default DiscoverCardSkeleton; 