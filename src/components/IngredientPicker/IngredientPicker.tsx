import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ProductUnitType } from '../../types/measures.types';
import { PRODUCT_UNITS, PRODUCT_UNITS_ARRAY } from '../../constants/measures';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './IngredientPicker.module.css';
import type { CreateRecipeIngredientDto } from '../../types';
import type { ProductMeasureResponseDto } from '../../types/api.types';
import { useVariantNames } from '../../hooks/useVariantNames';
import { useProductMeasureCache } from '../../hooks/useProductMeasureCache';
import { resolveIngredientIdentifiers } from '../../utils/recipeIngredient';
import { useAvailableIngredients, type AvailableIngredient } from '../../hooks/useAvailableIngredients';
import { productsService } from '../../services/productsService';

interface IngredientPickerProps {
  ingredients: CreateRecipeIngredientDto[];
  onChange: (ingredients: CreateRecipeIngredientDto[]) => void;
  errors?: Record<string, string>;
  compact?: boolean;
}

/**
 * React-компонент для управления списком ингредиентов рецепта.
 *
 * Позволяет:
 * - искать ингредиенты в каталоге продуктов и добавлять их в рецепт;
 * - выбирать допустимые единицы измерения из API (с учётом выбранного варианта продукта);
 * - редактировать количество и меру уже добавленных ингредиентов без пересоздания записи;
 * - отображать сообщения об ошибках валидации, приходящие «сверху».
 *
 * Компонент кэширует справочную информацию по единицам измерения (`fetchUnitsInfo`)
 * и повторно использует её для уже добавленных ингредиентов, чтобы исключить лишние запросы.
 * Поэтому при редактировании меры показывается только тот набор, который возвращает API.
 * Пока данные ещё загружаются, переключатель меры блокируется и отображает «Загрузка…».
 *
 * @param {IngredientPickerProps} props
 * @param {CreateRecipeIngredientDto[]} props.ingredients Текущий список ингредиентов рецепта.
 * @param {(ingredients: CreateRecipeIngredientDto[]) => void} props.onChange Колбэк для уведомления родителя об изменении списка.
 * @param {Record<string, string>} [props.errors] Ошибки валидации по конкретным полям ингредиентов (например `ingredients.0.count`).
 * @param {boolean} [props.compact=false] Флаг для упрощённого режима отображения (не используется в текущей реализации, зарезервирован для будущего).
 */
