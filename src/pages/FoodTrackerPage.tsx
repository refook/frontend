import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from './FoodTrackerPage.module.css';
import { foodTrackerService, type DayMeals, type MealType } from '../services/foodTrackerService';
import productsService from '../services/productsService';
import { RecipesService } from '../services/recipesService';
import type { ProductResponseDto, ProductMeasureResponseDto, Recipe } from '../types';

type ModalTab = 'product' | 'recipe' | 'manual';
type PortionUnit = 'portion' | 'gram' | 'piece';

const mealsLabels: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

const macroColors = {
  proteins: '#55c891',
  fats: '#f7c266',
  carbs: '#9ca8ff',
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, subtitle, children }) => {
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const handleClose = useCallback(() => {
    setDragOffset(0);
    setDragStart(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleClose]);

  const onStart = (y: number) => {
    setDragStart(y);
  };

  const onMove = (y: number) => {
    if (dragStart == null) return;
    const diff = y - dragStart;
    setDragOffset(Math.max(0, diff));
  };

  const onEnd = () => {
    if (dragOffset > 80) {
      handleClose();
    } else {
      setDragOffset(0);
    }
    setDragStart(null);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true">
      <div
        className={styles.sheetBackdrop}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className={styles.sheet}
        style={{ transform: `translateY(${dragOffset}px)` }}
        onMouseDown={(e) => onStart(e.clientY)}
        onMouseMove={(e) => dragStart != null && onMove(e.clientY)}
        onMouseUp={onEnd}
        onMouseLeave={dragStart != null ? onEnd : undefined}
        onTouchStart={(e) => onStart(e.touches[0].clientY)}
        onTouchMove={(e) => onMove(e.touches[0].clientY)}
        onTouchEnd={onEnd}
      >
        <div className={styles.sheetHandle} />
        <div className={styles.sheetHeader}>
          <div>
            <p className={styles.hint}>{subtitle}</p>
            <h2 className={styles.modalTitle}>{title}</h2>
          </div>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Закрыть">
            <XMarkIcon width={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const FoodTrackerPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const dateKey = useMemo(
    () => currentDate.toISOString().slice(0, 10),
    [currentDate]
  );
  const [meals, setMeals] = useState<DayMeals>(() =>
    foodTrackerService.getDay(dateKey)
  );
  const [modalMeal, setModalMeal] = useState<MealType | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('product');
  const [productQuery, setProductQuery] = useState('');
  const [productAmount, setProductAmount] = useState('1');
  const [productUnit, setProductUnit] = useState<PortionUnit>('portion');
  const [recipeQuery, setRecipeQuery] = useState('');
  const [recipeAmount, setRecipeAmount] = useState('1');
  const [recipeUnit, setRecipeUnit] = useState<PortionUnit>('portion');
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [productResults, setProductResults] = useState<ProductResponseDto[]>([]);
  const [recipeResults, setRecipeResults] = useState<Recipe[]>([]);
  const [productMeasures, setProductMeasures] = useState<Record<string, ProductMeasureResponseDto[]>>({});
  const [productSelections, setProductSelections] = useState<Record<string, { measureId?: string; amount: string }>>({});
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const goalCalories = 2000;

  const totalCalories = useMemo(
    () =>
      (Object.keys(meals) as MealType[]).reduce(
        (acc, key) =>
          acc +
          meals[key].reduce((sum, item) => sum + Number(item.calories || 0), 0),
        0
      ),
    [meals]
  );

  const goalProgress = Math.min(100, Math.round((totalCalories / goalCalories) * 100 || 0));

  const macrosTotal = useMemo(() => {
    return (Object.keys(meals) as MealType[]).reduce(
      (acc, key) => {
        meals[key].forEach((item) => {
          acc.proteins += Number(item.macros?.proteins ?? 0);
          acc.fats += Number(item.macros?.fats ?? 0);
          acc.carbs += Number(item.macros?.carbs ?? 0);
        });
        return acc;
      },
      { proteins: 0, fats: 0, carbs: 0 }
    );
  }, [meals]);

  useEffect(() => {
    setMeals(foodTrackerService.getDay(dateKey));
  }, [dateKey]);

  const ensureProductMeasures = useCallback(
    async (productId: string) => {
      if (productMeasures[productId]) return;
      try {
        const measures = await productsService.getBaseMeasures(productId);
        setProductMeasures((prev) => ({ ...prev, [productId]: measures }));
        if (!productSelections[productId]) {
          const defaultMeasure = measures.find((m) => m.isDefault) ?? measures[0];
          setProductSelections((prev) => ({
            ...prev,
            [productId]: { measureId: defaultMeasure?.id, amount: '1' },
          }));
        }
      } catch (e) {
        console.error('Не удалось загрузить меры продукта', e);
      }
    },
    [productMeasures, productSelections]
  );

  useEffect(() => {
    productResults.forEach((product) => {
      void ensureProductMeasures(product.id);
    });
  }, [productResults, ensureProductMeasures]);

  const unitLabels: Record<PortionUnit, string> = {
    portion: 'порции',
    gram: 'г',
    piece: 'шт',
  };

  const calculateFactor = (amountStr: string, unit: PortionUnit) => {
    const amount = Number(amountStr) || 0;
    if (amount <= 0) return 0;
    if (unit === 'gram') {
      return amount / 100;
    }
    return amount;
  };

  const buildDetails = (amountStr: string, unit: PortionUnit) => {
    const amount = Number(amountStr) || 0;
    if (!amount) return '';
    return `${amount} ${unitLabels[unit]}`;
  };

  const shiftDay = (delta: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta);
      return next;
    });
  };

  const openModal = (meal: MealType) => {
    setModalMeal(meal);
    setActiveTab('product');
    setError(null);
  };

  const closeModal = () => {
    setModalMeal(null);
    setError(null);
    setProductResults([]);
    setRecipeResults([]);
    setProductQuery('');
    setProductSelections({});
    setProductMeasures({});
    setProductAmount('1');
    setProductUnit('portion');
    setRecipeQuery('');
    setRecipeAmount('1');
    setRecipeUnit('portion');
    setManualName('');
    setManualCalories('');
  };

  const handleAddProduct = (product: ProductResponseDto) => {
    if (!modalMeal) return;
    const measures = productMeasures[product.id] ?? [];
    const selection = productSelections[product.id];
    const selectedMeasure =
      measures.find((m) => m.id === selection?.measureId) ??
      measures.find((m) => m.isDefault) ??
      measures[0];
    const amount = Number(selection?.amount ?? 1);
    const factor =
      selectedMeasure && amount > 0
        ? (selectedMeasure.weight * amount) / 100
        : calculateFactor(productAmount, productUnit);
    if (!factor) {
      setError('Укажите количество больше 0');
      return;
    }
    const updated = foodTrackerService.addEntry(
      dateKey,
      modalMeal,
      foodTrackerService.productToEntry(product, {
        factor,
        details: selectedMeasure
          ? `${amount} × ${selectedMeasure.name} (${selectedMeasure.weight} г)`
          : buildDetails(productAmount, productUnit),
      })
    );
    setMeals(updated);
    closeModal();
  };

  const handleAddRecipe = (recipe: Recipe) => {
    if (!modalMeal) return;
    const factor = calculateFactor(recipeAmount, recipeUnit);
    if (!factor) {
      setError('Укажите количество больше 0');
      return;
    }
    const updated = foodTrackerService.addEntry(
      dateKey,
      modalMeal,
      foodTrackerService.recipeToEntry(recipe, {
        factor,
        details: buildDetails(recipeAmount, recipeUnit),
      })
    );
    setMeals(updated);
    closeModal();
  };

  const handleManualAdd = () => {
    if (!modalMeal) return;
    if (!manualName.trim()) {
      setError('Добавьте название блюда');
      return;
    }
    const calories = Number(manualCalories) || 0;
    const updated = foodTrackerService.addEntry(dateKey, modalMeal, {
      title: manualName.trim(),
      calories,
      source: 'manual',
    });
    setMeals(updated);
    closeModal();
  };

  const handleRemove = (meal: MealType, id: string) => {
    setMeals(foodTrackerService.removeEntry(dateKey, meal, id));
  };

  const searchProducts = async (query: string) => {
    if (!query.trim()) return;
    setLoadingProduct(true);
    setError(null);
    try {
      const results = await productsService.searchProductsByName(query.trim());
      setProductResults(results);
    } catch (e) {
      setError('Не удалось загрузить продукты');
      console.error(e);
    } finally {
      setLoadingProduct(false);
    }
  };

  const searchRecipes = async (query: string) => {
    if (!query.trim()) return;
    setLoadingRecipe(true);
    setError(null);
    try {
      const results = await RecipesService.searchRecipes(query.trim(), 1, 5);
      setRecipeResults(results.data);
    } catch (e) {
      setError('Не удалось загрузить рецепты');
      console.error(e);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const renderModalContent = () => {
    if (!modalMeal) return null;
    return (
      <BottomSheet
        isOpen={Boolean(modalMeal)}
        onClose={closeModal}
        title="Добавление"
        subtitle={`Добавить в ${mealsLabels[modalMeal]}`}
      >
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'product' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('product')}
            type="button"
          >
            Продукт
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'recipe' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('recipe')}
            type="button"
          >
            Рецепт
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'manual' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('manual')}
            type="button"
          >
            Быстро
          </button>
        </div>

          {activeTab === 'product' && (
            <div className={styles.formSection}>
              <div className={styles.inputRow}>
                <input
                  className={styles.input}
                  placeholder="Введите продукт"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                />
                <button
                  className={styles.submitButton}
                  onClick={() => searchProducts(productQuery)}
                  type="button"
                >
                Поиск
              </button>
            </div>
            {loadingProduct && <span className={styles.hint}>Загрузка...</span>}
              {productResults.length > 0 && (
                <div className={styles.resultsList}>
                  {productResults.map((product) => (
                    <div key={product.id} className={styles.resultItem}>
                      <div className={styles.resultMeta}>
                        <span className={styles.resultTitle}>{product.name}</span>
                        <span className={styles.hint}>
                          {product.macros?.calories ?? 0} ккал
                        </span>
                        {productMeasures[product.id] && productMeasures[product.id].length > 0 && (
                          <div className={styles.amountRow}>
                            <input
                              className={styles.input}
                              placeholder="Кол-во"
                              value={productSelections[product.id]?.amount ?? '1'}
                              onChange={(e) =>
                                setProductSelections((prev) => ({
                                  ...prev,
                                  [product.id]: {
                                    measureId:
                                      prev[product.id]?.measureId ??
                                      productMeasures[product.id][0]?.id,
                                    amount: e.target.value,
                                  },
                                }))
                              }
                              type="number"
                              min="0"
                              step="1"
                            />
                            <select
                              className={styles.select}
                              value={
                                productSelections[product.id]?.measureId ??
                                productMeasures[product.id][0]?.id
                              }
                              onChange={(e) =>
                                setProductSelections((prev) => ({
                                  ...prev,
                                  [product.id]: {
                                    measureId: e.target.value,
                                    amount: prev[product.id]?.amount ?? '1',
                                  },
                                }))
                              }
                            >
                              {productMeasures[product.id].map((measure) => (
                                <option key={measure.id} value={measure.id}>
                                  {measure.name} ({measure.weight} г)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <button
                        className={styles.addButton}
                        onClick={() => handleAddProduct(product)}
                        type="button"
                      >
                      <PlusIcon width={16} />
                      Добавить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recipe' && (
          <div className={styles.formSection}>
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                placeholder="Название рецепта"
                value={recipeQuery}
                onChange={(e) => setRecipeQuery(e.target.value)}
              />
              <div className={styles.amountRow}>
                <input
                  className={styles.input}
                  placeholder="Кол-во"
                  value={recipeAmount}
                  onChange={(e) => setRecipeAmount(e.target.value)}
                  type="number"
                  min="0"
                  step="1"
                />
                <select
                  className={styles.select}
                  value={recipeUnit}
                  onChange={(e) =>
                    setRecipeUnit(e.target.value as typeof recipeUnit)
                  }
                >
                  <option value="portion">порции</option>
                  <option value="gram">граммы</option>
                  <option value="piece">штуки</option>
                </select>
              </div>
              <button
                className={styles.submitButton}
                onClick={() => searchRecipes(recipeQuery)}
                type="button"
              >
                Поиск
              </button>
            </div>
            {loadingRecipe && <span className={styles.hint}>Загрузка...</span>}
            {recipeResults.length > 0 && (
              <div className={styles.resultsList}>
                {recipeResults.map((recipe) => (
                  <div key={recipe.id} className={styles.resultItem}>
                    <div className={styles.resultMeta}>
                      <span className={styles.resultTitle}>{recipe.title}</span>
                      <span className={styles.hint}>
                        {recipe.macros?.calories ?? 0} ккал
                      </span>
                    </div>
                    <button
                      className={styles.addButton}
                      onClick={() => handleAddRecipe(recipe)}
                      type="button"
                    >
                      <PlusIcon width={16} />
                      Добавить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'manual' && (
          <div className={styles.formSection}>
            <input
              className={styles.input}
              placeholder="Название блюда"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
            />
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                placeholder="Калории, ккал"
                value={manualCalories}
                onChange={(e) => setManualCalories(e.target.value)}
                type="number"
                min="0"
                step="1"
              />
              <button
                className={styles.submitButton}
                onClick={handleManualAdd}
                type="button"
              >
                Добавить
              </button>
            </div>
          </div>
        )}

        {error && <span className={styles.hint}>{error}</span>}
      </BottomSheet>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <span className={styles.heroLabel}>Трекер питания</span>
          <h1 className={styles.title}>{formatDate(currentDate)}</h1>
          <div className={styles.heroActions}>
            <button
              className={styles.heroPill}
              onClick={() => shiftDay(-1)}
              type="button"
            >
              <ChevronLeftIcon width={16} />
              Вчера
            </button>
            <button
              className={styles.heroPill}
              onClick={() => shiftDay(1)}
              type="button"
            >
              Завтра
              <ChevronRightIcon width={16} />
            </button>
          </div>
        </div>
          <div className={styles.goalArea}>
            <div className={styles.legend}>
              <span className={styles.legendTitle}>БЖУ, г</span>
            <div className={styles.legendRow}>
              <span className={styles.legendText} style={{ color: macroColors.proteins }}>Белки</span>
              <strong>{Math.round(macrosTotal.proteins)}</strong>
            </div>
            <div className={styles.legendRow}>
              <span className={styles.legendText} style={{ color: macroColors.fats }}>Жиры</span>
              <strong>{Math.round(macrosTotal.fats)}</strong>
            </div>
            <div className={styles.legendRow}>
              <span className={styles.legendText} style={{ color: macroColors.carbs }}>Углеводы</span>
              <strong>{Math.round(macrosTotal.carbs)}</strong>
            </div>
          </div>
          <div className={styles.goalCard}>
            <div
              className={styles.goalGlow}
              style={{
                opacity: Math.max(0.25, goalProgress / 100),
                transform: `scale(${1 + goalProgress / 130})`,
              }}
            />
            <div className={styles.goalCircleWrapper}>
              {(() => {
                const totalMacros = Math.max(
                  0,
                  macrosTotal.proteins + macrosTotal.fats + macrosTotal.carbs
                );
                const segments = [
                  { key: 'proteins', value: macrosTotal.proteins, color: macroColors.proteins },
                  { key: 'fats', value: macrosTotal.fats, color: macroColors.fats },
                  { key: 'carbs', value: macrosTotal.carbs, color: macroColors.carbs },
                ].filter((segment) => (segment.value ?? 0) > 0);

                if (segments.length === 0) {
                  return (
                    <CircularProgressbar
                      value={100}
                      maxValue={100}
                      strokeWidth={10}
                      className={styles.goalProgress}
                      styles={buildStyles({
                        trailColor: 'rgba(99, 102, 241, 0.08)',
                        pathColor: 'rgba(99, 102, 241, 0.35)',
                        strokeLinecap: 'butt',
                      })}
                    />
                  );
                }

                let accumulated = 0;
                return segments.map((segment) => {
                  const percent = totalMacros ? (segment.value! / totalMacros) * 100 : 0;
                  const rotation = accumulated / 100;
                  accumulated += percent;
                  return (
                    <CircularProgressbar
                      key={segment.key}
                      value={percent}
                      maxValue={100}
                      strokeWidth={10}
                      className={styles.goalProgress}
                      styles={buildStyles({
                        trailColor: 'transparent',
                        pathColor: segment.color,
                        rotation,
                        strokeLinecap: 'butt',
                        pathTransition: 'none',
                      })}
                    />
                  );
                });
              })()}
              <div className={styles.goalCircle}>
                <span className={styles.goalLabel}>Цель</span>
                <span className={styles.goalValue}>{totalCalories} / {goalCalories}</span>
                <span className={styles.goalPercent}>{goalProgress}% от цели</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mealsGrid}>
        {(Object.keys(mealsLabels) as MealType[]).map((mealKey) => (
          <div key={mealKey} className={styles.mealCard}>
            <div className={styles.mealHeader}>
              <h3 className={styles.mealTitle}>{mealsLabels[mealKey]}</h3>
              <button
                className={styles.addButton}
                onClick={() => openModal(mealKey)}
                type="button"
              >
                <PlusIcon width={16} />
                Добавить
              </button>
            </div>
            <div className={styles.items}>
              {meals[mealKey].length === 0 && (
                <span className={styles.empty}>Пока ничего не добавлено</span>
              )}
              {meals[mealKey].map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemMeta}>
                    <div className={styles.itemTitleRow}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      {item.details && (
                        <span className={styles.detailText}>{item.details}</span>
                      )}
                      {item.source === 'recipe' && (
                        <span className={`${styles.badge} ${styles.badgeRecipe}`}>
                          Рецепт
                        </span>
                      )}
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.pill}>{item.calories} ккал</span>
                      {item.macros && (
                        <>
                          {[
                            { key: 'proteins', label: 'Б', value: item.macros.proteins, color: macroColors.proteins },
                            { key: 'fats', label: 'Ж', value: item.macros.fats, color: macroColors.fats },
                            { key: 'carbs', label: 'У', value: item.macros.carbs, color: macroColors.carbs },
                          ]
                            .filter((chip) => chip.value !== undefined)
                            .map((chip) => (
                              <span
                                key={chip.key}
                                className={styles.macroChip}
                                style={{ color: chip.color, borderColor: chip.color }}
                              >
                                {chip.label}: {Math.round(chip.value ?? 0)} г
                              </span>
                            ))}
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemove(mealKey, item.id)}
                    aria-label="Удалить"
                    type="button"
                  >
                    <XMarkIcon width={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {renderModalContent()}
    </div>
  );
};

export default FoodTrackerPage;
