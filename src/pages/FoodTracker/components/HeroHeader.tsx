import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import styles from '../../FoodTrackerPage.module.css';

interface HeroHeaderProps {
  title: string;
  isToday: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOpenGoal: () => void;
}

const HeroHeader: React.FC<HeroHeaderProps> = ({ title, isToday, onPrev, onNext, onOpenGoal }) => (
  <>
    <div className={styles.heroLeft}>
      <span className={styles.heroLabel}>Трекер питания</span>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {isToday && <span className={styles.todayHint}>Сегодня</span>}
      </div>
      <div className={styles.heroActions}>
        <button className={styles.heroPill} onClick={onPrev} type="button" aria-label="Предыдущий день">
          <ChevronLeftIcon width={16} />
        </button>
        <button className={styles.heroPill} onClick={onNext} type="button">
          Завтра
          <ChevronRightIcon width={16} />
        </button>
      </div>
    </div>
    <button
      className={styles.heroGoalButton}
      onClick={onOpenGoal}
      aria-label="Настроить цель"
      type="button"
    >
      <Cog6ToothIcon width={18} />
    </button>
  </>
);

export default HeroHeader;
