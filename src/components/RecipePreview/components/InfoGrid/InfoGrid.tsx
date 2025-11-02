import React from 'react';
import InfoCard from '../../../InfoCard/InfoCard';
import type { RecipePreviewInfoGridProps } from '../../RecipePreview.types';
import styles from './InfoGrid.module.css';

/**
 * Блок с основными характеристиками рецепта (сложность, время, порции).
 * Используется в верхней части превью и отображает данные в виде сетки карточек.
 */
const InfoGrid: React.FC<RecipePreviewInfoGridProps> = ({
  difficultyLabel,
  difficultyColor,
  totalMinutes,
  activeMinutes,
  servings,
}) => (
  <section className={styles.section}>
    <h3 className={styles.title}>Параметры рецепта</h3>
    <div className={styles.grid}>
      <InfoCard
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
      />
      <InfoCard
        label="Общее время"
        value={<span>{totalMinutes} мин</span>}
      />
      <InfoCard
        label="Активное время"
        value={<span>{activeMinutes} мин</span>}
      />
      <InfoCard
        label="Порции"
        value={<span>{servings}</span>}
      />
    </div>
  </section>
);

export default InfoGrid;
