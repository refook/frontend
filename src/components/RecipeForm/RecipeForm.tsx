import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';
import { BASE_UNITS_ARRAY, PRODUCT_UNITS, PRODUCT_UNITS_ARRAY, RECIPE_UNITS_ARRAY } from '../../constants/measures';
import type {
  CreateRecipeDto,
  KitchenType,
  DifficultyLevel,
  ApiCreateRecipeDto,
  ApiUpdateStepDto,
  ApiUpdateRecipeIngredientDto,
} from '../../types/recipe.types';
import type { ProductMeasureResponseDto } from '../../types/api.types';
import { productsService } from '../../services';
import IngredientPicker from '../IngredientPicker/IngredientPicker';
import StepsEditor, { type StepIngredientOveruse } from '../StepsEditor/StepsEditor';
import TagsInput from '../TagsInput/TagsInput';
import { PhotoIcon } from '@heroicons/react/24/outline';
import styles from './RecipeForm.module.css';
import { getAuthHeaders, authorizedFetch } from '../../services/auth';
import KitchensService from '../../services/kitchensService';

interface RecipeFormProps {
  initialData: CreateRecipeDto;
  onChange: (data: CreateRecipeDto) => void;
  onSubmit: (data: ApiCreateRecipeDto) => void;
  isSubmitting: boolean;
  isValid: boolean;
  mode?: 'create' | 'edit';
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  onChange,
  onSubmit,
  isSubmitting,
  isValid,
  mode = 'create'
}) => {
  // Нормализация кухонь: всегда храним массив строк-id
  const normalizeKitchenIds = (list: unknown): string[] => {
    if (!Array.isArray(list)) return [];
    return list
      .map((item: any) => (typeof item === 'string' ? item : (item?.id ?? item?.uuid ?? item?.value)))
      .filter(Boolean);
  };
  const [formData, setFormData] = useState<CreateRecipeDto>({
    name: initialData.name || '',
    description: initialData.description || '',
    level: initialData.level || 'EASY',
    kitchens: normalizeKitchenIds((initialData as any).kitchens) || [],
    cookTime: initialData.cookTime || 0,
    allTime: initialData.allTime || 0,
    
    photos: initialData.photos || [],
    tags: initialData.tags || [],
    ingredients: initialData.ingredients || [],
    steps: initialData.steps || [],
    baseUnit: initialData.baseUnit || 'GR',
    avgWeight: initialData.avgWeight || 100,
    unit: initialData.unit || 'GRAM',
    macros: initialData.macros || { calories: 0, proteins: 0, fats: 0, carbs: 0 },
    recipeUnit: initialData.recipeUnit || 'PORTION',
    unitCount: (initialData as any).unitCount ?? 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepIngredientOveruses, setStepIngredientOveruses] = useState<StepIngredientOveruse[]>([]);

  // Синхронизируем локальное состояние с пропсом при изменении initialData
  useEffect(() => {
    setFormData({
      name: initialData.name || '',
      description: initialData.description || '',
      level: initialData.level || 'EASY',
      kitchens: normalizeKitchenIds((initialData as any).kitchens) || [],
      cookTime: initialData.cookTime || 0,
      allTime: initialData.allTime || 0,
      
      photos: initialData.photos || [],
      tags: initialData.tags || [],
      ingredients: initialData.ingredients || [],
      steps: initialData.steps || [],
      baseUnit: initialData.baseUnit || 'GR',
      avgWeight: initialData.avgWeight || 100,
      unit: initialData.unit || 'GRAM',
      macros: initialData.macros || { calories: 0, proteins: 0, fats: 0, carbs: 0 },
      recipeUnit: initialData.recipeUnit || 'PORTION',
      unitCount: (initialData as any).unitCount ?? 1
    });
  }, [initialData]);

  useEffect(() => {
    setErrors(prev => {
      const hasOver = stepIngredientOveruses.length > 0;
      const hasPrev = Boolean(prev['steps.overuse']);
      if (hasOver && !hasPrev) {
        return {
          ...prev,
          'steps.overuse': 'Суммарное количество ингредиентов в шагах превышает доступное количество из основного списка',
        };
      }
      if (!hasOver && hasPrev) {
        const { ['steps.overuse']: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, [stepIngredientOveruses]);

  const updateField = <K extends keyof CreateRecipeDto>(
    field: K,
    value: CreateRecipeDto[K]
  ) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Название рецепта обязательно';
    if (!formData.description.trim()) newErrors.description = 'Описание рецепта обязательно';
    if (formData.allTime <= 0) newErrors.allTime = 'Общее время приготовления должно быть больше 0';
    if (formData.cookTime <= 0) newErrors.cookTime = 'Время готовки должно быть больше 0';
    if (!formData.level) newErrors.level = 'Выберите сложность рецепта';
    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'Добавьте хотя бы один ингредиент';
    } else {
      formData.ingredients.forEach((ing, index) => {
        if (!ing.id) newErrors[`ingredients.${index}.id`] = 'ID ингредиента обязателен';
        if (!ing.count || ing.count <= 0) newErrors[`ingredients.${index}.count`] = 'Количество должно быть больше 0';
        // Разрешаем отсутствие productUnit, если есть productMeasureId (из режима редактирования)
        const hasUnit = Boolean((ing as any).productUnit);
        const hasMeasureId = Boolean((ing as any).productMeasureId);
        if (!hasUnit && !hasMeasureId) newErrors[`ingredients.${index}.productUnit`] = 'Единица измерения обязательна';
      });
    }
    if (formData.steps.length === 0) {
      newErrors.steps = 'Добавьте хотя бы один шаг приготовления';
    } else {
      formData.steps.forEach((step, index) => {
        if (!step.description?.trim()) newErrors[`steps.${index}.description`] = 'Описание шага обязательно';
        if (!step.index || step.index <= 0) newErrors[`steps.${index}.index`] = 'Индекс шага должен быть положительным числом';
      });
    }
    if (stepIngredientOveruses.length > 0) {
      newErrors['steps.overuse'] = 'Суммарное количество ингредиентов в шагах превышает допустимое значение';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Кеш базовых мер по продукту
    const measuresCache = new Map<string, ProductMeasureResponseDto[]>();
    const getMeasures = async (productOrVariantId: string, isVariant: boolean) => {
      const cacheKey = `${isVariant ? 'variant' : 'base'}:${productOrVariantId}`;
      if (measuresCache.has(cacheKey)) return measuresCache.get(cacheKey)!;
      const list = isVariant
        ? await productsService.getVariantMeasures(productOrVariantId)
        : await productsService.getBaseMeasures(productOrVariantId);
      measuresCache.set(cacheKey, list);
      return list;
    };

    const unitLabelByValue = (value: string): string => {
      const entry = Object.values(PRODUCT_UNITS).find(u => u.value === value);
      return entry?.label ?? '';
    };

    // Маппинг ингредиентов формы -> UpdateRecipeIngredientDto (API)
    const resolveIngredientIds = (ingredient: any): {
      baseProductId?: string;
      variantId?: string;
      isVariant: boolean;
    } => {
      const pickId = (...candidates: any[]): string | undefined => {
        for (const candidate of candidates) {
          if (typeof candidate === 'string') {
            const trimmed = candidate.trim();
            if (trimmed.length > 0) return trimmed;
          }
          if (typeof candidate === 'number' && Number.isFinite(candidate)) {
            return String(candidate);
          }
        }
        return undefined;
      };

      const variantId = pickId(
        ingredient?.variantId,
        ingredient?.variant?.id,
        ingredient?.productVariantId,
        ingredient?.isVariant ? ingredient?.id : undefined
      );

      const baseProductId = pickId(
        ingredient?.baseProductId,
        ingredient?.productId,
        ingredient?.ingredientId,
        ingredient?.originalProductId,
        ingredient?.id
      );

      return {
        baseProductId: baseProductId || undefined,
        variantId: variantId || undefined,
        isVariant: Boolean(variantId || ingredient?.isVariant),
      };
    };

    const mapIngredients = async (
      ings: CreateRecipeDto['ingredients']
    ): Promise<ApiUpdateRecipeIngredientDto[] | null> => {
      const result: ApiUpdateRecipeIngredientDto[] = [];
      for (const ing of ings) {
        const meta = resolveIngredientIds(ing as any);
        const variantId = meta.variantId;
        const isVariant = meta.isVariant;
        const selectedId = variantId || meta.baseProductId || ing.id;
        const errorSuffixId = meta.baseProductId || variantId || ing.id;
        if (!selectedId) {
          setErrors(prev => ({ ...prev, [`ingredients.measure.${errorSuffixId}`]: 'Не удалось определить идентификатор продукта' }));
          return null;
        }
        // Если из режима редактирования пришел productMeasureId — используем его
        const directMeasureId = (ing as any).productMeasureId as string | undefined;
        if (directMeasureId) {
          result.push({ id: selectedId, count: ing.count, isVariant, productMeasureId: directMeasureId });
          continue;
        }

        // Попытка наследовать меру из базовых ингредиентов формы, если не указана в шаге
        const baseIng = formData.ingredients.find((b) => {
          const baseMeta = resolveIngredientIds(b as any);
          return (baseMeta.baseProductId || b.id) === (meta.baseProductId || ing.id)
            && (baseMeta.variantId || '') === (variantId || '');
        });
        const inheritedMeasureId = (baseIng as any)?.productMeasureId as string | undefined;
        if (inheritedMeasureId) {
          const inheritedVariantId = (baseIng as any)?.variantId as string | undefined;
          const inheritedIsVariant = Boolean(inheritedVariantId);
          result.push({ id: (inheritedVariantId || ing.id), count: ing.count, isVariant: inheritedIsVariant, productMeasureId: inheritedMeasureId });
          continue;
        }

        const inheritedUnit = (ing as any).productUnit || (baseIng as any)?.productUnit;
        if (inheritedUnit) {
          const measures = await getMeasures(selectedId, isVariant);
          const wantedLabel = unitLabelByValue(String(inheritedUnit));
          let found = measures.find(m => m.name === wantedLabel);
          if (!found) {
            found = measures.find(m => m.isDefault) ?? measures[0];
          }
          if (!found) {
            setErrors(prev => ({ ...prev, [`ingredients.measure.${errorSuffixId}`]: 'Не найдена подходящая базовая мера для выбранной единицы' }));
            return null;
          }
          result.push({ id: selectedId, count: ing.count, isVariant, productMeasureId: found.id });
          continue;
        }

        // Иначе подбираем по выбранной единице
        const measures = await getMeasures(selectedId, isVariant);
        const wantedLabel = unitLabelByValue((ing as any).productUnit as string);
        let found = measures.find(m => m.name === wantedLabel);
        if (!found) {
          found = measures.find(m => m.isDefault) ?? measures[0];
        }
        if (!found) {
          setErrors(prev => ({ ...prev, [`ingredients.measure.${errorSuffixId}`]: 'Не найдена подходящая базовая мера для выбранной единицы' }));
          return null;
        }
        result.push({ id: selectedId, count: ing.count, isVariant, productMeasureId: found.id });
      }
      return result;
    };

    // Основные ингредиенты
    const apiIngredients = await mapIngredients(formData.ingredients);
    if (!apiIngredients) return; // уже выставили ошибку

    // Шаги (переносим ингредиенты шагов при наличии)
    const apiSteps: ApiUpdateStepDto[] = await (async () => {
      const steps: ApiUpdateStepDto[] = [];
      // Стабилизируем порядок: сортируем по index и гарантируем последовательные индексы
      const sorted = [...formData.steps]
        .slice()
        .sort((a, b) => (Number(a.index || 0) - Number(b.index || 0)))
        .map((s, i) => ({ ...s, index: Number.isFinite(Number(s.index)) && Number(s.index) > 0 ? Number(s.index) : i + 1 }));

      for (const s of sorted) {
        let stepIngredients: ApiUpdateRecipeIngredientDto[] | undefined;
        if ((s as any).ingredients?.length) {
          const mapped = await mapIngredients((s as any).ingredients as any);
          // Если не удалось сопоставить ингредиенты шага — не обнуляем весь список шагов
          // Отправим шаг без ingredients, чтобы сохранить остальные данные шага
          if (mapped) {
            stepIngredients = mapped;
          }
        }
        steps.push({
          id: (s as any).id,
          index: s.index,
          name: s.name,
          description: s.description,
          photos: s.photos,
          ingredients: stepIngredients,
          time: (s as any).time,
        });
      }
      return steps;
    })();

    const apiDto: ApiCreateRecipeDto = {
      name: formData.name,
      description: formData.description,
      level: formData.level,
      composition: {
        ingredients: apiIngredients,
        steps: apiSteps,
      },
      metaInfo: {
        kitchens: formData.kitchens,
        tags: (formData.tags as any[] | undefined)?.map((t: any) => (typeof t === 'string' ? t : t?.id)).filter(Boolean) as string[] | undefined,
        photos: formData.photos,
      },
      cookingTime: {
        activeTime: formData.cookTime,
        allTime: formData.allTime,
      },
      serving: {
        baseUnit: (formData.baseUnit as any) ?? 'GR',
        totalWeight: (formData.avgWeight as any) ?? 0,
        recipeUnit: (formData.recipeUnit as any) ?? 'PORTION',
        unitCount: (formData.unitCount as any) ?? 1,
      },
      macros: {
        calories: formData.macros?.calories ?? 0,
        proteins: formData.macros?.proteins ?? 0,
        fats: formData.macros?.fats ?? 0,
        carbs: formData.macros?.carbs ?? 0,
      },
    };

    // Передаём наверх новый формат (временно как any для совместимости)
    onSubmit(apiDto as unknown as any);
  };

  const difficultyOptions = [
    { value: 'EASY' as DifficultyLevel, label: 'Легко' },
    { value: 'MEDIUM' as DifficultyLevel, label: 'Средне' },
    { value: 'HARD' as DifficultyLevel, label: 'Сложно' }
  ];

  const [kitchens, setKitchens] = useState<Array<{ id: string; name: string }>>([]);
  const [kitchenSelect, setKitchenSelect] = useState<string>('');
  useEffect(() => {
    const loadKitchens = async () => {
      try {
        const list = await KitchensService.getAll();
        const normalized = (Array.isArray(list) ? list : []).map((k: any) => ({
          id: k.id ?? k.uuid ?? k.value,
          name: k.name ?? k.title ?? k.label ?? 'Без названия',
        })).filter((k: { id?: string }) => Boolean(k.id));

        if (normalized.length === 0) {
          // Попробуем альтернативные структуры ответа (data/content/items)
          const headers = getAuthHeaders();
          const resp = await authorizedFetch(`${API_BASE_URL}/kitchens/all`, { headers, method: 'GET' });
          if (resp.ok) {
            const payload = await resp.json();
            const fallbackSource = Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.content)
                  ? payload.content
                  : Array.isArray(payload?.items)
                    ? payload.items
                    : [];

            const fallback = fallbackSource.map((k: any) => ({
              id: k.id ?? k.uuid ?? k.value,
              name: k.name ?? k.title ?? k.label ?? 'Без названия',
            })).filter((k: { id?: string }) => Boolean(k.id));
            setKitchens(fallback);
            return;
          }
        }

        setKitchens(normalized);
      } catch (error) {
        console.error('Не удалось загрузить список кухонь', error);
        setKitchens([]);
      }
    };

    void loadKitchens();
  }, []);

  const calculateMacrosFromProducts = async () => {
    try {
      const headers = getAuthHeaders();
      let calories = 0;
      let proteins = 0;
      let fats = 0;
      let carbs = 0;
      for (const ing of formData.ingredients) {
        if (!ing?.id || !ing?.count) continue;
        try {
          const resp = await authorizedFetch(`${API_BASE_URL}/products/${ing.id}`, { headers });
          if (!resp.ok) continue;
          const product = await resp.json();
          const m = product?.macros;
          if (m) {
            calories += (Number(m.calories) || 0) * (Number(ing.count) || 0);
            proteins += (Number(m.proteins) || 0) * (Number(ing.count) || 0);
            fats += (Number(m.fats) || 0) * (Number(ing.count) || 0);
            carbs += (Number(m.carbs) || 0) * (Number(ing.count) || 0);
          }
        } catch { /* ignore product error */ }
      }
      updateField('macros', {
        calories: Math.round(calories),
        proteins: Number(proteins.toFixed(2)),
        fats: Number(fats.toFixed(2)),
        carbs: Number(carbs.toFixed(2))
      } as any);
    } catch { /* ignore */ }
  };

  return (
    <form className={styles.recipeForm} onSubmit={handleSubmit}>
      <div className={styles.formContainer}>
        {/* Основная информация */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Основная информация</h2>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="name">Название рецепта *</label>
            <input id="name" type="text" className={`${styles.input} ${errors.name ? styles.error : ''}`} placeholder="Введите название рецепта" value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="description">Описание *</label>
            <textarea id="description" className={`${styles.textarea} ${errors.description ? styles.error : ''}`} placeholder="Расскажите о вашем рецепте" rows={4} value={formData.description} onChange={(e) => updateField('description', e.target.value)} />
            {errors.description && <span className={styles.errorText}>{errors.description}</span>}
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="allTime">Время приготовления (мин) *</label>
              <input id="allTime" type="number" min="1" className={`${styles.input} ${errors.allTime ? styles.error : ''}`} placeholder="15" value={Math.floor(formData.allTime / 60) || ''} onChange={(e) => updateField('allTime', (parseInt(e.target.value) || 0) * 60)} />
              {errors.allTime && <span className={styles.errorText}>{errors.allTime}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="cookTime">Время готовки (мин) *</label>
              <input id="cookTime" type="number" min="1" className={`${styles.input} ${errors.cookTime ? styles.error : ''}`} placeholder="30" value={Math.floor(formData.cookTime / 60) || ''} onChange={(e) => updateField('cookTime', (parseInt(e.target.value) || 0) * 60)} />
              {errors.cookTime && <span className={styles.errorText}>{errors.cookTime}</span>}
            </div>
            
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="difficulty">Сложность</label>
              <select id="difficulty" className={styles.select} value={formData.level} onChange={(e) => updateField('level', e.target.value as DifficultyLevel)}>
                {['EASY','MEDIUM','HARD'].map(value => (
                  <option key={value} value={value}>{value === 'EASY' ? 'Легко' : value === 'MEDIUM' ? 'Средне' : 'Сложно'}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="cuisine">Кухни</label>
              <select id="cuisine" className={styles.select} value={kitchenSelect} onChange={(e) => {
                const val = e.target.value;
                setKitchenSelect('');
                if (!val) return;
                const next = new Set([...(formData.kitchens || []), val]);
                updateField('kitchens', Array.from(next));
              }}>
                <option value="">Выберите кухню</option>
                {kitchens.map(k => (<option key={k.id} value={k.id}>{k.name}</option>))}
              </select>
              {formData.kitchens && formData.kitchens.length > 0 && (
                <div className={styles.tagsRow} style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {formData.kitchens.map((id) => {
                    const k = kitchens.find(x => x.id === id);
                    return (
                      <span key={id} className={styles.tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', border: '1px solid var(--ui-border, #e5e7eb)', borderRadius: 999 }}>
                        {k?.name || id}
                        <button type="button" onClick={() => updateField('kitchens', (formData.kitchens || []).filter(x => x !== id))} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>×</button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Изображение (временный ввод URL) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><PhotoIcon className={styles.sectionIcon} />Фотография (URL)</h2>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="photoUrl">Ссылка на изображение</label>
            <input id="photoUrl" type="url" className={styles.input} placeholder="https://example.com/image.jpg" value={formData.photos?.[0] || ''} onChange={(e) => updateField('photos', e.target.value ? [e.target.value] : [])} />
            {formData.photos?.[0] && (<div style={{ marginTop: 8 }}><img src={formData.photos[0]} alt="Предпросмотр" style={{ maxWidth: '100%', borderRadius: 8 }} /></div>)}
          </div>
        </section>

        {/* Теги */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Теги</h2>
          <TagsInput tags={(formData.tags as any) || []} onChange={(selected) => updateField('tags', selected as any)} placeholder="Выберите тег из списка" />
        </section>

        {/* Единицы итогового продукта */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Единицы рецепта</h2>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Базовая мера</label>
              <select
                className={styles.select}
                value={formData.baseUnit || 'GR'}
                onChange={(e) => updateField('baseUnit', e.target.value as any)}
              >
                {BASE_UNITS_ARRAY.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Вес всего блюда (г)</label>
              <input
                type="number"
                className={styles.input}
                min={0}
                step={1}
                value={formData.avgWeight ?? 0}
                onChange={(e) => updateField('avgWeight', Number(e.target.value) || 0)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Количество единиц</label>
              <input
                type="number"
                className={styles.input}
                min={1}
                step={1}
                value={formData.unitCount ?? 1}
                onChange={(e) => updateField('unitCount', Math.max(1, Number(e.target.value) || 1) as any)}
              />
            </div>
            {/* Убрано: конкретная мера. Используем recipeUnit вместо unit */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Единица рецепта</label>
              <select
                className={styles.select}
                value={formData.recipeUnit || 'PORTION'}
                onChange={(e) => updateField('recipeUnit', e.target.value as any)}
              >
                {RECIPE_UNITS_ARRAY.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Ингредиенты */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ингредиенты *</h2>
          <IngredientPicker ingredients={formData.ingredients} onChange={(ingredients) => updateField('ingredients', ingredients)} errors={errors} />
          {errors.ingredients && <span className={styles.errorText}>{errors.ingredients}</span>}
        </section>

        {/* КБЖУ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>КБЖУ</h2>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Калории</label>
              <input type="number" className={styles.input} value={formData.macros?.calories ?? 0} onChange={(e) => updateField('macros', { ...formData.macros!, calories: Number(e.target.value) } as any)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Белки</label>
              <input type="number" step="0.01" className={styles.input} value={formData.macros?.proteins ?? 0} onChange={(e) => updateField('macros', { ...formData.macros!, proteins: Number(e.target.value) } as any)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Жиры</label>
              <input type="number" step="0.01" className={styles.input} value={formData.macros?.fats ?? 0} onChange={(e) => updateField('macros', { ...formData.macros!, fats: Number(e.target.value) } as any)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Углеводы</label>
              <input type="number" step="0.01" className={styles.input} value={formData.macros?.carbs ?? 0} onChange={(e) => updateField('macros', { ...formData.macros!, carbs: Number(e.target.value) } as any)} />
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" className="ui-btn ui-btn--ghost" onClick={calculateMacrosFromProducts}>Рассчитать по ингредиентам (через продукты)</button>
          </div>
        </section>

        {/* Шаги приготовления */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Шаги приготовления *</h2>
          <StepsEditor
            steps={formData.steps}
            onChange={(steps) => updateField('steps', steps)}
            errors={errors}
            baseIngredients={formData.ingredients}
            onValidationChange={setStepIngredientOveruses}
          />
          {errors.steps && <span className={styles.errorText}>{errors.steps}</span>}
          {stepIngredientOveruses.length > 0 && (
            <div className={styles.errorText}>
              <span>Суммарно превышено количество для ингредиентов:</span>
              <ul className={styles.errorList}>
                {stepIngredientOveruses.map((item) => (
                  <li key={item.key}>
                    {`${item.name}: превышение на ${Number.isInteger(item.over) ? item.over : item.over.toFixed(2)} (использовано ${Number.isInteger(item.used) ? item.used : item.used.toFixed(2)} из ${Number.isInteger(item.base) ? item.base : item.base.toFixed(2)})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Кнопки */}
        <div className={styles.actions}>
          <button
            type="submit"
            className={`${styles.submitButton} ${(!isValid || stepIngredientOveruses.length > 0) ? styles.disabled : ''}`}
            disabled={!isValid || isSubmitting || stepIngredientOveruses.length > 0}
          >
            {isSubmitting
              ? (mode === 'edit' ? 'Обновляем рецепт...' : 'Создаем рецепт...')
              : (mode === 'edit' ? 'Обновить рецепт' : 'Создать рецепт')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RecipeForm; 
