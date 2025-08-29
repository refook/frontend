import React from 'react';
import styles from './SmartChip.module.css';

type ChipKind = 'label' | 'range' | 'select';

/**
 * Универсальный смарт-чип для панели быстрых фильтров.
 *
 * Компонент инкапсулирует несколько режимов отображения (label, range, select)
 * и единый внешний вид. Используется как «презентационная» часть чипа внутри
 * кликабельной кнопки-обёртки на панели фильтров.
 *
 * Особенности:
 * - Проп `removeMode` визуально отмечает чип «к удалению/скрытию» (режим редактирования)
 * - Проп `active` подчёркивает активный (выбранный) чип в обычном режиме
 * - Для вида `range` доступны поля ввода от/до, события не изменяют фильтры (заглушка)
 * - Для вида `select` доступен выпадающий список с опциями
 *
 * Замечания по UX:
 * - Сам чип визуально интерактивен, но обработчик клика вешается на внешнюю кнопку
 *   (владелец компонента), чтобы единообразно обрабатывать режимы панели (редактирование/обычный)
 * - Внутренние поля ввода имеют курсор `text`, чтобы не конфликтовать с кликом по чипу
 */
interface BaseProps {
  kind: ChipKind;
  title?: string;
  onRemove?: () => void;
  active?: boolean;
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
  toOnly?: boolean; // если true — показываем только поле "до"
}

interface SelectChipProps extends BaseProps {
  kind: 'select';
  value?: string;
  options: Array<{ value: string; label: string }>;
  onChange?: (value: string) => void;
}

type SmartChipProps = (LabelChipProps | RangeChipProps | SelectChipProps) & { removeMode?: boolean };

/**
 * Компонент SmartChip
 *
 * @param {('label'|'range'|'select')} props.kind Тип визуализации чипа
 * @param {string} [props.title] Заголовок/лейбл чипа
 * @param {boolean} [props.active] Визуально активное состояние (обычный режим панели)
 * @param {boolean} [props.removeMode] Визуально «режим удаления/скрытия» (режим редактирования панели)
 * @param {() => void} [props.onRemove] Коллбек удаления (если нужен крестик внутри чипа)
 *
 * @param {number} [props.from] Значение «от» (для kind='range')
 * @param {number} [props.to] Значение «до» (для kind='range')
 * @param {string} [props.placeholderFrom] Плейсхолдер «от» (для kind='range')
 * @param {string} [props.placeholderTo] Плейсхолдер «до» (для kind='range')
 * @param {(next: {from?: number; to?: number}) => void} [props.onChange] Изменение диапазона/значения
 *
 * @param {string} [props.value] Текущее значение (для kind='select')
 * @param {{value: string; label: string}[]} [props.options] Опции (для kind='select')
 */
const SmartChip: React.FC<SmartChipProps> = (props) => {
  return (
    <span className={`${styles.chip} ${props.removeMode ? styles.removeMode : ''} ${props.active ? styles.active : ''}`} title={props.title}>
      {props.kind === 'label' && (
        <>
          <span className={styles.label}>{props.text}</span>
        </>
      )}
      {props.kind === 'range' && (
        <>
          <span className={styles.label}>{props.title ?? 'Диапазон'}</span>
          {!(props as RangeChipProps).toOnly && (
            <>
              <input
                className={styles.input}
                type="number"
                placeholder={(props as RangeChipProps).placeholderFrom ?? 'от'}
                value={(props as RangeChipProps).from ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : Number(e.target.value);
                  (props as RangeChipProps).onChange?.({ from: val, to: (props as RangeChipProps).to });
                }}
              />
              <span className={styles.sep}>–</span>
            </>
          )}
          <input
            className={styles.input}
            type="number"
            placeholder={(props as RangeChipProps).placeholderTo ?? 'до'}
            value={(props as RangeChipProps).to ?? ''}
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
            value={(props as SelectChipProps).value ?? ''}
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


