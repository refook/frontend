import React from 'react';
import styles from './AdminCard.module.css';

interface AdminCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const AdminCard: React.FC<AdminCardProps> = ({ title, description, children }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{title}</div>
      {description && <div className={styles.cardDescription}>{description}</div>}
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
};

export default AdminCard;


