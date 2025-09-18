import React from 'react';
import { PRODUCT_UNITS_ARRAY } from '../../../../constants/measures';

/**
 * Пропсы формы добавления меры для варианта продукта.
 */
interface Props {
  unitName: string;
  baseMeasureId: string;
  weight: number;
  density?: number;
  availableUnitLabels: string[]; // фильтрованные PRODUCT_UNITS labels
  onChange: (next: { unitName: string; baseMeasureId: string; weight: number; density?: number }) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

/**
 * Форма для добавления меры варианта продукта: выбор названия единицы
 * (отфильтрованные доступные), веса и плотности. Авто-привязка baseMeasureId
 * выполняется снаружи по выбранному названию единицы.
 */
const AddVariantMeasureForm: React.FC<Props> = ({ unitName, baseMeasureId, weight, density = 1, availableUnitLabels, onChange, onSubmit, disabled }) => {
  return (
    <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8 }}>
      <select
        className="ui-input"
        value={unitName}
        onChange={(e) => onChange({ unitName: e.target.value, baseMeasureId, weight, density })}
        disabled={disabled}
      >
        {availableUnitLabels.map((label) => (
          <option key={label} value={label}>{label}</option>
        ))}
      </select>
      <input
        className="ui-input"
        type="number"
        min={1}
        step={1}
        value={weight}
        onChange={(e) => onChange({ unitName, baseMeasureId, weight: Number(e.target.value), density })}
        disabled={disabled}
      />
      <input
        className="ui-input"
        type="number"
        min={0}
        step={0.01}
        value={density}
        onChange={(e) => onChange({ unitName, baseMeasureId, weight, density: Number(e.target.value) })}
        disabled={disabled}
      />
      <div>
        <button className="ui-btn ui-btn--primary" type="button" onClick={onSubmit} disabled={disabled || !baseMeasureId}>
          Добавить меру варианта
        </button>
        {!baseMeasureId && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--ui-muted, #6b7280)' }}>
            Выберите единицу — будет использована базовая мера с таким же названием.
          </div>
        )}
      </div>
    </div>
  );
};

export default AddVariantMeasureForm;


