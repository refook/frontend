import React from 'react';
import styles from './StatsCard.module.css';

/**
 * StatsCard
 *
 * Презентационная карточка метрики для панели статистики.
 * Содержит иконку, заголовок (title) и значение (value).
 * Опционально поддерживает onClick (делает карточку интерактивной) и
 * состояние active (визуальная подсветка выбранной метрики).
 *
 * Доступность: при наличии onClick карточка получает role=button, tabIndex
 * и обрабатывает клавиши Enter/Space для активации.
 */
interface Props {
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  value: number | string;
  onClick?: () => void;
  active?: boolean;
}

export const StatsCard: React.FC<Props> = ({ icon, iconClassName, title, value, onClick, active }) => {
  return (
    <div className={`${styles.card} ${onClick ? styles.clickable : ''} ${active ? styles.active : ''}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} aria-label={onClick ? `Sort by ${title}` : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}>
      <div className={`${styles.icon} ${iconClassName || ''}`.trim()}>{icon}</div>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
};

export default StatsCard;


