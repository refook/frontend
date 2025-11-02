import React from 'react';
import styles from './NutritionInfo.module.css';
import { FireIcon, BeakerIcon, Squares2X2Icon, SparklesIcon } from '@heroicons/react/24/outline';

interface NutritionInfoProps {
  expanded: boolean;
  onToggle: () => void;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
}

/**
 * Компонент NutritionInfo — блок с основной и расширенной информацией о пищевой ценности.
 * Показывает калории, БЖУ и при раскрытии — дополнительные нутриенты с процентами.
 *
 * @param expanded Признак раскрытого состояния (true — показывать подробности).
 * @param onToggle Обработчик клика по кнопке «Подробнее/Скрыть» для переключения состояния.
 */
const NutritionInfo: React.FC<NutritionInfoProps> = ({ expanded, onToggle, calories, proteins, fats, carbs }) => {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>Пищевая ценность (на порцию)</h3>
        <button type="button" className="ui-btn" onClick={onToggle}>
          {expanded ? 'Скрыть' : 'Подробнее'}
        </button>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.cardCalories}`}>
          <span className={`${styles.iconWrap} ${styles.calories}`}><FireIcon className={styles.icon} /></span>
          <div className={styles.value}>{typeof calories === 'number' ? Math.round(calories) : 425}</div>
          <div className={styles.label}>Калории</div>
        </div>
        <div className={styles.card}>
          <span className={`${styles.iconWrap} ${styles.proteins}`}><SparklesIcon className={styles.icon} /></span>
          <div className={styles.value}>{typeof proteins === 'number' ? `${proteins} г` : '32 г'}</div>
          <div className={styles.label}>Белки</div>
        </div>
        <div className={styles.card}>
          <span className={`${styles.iconWrap} ${styles.carbs}`}><Squares2X2Icon className={styles.icon} /></span>
          <div className={styles.value}>{typeof carbs === 'number' ? `${carbs} г` : '28 г'}</div>
          <div className={styles.label}>Углеводы</div>
        </div>
        <div className={styles.card}>
          <span className={`${styles.iconWrap} ${styles.fats}`}><BeakerIcon className={styles.icon} /></span>
          <div className={styles.value}>{typeof fats === 'number' ? `${fats} г` : '18 г'}</div>
          <div className={styles.label}>Жиры</div>
        </div>
      </div>

      {expanded && (
        <div className={styles.details}>
          <div className={styles.row}><span>Насыщенные жиры</span><span>7.2 г</span><span>36%</span></div>
          <div className={styles.row}><span>Трансжиры</span><span>0.0 г</span><span>—</span></div>
          <div className={styles.row}><span>Холестерин</span><span>394.7 мг</span><span>132%</span></div>
          <div className={styles.row}><span>Клетчатка</span><span>1.1 г</span><span>4%</span></div>
          <div className={styles.row}><span>Сахара</span><span>2.2 г</span><span>—</span></div>
          <div className={styles.row}><span>Натрий</span><span>650.7 мг</span><span>28%</span></div>
        </div>
      )}
    </div>
  );
};

export default NutritionInfo;

