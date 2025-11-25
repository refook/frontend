import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styles from './FoodTrackerPage.module.css';
import HeroHeader from './FoodTracker/components/HeroHeader';
import GoalSummary from './FoodTracker/components/GoalSummary';
import MealCard from './FoodTracker/components/MealCard';
import AddEntryModal from './FoodTracker/components/AddEntryModal';
import GoalModal from './FoodTracker/components/GoalModal';
import { mealsLabels, unitLabels } from './FoodTracker/constants';
import { calculateGoalFromInputs, formatDate } from './FoodTracker/utils';
import { type GoalResult, type GoalType, type ModalTab, type PortionUnit, type Sex } from './FoodTracker/types';
import { foodTrackerService, type DayMeals, type MealType } from '../services/foodTrackerService';
import productsService from '../services/productsService';
import { RecipesService } from '../services/recipesService';
import type { ProductResponseDto, ProductMeasureResponseDto, Recipe } from '../types';

const FoodTrackerPage: React.FC = () => {
  const defaultGoalInputs = useMemo(
    () => ({
      weight: '70',
      height: '175',
      age: '30',
      sex: 'male' as Sex,
      target: 'maintenance' as GoalType,
    }),
    []
  );

  const initialGoal = useMemo(
    () =>
      calculateGoalFromInputs({
        weight: Number(defaultGoalInputs.weight),
        height: Number(defaultGoalInputs.height),
        age: Number(defaultGoalInputs.age),
        sex: defaultGoalInputs.sex,
        target: defaultGoalInputs.target,
      }),
    [defaultGoalInputs]
  );

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const dateKey = useMemo(
    () => currentDate.toISOString().slice(0, 10),
    [currentDate]
  );
  const isToday = useMemo(() => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    return todayKey === dateKey;
  }, [dateKey]);
  const [meals, setMeals] = useState<DayMeals>(() =>
    foodTrackerService.getDay(dateKey)
  );
  const [goal, setGoal] = useState<GoalResult>(initialGoal);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState({
    ...defaultGoalInputs,
    calories: String(initialGoal.calories),
    proteins: String(initialGoal.proteins),
    fats: String(initialGoal.fats),
    carbs: String(initialGoal.carbs),
  });
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

  const goalProgress = Math.min(100, Math.round((totalCalories / goal.calories) * 100 || 0));

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

  const openGoalModal = () => {
    setGoalForm((prev) => ({
      ...prev,
      calories: String(goal.calories),
      proteins: String(goal.proteins),
      fats: String(goal.fats),
      carbs: String(goal.carbs),
    }));
    setGoalError(null);
    setGoalModalOpen(true);
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

  const closeGoalModal = () => {
    setGoalModalOpen(false);
    setGoalError(null);
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

  const recalculateGoal = () => {
    const weight = Number(goalForm.weight);
    const height = Number(goalForm.height);
    const age = Number(goalForm.age);
    if (!weight || !height || !age) {
      setGoalError('Заполните вес, рост и возраст');
      return;
    }
    const result = calculateGoalFromInputs({
      weight,
      height,
      age,
      sex: goalForm.sex,
      target: goalForm.target,
    });
    setGoalForm((prev) => ({
      ...prev,
      calories: String(result.calories),
      proteins: String(result.proteins),
      fats: String(result.fats),
      carbs: String(result.carbs),
    }));
    setGoalError(null);
  };

  const confirmGoal = () => {
    const calories = Number(goalForm.calories);
    const proteins = Number(goalForm.proteins);
    const fats = Number(goalForm.fats);
    const carbs = Number(goalForm.carbs);

    if (![calories, proteins, fats, carbs].every((v) => v > 0)) {
      setGoalError('Заполните калории и БЖУ больше 0');
      return;
    }

    setGoal({ calories, proteins, fats, carbs });
    closeGoalModal();
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <HeroHeader
          title={formatDate(currentDate)}
          isToday={isToday}
          onPrev={() => shiftDay(-1)}
          onNext={() => shiftDay(1)}
          onOpenGoal={openGoalModal}
        />
        <GoalSummary
          macrosTotal={macrosTotal}
          goal={goal}
          totalCalories={totalCalories}
          goalProgress={goalProgress}
        />
      </div>

      <div className={styles.mealsGrid}>
        {(Object.keys(mealsLabels) as MealType[]).map((mealKey) => (
          <MealCard
            key={mealKey}
            mealKey={mealKey}
            label={mealsLabels[mealKey]}
            items={meals[mealKey]}
            onAdd={() => openModal(mealKey)}
            onRemove={handleRemove}
          />
        ))}
      </div>

      <AddEntryModal
        isOpen={Boolean(modalMeal)}
        mealLabel={modalMeal ? mealsLabels[modalMeal] : ''}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setError(null);
        }}
        onClose={closeModal}
        productQuery={productQuery}
        onProductQueryChange={setProductQuery}
        productResults={productResults}
        productMeasures={productMeasures}
        productSelections={productSelections}
        onProductSelectionChange={(productId, selection) =>
          setProductSelections((prev) => ({ ...prev, [productId]: selection }))
        }
        onProductSearch={searchProducts}
        onAddProduct={handleAddProduct}
        loadingProduct={loadingProduct}
        recipeQuery={recipeQuery}
        onRecipeQueryChange={setRecipeQuery}
        recipeResults={recipeResults}
        recipeAmount={recipeAmount}
        recipeUnit={recipeUnit}
        onRecipeAmountChange={setRecipeAmount}
        onRecipeUnitChange={(unit) => setRecipeUnit(unit)}
        onRecipeSearch={searchRecipes}
        onAddRecipe={handleAddRecipe}
        loadingRecipe={loadingRecipe}
        manualName={manualName}
        manualCalories={manualCalories}
        onManualNameChange={setManualName}
        onManualCaloriesChange={setManualCalories}
        onManualAdd={handleManualAdd}
        error={error}
      />

      <GoalModal
        isOpen={goalModalOpen}
        onClose={closeGoalModal}
        form={goalForm}
        onFormChange={(patch) => {
          setGoalForm((prev) => ({ ...prev, ...patch }));
          setGoalError(null);
        }}
        onRecalculate={recalculateGoal}
        onConfirm={confirmGoal}
        error={goalError}
      />
    </div>
  );
};

export default FoodTrackerPage;
