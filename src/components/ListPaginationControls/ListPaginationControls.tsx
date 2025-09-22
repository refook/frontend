import React from 'react';
import LoadMoreButton from '../LoadMoreButton/LoadMoreButton';
import styles from './ListPaginationControls.module.css';

/**
 * Управляющие элементы для постраничного отображения списков.
 * Отображает краткое резюме, кнопку «Показать ещё» либо статус завершения,
 * а также (опционально) поле для ввода количества элементов на шаг подгрузки.
 */
interface ListPaginationControlsProps {
  /** Текст-резюме над кнопками, например: "Показано 12 из 100" */
  summary?: string | null;
  /** Есть ли ещё элементы для подгрузки (управляет состоянием кнопки/заглушки) */
  hasMore?: boolean;
  /** Признак загрузки, блокирует кнопку и показывает спиннер в дочерней кнопке */
  loading?: boolean;
  /** Обработчик клика по кнопке «Показать ещё» */
  onLoadMore?: () => void;
  /** Текст на кнопке подгрузки */
  buttonLabel?: string;
  /** Текст, когда больше нет элементов для подгрузки */
  finishedLabel?: string;
  /** Примечание под статусом завершения (показывается только когда hasMore=false) */
  note?: string;
  /** Глобальная блокировка контролов */
  disabled?: boolean;
  /**
   * Текущее значение количества элементов на шаг подгрузки.
   * Если число передано, рядом отрисуется числовой инпут изменения этого значения.
   */
  perPageValue?: number;
  /** Колбэк изменения значения perPage (ожидается неотрицательное целое > 0) */
  onPerPageChange?: (next: number) => void;
  /** Подпись для инпута perPage */
  perPageLabel?: string;
}

/**
 * Компонент управляющих контролов постраничной загрузки.
 * Не хранит состояние сам по себе, полностью управляется внешними пропсами.
 */
const ListPaginationControls: React.FC<ListPaginationControlsProps> = ({
  summary,
  hasMore = false,
  loading = false,
  onLoadMore,
  buttonLabel = 'Показать ещё',
  finishedLabel = 'Больше нет элементов',
  note,
  disabled = false,
  perPageValue,
  onPerPageChange,
  perPageLabel = 'Показывать по'
}) => {
  const canLoadMore = Boolean(onLoadMore) && hasMore && !disabled;
  const buttonDisabled = disabled || loading || !hasMore || !onLoadMore;

  const handleClick = () => {
    if (!canLoadMore) return;
    onLoadMore?.();
  };

  return (
    <div className={styles.wrapper}>
      {hasMore ? (
        <LoadMoreButton
          onClick={handleClick}
          loading={loading}
          disabled={buttonDisabled}
        >
          {buttonLabel}
        </LoadMoreButton>
      ) : (
        <button className={styles.finishButton} type="button" disabled>
          {finishedLabel}
        </button>
      )}
      <div className={styles.topRow}>
        {typeof perPageValue === 'number' && onPerPageChange ? (
          <div className={styles.controlsRow}>
            <label className={styles.label}>{perPageLabel}:</label>
            <input
              className="ui-input"
              type="number"
              min={1}
              step={1}
              value={Number.isFinite(perPageValue) ? perPageValue : 1}
              onChange={(e) => {
                const next = Math.max(1, Number.parseInt(e.target.value || '1', 10));
                onPerPageChange(next);
              }}
              disabled={disabled}
              style={{ maxWidth: 110, height: 36 }}
            />
          </div>
        ) : null}
        {summary ? <p className={styles.summary}>{summary}</p> : null}
      </div>
      {!hasMore && note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
};

export default ListPaginationControls;
