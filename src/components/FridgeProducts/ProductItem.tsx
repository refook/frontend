import React, { useState } from 'react';
import type { FridgeProduct } from '../../types/fridge.types';
import styles from './ProductItem.module.css';

interface ProductItemProps {
  item: FridgeProduct;
  onUpdate?: (id: string, updates: any) => void;
  onDelete?: (id: string) => void;
}

export const ProductItem: React.FC<ProductItemProps> = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(item.amount.toString());
  const [editNotes, setEditNotes] = useState(item.notes || '');

  const handleUpdate = () => {
    const updates = {
      count: parseFloat(editAmount) || 0,
      comment: editNotes.trim() || undefined
    };
    
    onUpdate?.(item.id, updates);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Удалить ${item.ingredient.name} из холодильника?`)) {
      onDelete?.(item.id);
    }
  };

  const handleCancel = () => {
    setEditAmount(item.amount.toString());
    setEditNotes(item.notes || '');
    setIsEditing(false);
  };

  const isExpiringSoon = item.expiryDate && item.expiryDate <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const isExpired = item.expiryDate && item.expiryDate < new Date();

  return (
    <div className={`${styles.productItem} ${isExpired ? styles.expired : isExpiringSoon ? styles.expiring : ''}`}>
      <div className={styles.productHeader}>
        <h3 className={styles.productName}>{item.ingredient.name}</h3>
        <div className={styles.actions}>
          {!isEditing ? (
            <>
              <button
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
                title="Редактировать"
              >
                ✏️
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDelete}
                title="Удалить"
              >
                🗑️
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.saveButton}
                onClick={handleUpdate}
                title="Сохранить"
              >
                ✅
              </button>
              <button
                className={styles.cancelButton}
                onClick={handleCancel}
                title="Отмена"
              >
                ❌
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.productDetails}>
        {!isEditing ? (
          <>
            <div className={styles.amount}>
              <strong>{item.amount} {item.unit}</strong>
            </div>
            {item.expiryDate && (
              <div className={styles.expiry}>
                Годен до: {item.expiryDate.toLocaleDateString('ru-RU')}
              </div>
            )}
            {item.notes && (
              <div className={styles.notes}>
                <em>{item.notes}</em>
              </div>
            )}
          </>
        ) : (
          <div className={styles.editForm}>
            <div className={styles.editRow}>
              <label>
                Количество:
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  min="0"
                  step="0.1"
                  className={styles.editInput}
                />
                <span className={styles.unit}>{item.unit}</span>
              </label>
            </div>
            <div className={styles.editRow}>
              <label>
                Заметки:
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Дополнительная информация"
                  className={styles.editInput}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {isExpired && (
        <div className={styles.statusBadge}>
          Просрочено
        </div>
      )}
      {isExpiringSoon && !isExpired && (
        <div className={styles.statusBadge}>
          Скоро истечет
        </div>
      )}
    </div>
  );
}; 