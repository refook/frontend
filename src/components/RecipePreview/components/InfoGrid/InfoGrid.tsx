import React from 'react';
import { ClockIcon, StarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import InfoCard from '../../../InfoCard/InfoCard';
import type { RecipePreviewInfoGridProps } from '../../RecipePreview.types';
import styles from './InfoGrid.module.css';

const InfoGrid: React.FC<RecipePreviewInfoGridProps> = ({
  difficultyLabel,
  difficultyColor,
  totalMinutes,
  activeMinutes,
  servings,
}) => (
  <div className={styles.grid}>
    <InfoCard
      icon={<StarIcon className={styles.infoIcon} />}
      label="Сложность"
      value={
        <span
          className={styles.difficultyBadge}
          style={{
            color: difficultyColor,
            background: `color-mix(in oklab, ${difficultyColor} 18%, transparent)`,
          }}
        >
          {difficultyLabel}
        </span>
      }
      tone="accent"
    />
    <InfoCard
      icon={<ClockIcon className={styles.infoIcon} />}
      label="Общее время"
      value={<span>{totalMinutes} мин</span>}
      tone="info"
    />
    <InfoCard
      icon={<ClockIcon className={styles.infoIcon} />}
      label="Активное время"
      value={<span>{activeMinutes} мин</span>}
      tone="warning"
    />
    <InfoCard
      icon={<UserGroupIcon className={styles.infoIcon} />}
      label="Порции"
      value={<span>{servings}</span>}
      tone="success"
    />
  </div>
);

export default InfoGrid;
