import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import styles from './LoadMoreButton.module.css';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ 
  onClick, 
  loading = false, 
  disabled = false,
  children = 'Загрузить еще'
}) => {
  return (
    <div className={styles.buttonContainer}>
      <button
        className={`${styles.loadMoreButton} ${loading ? styles.loading : ''}`}
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading && (
          <ArrowPathIcon className={styles.loadingIcon} />
        )}
        <span className={styles.buttonText}>
          {loading ? 'Загрузка...' : children}
        </span>
      </button>
    </div>
  );
};

export default LoadMoreButton; 