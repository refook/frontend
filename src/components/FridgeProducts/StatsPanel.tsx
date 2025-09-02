import React from 'react';
import type { FridgeProduct } from '../../types/fridge.types';
import styles from './StatsPanel.module.css';
import { StatsCard } from './StatsCard';

interface Props {
  items: FridgeProduct[];
}

export const StatsPanel: React.FC<Props> = ({ items }) => {
  const now = new Date();
  const toYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const isToday = (d?: Date) => !!d && toYmd(d) === toYmd(now);
  const isExpired = (d?: Date) => !!d && d.getTime() < now.getTime();
  const isSoon = (d?: Date) => !!d && !isExpired(d) && d.getTime() <= now.getTime() + 3 * 24 * 60 * 60 * 1000;

  const total = items.length;
  const fresh = items.filter(it => it.expiryDate && !isSoon(it.expiryDate) && !isExpired(it.expiryDate)).length;
  const expiringSoon = items.filter(it => isSoon(it.expiryDate) || isToday(it.expiryDate)).length;
  const needAttention = items.filter(it => isExpired(it.expiryDate) || isToday(it.expiryDate)).length;

  return (
    <div className={styles.stats}>
      <StatsCard
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4a2 2 0 001-1.73zM5 9.3l7-4 7 4V9l-7 4-7-4v.3z"/>
          </svg>
        }
        iconClassName={styles.iconTotal}
        title="Total"
        value={total}
      />
      <StatsCard
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        }
        iconClassName={styles.iconAttn}
        title="Need Attention"
        value={needAttention}
      />
      <StatsCard
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 1a11 11 0 1011 11A11.013 11.013 0 0012 1zm1 11h5v2h-7V6h2z"/>
          </svg>
        }
        iconClassName={styles.iconFresh}
        title="Fresh"
        value={fresh}
      />
      <StatsCard
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14zm0-12H5V6h14z"/>
          </svg>
        }
        iconClassName={styles.iconSoon}
        title="Expiring Soon"
        value={expiringSoon}
      />
    </div>
  );
};

export default StatsPanel;


