import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import styles from './SwipeIndicator.module.css';

interface SwipeIndicatorProps {
  direction: 'up' | 'down';
  visible: boolean;
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ direction, visible }) => {
  if (!visible) return null;

  return (
    <div className={`${styles.swipeIndicator} ${styles[direction]}`}>
      <div className={styles.swipeIcon}>
        {direction === 'up' ? (
          <ChevronUpIcon className={styles.icon} />
        ) : (
          <ChevronDownIcon className={styles.icon} />
        )}
      </div>
      <span className={styles.swipeText}>
        {direction === 'up' ? 'Следующий рецепт' : 'Предыдущий рецепт'}
      </span>
    </div>
  );
};

export default SwipeIndicator; 