import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { createShoppingListThunk } from '../../store/thunks/shoppingListThunks';
import type { Recipe, RecipeIngredient, FridgeProduct } from '../../types';
import type { RecipeIngredientDto } from '../../types/recipe.types';
import type { MeasureType, ProductUnitType } from '../../types/measures.types';
import type { FilterType } from './FilterSettings';
import {
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import styles from './DiscoverCard.module.css';
import { fridgeApiService } from '../../services/fridgeApiService';
import { PRODUCT_UNITS } from '../../constants/measures';
import { formatMeasureLabel } from '../../utils/measureLabel';
import { RecipesService } from '../../services/recipesService';

type FridgeTotals = Record<string, { amount: number; unit: MeasureType }>;

let cachedFridgeData: { ids: string[]; totals: FridgeTotals } | null = null;
let fridgeLoadPromise: Promise<{ ids: string[]; totals: FridgeTotals }> | null = null;

interface DiscoverCardProps {
  recipe: Recipe;
  availableIngredients: string[];
  missingIngredients: RecipeIngredient[];
  onSelect: () => void;
  currentFilter?: FilterType;
  onFilterChange?: (filter: FilterType) => void;
  isActive?: boolean;
}

const normalizeUnitCode = (unit?: string | null): string | null => {
  if (!unit) return null;
  const value = unit.toString().trim();
  if (!value) return null;
  return value.toUpperCase();
};

const UNIT_CODE_TO_PRODUCT_UNIT: Record<string, ProductUnitType> = {
  GR: 'GRAM',
  G: 'GRAM',
  'Г': 'GRAM',
  'ГР': 'GRAM',
  'ГРАММ': 'GRAM',
  'ГРАММЫ': 'GRAM',
  'ГРАММОВ': 'GRAM',
  MG: 'MILLIGRAM',
  MILLIGRAM: 'MILLIGRAM',
  'МИЛЛИГРАММ': 'MILLIGRAM',
  'МИЛЛИГРАММЫ': 'MILLIGRAM',
  KG: 'KILOGRAM',
  KILOGRAM: 'KILOGRAM',
  'КГ': 'KILOGRAM',
  'КИЛОГРАММ': 'KILOGRAM',
  'КИЛОГРАММЫ': 'KILOGRAM',
  ML: 'MILLILITER',
  MILLILITER: 'MILLILITER',
  'МЛ': 'MILLILITER',
  'МИЛЛИЛИТР': 'MILLILITER',
  'МИЛЛИЛИТРОВ': 'MILLILITER',
  L: 'LITER',
  LITER: 'LITER',
  'Л': 'LITER',
  'ЛИТР': 'LITER',
  'ЛИТРА': 'LITER',
  'ЛИТРОВ': 'LITER'
};

const mapUnitCodeToMeasureType = (unit?: string | null): MeasureType | null => {
  const normalized = normalizeUnitCode(unit);
  switch (normalized) {
    case 'GR':
    case 'GRAM':
    case 'G':
    case 'Г':
    case 'ГР':
    case 'ГРАММ':
    case 'ГРАММЫ':
    case 'ГРАММОВ':
      return 'GR';
    case 'MG':
    case 'MILLIGRAM':
    case 'МИЛЛИГРАММ':
    case 'МИЛЛИГРАММЫ':
      return 'MG';
    case 'KG':
    case 'KILOGRAM':
    case 'КГ':
    case 'КИЛОГРАММ':
    case 'КИЛОГРАММЫ':
      return 'KG';
    case 'ML':
    case 'MILLILITER':
    case 'МЛ':
    case 'МИЛЛИЛИТР':
    case 'МИЛЛИЛИТРОВ':
      return 'ML';
    case 'L':
    case 'LITER':
    case 'Л':
    case 'ЛИТР':
    case 'ЛИТРА':
    case 'ЛИТРОВ':
      return 'L';
    default:
      return null;
  }
};

const getUnitLabelFromCode = (unit?: string | null): string => {
  const normalized = normalizeUnitCode(unit);
  if (!normalized) return '';

  const directProductUnit = (PRODUCT_UNITS as Record<string, { label: string }>)[normalized];
  if (directProductUnit) {
    return directProductUnit.label;
  }

  const fallbackProductUnit = UNIT_CODE_TO_PRODUCT_UNIT[normalized];
  if (fallbackProductUnit) {
    const productUnitEntry = PRODUCT_UNITS[fallbackProductUnit];
    if (productUnitEntry) {
      return productUnitEntry.label;
    }
  }

  return formatMeasureLabel(unit ?? undefined);
};

const getIngredientMeasure = (ingredient: any): MeasureType | null => {
  const rawUnit = (ingredient as any)?.measure ?? (ingredient as any)?.productUnit ?? null;
  return mapUnitCodeToMeasureType(rawUnit);
};

const getIngredientUnitLabel = (ingredient: any): string => {
  const rawUnit = (ingredient as any)?.productUnit ?? (ingredient as any)?.measure ?? null;
  return getUnitLabelFromCode(rawUnit);
};

const getIngredientCandidateIds = (ingredient: any): string[] => {
  const candidates = [
    (ingredient as any)?.productId,
    (ingredient as any)?.ingredient?.id,
    (ingredient as any)?.ingredientId,
    (ingredient as any)?.id
  ];
  return candidates
    .map((value) => (value ? String(value) : ''))
    .filter((value, index, array) => value && array.indexOf(value) === index);
};

const getIngredientKey = (ingredient: any): string => {
  const candidates = getIngredientCandidateIds(ingredient);
  if (candidates.length > 0) return candidates[0];
  const name = (ingredient as any)?.name;
  return name ? String(name) : '';
};

const formatAmount = (value: number): string => {
  const rounded = Number(value.toFixed(1));
  if (!Number.isFinite(rounded)) return '0';
  return Number.isInteger(rounded) ? String(Math.trunc(rounded)) : String(rounded);
};

const DiscoverCard: React.FC<DiscoverCardProps> = ({
  recipe,
  availableIngredients,
  missingIngredients,
  onSelect,
  currentFilter,
  onFilterChange,
  isActive = false
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, time: 0 });
  const [detailedIngredients, setDetailedIngredients] = useState<RecipeIngredientDto[] | null>(null);
  const [ingredientsLoaded, setIngredientsLoaded] = useState(false);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [ingredientsError, setIngredientsError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleFilterToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFilterDropdown(!showFilterDropdown);
  };

  const handleFilterSelect = (filter: FilterType, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onFilterChange) {
      onFilterChange(filter);
    }
    setShowFilterDropdown(false);
  };

  useEffect(() => {
    const initialIngredients = (recipe.ingredients ?? []) as RecipeIngredientDto[];
    setDetailedIngredients(initialIngredients.length > 0 ? initialIngredients : null);
    setIngredientsLoaded(initialIngredients.length > 0);
    setIngredientsLoading(false);
    setIngredientsError(null);
    setShowIngredients(false);
  }, [recipe.id]);

  useEffect(() => {
    if (!isActive) return;
    if (ingredientsLoaded) return;

    let cancelled = false;
    setIngredientsLoading(true);
    setIngredientsError(null);

    const fetchIngredients = async () => {
      try {
        const detailedRecipe = await RecipesService.getRecipe(recipe.id);
        if (cancelled) return;
        const nextIngredients = (detailedRecipe?.ingredients ?? []) as RecipeIngredientDto[];
        setDetailedIngredients(nextIngredients);
        setIngredientsLoaded(true);
      } catch (error) {
        if (cancelled) return;
        console.error('Не удалось получить ингредиенты рецепта:', error);
        setIngredientsError(error instanceof Error ? error.message : 'Не удалось загрузить ингредиенты');
      } finally {
        if (!cancelled) {
          setIngredientsLoading(false);
        }
      }
    };

    void fetchIngredients();

    return () => {
      cancelled = true;
      setIngredientsLoading(false);
    };
  }, [isActive, ingredientsLoaded, recipe.id]);

  const ingredients = React.useMemo<RecipeIngredientDto[]>(() => {
    if (ingredientsLoaded) {
      return detailedIngredients ?? [];
    }
    return (recipe.ingredients ?? []) as RecipeIngredientDto[];
  }, [detailedIngredients, ingredientsLoaded, recipe.ingredients]);

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'all':
        return 'Все рецепты';
      case 'available':
        return 'Полностью доступные';
      case 'partial':
        return 'Частично доступные';
      case 'missing':
        return 'Недостающие ингредиенты';
      default:
        return 'Все рецепты';
    }
  };

  // initial placeholder (will be overridden below with store-aware version)
  const getAvailabilityPercentage = () => 0;

  const fridgeItems = useAppSelector((state) => state.fridge.items);

  const availableIdsFromStore = useMemo(
    () => {
      const collected = fridgeItems.map((item: any) => {
        const rawId = item?.productId ?? item?.ingredient?.id ?? item?.ingredientId ?? item?.id;
        return rawId ? String(rawId) : '';
      }).filter(Boolean);
      return Array.from(new Set(collected));
    },
    [fridgeItems]
  );

  // Fallback: если стор пустой, подгружаем продукты из API холодильника
  const [availableIdsFromApi, setAvailableIdsFromApi] = useState<string[]>([]);
  const [fridgeTotalsById, setFridgeTotalsById] = useState<FridgeTotals>({});

  useEffect(() => {
    let mounted = true;

    if (availableIdsFromStore.length > 0) {
      setAvailableIdsFromApi([]);
      setFridgeTotalsById({});
      return () => {
        mounted = false;
      };
    }

    const applyData = (data: { ids: string[]; totals: FridgeTotals }) => {
      if (!mounted) return;
      setAvailableIdsFromApi(data.ids);
      setFridgeTotalsById(data.totals);
    };

    const buildFridgeData = (products: FridgeProduct[]): { ids: string[]; totals: FridgeTotals } => {
      const totals: FridgeTotals = {};
      const idsSet = new Set<string>();
      for (const p of products) {
        const amount = Number((p as any)?.amount ?? (p as any)?.count);
        const rawUnit = (p as any)?.unit ?? (p as any)?.measure ?? (p as any)?.measure?.value ?? (p as any)?.baseUnit;
        const measure = mapUnitCodeToMeasureType(rawUnit);
        if (!Number.isFinite(amount) || amount <= 0 || !measure) continue;

        const ids = [
          (p as any)?.productId,
          p?.ingredient?.id,
          (p as any)?.ingredientId,
          (p as any)?.id
        ]
          .map((value) => (value ? String(value) : ''))
          .filter((value, index, array) => value && array.indexOf(value) === index);

        if (ids.length === 0) continue;

        for (const id of ids) {
          idsSet.add(id);
          mergeAmountIntoTotals(totals, id, amount, measure);
        }
      }
      return { ids: Array.from(idsSet), totals };
    };

    const ensureFridgeData = async () => {
      if (cachedFridgeData) {
        applyData(cachedFridgeData);
        return;
      }

      if (!fridgeLoadPromise) {
        fridgeLoadPromise = fridgeApiService.getAllFridgeProducts()
          .then((products) => {
            const data = buildFridgeData(products);
            cachedFridgeData = data;
            return data;
          })
          .catch((error) => {
            console.error('Не удалось загрузить продукты холодильника:', error);
            cachedFridgeData = null;
            throw error;
          })
          .finally(() => {
            fridgeLoadPromise = null;
          });
      }

      try {
        const data = await fridgeLoadPromise;
        applyData(data);
      } catch {
        if (mounted) {
          setAvailableIdsFromApi([]);
          setFridgeTotalsById({});
        }
      }
    };

    void ensureFridgeData();

    return () => {
      mounted = false;
    };
  }, [availableIdsFromStore.length]);

  const normalizeToRecipeIngredient = (ing: any): RecipeIngredient => {
    const ingredientId = getIngredientKey(ing);
    const safeId = ingredientId || String((ing as any)?.id ?? (ing as any)?.name ?? '');
    const amount = Number((ing as any)?.count) || 0;
    const unitLabel = getIngredientUnitLabel(ing);

    return {
      id: safeId,
      ingredient: {
        id: safeId,
        name: (ing as any)?.name ?? 'Ингредиент',
        category: { id: 'api', name: 'Из API', color: '#4f46e5' }
      },
      amount,
      unit: unitLabel || '',
    };
  };

  // Конвертация единиц в базовые группы для сравнения количеств
  const convertToBase = (value: number, unit?: MeasureType | null): { value: number; group: 'weight' | 'volume' | 'unknown' } => {
    if (!unit) return { value, group: 'unknown' };
    switch (unit) {
      case 'MG': return { value: value / 1000, group: 'weight' }; // в граммы
      case 'GR': return { value, group: 'weight' }; // граммы
      case 'KG': return { value: value * 1000, group: 'weight' }; // в граммы
      case 'ML': return { value, group: 'volume' }; // миллилитры
      case 'L':  return { value: value * 1000, group: 'volume' }; // в миллилитры
      default: return { value, group: 'unknown' };
    }
  };

  const convertBaseToUnit = (baseValue: number, unit?: MeasureType | null): number => {
    if (!unit) return baseValue;
    switch (unit) {
      case 'MG': return baseValue * 1000; // граммы -> миллиграммы
      case 'GR': return baseValue;       // граммы
      case 'KG': return baseValue / 1000; // граммы -> килограммы
      case 'ML': return baseValue;       // миллилитры
      case 'L':  return baseValue / 1000; // миллилитры -> литры
      default: return baseValue;
    }
  };

  const mergeAmountIntoTotals = (totals: FridgeTotals, ingredientId: string, amount: number, unit: MeasureType) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const existing = totals[ingredientId];
    if (!existing) {
      totals[ingredientId] = { amount, unit };
      return;
    }
    if (existing.unit === unit) {
      existing.amount += amount;
      return;
    }
    const existingBase = convertToBase(existing.amount, existing.unit);
    const incomingBase = convertToBase(amount, unit);
    if (existingBase.group === 'unknown' || incomingBase.group === 'unknown' || existingBase.group !== incomingBase.group) {
      return;
    }
    const sum = existingBase.value + incomingBase.value;
    totals[ingredientId] = {
      amount: sum,
      unit: existingBase.group === 'weight' ? ('GR' as MeasureType) : ('ML' as MeasureType)
    };
  };

  const storeFridgeData = useMemo(() => {
    if (!Array.isArray(fridgeItems) || fridgeItems.length === 0) {
      return null;
    }
    const totals: FridgeTotals = {};
    const idsSet = new Set<string>();
    for (const item of fridgeItems as any[]) {
      const amount = Number(item?.amount ?? item?.count);
      const rawUnit = item?.unit ?? item?.measure ?? item?.measureId ?? item?.baseUnit;
      const measure = mapUnitCodeToMeasureType(rawUnit);
      if (!Number.isFinite(amount) || amount <= 0 || !measure) continue;

      const ids = [
        item?.productId,
        item?.ingredient?.id,
        item?.ingredientId,
        item?.id
      ]
        .map((value) => (value ? String(value) : ''))
        .filter((value, index, array) => value && array.indexOf(value) === index);

      if (ids.length === 0) continue;

      for (const id of ids) {
        idsSet.add(id);
        mergeAmountIntoTotals(totals, id, amount, measure);
      }
    }
    return { ids: Array.from(idsSet), totals };
  }, [fridgeItems]);

  const getIngredientAvailabilityDetails = (ing: any) => {
    const measure = getIngredientMeasure(ing);
    const amountNeeded = Number((ing as any)?.count) || 0;
    const candidateIds = getIngredientCandidateIds(ing);
    const recBase = measure ? convertToBase(amountNeeded, measure) : { value: 0, group: 'unknown' };
    let availableBase = 0;
    let hasComparable = false;
    let hasAnyPresence = false;

    if (measure && amountNeeded > 0) {
      for (const id of candidateIds) {
        const fridge = fridgeTotals[id];
        if (!fridge) continue;
        hasAnyPresence = true;
        const frBase = convertToBase(fridge.amount, fridge.unit);
        if (frBase.group !== recBase.group || frBase.group === 'unknown') continue;
        availableBase = frBase.value;
        hasComparable = true;
        break;
      }
    } else {
      for (const id of candidateIds) {
        if (fridgeTotals[id]) {
          hasAnyPresence = true;
          break;
        }
      }
    }

    const availableClampedBase = measure && hasComparable
      ? Math.min(availableBase, recBase.value)
      : 0;

    const availableInRecipeUnit = measure && hasComparable
      ? convertBaseToUnit(availableClampedBase, measure)
      : 0;

    const deficitBase = measure && hasComparable
      ? Math.max(recBase.value - availableBase, 0)
      : 0;

    const deficitInRecipeUnit = measure && hasComparable
      ? convertBaseToUnit(deficitBase, measure)
      : 0;

    return {
      measure,
      amountNeeded,
      candidateIds,
      recBase,
      availableBase,
      availableInRecipeUnit,
      deficitBase,
      deficitInRecipeUnit,
      hasComparable,
      hasAnyPresence,
    };
  };

  const storeAvailableIds = storeFridgeData?.ids ?? availableIdsFromStore;
  const fridgeTotals = storeFridgeData?.totals ?? fridgeTotalsById;

  const effectiveAvailableIds =
    storeAvailableIds.length > 0
      ? storeAvailableIds
      : (availableIdsFromApi.length > 0 ? availableIdsFromApi : availableIngredients);

  const resolveIngredientStatus = (details: ReturnType<typeof getIngredientAvailabilityDetails>): 'available' | 'partial' | 'missing' => {
    const { measure, amountNeeded, recBase, availableBase, hasComparable, hasAnyPresence, candidateIds } = details;

    if (measure && amountNeeded > 0 && hasComparable) {
      if (availableBase >= recBase.value) return 'available';
      if (availableBase > 0) return 'partial';
      return 'missing';
    }

    if (hasAnyPresence && amountNeeded > 0 && measure && !hasComparable) {
      return 'available';
    }

    const hasFallbackPresence = candidateIds.some((id) => effectiveAvailableIds.includes(id));
    if (hasFallbackPresence) {
      return amountNeeded > 0 ? 'available' : 'missing';
    }

    return 'missing';
  };

  const classifyIngredient = (ing: any): 'available' | 'partial' | 'missing' => {
    const details = getIngredientAvailabilityDetails(ing);
    return resolveIngredientStatus(details);
  };

  const computeMissing = (): RecipeIngredient[] => {
    // Возвращаем список того, чего не хватает (включая частично доступные позиции)
    const result: RecipeIngredient[] = [];
    for (const ing of ingredients as any[]) {
      const key = getIngredientKey(ing);
      const details = getIngredientAvailabilityDetails(ing);
      const status = resolveIngredientStatus(details);
      if (status === 'missing') {
        result.push(normalizeToRecipeIngredient(ing));
        continue;
      }

      if (status === 'partial') {
        if (!details.measure || details.deficitBase <= 0) continue;
        const unitLabel = getIngredientUnitLabel(ing);
        const deficitValue = Math.max(0, details.deficitInRecipeUnit);
        const formattedAmount = Number(deficitValue.toFixed(1));

        result.push({
          id: key || (details.candidateIds[0] ?? String((ing as any)?.name ?? '')),
          ingredient: {
            id: key || (details.candidateIds[0] ?? String((ing as any)?.name ?? '')),
            name: (ing as any)?.name ?? 'Ингредиент',
            category: { id: 'api', name: 'Из API', color: '#4f46e5' }
          },
          amount: formattedAmount,
          unit: unitLabel || '',
        });
      }
    }
    return result;
  };

  const haveEffectiveAvailability =
    effectiveAvailableIds.length > 0 || Object.keys(fridgeTotals).length > 0;
  const missingFromStore: RecipeIngredient[] = useMemo(() => {
    if (!haveEffectiveAvailability || ingredients.length === 0) return [] as RecipeIngredient[];
    return computeMissing();
  }, [ingredients, haveEffectiveAvailability, fridgeTotals, effectiveAvailableIds]);

  // Если есть данные о наличии (store/API), используем вычисленные, даже если они пустые
  const effectiveMissingIngredients: RecipeIngredient[] = haveEffectiveAvailability ? missingFromStore : missingIngredients;

  const getAvailabilityPercentageStoreAware = () => {
    const total = ingredients.length;
    if (total === 0) return 0;
    let availableCount = 0;
    let partialCount = 0;
    for (const ing of ingredients as any[]) {
      const status = classifyIngredient(ing);
      if (status === 'available') availableCount += 1;
      else if (status === 'partial') partialCount += 1;
    }
    const score = availableCount + partialCount * 0.5;
    return Math.round((score / total) * 100);
  };

  const availabilityPercentage = getAvailabilityPercentageStoreAware();

  // Сброс ошибки изображения при смене рецепта
  React.useEffect(() => {
    setImageError(false);
  }, [recipe.id]);

  const handleCardClick = () => {
    // Переход к деталям рецепта только если не было свайпа
    if (!isDragging) {
      navigate(`/recipe/${recipe.id}`);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ 
      x: e.clientX, 
      y: e.clientY, 
      time: Date.now() 
    });
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart.time === 0) return;
    
    const deltaX = Math.abs(e.clientX - dragStart.x);
    const deltaY = Math.abs(e.clientY - dragStart.y);
    
    // Если движение больше 5 пикселей, считаем это свайпом
    if (deltaX > 5 || deltaY > 5) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    // Сбрасываем состояние через небольшую задержку
    setTimeout(() => {
      setIsDragging(false);
      setDragStart({ x: 0, y: 0, time: 0 });
    }, 50);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragStart({ 
      x: touch.clientX, 
      y: touch.clientY, 
      time: Date.now() 
    });
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart.time === 0) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - dragStart.x);
    const deltaY = Math.abs(touch.clientY - dragStart.y);
    
    // Если движение больше 5 пикселей, считаем это свайпом
    if (deltaX > 5 || deltaY > 5) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = () => {
    // Сбрасываем состояние через небольшую задержку
    setTimeout(() => {
      setIsDragging(false);
      setDragStart({ x: 0, y: 0, time: 0 });
    }, 50);
  };

  const handleCreateShoppingList = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const ingredientsToBuy: RecipeIngredient[] = (effectiveAvailableIds.length === 0)
      ? ingredients.map((ing: any) => normalizeToRecipeIngredient(ing))
      : effectiveMissingIngredients;
    
    // Создаем список в Redux store
    try {
      const formData = {
        title: `Список для "${recipe.title}"`,
        recipeId: recipe.id,
        recipeName: recipe.title,
        items: ingredientsToBuy.map((ingredient: RecipeIngredient) => ({
          ingredientName: ingredient.ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          notes: ''
        }))
      };
      
      await dispatch(createShoppingListThunk({
        userId: 'current-user', // В реальном приложении получаем из auth
        formData
      })).unwrap();
      
      // Показываем уведомление об успешном создании
      console.log('Список покупок создан и сохранен!');
      
    } catch (error) {
      console.error('Ошибка создания списка покупок:', error);
    }
    
    // Также создаем текстовый список для sharing/копирования
    const shoppingList = ingredientsToBuy
      .map((ingredient: RecipeIngredient) => {
        const unitSuffix = ingredient.unit ? ` ${ingredient.unit}` : '';
        const formattedAmount = formatAmount(Number(ingredient.amount));
        return `${ingredient.ingredient.name} - ${formattedAmount}${unitSuffix}`;
      })
      .join('\n');
    
    const listText = `Список покупок для рецепта "${recipe.title}":\n\n${shoppingList}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Список покупок: ${recipe.title}`,
        text: listText
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(listText).then(() => {
        console.log('Список покупок скопирован в буфер обмена');
      });
    } else {
      // Fallback для старых браузеров
      const textarea = document.createElement('textarea');
      textarea.value = listText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  return (
    <div 
      className={styles.card}
      onDragStart={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleCardClick}
    >
      {/* Основное изображение */}
      <div className={styles.imageContainer}>
        {recipe.image && !imageError ? (
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className={styles.recipeImage}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className={styles.placeholderImage}>
            <span>🍽️</span>
          </div>
        )}
        
        {/* Градиент поверх изображения */}
        <div className={styles.imageOverlay} />
        
        {/* Информация о рецепте поверх изображения */}
        <div className={styles.recipeInfo}>
          <div className={styles.recipeHeader}>
            <h2 className={styles.recipeTitle}>{recipe.title}</h2>
            <div className={styles.recipeStats}>
              <div className={styles.stat}>
                <ClockIcon className={styles.statIcon} />
                <span>{recipe.prepTime + recipe.cookTime} мин</span>
              </div>
              <div className={styles.stat}>
                <UserIcon className={styles.statIcon} />
                <span>{recipe.servings} порций</span>
              </div>
              <div className={styles.stat}>
                <StarIcon className={styles.statIcon} />
                <span>{recipe.stats.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <p className={styles.recipeDescription}>{recipe.description}</p>
          
          {/* Индикатор доступности ингредиентов */}
          <div className={styles.availabilityIndicator}>
            <div className={styles.availabilityBar}>
              <div 
                className={styles.availabilityProgress}
                style={{ width: `${availabilityPercentage}%` }}
              />
            </div>
            <span className={styles.availabilityText}>
              {effectiveAvailableIds.length === 0 
                ? 'Нет ингредиентов в холодильнике'
                : `${availabilityPercentage}% ингредиентов доступно`}
            </span>
          </div>
        </div>
      </div>

      {/* Боковые кнопки действий */}
      <div 
        className={styles.actionButtons}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
          onClick={handleLike}
        >
          {isLiked ? (
            <HeartSolidIcon className={styles.actionIcon} />
          ) : (
            <HeartIcon className={styles.actionIcon} />
          )}
          <span className={styles.actionCount}>{recipe.stats.likes}</span>
        </button>
        
        <button 
          className={`${styles.actionButton} ${isSaved ? styles.saved : ''}`}
          onClick={handleSave}
        >
          <BookmarkIcon className={styles.actionIcon} />
          <span className={styles.actionCount}>{recipe.stats.saves}</span>
        </button>
        
        <button className={styles.actionButton} onClick={handleShare}>
          <ShareIcon className={styles.actionIcon} />
        </button>
        
        {/* Информация об авторе */}
        <div className={styles.authorProfile}>
          <div className={styles.authorAvatar}>
            <UserIcon className={styles.authorIcon} />
          </div>
        </div>
      </div>





      {/* Панель ингредиентов и фильтра */}
      <div 
        className={styles.ingredientsPanel}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className={styles.panelButtons}>
          <button 
            className={styles.ingredientsToggle}
            onClick={(e) => {
              e.stopPropagation();
              setShowIngredients(!showIngredients);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowIngredients(!showIngredients);
            }}
          >
            {showIngredients ? 'Скрыть' : 'Показать'} ингредиенты
          </button>
          
          {onFilterChange && (
            <div className={styles.filterContainer}>
              <button 
                className={styles.filterToggle}
                onClick={handleFilterToggle}
                onTouchEnd={handleFilterToggle}
              >
                <FunnelIcon className={styles.filterIcon} />
                <span>{currentFilter ? getFilterLabel(currentFilter) : 'Фильтр'}</span>
              </button>
              
              {showFilterDropdown && (
                <div className={styles.filterDropdown}>
                  {(['all', 'available', 'partial', 'missing'] as FilterType[]).map((filter) => (
                    <button
                      key={filter}
                      className={`${styles.filterOption} ${currentFilter === filter ? styles.active : ''}`}
                      onClick={(e) => handleFilterSelect(filter, e)}
                      onTouchEnd={(e) => handleFilterSelect(filter, e)}
                    >
                      {getFilterLabel(filter)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {showIngredients && (
          <div className={styles.ingredientsList}>
            <h3>Ингредиенты:</h3>
            {isActive && (ingredientsLoading || (!ingredientsLoaded && ingredients.length === 0)) ? (
              <div className={styles.ingredientsStatus}>Загружаем ингредиенты…</div>
            ) : ingredientsError ? (
              <div className={styles.ingredientsError}>{ingredientsError}</div>
            ) : ingredients.length === 0 ? (
              <div className={styles.ingredientsStatus}>Ингредиенты недоступны для этого рецепта</div>
            ) : (
              <div className={styles.ingredientsGrid}>
                {ingredients.map((ingredient: any, index: number) => {
                  const availabilityDetails = getIngredientAvailabilityDetails(ingredient);
                  const status = resolveIngredientStatus(availabilityDetails);
                  const isAvailable = status === 'available';
                  const isPartial = status === 'partial';
                  const hasNoIngredients =
                    effectiveAvailableIds.length === 0 && Object.keys(fridgeTotals).length === 0;
                  const ingredientId = getIngredientKey(ingredient);
                  const key = ingredientId || String((ingredient as any)?.id ?? `ingredient-${index}`);
                  const ingredientName = (ingredient as any)?.name ?? 'Ингредиент';
                  const ingredientUnitLabel = getIngredientUnitLabel(ingredient);
                  const unitSuffix = ingredientUnitLabel ? ` ${ingredientUnitLabel}` : '';
                  const ingredientCountRaw = Number((ingredient as any)?.count) || 0;

                  const requiredFormatted = formatAmount(Math.max(0, ingredientCountRaw));

                  const availableValue = (() => {
                    if (isPartial) {
                      return availabilityDetails.availableInRecipeUnit;
                    }
                    if (isAvailable) {
                      if (availabilityDetails.hasComparable) {
                        return availabilityDetails.availableInRecipeUnit > 0
                          ? availabilityDetails.availableInRecipeUnit
                          : ingredientCountRaw;
                      }
                      if (availabilityDetails.hasAnyPresence) {
                        return ingredientCountRaw;
                      }
                      return ingredientCountRaw;
                    }
                    return 0;
                  })();

                  const cappedAvailableValue = Math.max(0, Math.min(availableValue, ingredientCountRaw));
                  const ingredientAvailableFormatted = formatAmount(cappedAvailableValue);

                  return (
                    <div
                      key={key}
                      className={`${styles.ingredientItem} ${hasNoIngredients ? styles.missing : (isAvailable ? styles.available : (isPartial ? styles.partial : styles.missing))}`}
                    >
                      <div className={styles.ingredientIcon}>
                        {hasNoIngredients ? (
                          <ExclamationTriangleIcon className={styles.warningIcon} />
                        ) : isAvailable ? (
                          <CheckCircleIcon className={styles.checkIcon} />
                        ) : isPartial ? (
                          <ExclamationTriangleIcon className={styles.partialIcon} />
                        ) : (
                          <ExclamationTriangleIcon className={styles.warningIcon} />
                        )}
                      </div>
                      <span className={styles.ingredientText}>
                        {isPartial
                          ? `${ingredientName} (${ingredientAvailableFormatted}/${requiredFormatted}${unitSuffix})`
                          : `${ingredientName} (${requiredFormatted}${unitSuffix})`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            
            {!ingredientsLoading && ingredients.length > 0 && effectiveAvailableIds.length === 0 ? (
              <div className={styles.missingIngredients}>
                <div className={styles.missingHeader}>
                  <h4>Все ингредиенты:</h4>
                  <button 
                    className={styles.shoppingListBtn}
                    onClick={handleCreateShoppingList}
                    onTouchEnd={handleCreateShoppingList}
                    title="Составить список покупок"
                  >
                    <ListBulletIcon className={styles.shoppingListIcon} />
                    Список покупок
                  </button>
                </div>
                <ul>
                  {ingredients.map((ingredient: any, index: number) => {
                    const ingredientId = getIngredientKey(ingredient);
                    const key = ingredientId || String((ingredient as any)?.id ?? `ingredient-${index}`);
                    const ingredientName = (ingredient as any)?.name ?? 'Ингредиент';
                    const ingredientUnitLabel = getIngredientUnitLabel(ingredient);
                    const unitSuffix = ingredientUnitLabel ? ` ${ingredientUnitLabel}` : '';
                    const ingredientCountRaw = Number((ingredient as any)?.count) || 0;
                    const formattedAmountValue = formatAmount(Math.max(0, ingredientCountRaw));
                    return (
                      <li key={key}>
                        {ingredientName} - {formattedAmountValue}{unitSuffix}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (!ingredientsLoading && effectiveMissingIngredients.length > 0) && (
              <div className={styles.missingIngredients}>
                <div className={styles.missingHeader}>
                  <h4>Нужно докупить:</h4>
                  <button 
                    className={styles.shoppingListBtn}
                    onClick={handleCreateShoppingList}
                    onTouchEnd={handleCreateShoppingList}
                    title="Составить список покупок"
                  >
                    <ListBulletIcon className={styles.shoppingListIcon} />
                    Список покупок
                  </button>
                </div>
                <ul>
                  {effectiveMissingIngredients.map((ingredient: RecipeIngredient) => {
                    const unitSuffix = ingredient.unit ? ` ${ingredient.unit}` : '';
                    const formattedAmount = formatAmount(Number(ingredient.amount));
                    return (
                      <li key={ingredient.id}>
                        {ingredient.ingredient.name} - {formattedAmount}{unitSuffix}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
};

export default DiscoverCard; 
