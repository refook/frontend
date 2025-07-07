import React from 'react';
import styles from './RecipeCardSkeleton.module.css';

const RecipeCardSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonDescription}>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLineShort}></div>
        </div>
        <div className={styles.skeletonMeta}>
          <div className={styles.skeletonMetaItem}></div>
          <div className={styles.skeletonMetaItem}></div>
          <div className={styles.skeletonMetaItem}></div>
        </div>
        <div className={styles.skeletonAuthor}>
          <div className={styles.skeletonAvatar}></div>
          <div className={styles.skeletonAuthorName}></div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCardSkeleton; 