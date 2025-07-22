import React, { useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import styles from './RecipeSelectedNotification.module.css';

interface RecipeSelectedNotificationProps {
  recipeTitle: string;
  visible: boolean;
  onClose: () => void;
}

const RecipeSelectedNotification: React.FC<RecipeSelectedNotificationProps> = ({
  recipeTitle,
  visible,
  onClose
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={styles.notification}>
      <div className={styles.notificationContent}>
        <CheckCircleIcon className={styles.checkIcon} />
        <div className={styles.notificationText}>
          <span className={styles.notificationTitle}>Рецепт выбран!</span>
          <span className={styles.recipeTitle}>{recipeTitle}</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeSelectedNotification; 