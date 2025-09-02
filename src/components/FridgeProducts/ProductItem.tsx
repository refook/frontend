import React, { useMemo, useState } from 'react';
import { Dropdown } from '../Dropdown/Dropdown';
import type { FridgeProduct } from '../../types/fridge.types';
import styles from './ProductItem.module.css';

/**
 * Props для компонента `ProductItem`.
 *
 * Компонент рендерит карточку продукта из холодильника в двух режимах:
 * 1) обычный (с прямоугольным фото, атрибутами, горизонтальной полосой «срока»);
 * 2) компактный (с круглым фото и круговой шкалой «срока», без горизонтальной полосы).
 *
 * Основные особенности:
 * - Дата истечения «Годен до» может быть задана и изменена в режиме редактирования;
 * - Цветовые сигналы (зелёный/жёлтый/красный) унифицированы между горизонтальной и круговой шкалами:
 *   красный — только если продукт уже просрочен; жёлтый — сегодня или в ближайшие 3 дня; зелёный — иначе.
 * - Кнопки действий скрыты за иконкой-троеточием (Dropdown) вне режима редактирования.
 * - В компактном режиме вместо горизонтальной полосы показывается заметка в одну строку.
 */
interface ProductItemProps {
  item: FridgeProduct;
  onUpdate?: (id: string, updates: any) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

/**
 * ProductItem
 *
 * Отображает карточку продукта с возможностью редактирования количества, единиц измерения,
 * заметки и даты годности. Поддерживает «компактный» вариант отображения с круглым фото
 * и круговой шкалой «срока» вокруг него.
 *
 * UX/ARIA:
 * - Кнопка троеточия имеет aria-label «Действия»;
 * - Кнопки сохранения/отмены имеют aria-label и title;
 * - Полосы прогресса имеют aria-label «Прогресс срока годности».
 *
 * Пограничные случаи:
 * - Если в ответе нет `expiryDate`, шкала не показывается;
 * - Если `createdAt` отсутствует — старт вычислений берётся из `addedAt` или текущего времени;
 * - «Сегодня» трактуется как не просрочено и подсвечивается жёлтым;
 * - Прошедшие даты запрещены при редактировании (валидация в UI).
 */
export const ProductItem: React.FC<ProductItemProps> = ({ item, onUpdate, onDelete, compact = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(item.amount.toString());
  const [editNotes, setEditNotes] = useState(item.notes || '');
  const [editExpiryDate, setEditExpiryDate] = useState<string>(
    item.expiryDate ? item.expiryDate.toISOString().slice(0, 10) : ''
  );
  const todayDateStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
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
    // Валидация даты: запрещаем прошлые даты
    if (editExpiryDate) {
      const chosen = new Date(editExpiryDate + 'T00:00:00');
      const today = new Date(todayDateStr + 'T00:00:00');
      if (chosen < today) {
        alert('Дата годности не может быть в прошлом. Выберите сегодняшнюю или будущую дату.');
        return;
      }
    }
    const updates = {
      count: parseFloat(editAmount) || 0,
      comment: editNotes.trim() || undefined,
      productUnit: editProductUnit,
      baseUnit: editBaseUnit,
      expiryDate: editExpiryDate || null
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
    setEditExpiryDate(item.expiryDate ? item.expiryDate.toISOString().slice(0, 10) : '');
    setIsEditing(false);
  };

  const isExpiringSoon = item.expiryDate && item.expiryDate <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const isExpired = item.expiryDate && item.expiryDate < new Date();

  // Прогресс до истечения срока годности (от добавления до expiryDate)
  const expiryProgress = useMemo(() => {
    if (!item.expiryDate) return null;
    // Приоритет: createdAt (API) -> addedAt (локальное) -> сейчас
    const createdAtStr = (item as any).createdAt as string | undefined;
    const parseDateLike = (d: unknown): Date | undefined => {
      if (!d) return undefined;
      if (d instanceof Date) return d;
      const parsed = new Date(d as any);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    };
    const createdAtDate = createdAtStr ? parseDateLike(createdAtStr) : undefined;
    const addedAtDate = parseDateLike(item.addedAt as unknown as any);
    const expiryDate = parseDateLike(item.expiryDate as unknown as any);
    if (!expiryDate) return null;
    const startMs = (createdAtDate || addedAtDate || new Date()).getTime();
    const endMs = expiryDate.getTime();
    const nowMs = Date.now();
    const total = Math.max(endMs - startMs, 0);
    if (total === 0) return { percent: 100, level: 'danger' as 'ok' | 'warn' | 'danger' };
    const elapsed = Math.min(Math.max(nowMs - startMs, 0), total);
    let percent = Math.round((elapsed / total) * 100);
    if (percent > 0 && percent < 2) percent = 2; // минимальная видимость
    const remainingRatio = 1 - elapsed / total; // 1..0
    // если срок ровно сегодня (по локальной дате) — жёлтый
    const isSameLocalDay = (() => {
      const toYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return toYmd(new Date()) === toYmd(expiryDate);
    })();
    const level: 'ok' | 'warn' | 'danger' = isExpired
      ? 'danger'
      : isSameLocalDay
        ? 'warn'
        : remainingRatio <= 0.15
          ? 'danger'
          : remainingRatio <= 0.35
            ? 'warn'
            : 'ok';
    return { percent, level };
  }, [item.addedAt, item.expiryDate, isExpired]);

  // Геометрия круговой шкалы для компактного режима
  const circle = useMemo(() => {
    const size = 120; // внешний размер SVG (вписывается в контейнер 140x140)
    const stroke = 16; // ещё шире
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const percent = expiryProgress?.percent ?? 0;
    const dash = Math.max(0, Math.min(100, percent)) / 100 * c;
    const gap = c - dash;
    // Цвет как в логике статуса карточки: красный только если ПРОСРОЧЕНО,
    // жёлтый — если сегодня или в ближайшие 3 дня; иначе зелёный
    const now = new Date();
    const toYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isToday = (d?: Date) => !!d && toYmd(d) === toYmd(now);
    const exp = item.expiryDate;
    const isExpiredNow = !!exp && exp.getTime() < now.getTime();
    const isSoon = !!exp && !isExpiredNow && exp.getTime() <= now.getTime() + 3 * 24 * 60 * 60 * 1000;
    const tone = isExpiredNow ? '#ef4444' : (isToday(exp) || isSoon) ? '#f59e0b' : '#10b981';
    return { size, stroke, r, c, dash, gap, tone };
  }, [expiryProgress, item.expiryDate]);

  return (
    <div className={`${styles.productItem} ${compact ? styles.compact : ''} ${isExpired ? styles.expired : isExpiringSoon ? styles.expiring : ''}`}>
      {/* Верхний блок изображения с оверлеем */}
      <div className={`${styles.imageContainer} ${compact ? styles.circleWrap : ''}`}>
        {/* Фото/плейсхолдер */}
        <div className={`${styles.imagePlaceholder} ${compact ? styles.circleInner : ''}`} aria-hidden="true" />
        {!compact && <div className={styles.imageOverlay} />}
        {compact && (
          <svg className={styles.circleSvg} width={circle.size} height={circle.size} viewBox={`0 0 ${circle.size} ${circle.size}`} aria-hidden="true">
            <circle cx={circle.size/2} cy={circle.size/2} r={circle.r} stroke="var(--color-gray-200)" strokeWidth={circle.stroke} fill="none" />
            <circle
              className={styles.circleProgress}
              cx={circle.size/2}
              cy={circle.size/2}
              r={circle.r}
              stroke={circle.tone}
              strokeWidth={circle.stroke}
              fill="none"
              strokeDasharray={circle.c}
              strokeDashoffset={circle.c - circle.dash}
              strokeLinecap="round"
              transform={`translate(${circle.size} 0) scale(-1 1) rotate(-90 ${circle.size/2} ${circle.size/2})`}
            />
          </svg>
        )}
        {item.ingredient.description && (
          <div className={styles.imageCaption}>
            <em>"{item.ingredient.description}"</em>
          </div>
        )}
        {!isEditing && item.notes && (
          <div className={styles.imageNote} title={item.notes}>
            <span>{item.notes}</span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {!isEditing ? (
          <Dropdown triggerAriaLabel="Действия">
            <Dropdown.Item onClick={() => setIsEditing(true)}>Редактировать</Dropdown.Item>
            <Dropdown.Item danger onClick={handleDelete}>Удалить</Dropdown.Item>
          </Dropdown>
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

      <div className={styles.productHeader}>
        <h3 className={styles.productName}>{item.ingredient.name}</h3>
      </div>

      <div className={styles.productDetails}>
        {!isEditing ? (
          <>
            <div className={styles.amount}>
              <strong>{item.amount} {item.unit}</strong>
            </div>
            {!compact && item.expiryDate && (
              <div className={styles.expiry}>
                Годен до: {item.expiryDate.toLocaleDateString('ru-RU')}
              </div>
            )}
            {!compact && expiryProgress && (
              (() => {
                const now = new Date();
                const toYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const isToday = (d?: Date) => !!d && toYmd(d) === toYmd(now);
                const exp = item.expiryDate;
                const isExpiredNow = !!exp && exp.getTime() < now.getTime();
                const isSoon = !!exp && !isExpiredNow && exp.getTime() <= now.getTime() + 3 * 24 * 60 * 60 * 1000;
                const level: 'ok' | 'warn' | 'danger' = isExpiredNow ? 'danger' : (isToday(exp) || isSoon) ? 'warn' : 'ok';
                return (
                  <div className={styles.expiryBar} aria-label="Прогресс срока годности">
                    <div
                      className={`${styles.expiryFill} ${level === 'ok' ? styles.ok : level === 'warn' ? styles.warn : styles.danger}`}
                      style={{ width: `${expiryProgress.percent}%` }}
                    />
                  </div>
                );
              })()
            )}
            {compact && item.notes && (
              <div className={styles.compactNote} title={item.notes}>{item.notes}</div>
            )}
            {/* Заметки перенесены на фото (overlay) */}
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
                Годен до:
                <input
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  min={todayDateStr}
                  className={styles.editInput}
                />
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

      {/* Бейджи статуса заменены прогресс-полосой срока годности */}
    </div>
  );
}; 