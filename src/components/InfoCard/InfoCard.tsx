import React from 'react';
import styles from './InfoCard.module.css';

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value }) => {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap}><span className={styles.icon}>{icon}</span></div>
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
};

export default InfoCard;


