import React from 'react';
import styles from './EditableTable.module.css';

export interface EditableRow { id: string; name: string }

interface EditableTableProps {
  rows: EditableRow[];
  editing: Record<string, string>;
  setEditing: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  updatingId?: string | null;
  onSave: (id: string) => void;
  loading?: boolean;
  emptyText?: string;
  enableCopyId?: boolean;
  onCopyId?: (id: string) => void;
  onEditClick?: (id: string) => void;
  enableSave?: boolean;
}

const EditableTable: React.FC<EditableTableProps> = ({
  rows,
  editing,
  setEditing,
  updatingId,
  onSave,
  loading = false,
  emptyText = 'Записей не найдено',
  enableCopyId = false,
  onCopyId,
  onEditClick,
  enableSave = true,
}) => {
  return (
    <div className={styles.table}>
      <div className={`${styles.row} ${styles.header}`}>
        <div className={styles.colId}>ID</div>
        <div className={styles.colName}>Название</div>
        <div className={styles.colActions}>Действия</div>
      </div>
      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : rows.length === 0 ? (
        <div className={styles.empty}>{emptyText}</div>
      ) : (
        rows.map((r) => (
          <div key={r.id} className={styles.row}>
            <div className={styles.colId} title={r.id}>
              {enableCopyId ? (
                <button
                  type="button"
                  className={styles.idButton}
                  onClick={() => onCopyId?.(r.id)}
                  aria-label={`Скопировать ID ${r.id}`}
                  title="Скопировать ID"
                >
                  <span className={styles.idText}>{r.id}</span>
                </button>
              ) : (
                <span className={styles.idText}>{r.id}</span>
              )}
            </div>
            <div className={styles.colName}>
              <input
                className={`${styles.input} ui-input`}
                type="text"
                value={editing[r.id] ?? r.name}
                onChange={(e) => setEditing((prev) => ({ ...prev, [r.id]: e.target.value }))}
              />
            </div>
            <div className={styles.colActions}>
              {enableSave && (
                <button
                  className="ui-btn ui-btn--primary"
                  onClick={() => onSave(r.id)}
                  disabled={updatingId === r.id}
                >
                  {updatingId === r.id ? 'Сохранение...' : 'Сохранить'}
                </button>
              )}
              {onEditClick && (
                <button
                  className="ui-btn ui-btn--ghost"
                  onClick={() => onEditClick(r.id)}
                  style={{ marginLeft: 8 }}
                >
                  Редактировать
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EditableTable;


