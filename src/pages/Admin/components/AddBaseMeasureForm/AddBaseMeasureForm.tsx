import React from 'react';
import { PRODUCT_UNITS_ARRAY } from '../../../../constants/measures';

/**
 * Пропсы формы добавления базовой меры продукта.
 */
interface Props {
  value: { name: string; weight: number; density?: number; isDefault: boolean };
  disabled?: boolean;
  onChange: (next: Props['value']) => void;
  onSubmit: () => void;
}

/**
 * Форма добавления новой базовой меры: выбор единицы, веса,
 * плотности и признака «основная».
 */
const AddBaseMeasureForm: React.FC<Props> = ({ value, disabled, onChange, onSubmit }) => {
  return (
    <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8 }}>
      <select
        className="ui-input"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        disabled={disabled}
      >
        {PRODUCT_UNITS_ARRAY.map((u) => (
          <option key={u.value} value={u.label}>{u.label}</option>
        ))}
      </select>
      <input
        className="ui-input"
        type="number"
        min={1}
        step={1}
        value={value.weight}
        onChange={(e) => onChange({ ...value, weight: Number(e.target.value) })}
        disabled={disabled}
      />
      <input
        className="ui-input"
        type="number"
        min={0}
        step={0.01}
        value={value.density ?? 1}
        onChange={(e) => onChange({ ...value, density: Number(e.target.value) })}
        disabled={disabled}
      />
      <input
        type="checkbox"
        checked={value.isDefault}
        onChange={(e) => onChange({ ...value, isDefault: e.target.checked })}
        disabled={disabled}
      />
      <div>
        <button className="ui-btn ui-btn--primary" type="button" onClick={onSubmit} disabled={disabled}>
          Добавить меру
        </button>
      </div>
    </div>
  );
};

export default AddBaseMeasureForm;


