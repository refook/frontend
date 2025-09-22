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
}

const ListPaginationControls: React.FC<ListPaginationControlsProps> = ({
  summary,
  hasMore = false,
  loading = false,
  onLoadMore,
  buttonLabel = 'Показать ещё',
  finishedLabel = 'Больше нет элементов',
  note,
  disabled = false
}) => {
  const canLoadMore = Boolean(onLoadMore) && hasMore && !disabled;
  const buttonDisabled = disabled || loading || !hasMore || !onLoadMore;

  const handleClick = () => {
    if (!canLoadMore) return;
    onLoadMore?.();
  };

  return (
    <div className={styles.wrapper}>
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
