import React from 'react';
import LoadMoreButton from '../LoadMoreButton/LoadMoreButton';
import styles from './ListPaginationControls.module.css';

interface ListPaginationControlsProps {
  summary?: string | null;
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  buttonLabel?: string;
  finishedLabel?: string;
  note?: string;
  disabled?: boolean;
  // Позволяет вводить количество отображаемых элементов
  perPageValue?: number;
  onPerPageChange?: (next: number) => void;
  perPageLabel?: string;
}

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
      {typeof perPageValue === 'number' && onPerPageChange ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <label style={{ fontSize: 14 }}>
            {perPageLabel}:
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={Number.isFinite(perPageValue) ? perPageValue : 1}
            onChange={(e) => {
              const next = Math.max(1, Number.parseInt(e.target.value || '1', 10));
              onPerPageChange(next);
            }}
            disabled={disabled}
            style={{ width: 90 }}
          />
        </div>
      ) : null}
      {summary ? <p className={styles.summary}>{summary}</p> : null}
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
      {!hasMore && note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
};

export default ListPaginationControls;
