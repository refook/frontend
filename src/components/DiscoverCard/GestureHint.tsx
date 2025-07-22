import React, { useState, useEffect } from 'react';
import { HandRaisedIcon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './GestureHint.module.css';

const GestureHint: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.hintContainer}>
      <div className={styles.hintContent}>
        <HandRaisedIcon className={styles.handIcon} />
        <div className={styles.hintText}>
          <span className={styles.hintTitle}>Жесты</span>
          <span className={styles.hintDescription}>
            Свайп вверх/вниз для навигации
          </span>
        </div>
        <button 
          className={styles.closeButton}
          onClick={() => setVisible(false)}
        >
          <XMarkIcon className={styles.closeIcon} />
        </button>
      </div>
    </div>
  );
};

export default GestureHint; 