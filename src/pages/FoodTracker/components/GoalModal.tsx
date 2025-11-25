import React from 'react';
import BottomSheet from './BottomSheet';
import styles from '../../FoodTrackerPage.module.css';
import type { GoalType, Sex } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    weight: string;
    height: string;
    age: string;
    sex: Sex;
    target: GoalType;
    calories: string;
    proteins: string;
    fats: string;
    carbs: string;
  };
  onFormChange: (patch: Partial<GoalModalProps['form']>) => void;
  onRecalculate: () => void;
  onConfirm: () => void;
  error?: string | null;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, form, onFormChange, onRecalculate, onConfirm, error }) => {
  if (!isOpen) return null;

  const goalOptions: Array<{ value: GoalType; label: string }> = [
    { value: 'maintenance', label: 'Сохранение веса' },
    { value: 'fatLoss', label: 'Похудение' },
    { value: 'weightGain', label: 'Набор веса' },
    { value: 'muscleGain', label: 'Набор мышечной массы' },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Настройка цели"
      subtitle="Авторасчёт и ручная настройка"
    >
      <div className={styles.formSection}>
        <div className={styles.goalGridMeasurements}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="goal-weight">Вес (кг)</label>
            <input
              id="goal-weight"
              className={styles.input}
              value={form.weight}
              onChange={(e) => onFormChange({ weight: e.target.value })}
              type="number"
              min="1"
              step="0.1"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="goal-height">Рост (см)</label>
            <input
              id="goal-height"
              className={styles.input}
              value={form.height}
              onChange={(e) => onFormChange({ height: e.target.value })}
              type="number"
              min="50"
              step="1"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="goal-age">Возраст</label>
            <input
              id="goal-age"
              className={styles.input}
              value={form.age}
              onChange={(e) => onFormChange({ age: e.target.value })}
              type="number"
              min="14"
              step="1"
            />
          </div>
        </div>
        <div className={styles.goalGridSelectors}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="goal-sex">Пол</label>
            <select
              id="goal-sex"
              className={styles.select}
              value={form.sex}
              onChange={(e) => onFormChange({ sex: e.target.value as Sex })}
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="goal-target">Цель</label>
            <select
              id="goal-target"
              className={styles.select}
              value={form.target}
              onChange={(e) => onFormChange({ target: e.target.value as GoalType })}
            >
              {goalOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.macroGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="goal-calories">Калории, ккал</label>
            <input
              id="goal-calories"
              className={styles.input}
              value={form.calories}
              onChange={(e) => onFormChange({ calories: e.target.value })}
              type="number"
              min="0"
              step="1"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="goal-proteins">Белки, г</label>
            <input
              id="goal-proteins"
              className={styles.input}
              value={form.proteins}
              onChange={(e) => onFormChange({ proteins: e.target.value })}
              type="number"
              min="0"
              step="1"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="goal-fats">Жиры, г</label>
            <input
              id="goal-fats"
              className={styles.input}
              value={form.fats}
              onChange={(e) => onFormChange({ fats: e.target.value })}
              type="number"
              min="0"
              step="1"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="goal-carbs">Углеводы, г</label>
            <input
              id="goal-carbs"
              className={styles.input}
              value={form.carbs}
              onChange={(e) => onFormChange({ carbs: e.target.value })}
              type="number"
              min="0"
              step="1"
            />
          </div>
        </div>

        <div className={styles.goalHintRow}>
          <span className={styles.hint}>
            Авторасчёт использует формулу Миффлина — коэффициент активности 1.2. Значения можно изменить вручную перед сохранением.
          </span>
        </div>

        <div className={styles.actionsRow}>
          <button className={styles.secondaryButton} type="button" onClick={onRecalculate}>
            Пересчитать
          </button>
          <div className={styles.actionsSpacer} />
          <button className={styles.closeButton} type="button" onClick={onClose}>
            Отменить
          </button>
          <button className={styles.submitButton} type="button" onClick={onConfirm}>
            Сохранить цель
          </button>
        </div>

        {error && <span className={styles.hint}>{error}</span>}
      </div>
    </BottomSheet>
  );
};

export default GoalModal;
