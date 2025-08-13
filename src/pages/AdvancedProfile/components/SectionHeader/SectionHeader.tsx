import React from 'react';
import styles from './SectionHeader.module.css';

export type StatTone = 'accent' | 'success' | 'warning' | 'danger' | 'muted';

export interface SectionStat {
  label: string;
  value: number | string;
  tone?: StatTone;
}

export interface SectionHeaderProps {
  title: string;
  description?: string;
  stats?: SectionStat[];
  actionLabel?: string;
  onActionClick?: () => void;
  actionVariant?: 'primary' | 'ghost';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  stats = [],
  actionLabel,
  onActionClick,
  actionVariant = 'primary'
}) => {
  const hasRight = (stats && stats.length > 0) || actionLabel;

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {hasRight && (
        <div className={styles.right}>
          {stats && stats.length > 0 && (
            <div className={styles.stats} aria-label="Section statistics">
              {stats.map((s, idx) => (
                <div key={idx} className={`${styles.stat} ${s.tone ? styles[`stat_${s.tone}`] : ''}`}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
          {actionLabel && (
            <button
              className={`ui-btn ${actionVariant === 'primary' ? 'ui-btn--primary' : 'ui-btn--ghost'}`}
              onClick={onActionClick}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;


