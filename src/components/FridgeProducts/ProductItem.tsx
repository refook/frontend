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
  // Новые поля редактирования единиц измерения
  const initialProductUnit = ((): 'GRAM' | 'KILOGRAM' | 'MILLIGRAM' => {
    const u = (item.unit || '').toUpperCase();
    if (u === 'KG' || u === 'KILOGRAM') return 'KILOGRAM';
    if (u === 'MG' || u === 'MILLIGRAM') return 'MILLIGRAM';
    return 'GRAM';
  })();
  const initialBaseUnit = ((): 'GR' | 'ML' => {
    if (item.baseUnit) return item.baseUnit;
    const u = (item.unit || '').toUpperCase();
    return (u === 'ML' || u === 'L' || u === 'MILLILITER' || u === 'LITER') ? 'ML' : 'GR';
  })();
  const [editProductUnit, setEditProductUnit] = useState<'GRAM' | 'KILOGRAM' | 'MILLIGRAM'>(initialProductUnit);
  const [editBaseUnit, setEditBaseUnit] = useState<'GR' | 'ML'>(initialBaseUnit);

  const handleUpdate = () => {
    const updates = {
      count: parseFloat(editAmount) || 0,
      comment: editNotes.trim() || undefined,
      productUnit: editProductUnit,
      baseUnit: editBaseUnit
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
                aria-label="Редактировать"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
                  <path d="M20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                </svg>
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDelete}
                title="Удалить"
                aria-label="Удалить"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M6 7h12v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" fill="currentColor"/>
                  <path d="M9 4h6l1 2H8l1-2z" fill="currentColor"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.saveButton}
                onClick={handleUpdate}
                title="Сохранить"
                aria-label="Сохранить"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9 16.2l-3.5-3.5L4 14.2 9 19l12-12-1.5-1.5L9 16.2z" fill="currentColor"/>
                </svg>
              </button>
              <button
                className={styles.cancelButton}
                onClick={handleCancel}
                title="Отмена"
                aria-label="Отмена"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29 10.59 10.6 16.89 4.29l1.41 1.42z" fill="currentColor"/>
                </svg>
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
                <span className={styles.unit}>{editProductUnit}</span>
              </label>
            </div>
            <div className={styles.editRow}>
              <label>
                Ед. продукта (productUnit):
                <select
                  className={styles.editInput}
                  value={editProductUnit}
                  onChange={(e) => setEditProductUnit(e.target.value as 'GRAM' | 'KILOGRAM' | 'MILLIGRAM')}
                >
                  <option value="GRAM">GRAM</option>
                  <option value="KILOGRAM">KILOGRAM</option>
                  <option value="MILLIGRAM">MILLIGRAM</option>
                </select>
              </label>
            </div>
            <div className={styles.editRow}>
              <label>
                Базовая ед. (baseUnit):
                <select
                  className={styles.editInput}
                  value={editBaseUnit}
                  onChange={(e) => setEditBaseUnit(e.target.value as 'GR' | 'ML')}
                >
                  <option value="GR">GR</option>
                  <option value="ML">ML</option>
                </select>
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

      {!isEditing && isExpired && (
        <div className={styles.statusBadge}>
          Просрочено
        </div>
      )}
      {!isEditing && isExpiringSoon && !isExpired && (
        <div className={styles.statusBadge}>
          Скоро истечет
        </div>
      )}
    </div>
  );
}; 