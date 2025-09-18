import React from 'react';
import styles from './ModeSwitch.module.css';

/**
 * Режимы сохранения для работы с продуктами.
 */
type Mode = 'base' | 'variant' | 'variant_update';

/**
 * Пропсы переключателя режимов и выбора варианта продукта.
 */
interface ModeSwitchProps {
  mode: Mode;
  variants: Array<{ id: string; name: string }>;
  selectedVariantId?: string;
  onModeChange: (mode: Mode) => void;
  onVariantChange?: (variantId: string) => void;
}

/**
 * Компонент для переключения режима сохранения (база/вариант/обновление)
 * и, при необходимости, выбора варианта продукта из списка.
 */
const ModeSwitch: React.FC<ModeSwitchProps> = ({ mode, variants, selectedVariantId = '', onModeChange, onVariantChange }) => {
  return (
    <div className={styles.row}>
      <label className={styles.label}>
        Режим сохранения:
        <select className="ui-input" value={mode} onChange={(e) => onModeChange(e.target.value as Mode)}>
          <option value="variant">Создать вариант продукта</option>
          <option value="base">Обновить базовый продукт</option>
          <option value="variant_update">Обновить вариант продукта</option>
        </select>
      </label>
      {mode === 'variant_update' && onVariantChange && (
        <label className={styles.label}>
          Вариант из списка:
          <select className="ui-input" value={selectedVariantId} onChange={(e) => onVariantChange(e.target.value)}>
            <option value="">—</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
};

export default ModeSwitch;


