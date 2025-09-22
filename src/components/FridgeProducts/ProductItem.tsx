import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown } from '../Dropdown/Dropdown';
import productsService from '../../services/productsService';
import type { FridgeProduct } from '../../types/fridge.types';
import type { ProductMeasureResponseDto } from '../../types/api.types';
import styles from './ProductItem.module.css';

interface ProductUpdatePayload {
  count?: number;
  comment?: string | null;
  measureId?: string;
  expiryDate?: string | null;
}

interface ProductItemProps {
  item: FridgeProduct;
  onUpdate?: (id: string, updates: ProductUpdatePayload) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

const getDefaultMeasureId = (list: ProductMeasureResponseDto[]): string => {
  return list.find(m => m.isDefault)?.id || list[0]?.id || '';
};

export const ProductItem: React.FC<ProductItemProps> = ({ item, onUpdate, onDelete, compact = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editCount, setEditCount] = useState(item.count.toString());
  const [editComment, setEditComment] = useState(item.comment || '');
  const [editExpiryDate, setEditExpiryDate] = useState(
    item.expiryDate ? item.expiryDate.toISOString().slice(0, 10) : ''
  );
  const [editMeasureId, setEditMeasureId] = useState(item.measure?.id || '');

  const [measureOptions, setMeasureOptions] = useState<ProductMeasureResponseDto[]>(
    item.measure ? [item.measure] : []
  );
  const [measureLoading, setMeasureLoading] = useState(false);
  const [measureError, setMeasureError] = useState('');

  const measuresCacheRef = useRef<Map<string, ProductMeasureResponseDto[]>>(new Map());

  const todayDateStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const measureCacheKey = `${item.isVariant ? 'variant' : 'base'}:${item.productId}`;

  useEffect(() => {
    if (isEditing) {
      const cached = measuresCacheRef.current.get(measureCacheKey);
      if (cached) {
        setMeasureOptions(cached);
        setEditMeasureId(prev => (prev && cached.some(m => m.id === prev) ? prev : getDefaultMeasureId(cached)));
        setMeasureError('');
        return;
      }

      let cancelled = false;
      const loadMeasures = async () => {
        try {
          setMeasureLoading(true);
          setMeasureError('');
          const list = item.isVariant
            ? await productsService.getVariantMeasures(item.productId, true)
            : await productsService.getBaseMeasures(item.productId);
          const measures = Array.isArray(list) ? list : [];
          const normalized = measures.length > 0
            ? measures
            : (item.measure ? [item.measure] : []);
          if (!cancelled) {
            measuresCacheRef.current.set(measureCacheKey, normalized);
            setMeasureOptions(normalized);
            setEditMeasureId(prev => (prev && normalized.some(m => m.id === prev)
              ? prev
              : getDefaultMeasureId(normalized)));
          }
        } catch (error) {
          console.error('Не удалось загрузить меры продукта', {
            productId: item.productId,
            isVariant: item.isVariant,
            error
          });
          if (!cancelled) {
            setMeasureError('Не удалось загрузить меры продукта.');
            const fallback = item.measure ? [item.measure] : [];
            setMeasureOptions(fallback);
            setEditMeasureId(prev => (prev && fallback.some(m => m.id === prev)
              ? prev
              : getDefaultMeasureId(fallback)));
          }
        } finally {
          if (!cancelled) {
            setMeasureLoading(false);
          }
        }
      };

      void loadMeasures();
      return () => {
        cancelled = true;
      };
    }
  }, [isEditing, item.isVariant, item.measure, item.productId, measureCacheKey]);

  useEffect(() => {
    if (!isEditing) {
      setEditCount(item.count.toString());
      setEditComment(item.comment || '');
      setEditExpiryDate(item.expiryDate ? item.expiryDate.toISOString().slice(0, 10) : '');
      setEditMeasureId(item.measure?.id || '');
      setMeasureOptions(item.measure ? [item.measure] : []);
      setMeasureError('');
    }
  }, [item, isEditing]);

  const handleUpdate = () => {
    const numericCount = Number(editCount);
    if (Number.isNaN(numericCount) || numericCount <= 0) {
      alert('Введите корректное количество');
      return;
    }

    if (editExpiryDate) {
      const chosen = new Date(`${editExpiryDate}T00:00:00`);
      const today = new Date(`${todayDateStr}T00:00:00`);
      if (chosen < today) {
        alert('Дата годности не может быть в прошлом. Выберите сегодняшнюю или будущую дату.');
        return;
      }
    }

    if (!editMeasureId) {
      alert('Выберите меру продукта');
      return;
    }

    const trimmedComment = editComment.trim();
    const updates: ProductUpdatePayload = {
      count: numericCount,
      comment: trimmedComment ? trimmedComment : null,
      measureId: editMeasureId,
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
    setEditCount(item.count.toString());
    setEditComment(item.comment || '');
    setEditExpiryDate(item.expiryDate ? item.expiryDate.toISOString().slice(0, 10) : '');
    setEditMeasureId(item.measure?.id || '');
    setMeasureError('');
    setIsEditing(false);
  };

  const isExpiringSoon = item.expiryDate && item.expiryDate <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const isExpired = item.expiryDate && item.expiryDate < new Date();

  const expiryProgress = useMemo(() => {
    if (!item.expiryDate) return null;

    const createdAtStr = (item as any).createdAt as string | undefined;
    const parseDateLike = (d: unknown): Date | undefined => {
      if (!d) return undefined;
      if (d instanceof Date) return d;
      const parsed = new Date(d as any);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    };

    const createdAtDate = createdAtStr ? parseDateLike(createdAtStr) : undefined;
    const addedAtDate = parseDateLike(item.addedAt as unknown as any);
    const expiryDate = parseDateLike(item.expiryDate as unknown as any);
    if (!expiryDate) return null;

    const startMs = (createdAtDate || addedAtDate || new Date()).getTime();
    const endMs = expiryDate.getTime();
    const nowMs = Date.now();
    const total = Math.max(endMs - startMs, 0);
    if (total === 0) {
      return { percent: 100, level: 'danger' as 'ok' | 'warn' | 'danger' };
    }

    const elapsed = Math.min(Math.max(nowMs - startMs, 0), total);
    let percent = Math.round((elapsed / total) * 100);
    if (percent > 0 && percent < 2) percent = 2;

    const remainingRatio = 1 - elapsed / total;
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

  const circle = useMemo(() => {
    const size = 120;
    const stroke = 16;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const percent = expiryProgress?.percent ?? 0;
    const dash = Math.max(0, Math.min(100, percent)) / 100 * c;
    const gap = c - dash;
    const now = new Date();
    const toYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isToday = (d?: Date) => !!d && toYmd(d) === toYmd(now);
    const exp = item.expiryDate;
    const isExpiredNow = !!exp && exp.getTime() < now.getTime();
    const isSoon = !!exp && !isExpiredNow && exp.getTime() <= now.getTime() + 3 * 24 * 60 * 60 * 1000;
    const tone = isExpiredNow ? '#f87171' : (isToday(exp) || isSoon) ? '#fbbf24' : '#10b981';
    return { size, stroke, r, c, dash, gap, tone };
  }, [expiryProgress, item.expiryDate]);

  const measureLabel = item.measure?.name || '';

  return (
    <div className={`${styles.productItem} ${compact ? styles.compact : ''} ${isExpired ? styles.expired : isExpiringSoon ? styles.expiring : ''}`}>
      <div className={`${styles.imageContainer} ${compact ? styles.circleWrap : ''}`}>
        <div className={`${styles.imagePlaceholder} ${compact ? styles.circleInner : ''}`} aria-hidden="true" />
        {!compact && <div className={styles.imageOverlay} />}
        {compact && (
          <svg className={styles.circleSvg} width={circle.size} height={circle.size} viewBox={`0 0 ${circle.size} ${circle.size}`} aria-hidden="true">
            <circle cx={circle.size / 2} cy={circle.size / 2} r={circle.r} stroke="var(--color-gray-200)" strokeWidth={circle.stroke} fill="none" />
            <circle
              className={styles.circleProgress}
              cx={circle.size / 2}
              cy={circle.size / 2}
              r={circle.r}
              stroke={circle.tone}
              strokeWidth={circle.stroke}
              fill="none"
              strokeDasharray={circle.c}
              strokeDashoffset={circle.c - circle.dash}
              strokeLinecap="round"
              transform={`translate(${circle.size} 0) scale(-1 1) rotate(-90 ${circle.size / 2} ${circle.size / 2})`}
            />
          </svg>
        )}
        {item.ingredient.description && (
          <div className={styles.imageCaption}>
            <em>"{item.ingredient.description}"</em>
          </div>
        )}
        {!isEditing && item.comment && (
          <div className={styles.imageNote} title={item.comment}>
            <span>{item.comment}</span>
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
              disabled={measureLoading}
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
              <strong>
                {item.count}
                {measureLabel ? ` ${measureLabel}` : ''}
              </strong>
            </div>
            {!compact && item.expiryDate && (
              <div className={styles.expiry}>
                Годен до: {item.expiryDate.toLocaleDateString('ru-RU')}
              </div>
            )}
            {!compact && expiryProgress && (() => {
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
            })()}
            {compact && item.comment && (
              <div className={styles.compactNote} title={item.comment}>{item.comment}</div>
            )}
          </>
        ) : (
          <div className={styles.editForm}>
            <div className={styles.editRow}>
              <label>
                Количество:
                <input
                  type="number"
                  value={editCount}
                  onChange={(e) => setEditCount(e.target.value)}
                  min="0"
                  step="0.1"
                  className={styles.editInput}
                />
              </label>
            </div>
            <div className={styles.editRow}>
              <label>
                Мера продукта:
                <select
                  className={styles.editInput}
                  value={editMeasureId}
                  onChange={(e) => setEditMeasureId(e.target.value)}
                  disabled={measureLoading || measureOptions.length === 0}
                >
                  <option value="">
                    {measureLoading ? 'Загрузка мер…' : 'Выберите меру…'}
                  </option>
                  {measureOptions.map(measure => (
                    <option key={measure.id} value={measure.id}>
                      {measure.name || 'Без названия'}
                      {measure.weight ? ` · ${measure.weight}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              {measureError && <span className={styles.editError}>{measureError}</span>}
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
                Комментарий:
                <input
                  type="text"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Дополнительная информация"
                  className={styles.editInput}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
