import React from 'react';
import styles from './SmartChip.module.css';

type ChipKind = 'label' | 'range' | 'select';

interface BaseProps {
  kind: ChipKind;
  title?: string;
  onRemove?: () => void;
}

interface LabelChipProps extends BaseProps {
  kind: 'label';
  text: string;
}

interface RangeChipProps extends BaseProps {
  kind: 'range';
  from?: number;
  to?: number;
  placeholderFrom?: string;
  placeholderTo?: string;
  onChange?: (next: { from?: number; to?: number }) => void;
}

interface SelectChipProps extends BaseProps {
  kind: 'select';
  value?: string;
  options: Array<{ value: string; label: string }>;
  onChange?: (value: string) => void;
}

type SmartChipProps = (LabelChipProps | RangeChipProps | SelectChipProps) & { removeMode?: boolean };

const SmartChip: React.FC<SmartChipProps> = (props) => {
  return (
    <span className={`${styles.chip} ${props.removeMode ? styles.removeMode : ''}`} title={props.title}>
      {props.kind === 'label' && (
        <>
          <span className={styles.label}>{props.text}</span>
        </>
      )}
      {props.kind === 'range' && (
        <>
          <span className={styles.label}>{props.title ?? 'Диапазон'}</span>
          <input
            className={styles.input}
            type="number"
            placeholder={(props as RangeChipProps).placeholderFrom ?? 'от'}
            defaultValue={(props as RangeChipProps).from ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? undefined : Number(e.target.value);
              (props as RangeChipProps).onChange?.({ from: val, to: (props as RangeChipProps).to });
            }}
          />
          <span className={styles.sep}>–</span>
          <input
            className={styles.input}
            type="number"
            placeholder={(props as RangeChipProps).placeholderTo ?? 'до'}
            defaultValue={(props as RangeChipProps).to ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? undefined : Number(e.target.value);
              (props as RangeChipProps).onChange?.({ from: (props as RangeChipProps).from, to: val });
            }}
          />
        </>
      )}
      {props.kind === 'select' && (
        <>
          <span className={styles.label}>{props.title ?? 'Выбор'}</span>
          <select
            className={styles.select}
            defaultValue={(props as SelectChipProps).value ?? ''}
            onChange={(e) => (props as SelectChipProps).onChange?.(e.target.value)}
          >
            <option value="" disabled>Выберите…</option>
            {(props as SelectChipProps).options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </>
      )}
      {props.onRemove && (
        <button className={styles.removeBtn} onClick={props.onRemove} aria-label="Удалить чип">×</button>
      )}
    </span>
  );
};

export default SmartChip;