const IngredientPicker: React.FC<IngredientPickerProps> = ({
  ingredients,
  onChange,
  errors = {},
  compact = false
}) => {
  const getIngredientKey = (productId: string, variant?: string | null, isVariant?: boolean) => {
    if (variant) return `variant:${variant}`;
    if (isVariant && productId) return `variant:${productId}`;
    if (productId) return `base:${productId}`;
    return '';
  };

  const resolveMeasureContext = (ingredient: unknown): {
    baseProductId?: string;
    variantId?: string;
    isVariant: boolean;
  } => {
    const meta = resolveIngredientIdentifiers(ingredient);
    return {
      baseProductId: meta.baseProductId,
      variantId: meta.variantId,
      isVariant: meta.isVariant,
    };
  };

  const normalizeMeasureLabel = (label?: string): string => {
    if (typeof label !== 'string') return '';
    return label
      .toLowerCase()
      .replace(/[\.,]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const MEASURE_ALIASES: Record<string, ProductUnitType> = {
    'шт': PRODUCT_UNITS.PIECE.value,
    'штук': PRODUCT_UNITS.PIECE.value,
    'штука': PRODUCT_UNITS.PIECE.value,
    'штуки': PRODUCT_UNITS.PIECE.value,
    'шту': PRODUCT_UNITS.PIECE.value,
    'ед': PRODUCT_UNITS.PIECE.value,
    'единица': PRODUCT_UNITS.PIECE.value,
    'единицы': PRODUCT_UNITS.PIECE.value,
    'порц': PRODUCT_UNITS.PORTION.value,
    'порция': PRODUCT_UNITS.PORTION.value,
    'порции': PRODUCT_UNITS.PORTION.value,
    'ч ложка': PRODUCT_UNITS.TEASPOON.value,
    'ложка чайная': PRODUCT_UNITS.TEASPOON.value,
    'чайная ложка': PRODUCT_UNITS.TEASPOON.value,
    'ст ложка': PRODUCT_UNITS.TABLESPOON.value,
    'столовая ложка': PRODUCT_UNITS.TABLESPOON.value,
    'ложка столовая': PRODUCT_UNITS.TABLESPOON.value,
    'гр': PRODUCT_UNITS.GRAM.value,
    'грамм': PRODUCT_UNITS.GRAM.value,
    'граммы': PRODUCT_UNITS.GRAM.value,
    'кг': PRODUCT_UNITS.KILOGRAM.value,
    'килограмм': PRODUCT_UNITS.KILOGRAM.value,
    'килограммы': PRODUCT_UNITS.KILOGRAM.value,
    'мл': PRODUCT_UNITS.MILLILITER.value,
    'миллилитр': PRODUCT_UNITS.MILLILITER.value,
    'миллилитры': PRODUCT_UNITS.MILLILITER.value,
  };

  const findUnitValueForMeasureName = (measureName?: string): ProductUnitType | undefined => {
    const normalizedName = normalizeMeasureLabel(measureName);
    if (!normalizedName) return undefined;

    const aliasMatch = MEASURE_ALIASES[normalizedName];
    if (aliasMatch) return aliasMatch;

    const exactMatch = PRODUCT_UNITS_ARRAY.find(u => normalizeMeasureLabel(u.label) === normalizedName);
    if (exactMatch) return exactMatch.value as ProductUnitType;

    const fuzzyMatch = PRODUCT_UNITS_ARRAY.find((u) => {
      const normalizedUnit = normalizeMeasureLabel(u.label);
      return normalizedUnit.includes(normalizedName) || normalizedName.includes(normalizedUnit);
    });

    return fuzzyMatch?.value as ProductUnitType | undefined;
  };

  type UnitsInfo = {
    units: typeof PRODUCT_UNITS_ARRAY;
    warning: string | null;
    measures: ProductMeasureResponseDto[];
  };

  const { getMeasures } = useProductMeasureCache();

  const [showForm, setShowForm] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<AvailableIngredient | null>(null);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [allowedUnits, setAllowedUnits] = useState<typeof PRODUCT_UNITS_ARRAY>(PRODUCT_UNITS_ARRAY);
  const [variants, setVariants] = useState<Array<{ id: string; name: string }>>([]);
  const [variantId, setVariantId] = useState<string>('');
  const [unitWarning, setUnitWarning] = useState<string | null>(null);
  const { ingredients: availableIngredients, loading: ingredientsLoading } = useAvailableIngredients(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [ingredientUnitsMap, setIngredientUnitsMap] = useState<Record<string, UnitsInfo>>({});
  const ingredientUnitsMapRef = useRef<Record<string, UnitsInfo>>({});
  const lastUnitsInfoRef = useRef<UnitsInfo | null>(null);
  const variantNameMap = useVariantNames(useMemo(() => ingredients as unknown[], [ingredients]));

  useEffect(() => {
    ingredientUnitsMapRef.current = ingredientUnitsMap;
  }, [ingredientUnitsMap]);

  const fetchUnitsInfo = async (
    params: { baseProductId?: string; variantId?: string | null; isVariant?: boolean }
  ): Promise<UnitsInfo> => {
    const baseId = params.baseProductId?.trim() || undefined;
    const variantId = params.variantId?.trim() || undefined;
    const isVariant = Boolean(variantId || params.isVariant);

    try {
      const measures = await getMeasures({
        baseProductId: baseId,
        variantId,
      });

      const allowedLabels = new Set(
        (measures || [])
          .map((m: ProductMeasureResponseDto) => String(m?.name ?? '').trim())
          .filter(Boolean),
      );

      const filtered = allowedLabels.size > 0
        ? PRODUCT_UNITS_ARRAY.filter((u) => allowedLabels.has(u.label))
        : [];

      let warning: string | null = null;
      if (isVariant && filtered.length === 0) {
        warning = 'Для выбранного варианта нет доступных мер. Выберите другой вариант или продукт.';
      } else if (!isVariant && filtered.length === 0 && (measures?.length ?? 0) === 0) {
        warning = 'Для продукта нет доступных мер. Добавьте их в админке.';
      }

      return {
        units: filtered,
        warning,
        measures,
      };
    } catch (error) {
      console.error('IngredientPicker: не удалось загрузить меры продукта', error);
      return { units: [], warning: 'Не удалось загрузить меры продукта.', measures: [] };
    }
  };

  // Загружаем продукты (ингредиенты) из нового API
  // Список продуктовых единиц измерения
  const suggestions = availableIngredients.filter((ingredient) => {
    if (searchTerm.length === 0) return false;
    const term = searchTerm.toLowerCase();
    const nameMatch = ingredient.name.toLowerCase().includes(term);
    const descriptionMatch = ingredient.description?.toLowerCase().includes(term) ?? false;
    const alreadySelected = ingredients.some((ing) => ing.id === ingredient.id);
    return (nameMatch || descriptionMatch) && !alreadySelected;
  });

  useEffect(() => {
    const loadUnitsForExisting = async () => {
      const updatesMap = new Map<number, Record<string, unknown>>();

      const scheduleUpdate = (idx: number, update: Record<string, unknown>) => {
        if (Object.keys(update).length === 0) return;
        const existing = updatesMap.get(idx) ?? {};
        updatesMap.set(idx, { ...existing, ...update });
      };

      for (let index = 0; index < ingredients.length; index++) {
        const ingredient = ingredients[index];
        const context = resolveMeasureContext(ingredient as any);
        const cacheKeySeed = context.baseProductId || context.variantId;
        if (!cacheKeySeed) continue;
        const key = getIngredientKey(cacheKeySeed, context.variantId, context.isVariant);
        const hasCached = Boolean(key && ingredientUnitsMapRef.current[key]);
        const info = hasCached
          ? ingredientUnitsMapRef.current[key]
          : await fetchUnitsInfo({
            baseProductId: context.baseProductId,
            variantId: context.variantId,
            isVariant: context.isVariant,
          });

        if (!hasCached && key) {
          setIngredientUnitsMap(prev => {
            if (prev[key]) return prev;
            const next = { ...prev, [key]: info };
            ingredientUnitsMapRef.current = next;
            return next;
          });
        }

        const measureId = (ingredient as any)?.productMeasureId as string | undefined;
        const currentUnitValue = (ingredient as any)?.productUnit as string | undefined;
        const measures = info.measures ?? [];

        if (context.variantId) {
          const currentVariantName = (ingredient as any)?.variantName || (ingredient as any)?.variant?.name;
          if (!currentVariantName) {
            const cachedVariantName = variantNameMap[context.variantId];
            if (cachedVariantName) {
              scheduleUpdate(index, { variantName: cachedVariantName });
            } else {
              try {
                const variant = await productsService.getProductVariantById(context.variantId);
                const resolvedName =
                  (variant as any)?.name ??
                  (variant as any)?.variantName ??
                  (variant as any)?.title ??
                  (variant as any)?.label ??
                  (variant as any)?.product?.name ??
                  (variant as any)?.productName;
                if (typeof resolvedName === 'string' && resolvedName.trim().length > 0) {
                  scheduleUpdate(index, { variantName: resolvedName.trim() });
                }
              } catch (error) {
                console.warn('Не удалось получить название варианта продукта', error);
              }
            }
          }
        }

        if (measures.length === 0) continue;

        if (measureId) {
          const matchedMeasure = measures.find(m => m.id === measureId);
          if (matchedMeasure) {
            const matchingUnit = findUnitValueForMeasureName(matchedMeasure.name);
            if (matchingUnit && matchingUnit !== currentUnitValue) {
              scheduleUpdate(index, { productUnit: matchingUnit });
            }
          }
          continue;
        }

        const unitLabel = PRODUCT_UNITS_ARRAY.find(u => u.value === currentUnitValue)?.label;
        let selectedMeasure = unitLabel
          ? measures.find(m => normalizeMeasureLabel(m.name) === normalizeMeasureLabel(unitLabel))
          : undefined;

        if (!selectedMeasure) {
          selectedMeasure = measures.find(m => m.isDefault) ?? measures[0];
        }

        if (selectedMeasure) {
          const updatePayload: Record<string, unknown> = { productMeasureId: selectedMeasure.id };
          const derivedUnit = findUnitValueForMeasureName(selectedMeasure.name);
          if (derivedUnit && derivedUnit !== currentUnitValue) {
            updatePayload.productUnit = derivedUnit;
          }
          scheduleUpdate(index, updatePayload);
        }
      }

      if (updatesMap.size > 0) {
        const next = ingredients.map((ingredient, idx) => {
          const update = updatesMap.get(idx);
          if (!update) return ingredient;
          const nextIngredient: any = { ...ingredient, ...update };
          return nextIngredient as CreateRecipeIngredientDto;
        });
        onChange(next);
      }
    };

    void loadUnitsForExisting();
  }, [ingredients, onChange, variantNameMap]);

  const addIngredient = () => {
    if (selectedIngredient && amount.trim() && unit) {
      const newIngredient: CreateRecipeIngredientDto = {
        id: selectedIngredient.id,
        count: parseInt(amount.trim()) || 0,
        productUnit: unit as ProductUnitType
      };
      
      const payload: any = { ...newIngredient };
      if (variantId) {
        payload.variantId = variantId;
        const v = variants.find(v => v.id === variantId);
        if (v?.name) payload.variantName = v.name;
      }

      onChange([...ingredients, payload]);

      const key = getIngredientKey(selectedIngredient.id, variantId || null, Boolean(variantId));
      const infoSource = lastUnitsInfoRef.current;
      const info: UnitsInfo = infoSource
        ? {
          units: [...(infoSource.units || PRODUCT_UNITS_ARRAY)],
          warning: infoSource.warning,
          measures: [...(infoSource.measures || [])],
        }
        : {
          units: allowedUnits,
          warning: unitWarning ?? null,
          measures: [],
        };
      setIngredientUnitsMap(prev => {
        const next = { ...prev, [key]: info };
        ingredientUnitsMapRef.current = next;
        return next;
      });
      
      // Сбрасываем форму
      setSelectedIngredient(null);
      setSearchTerm('');
      setAmount('');
      setUnit('');
      setVariantId('');
      setVariants([]);
      setAllowedUnits(PRODUCT_UNITS_ARRAY);
      setUnitWarning(null);
      setShowForm(false);
      setShowSuggestions(false);
    }
  };

  const removeIngredient = (id: string) => {
    onChange(ingredients.filter(ing => ing.id !== id));
  };

  const updateIngredient = (index: number, updates: Partial<CreateRecipeIngredientDto> & Record<string, unknown>) => {
    const next = [...ingredients];
    const current: any = next[index] ?? {};
    const nextIngredient: any = { ...current, ...updates };
    next[index] = nextIngredient as CreateRecipeIngredientDto;
    onChange(next);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
    setSelectedIngredient(null);
  };

  const handleSuggestionClick = (ingredient: AvailableIngredient) => {
    setSelectedIngredient(ingredient);
    setSearchTerm(ingredient.name);
    // Сброс вариантов и юнитов под выбранный продукт
    setVariantId('');
    void loadVariantsAndMeasures(ingredient.id, '');
    setShowSuggestions(false);
  };

  const loadVariantsAndMeasures = async (productId: string, nextVariantId: string) => {
    try {
      const variantList = await productsService.getProductVariantsByProduct(productId);
      setVariants(
        (variantList || [])
          .map((variant) => {
            const record = variant as any;
            const rawName =
              record?.name ??
              record?.variantName ??
              record?.title ??
              record?.label ??
              record?.product?.name ??
              record?.productName;

            const fallbackName = typeof rawName === 'string' && rawName.trim().length > 0 ? rawName.trim() : 'Вариант';

            return {
              id: variant.id,
              name: fallbackName,
            };
          })
          .filter((variant) => Boolean(variant.id)),
      );

      const variantKey = nextVariantId || null;
      const unitsInfo = await fetchUnitsInfo({
        baseProductId: productId,
        variantId: variantKey,
        isVariant: Boolean(variantKey),
      });

      lastUnitsInfoRef.current = unitsInfo;

      setUnitWarning(unitsInfo.warning ?? null);
      setAllowedUnits(unitsInfo.units);
      if (unitsInfo.units.length > 0) {
        const defaultUnit = unitsInfo.units.find(u => u.value === unit) || unitsInfo.units[0];
        setUnit((defaultUnit as any)?.value || '');
      } else {
        setUnit('');
      }

      const key = getIngredientKey(productId, variantKey, Boolean(variantKey));
      setIngredientUnitsMap(prev => {
        const next = { ...prev, [key]: unitsInfo };
        ingredientUnitsMapRef.current = next;
        return next;
      });
    } catch {
      setVariants([]);
      setAllowedUnits(PRODUCT_UNITS_ARRAY);
      setUnitWarning(null);
      setUnit('GR');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIngredient();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={styles.ingredientPicker}>
      {/* Список ингредиентов */}
      <div className={styles.ingredientsList}>
        {ingredients.map((ingredient, index) => (
          <div key={ingredient.id} className={styles.ingredientItem}>
            <div className={styles.ingredientInfo}>
              <span className={styles.ingredientName}>
                {(() => {
                  const raw = ingredient as any;
                  const resolvedVariantId = raw.variantId || (raw.isVariant ? raw.id : undefined);
                  const baseProductId = raw.baseProductId || raw.productId || raw.id;

                  const variantName =
                    raw.variantName ||
                    raw.variant?.name ||
                    (resolvedVariantId ? variantNameMap[resolvedVariantId] : undefined);

                  const baseName =
                    availableIngredients.find((item) => item.id === baseProductId)?.name ||
                    raw.name;

                  return variantName || baseName || 'Неизвестный ингредиент';
                })()}
              </span>
              {(() => {
                const context = resolveMeasureContext(ingredient as any);
                const cacheSeed = context.baseProductId || context.variantId || ingredient.id;
                const key = cacheSeed ? getIngredientKey(cacheSeed, context.variantId, context.isVariant) : '';
                const info = key ? ingredientUnitsMap[key] : undefined;
                const hasInfo = Boolean(info);
                const warningMessage = info?.warning ?? null;
                const measures = info?.measures ?? [];
                const hasMeasures = measures.length > 0;
                const currentMeasureId = (ingredient as any).productMeasureId as string | undefined;
                const currentUnitValue = (ingredient as any).productUnit;

                const measureOptions = hasMeasures
                  ? measures
                      .filter((measure) => typeof measure?.id === 'string')
                      .map((measure) => ({
                        id: measure.id,
                        name: measure.name ?? (measure.id ?? 'Мера'),
                        unitValue: findUnitValueForMeasureName(measure.name),
                      }))
                  : [];

                if (hasMeasures && currentMeasureId && !measureOptions.some(opt => opt.id === currentMeasureId)) {
                  const fallbackLabel = PRODUCT_UNITS_ARRAY.find(u => u.value === currentUnitValue)?.label
                    || measureOptions[0]?.name
                    || 'Текущая мера';
                  measureOptions.push({
                    id: currentMeasureId,
                    name: fallbackLabel,
                    unitValue: findUnitValueForMeasureName(fallbackLabel),
                  });
                }

                let unitsList = hasInfo ? (info?.units ?? []) : [];

                if (!hasInfo) {
                  const currentUnit = PRODUCT_UNITS_ARRAY.find(u => u.value === currentUnitValue);
                  if (currentUnit) unitsList = [currentUnit];
                } else if (!hasMeasures) {
                  if (unitsList.length === 0) {
                    const currentUnit = PRODUCT_UNITS_ARRAY.find(u => u.value === currentUnitValue);
                    if (currentUnit) unitsList = [currentUnit];
                  } else if (currentUnitValue && !unitsList.some(u => u.value === currentUnitValue)) {
                    const currentUnit = PRODUCT_UNITS_ARRAY.find(u => u.value === currentUnitValue);
                    if (currentUnit) {
                      unitsList = [...unitsList, currentUnit];
                    }
                  }
                }

                const uniqueUnits: typeof PRODUCT_UNITS_ARRAY = [];
                if (!hasMeasures) {
                  const seenUnits = new Set<string>();
                  unitsList.forEach(u => {
                    if (!seenUnits.has(u.value)) {
                      seenUnits.add(u.value);
                      uniqueUnits.push(u);
                    }
                  });
                }

                const selectValue = hasMeasures
                  ? (currentMeasureId ?? (measureOptions[0]?.id ?? ''))
                  : (currentUnitValue || '');

                const displayMeasureLabel = hasMeasures
                  ? measureOptions.find(opt => opt.id === (currentMeasureId || selectValue))?.name
                  : PRODUCT_UNITS_ARRAY.find(u => u.value === currentUnitValue)?.label;

                return (
                  <div className={styles.ingredientControls}>
                    <label className={styles.controlLabel}>
                      Кол-во
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={Number(ingredient.count) || 0}
                        onChange={(e) => updateIngredient(index, { count: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className={styles.controlInput}
                      />
                    </label>
                    <label className={styles.controlLabel}>
                      Мера
                      <select
                        className={styles.controlSelect}
                        value={selectValue}
                        onChange={(e) => {
                          if (hasMeasures) {
                            const selectedMeasureId = e.target.value;
                            if (selectedMeasureId === currentMeasureId) return;
                            const selectedMeasure = measureOptions.find(opt => opt.id === selectedMeasureId);
                            if (!selectedMeasure) return;
                            const updates: any = {
                              productMeasureId: selectedMeasure.id,
                            };
                            if (selectedMeasure.unitValue) {
                              updates.productUnit = selectedMeasure.unitValue;
                            }
                            updateIngredient(index, updates);
                          } else {
                            const nextUnit = e.target.value as ProductUnitType;
                            if (nextUnit === currentUnitValue) return;
                            updateIngredient(index, { productUnit: nextUnit });
                          }
                        }}
                        disabled={!hasInfo || (hasMeasures ? measureOptions.length === 0 : uniqueUnits.length === 0)}
                      >
                        {hasMeasures
                          ? measureOptions.map(option => (
                            <option key={option.id} value={option.id}>{option.name}</option>
                          ))
                          : uniqueUnits.map(unitOption => (
                            <option key={unitOption.value} value={unitOption.value}>{unitOption.label}</option>
                          ))}
                        {!hasInfo && !hasMeasures && (
                          <option value="" disabled>Загрузка…</option>
                        )}
                      </select>
                    </label>
                    {displayMeasureLabel && (
                      <span style={{ marginLeft: 6, color: 'var(--token-muted)', fontSize: 12 }}>
                        {displayMeasureLabel}
                      </span>
                    )}
                    {warningMessage && (
                      <div className={styles.controlWarning}>{warningMessage}</div>
                    )}
                  </div>
                );
              })()}
              {errors[`ingredients.${index}.count`] && (
                <span className={styles.errorText}>
                  {errors[`ingredients.${index}.count`]}
                </span>
              )}
              {errors[`ingredients.${index}.measure`] && (
                <span className={styles.errorText}>
                  {errors[`ingredients.${index}.measure`]}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeIngredient(ingredient.id)}
              className={styles.removeButton}
              title={`Удалить ингредиент "${availableIngredients.find(i => i.id === ingredient.id)?.name || 'Неизвестный ингредиент'}"`}
            >
              <XMarkIcon className={styles.removeIcon} />
            </button>
          </div>
        ))}
      </div>

      {/* Форма добавления */}
      {showForm ? (
        <div className={styles.addForm}>
          <div className={styles.formRow}>
            <div className={styles.nameGroup}>
              <label className={styles.label}>Название *</label>
              <div className={styles.inputContainer}>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder={ingredientsLoading ? "Загрузка..." : "Начните вводить название"}
                  className={styles.input}
                  disabled={ingredientsLoading}
                  required
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {suggestions.slice(0, 5).map(ingredient => (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() => handleSuggestionClick(ingredient)}
                        className={styles.suggestion}
                      >
                        {ingredient.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.amountGroup}>
              <label className={styles.label}>Количество</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className={styles.input}
              />
            </div>

            {/* Вариант продукта (опционально) */}
            {selectedIngredient && (
              <div className={styles.unitGroup}>
                <label className={styles.label}>Вариант продукта</label>
                <select
                  value={variantId}
                  onChange={async (e) => {
                    const vId = e.target.value;
                    setVariantId(vId);
                    await loadVariantsAndMeasures(selectedIngredient.id, vId);
                  }}
                  className={styles.select}
                >
                  <option value="">Оригинал</option>
                  {variants.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            )}

            {unitWarning ? (
              <div className={styles.unitGroup}>
                <label className={styles.label}>Единица</label>
                <div className={styles.errorText}>{unitWarning}</div>
              </div>
            ) : (
              <div className={styles.unitGroup}>
                <label className={styles.label}>Единица</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={styles.select}
                >
                  <option value="">Выберите</option>
                  {allowedUnits.map(u => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSelectedIngredient(null);
                setSearchTerm('');
                setAmount('');
                setUnit('');
                setShowSuggestions(false);
              }}
              className={styles.cancelButton}
            >
              Отмена
            </button>
            <button
              type="button"
              className={styles.addButton}
              onClick={addIngredient}
              disabled={!selectedIngredient || !amount.trim() || !unit}
            >
              Добавить
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setTimeout(() => nameInputRef.current?.focus(), 100);
          }}
          className={styles.showFormButton}
        >
          <PlusIcon className={styles.plusIcon} />
          Добавить ингредиент
        </button>
      )}
    </div>
  );
};

export default IngredientPicker; 
