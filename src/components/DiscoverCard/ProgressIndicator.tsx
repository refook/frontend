import React from 'react';
import styles from './ProgressIndicator.module.css';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  current, 
  total, 
  className = '' 
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={`${styles.progressContainer} ${className}`}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={styles.progressText}>
        {current} из {total}
      </div>
    </div>
  );
};

export default ProgressIndicator; 