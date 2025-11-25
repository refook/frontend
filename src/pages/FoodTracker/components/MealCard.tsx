import React from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from '../../FoodTrackerPage.module.css';
import { macroColors } from '../constants';
import type { DayMeals, MealType } from '../../../services/foodTrackerService';

interface MealCardProps {
  mealKey: MealType;
  label: string;
  items: DayMeals[MealType];
  onAdd: () => void;
  onRemove: (meal: MealType, id: string) => void;
}

const MealCard: React.FC<MealCardProps> = ({ mealKey, label, items, onAdd, onRemove }) => (
  <div className={styles.mealCard}>
    <div className={styles.mealHeader}>
      <h3 className={styles.mealTitle}>{label}</h3>
      <button className={styles.addButton} onClick={onAdd} type="button" aria-label="Добавить">
        <PlusIcon width={16} />
      </button>
    </div>
    <div className={styles.items}>
      {items.map((item) => (
        <div key={item.id} className={styles.itemRow}>
          <div className={styles.itemMeta}>
            <div className={styles.itemTitleRow}>
              <div className={styles.itemTitleGroup}>
                <span className={styles.itemTitle}>{item.title}</span>
                {item.details && (
                  <span className={styles.detailText}>{item.details}</span>
                )}
              </div>
              <button
                className={styles.removeButton}
                onClick={() => onRemove(mealKey, item.id)}
                aria-label="Удалить"
                type="button"
              >
                <XMarkIcon width={16} />
              </button>
            </div>
            <div className={styles.itemDetailsWrapper}>
              <div className={styles.itemDetails}>
                <span className={styles.pill}>{item.calories} ккал</span>
                {item.macros && (
                  <>
                    {[
                      { key: 'proteins', label: '', value: item.macros.proteins, color: macroColors.proteins },
                      { key: 'fats', label: '', value: item.macros.fats, color: macroColors.fats },
                      { key: 'carbs', label: '', value: item.macros.carbs, color: macroColors.carbs },
                    ]
                      .filter((chip) => chip.value !== undefined)
                      .map((chip) => (
                        <span
                          key={chip.key}
                          className={styles.macroChip}
                          style={{ color: chip.color, borderColor: chip.color }}
                        >
                          {Math.round(chip.value ?? 0)} г
                        </span>
                      ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MealCard;
