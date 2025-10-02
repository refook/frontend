import React, { useState, useRef, useEffect } from 'react';
import type { ProductUnitType } from '../../types/measures.types';
import { API_BASE_URL } from '../../services/api';
import keycloak from '../../services/keycloak.ts';
import { PRODUCT_UNITS, PRODUCT_UNITS_ARRAY } from '../../constants/measures';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './IngredientPicker.module.css';
import type {ApiIngredient, CreateRecipeIngredientDto} from "../../types";
import { getAuthHeaders, authorizedFetch } from '../../services/auth';
import { productsService } from '../../services';

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
  const getIngredientKey = (productId: string, variant?: string | null) => (variant ? `${productId}::${variant}` : productId);

  type UnitsInfo = {
    units: typeof PRODUCT_UNITS_ARRAY;
    warning: string | null;
  };

  const [showForm, setShowForm] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<ApiIngredient | null>(null);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [allowedUnits, setAllowedUnits] = useState<typeof PRODUCT_UNITS_ARRAY>(PRODUCT_UNITS_ARRAY);
  const [variants, setVariants] = useState<Array<{ id: string; name: string }>>([]);
  const [variantId, setVariantId] = useState<string>('');
  const [unitWarning, setUnitWarning] = useState<string | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<ApiIngredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [ingredientUnitsMap, setIngredientUnitsMap] = useState<Record<string, UnitsInfo>>({});
  const ingredientUnitsMapRef = useRef<Record<string, UnitsInfo>>({});
  const [variantNameMap, setVariantNameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    ingredientUnitsMapRef.current = ingredientUnitsMap;
  }, [ingredientUnitsMap]);

  const fetchUnitsInfo = async (productId: string, variant?: string | null): Promise<UnitsInfo> => {
    try {
      const headers = getAuthHeaders();
      let measures: Array<{ name?: string }> = [];
      let variantFallbackUsed = false;

      if (variant) {
        const respVariant = await authorizedFetch(`${API_BASE_URL}/products/measures/variant/${variant}/all`, { headers });
        const variantMeasures = respVariant.ok ? await respVariant.json() : [];
        if (Array.isArray(variantMeasures) && variantMeasures.length > 0) {
          measures = variantMeasures;
        } else {
          variantFallbackUsed = true;
          const respBase = await authorizedFetch(`${API_BASE_URL}/products/measures/base/${productId}/all`, { headers });
          measures = respBase.ok ? await respBase.json() : [];
        }
      } else {
        const respBase = await authorizedFetch(`${API_BASE_URL}/products/measures/base/${productId}/all`, { headers });
        measures = respBase.ok ? await respBase.json() : [];
      }

      const allowedLabels = new Set((measures || []).map((m: any) => String(m?.name ?? '').trim()).filter(Boolean));
      const filtered = PRODUCT_UNITS_ARRAY.filter(u => allowedLabels.has(u.label));

      let warning: string | null = null;
      if (variant && filtered.length === 0 && !variantFallbackUsed) {
        warning = 'Для выбранного варианта нет доступных мер. Выберите другой вариант или продукт.';
      }

      return {
        units: filtered.length > 0 ? filtered : PRODUCT_UNITS_ARRAY,
        warning,
      };
    } catch (error) {
      console.error('IngredientPicker: не удалось загрузить меры продукта', error);
      return { units: PRODUCT_UNITS_ARRAY, warning: null };
    }
  };

  // Загружаем продукты (ингредиенты) из нового API
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setIngredientsLoading(true);
        console.log('IngredientPicker: Загрузка продуктов из API /products/all ...');
        const headers: Record<string, string> = getAuthHeaders();
        const resp = await authorizedFetch(`${API_BASE_URL}/products/all`, { headers });
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const apiProducts = await resp.json();
        setAvailableIngredients(apiProducts);
        console.log(`IngredientPicker: Загружено ${apiProducts.length} продуктов`);
      } catch (error) {
        console.error('IngredientPicker: Ошибка при загрузке продуктов:', error);
        // При ошибке API оставляем пустой массив
        setAvailableIngredients([]);
      } finally {
        setIngredientsLoading(false);
      }
    };

    loadIngredients();
  }, []);

  // Список продуктовых единиц измерения
  const suggestions = availableIngredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !ingredients.some(ing => ing.id === ingredient.id) &&
    searchTerm.length > 0
  );

  useEffect(() => {
    const loadUnitsForExisting = async () => {
      for (const ingredient of ingredients) {
        const variant = (ingredient as any)?.variantId ?? null;
        const key = getIngredientKey(ingredient.id, variant);
        if (!key || ingredientUnitsMapRef.current[key]) continue;
        const info = await fetchUnitsInfo(ingredient.id, variant);
        setIngredientUnitsMap(prev => {
          if (prev[key]) return prev;
          const next = { ...prev, [key]: info };
          ingredientUnitsMapRef.current = next;
          return next;
        });
      }
    };

    void loadUnitsForExisting();
  }, [ingredients]);

  // Подтягиваем названия вариантов для уже существующих ингредиентов (редактирование)
  useEffect(() => {
    let cancelled = false;
    const loadVariantNames = async () => {
      const toFetch = Array.from(new Set(
        ingredients
          .map((ing: any) => String(ing?.variantId || ''))
          .filter((id) => id && !variantNameMap[id])
      ));
      for (const vId of toFetch) {
        try {
          const variant = await productsService.getProductVariantById(vId);
          if (!cancelled && variant?.name) {
            setVariantNameMap((prev) => ({ ...prev, [vId]: variant.name }));
          }
        } catch {
          // ignore
        }
      }
    };
    void loadVariantNames();
    return () => { cancelled = true; };
  }, [ingredients, variantNameMap]);

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

      const key = getIngredientKey(selectedIngredient.id, variantId || null);
      const info: UnitsInfo = unitWarning
        ? { units: [], warning: unitWarning }
        : { units: allowedUnits.length > 0 ? allowedUnits : PRODUCT_UNITS_ARRAY, warning: null };
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

  const updateIngredient = (index: number, updates: Partial<CreateRecipeIngredientDto>) => {
    const next = [...ingredients];
    next[index] = { ...next[index], ...updates } as CreateRecipeIngredientDto;
    onChange(next);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
    setSelectedIngredient(null);
  };

  const handleSuggestionClick = (ingredient: ApiIngredient) => {
    setSelectedIngredient(ingredient);
    setSearchTerm(ingredient.name);
    // Сброс вариантов и юнитов под выбранный продукт
    setVariantId('');
    void loadVariantsAndMeasures(ingredient.id, '');
    setShowSuggestions(false);
  };

  const loadVariantsAndMeasures = async (productId: string, nextVariantId: string) => {
    try {
      // загрузим варианты продукта
      const headers = getAuthHeaders();
      const respVar = await authorizedFetch(`${API_BASE_URL}/products/variants/${productId}/all`, { headers });
      const variantList: Array<{ id: string; name: string }> = respVar.ok ? await respVar.json() : [];
      setVariants((variantList || []).map((v: any) => ({ id: v.id ?? v.uuid ?? v.value, name: v.name ?? v.title ?? 'Вариант' })).filter(v => v.id));

      const variantKey = nextVariantId || null;
      const unitsInfo = await fetchUnitsInfo(productId, variantKey);
      if (variantKey) {
        setUnitWarning(unitsInfo.warning);
      } else {
        setUnitWarning(null);
      }
      setAllowedUnits(unitsInfo.units);
      if (unitsInfo.units.length > 0) {
        const defaultUnit = unitsInfo.units.find(u => u.value === unit) || unitsInfo.units[0] || PRODUCT_UNITS.GRAM;
        setUnit((defaultUnit as any)?.value || 'GR');
      } else {
        setUnit('');
      }

      const key = getIngredientKey(productId, variantKey);
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
                {((ingredient as any).variantName)
                  || (ingredient as any).name
                  || ((ingredient as any).variantId && variantNameMap[(ingredient as any).variantId])
                  || availableIngredients.find(i => i.id === ingredient.id)?.name
                  || 'Неизвестный ингредиент'}
              </span>
              {(() => {
                const variant = (ingredient as any)?.variantId ?? null;
                const key = getIngredientKey(ingredient.id, variant);
                const info = ingredientUnitsMap[key];
                const hasInfo = Boolean(info);
                const warningMessage = info?.warning ?? null;
                let unitsList = hasInfo ? (info?.units ?? PRODUCT_UNITS_ARRAY) : PRODUCT_UNITS_ARRAY.filter(u => u.value === (ingredient as any).productUnit);

                if (unitsList.length > 0 && !(unitsList.some(u => u.value === (ingredient as any).productUnit))) {
                  const currentUnit = PRODUCT_UNITS_ARRAY.find(u => u.value === (ingredient as any).productUnit);
                  if (currentUnit) {
                    unitsList = [...unitsList, currentUnit];
                  }
                }

                if (unitsList.length === 0) {
                  const currentUnit = PRODUCT_UNITS_ARRAY.find(u => u.value === (ingredient as any).productUnit);
                  if (currentUnit) {
                    unitsList = [currentUnit];
                  }
                }

                const uniqueUnits: typeof PRODUCT_UNITS_ARRAY = [];
                const seenUnits = new Set<string>();
                unitsList.forEach(u => {
                  if (!seenUnits.has(u.value)) {
                    seenUnits.add(u.value);
                    uniqueUnits.push(u);
                  }
                });

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
                        value={(ingredient as any).productUnit || ''}
                        onChange={(e) => updateIngredient(index, { productUnit: e.target.value as ProductUnitType })}
                        disabled={!hasInfo || (Boolean(warningMessage) && (info?.units?.length ?? 0) === 0)}
                      >
                        {uniqueUnits.map(unitOption => (
                          <option key={unitOption.value} value={unitOption.value}>{unitOption.label}</option>
                        ))}
                        {!hasInfo && (
                          <option value="" disabled>Загрузка…</option>
                        )}
                      </select>
                    </label>
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
