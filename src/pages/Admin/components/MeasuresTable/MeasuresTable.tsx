import React from 'react';
import { PRODUCT_UNITS_ARRAY } from '../../../../constants/measures';

/**
 * Единица измерения продукта в таблице редактирования.
 */
export interface MeasureRow {
  id: string;
  name: string;
  weight: number;
  density?: number;
  isDefault: boolean;
}

/**
 * Пропсы таблицы редактирования мер продукта.
 */
interface MeasuresTableProps {
  measures: MeasureRow[];
  editing: Record<string, MeasureRow>;
  onChange: (id: string, next: Partial<MeasureRow>) => void;
  onSave: (id: string) => Promise<void> | void;
  disabled?: boolean;
}

/**
 * Таблица редактирования мер (единиц измерения) с возможностью
 * изменения названия, веса, плотности и признака основной меры.
 */
const MeasuresTable: React.FC<MeasuresTableProps> = ({ measures, editing, onChange, onSave, disabled }) => {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8 }}>
        <div><strong>Название</strong></div>
        <div><strong>Вес (г)</strong></div>
        <div><strong>Плотность</strong></div>
        <div><strong>Основная</strong></div>
        <div />
        {measures.map((m) => (
          <React.Fragment key={m.id}>
            <select
              className="ui-input"
              value={editing[m.id]?.name ?? m.name}
              onChange={(e) => onChange(m.id, { name: e.target.value })}
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
              value={editing[m.id]?.weight ?? m.weight}
              onChange={(e) => onChange(m.id, { weight: Number(e.target.value) })}
              disabled={disabled}
            />
            <input
              className="ui-input"
              type="number"
              min={0}
              step={0.01}
              value={(editing[m.id]?.density ?? m.density ?? 1) as number}
              onChange={(e) => onChange(m.id, { density: Number(e.target.value) })}
              disabled={disabled}
            />
            <input
              type="checkbox"
              checked={editing[m.id]?.isDefault ?? m.isDefault}
              onChange={(e) => onChange(m.id, { isDefault: e.target.checked })}
              disabled={disabled}
            />
            <div>
              <button className="ui-btn ui-btn--primary" type="button" onClick={() => onSave(m.id)} disabled={disabled}>
                Сохранить меру
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MeasuresTable;


