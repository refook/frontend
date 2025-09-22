import React, { useEffect, useMemo, useRef, useState } from 'react';
import productsService from '../../services/productsService';
import type { ProductMeasureResponseDto, ProductResponseDto } from '../../types/api.types';
import styles from './AddProductForm.module.css';

export interface AddProductFormSubmitPayload {
  productId: string;
  isVariant: boolean;
  count: number;
  measureId: string;
  expiryDate?: string | null;
  comment?: string | null;
}

interface AddProductFormProps {
  onSubmit: (productData: AddProductFormSubmitPayload) => void;
  onCancel: () => void;
}

const getDefaultMeasureId = (list: ProductMeasureResponseDto[]): string => {
  return list.find(m => m.isDefault)?.id || list[0]?.id || '';
};

export const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, onCancel }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchTouched, setSearchTouched] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [variantOptions, setVariantOptions] = useState<ProductResponseDto[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  const [measureOptions, setMeasureOptions] = useState<ProductMeasureResponseDto[]>([]);
  const [selectedMeasureId, setSelectedMeasureId] = useState<string>('');
  const [measureLoading, setMeasureLoading] = useState(false);

  const measuresCacheRef = useRef<Map<string, ProductMeasureResponseDto[]>>(new Map());
  const variantsCacheRef = useRef<Map<string, ProductResponseDto[]>>(new Map());

  const [count, setCount] = useState<string>('1');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [selectedProductSummary, setSelectedProductSummary] = useState<{ id: string; name: string; description?: string } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isVariantSelected = useMemo(() => Boolean(selectedVariantId), [selectedVariantId]);
  const effectiveProductId = isVariantSelected ? selectedVariantId : selectedProductId;
  const effectiveMeasureCacheKey = effectiveProductId
    ? `${isVariantSelected ? 'variant' : 'base'}:${effectiveProductId}`
    : '';

  useEffect(() => {
    if (!searchTouched) {
      return;
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setSearchError(trimmed.length === 0 ? '' : 'Введите минимум 3 символа');
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    const runSearch = async () => {
      try {
        setSearchLoading(true);
        setSearchError('');
        const results = await productsService.searchProductsByName(trimmed);
        if (cancelled) return;
        const mapped = (results || []).map(product => ({
          id: product.id,
          name: product.name,
          description: product.description
        }));
        if (mapped.length === 0) {
          setSearchError('Ничего не найдено. Попробуйте другой запрос.');
        }
        setSearchResults(mapped);
      } catch (error) {
        if (cancelled) return;
        console.error('Ошибка поиска продуктов:', error);
        setSearchError('Не удалось выполнить поиск. Повторите попытку позже.');
        setSearchResults([]);
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    };

    const debounce = window.setTimeout(runSearch, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(debounce);
    };
  }, [searchQuery, searchTouched]);

  useEffect(() => {
    if (!selectedProductId) {
      setVariantOptions([]);
      setSelectedVariantId('');
      return;
    }

    const cached = variantsCacheRef.current.get(selectedProductId);
    if (cached) {
      setVariantOptions(cached);
      return;
    }

    let cancelled = false;
    const loadVariants = async () => {
      try {
        setVariantsLoading(true);
        const variants = await productsService.getProductVariantsByProduct(selectedProductId);
        if (!cancelled) {
          variantsCacheRef.current.set(selectedProductId, variants ?? []);
          setVariantOptions(variants ?? []);
        }
      } catch (error) {
        console.warn('Не удалось загрузить варианты продукта', { productId: selectedProductId, error });
        if (!cancelled) {
          setVariantOptions([]);
        }
      } finally {
        if (!cancelled) {
          setVariantsLoading(false);
        }
      }
    };

    void loadVariants();
    return () => {
      cancelled = true;
    };
  }, [selectedProductId]);

  useEffect(() => {
    if (!effectiveProductId) {
      setMeasureOptions([]);
      setSelectedMeasureId('');
      return;
    }

    const cached = measuresCacheRef.current.get(effectiveMeasureCacheKey);
    if (cached) {
      setMeasureOptions(cached);
      setSelectedMeasureId(prev => (prev && cached.some(m => m.id === prev) ? prev : getDefaultMeasureId(cached)));
      return;
    }

    let cancelled = false;
    const loadMeasures = async () => {
      try {
        setMeasureLoading(true);
        const list = isVariantSelected
          ? await productsService.getVariantMeasures(effectiveProductId, true)
          : await productsService.getBaseMeasures(effectiveProductId);
        const measures = Array.isArray(list) ? list : [];
        if (!cancelled) {
          measuresCacheRef.current.set(effectiveMeasureCacheKey, measures);
          setMeasureOptions(measures);
          setSelectedMeasureId(getDefaultMeasureId(measures));
          setErrors(prev => ({ ...prev, measureId: '' }));
        }
      } catch (error) {
        console.error('Не удалось загрузить меры продукта', {
          productId: effectiveProductId,
          isVariant: isVariantSelected,
          error
        });
        if (!cancelled) {
          setMeasureOptions([]);
          setSelectedMeasureId('');
          setErrors(prev => ({ ...prev, measureId: 'Не удалось загрузить меры продукта.' }));
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
  }, [effectiveProductId, effectiveMeasureCacheKey, isVariantSelected]);

  const resetFieldErrors = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleProductSelect = (product: { id: string; name: string; description?: string }) => {
    setSelectedProductId(product.id);
    setSelectedVariantId('');
    setSelectedMeasureId('');
    setMeasureOptions([]);
    setSearchQuery(product.name);
    setSearchTouched(false);
    setSearchError('');
    setSearchResults([]);
    setSelectedProductSummary(product);
    resetFieldErrors('product');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSearchTouched(true);
    setSearchError('');
    setSearchResults([]);
    setSelectedProductId('');
    setSelectedVariantId('');
    setSelectedMeasureId('');
    setMeasureOptions([]);
    setVariantOptions([]);
    setSelectedProductSummary(null);
  };

  const handleClearSelection = () => {
    setSearchQuery('');
    setSearchTouched(false);
    setSearchResults([]);
    setSearchError('');
    setSelectedProductId('');
    setSelectedVariantId('');
    setSelectedMeasureId('');
    setMeasureOptions([]);
    setVariantOptions([]);
    setSelectedProductSummary(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedProductId) {
      newErrors.product = 'Выберите продукт';
    }

    if (!count || Number.isNaN(Number(count)) || Number(count) <= 0) {
      newErrors.count = 'Введите корректное количество';
    }

    if (!selectedMeasureId) {
      newErrors.measureId = 'Выберите меру продукта';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    if (!effectiveProductId || !selectedMeasureId) {
      return;
    }

    const numericCount = Number(count);
    const trimmedComment = comment.trim();

    onSubmit({
      productId: effectiveProductId,
      isVariant: isVariantSelected,
      count: numericCount,
      measureId: selectedMeasureId,
      expiryDate: expiryDate ? expiryDate : null,
      comment: trimmedComment ? trimmedComment : null
    });
  };

  return (
    <div className={styles.addProductForm}>
      <div className={styles.header}>
        <h3 className={styles.title}>Добавить продукт</h3>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onCancel}
          aria-label="Закрыть форму"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Продукт <span className={styles.required}>*</span>
            {errors.product && <span className={styles.error}>{errors.product}</span>}
          </label>
          <div className={styles.searchGroup}>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Введите название продукта"
              className={`${styles.input} ${styles.searchInput} ${errors.product ? styles.inputError : ''}`.trim()}
            />
            {(searchQuery || selectedProductId) && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearSelection}
                aria-label="Очистить выбранный продукт"
              >
                ×
              </button>
            )}
          </div>
          {selectedProductSummary && (
            <div className={styles.selectedInfo}>
              <span className={styles.selectedLabel}>Выбран продукт:</span>
              <span className={styles.selectedName}>{selectedProductSummary.name}</span>
              {selectedProductSummary.description && (
                <span className={styles.selectedDescription}>{selectedProductSummary.description}</span>
              )}
            </div>
          )}
          {searchLoading && (
            <div className={styles.searchStatus}>Поиск продуктов…</div>
          )}
          {!searchLoading && searchError && (
            <div className={searchError.startsWith('Введите минимум') ? styles.searchStatus : styles.error}>
              {searchError}
            </div>
          )}
          {!searchLoading && searchResults.length > 0 && (
            <ul className={styles.searchResults}>
              {searchResults.map(result => (
                <li key={result.id}>
                  <button
                    type="button"
                    className={styles.searchResultButton}
                    onClick={() => handleProductSelect(result)}
                  >
                    <span className={styles.resultName}>{result.name}</span>
                    {result.description && (
                      <span className={styles.resultDescription}>{result.description}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(variantsLoading || variantOptions.length > 0) && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Вариант продукта
            </label>
            <select
              value={selectedVariantId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedVariantId(nextId);
                setSelectedMeasureId('');
                setMeasureOptions([]);
              }}
              className={styles.select}
              disabled={variantsLoading}
            >
              <option value="">Базовый продукт</option>
              {variantOptions.map(variant => (
                <option key={variant.id} value={variant.id}>
                  {variant.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Количество <span className={styles.required}>*</span>
              {errors.count && <span className={styles.error}>{errors.count}</span>}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={count}
              onChange={(e) => {
                setCount(e.target.value);
                resetFieldErrors('count');
              }}
              className={`${styles.input} ${errors.count ? styles.inputError : ''}`.trim()}
              placeholder="0"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Мера продукта <span className={styles.required}>*</span>
              {errors.measureId && <span className={styles.error}>{errors.measureId}</span>}
            </label>
            <select
              value={selectedMeasureId}
              onChange={(e) => {
                setSelectedMeasureId(e.target.value);
                resetFieldErrors('measureId');
              }}
            className={`${styles.select} ${errors.measureId ? styles.inputError : ''}`.trim()}
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
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Срок годности</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className={styles.input}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Комментарий</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={styles.textarea}
            placeholder="Например: открыл вчера"
            rows={3}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={`${styles.cancelButton} ui-btn ui-btn--ghost`}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={`${styles.submitButton} ui-btn ui-btn--primary`}
            disabled={searchLoading || measureLoading}
          >
            Добавить продукт
          </button>
        </div>
      </form>
    </div>
  );
};
