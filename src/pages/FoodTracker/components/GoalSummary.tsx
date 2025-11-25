import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { macroColors } from '../constants';
import styles from '../../FoodTrackerPage.module.css';
import 'react-circular-progressbar/dist/styles.css';
import type { GoalResult } from '../types';

interface GoalSummaryProps {
  macrosTotal: { proteins: number; fats: number; carbs: number };
  goal: GoalResult;
  totalCalories: number;
  goalProgress: number;
}

const GoalSummary: React.FC<GoalSummaryProps> = ({ macrosTotal, goal, totalCalories, goalProgress }) => (
  <div className={styles.goalArea}>
    <div className={styles.legend}>
      <div className={styles.legendRow}>
        <span className={styles.legendText} style={{ color: macroColors.proteins }}>Белки</span>
        <div className={styles.legendValues}>
          <strong>{Math.round(macrosTotal.proteins)}</strong>
          <span className={styles.legendGoal}>из {goal.proteins}</span>
        </div>
      </div>
      <div className={styles.legendRow}>
        <span className={styles.legendText} style={{ color: macroColors.fats }}>Жиры</span>
        <div className={styles.legendValues}>
          <strong>{Math.round(macrosTotal.fats)}</strong>
          <span className={styles.legendGoal}>из {goal.fats}</span>
        </div>
      </div>
      <div className={styles.legendRow}>
        <span className={styles.legendText} style={{ color: macroColors.carbs }}>Углеводы</span>
        <div className={styles.legendValues}>
          <strong>{Math.round(macrosTotal.carbs)}</strong>
          <span className={styles.legendGoal}>из {goal.carbs}</span>
        </div>
      </div>
    </div>
    <div className={styles.goalCard}>
      <div
        className={styles.goalGlow}
        style={{
          opacity: Math.max(0.25, goalProgress / 100),
          transform: `scale(${1 + goalProgress / 130})`,
        }}
      />
      <div className={styles.goalCircleWrapper}>
        {(() => {
          const totalMacros = Math.max(
            0,
            macrosTotal.proteins + macrosTotal.fats + macrosTotal.carbs
          );
          const segments = [
            { key: 'proteins', value: macrosTotal.proteins, color: macroColors.proteins },
            { key: 'fats', value: macrosTotal.fats, color: macroColors.fats },
            { key: 'carbs', value: macrosTotal.carbs, color: macroColors.carbs },
          ].filter((segment) => (segment.value ?? 0) > 0);

          if (segments.length === 0) {
            return (
              <CircularProgressbar
                value={100}
                maxValue={100}
                strokeWidth={2}
                className={styles.goalProgress}
                styles={buildStyles({
                  trailColor: 'rgba(99, 102, 241, 0.08)',
                  pathColor: 'rgba(99, 102, 241, 0.35)',
                  strokeLinecap: 'butt',
                })}
              />
            );
          }

          let accumulated = 0;
          return segments.map((segment) => {
            const percent = totalMacros ? (segment.value! / totalMacros) * 100 : 0;
            const rotation = accumulated / 100;
            accumulated += percent;
            return (
              <CircularProgressbar
                key={segment.key}
                value={percent}
                maxValue={100}
                strokeWidth={6}
                className={styles.goalProgress}
                styles={buildStyles({
                  trailColor: 'transparent',
                  pathColor: segment.color,
                  rotation,
                  strokeLinecap: 'butt',
                  pathTransition: 'none',
                })}
              />
            );
          });
        })()}
        <div className={styles.goalCircle}>
          <span className={styles.goalLabel}>Цель</span>
          <span className={styles.goalValue}>{totalCalories} / {goal.calories}</span>
          <span className={styles.goalPercent}>{goalProgress}% от цели</span>
        </div>
      </div>
    </div>
  </div>
);

export default GoalSummary;
