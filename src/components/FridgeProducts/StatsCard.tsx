import React from 'react';
import styles from './StatsCard.module.css';

interface Props {
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  value: number | string;
}

export const StatsCard: React.FC<Props> = ({ icon, iconClassName, title, value }) => {
  return (
    <div className={styles.card}>
      <div className={`${styles.icon} ${iconClassName || ''}`.trim()}>{icon}</div>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
};

export default StatsCard;


