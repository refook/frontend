import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchFridgeItemsThunk, addFridgeItemThunk } from '../store/thunks/fridgeThunks';
import { fetchRecipes } from '../store/thunks/recipesThunks';
import type { Recipe } from '../types';
import CardsFeed from '../components/DiscoverCard/CardsFeed';
import DiscoverCardSkeleton from '../components/DiscoverCard/DiscoverCardSkeleton';
import EmptyDiscoverCard from '../components/DiscoverCard/EmptyDiscoverCard';
import RecipeSelectedNotification from '../components/DiscoverCard/RecipeSelectedNotification';
import type { FilterType } from '../components/DiscoverCard/FilterSettings';
import styles from './DiscoverPage.module.css';
import { fridgeApiService } from '../services/fridgeApiService';
import type { MeasureType } from '../types/measures.types';

const DiscoverPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNotification, setShowNotification] = useState(false);
  const [selectedRecipeTitle, setSelectedRecipeTitle] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');

  const dispatch = useAppDispatch();
  
  const { items: fridgeItems } = useAppSelector((state) => state.fridge);
  const { items: allRecipes, loading: recipesLoading } = useAppSelector((state) => state.recipes);

  // Доступность по количеству из реального API холодильника
  const [fridgeTotalsById, setFridgeTotalsById] = useState<Record<string, { amount: number; unit: MeasureType }>>({});
  const [fridgeLoaded, setFridgeLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadFridge = async () => {
      try {
        const products = await fridgeApiService.getAllFridgeProducts();
        if (!isActive) return;
        const totals: Record<string, { amount: number; unit: MeasureType }> = {};
        for (const p of products) {
          const id = p.ingredient.id;
          const unit = p.unit as MeasureType;
          const amount = Number(p.amount) || 0;
          if (!totals[id]) {
            totals[id] = { amount, unit };
          } else {
            // Суммируем, приводя к базовым единицам
            const base = convertToBase(amount, unit);
            const cur = totals[id];
            const curBase = convertToBase(cur.amount, cur.unit);
            const sumBase = base.value + curBase.value;
            totals[id] = {
              amount: sumBase,
              unit: base.group === 'weight' ? ('GR' as MeasureType) : ('ML' as MeasureType)
            };
          }
        }
        setFridgeTotalsById(totals);
      } finally {
        if (isActive) setFridgeLoaded(true);
      }
    };
    loadFridge();
    return () => { isActive = false; };
  }, []);

  const convertToBase = (value: number, unit: MeasureType): { value: number; group: 'weight' | 'volume' | 'unknown' } => {
    switch (unit) {
      case 'MG': return { value: value / 1000, group: 'weight' };
      case 'GR': return { value, group: 'weight' };
      case 'KG': return { value: value * 1000, group: 'weight' };
      case 'ML': return { value, group: 'volume' };
      case 'L':  return { value: value * 1000, group: 'volume' };
      default: return { value, group: 'unknown' };
    }
  };

  const classifyIngredient = (ing: any): 'available' | 'partial' | 'missing' => {
    const id = ing.id as string;
    const fridge = fridgeTotalsById[id];
    if (!fridge) return 'missing';
    const recBase = convertToBase(ing.count, ing.measure as MeasureType);
    const frBase = convertToBase(fridge.amount, fridge.unit);
    if (recBase.group !== frBase.group || recBase.group === 'unknown') {
      // Не можем сравнить корректно — считаем как наличие
      return 'available';
    }
    if (frBase.value >= recBase.value) return 'available';
    if (frBase.value > 0) return 'partial';
    return 'missing';
  };

  // Загружаем данные холодильника и рецепты при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      try {
        const fridgeResult = await dispatch(fetchFridgeItemsThunk('current-user')).unwrap();
        const recipesResult = await dispatch(fetchRecipes({ page: 1, limit: 50 })).unwrap(); // Загружаем первые 50 рецептов
        console.log('Data loaded successfully:', {
          fridgeItemsLoaded: fridgeResult.length,
          recipesLoaded: recipesResult.data.length
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [dispatch]);



  useEffect(() => {
    // Фильтруем рецепты только если они уже загружены
    if (recipesLoading || allRecipes.length === 0) {
      console.log('Skipping filter because data not ready:', {
        recipesLoading,
        allRecipesLength: allRecipes.length,
        fridgeItemsLength: fridgeItems.length
      });
      return;
    }

    // Загружаем рецепты и фильтруем их по доступным ингредиентам
    const loadRecipes = async () => {
      setLoading(true);
      try {
        // Отладочная информация
        console.log('Debug DiscoverPage:', {
          allRecipesCount: allRecipes.length,
          fridgeItemsCount: fridgeItems.length,
          currentFilter,
          loading,
          recipesLoading,
          availableIngredients: fridgeItems.map((item: any) => item.ingredient.id),
          fridgeItems: fridgeItems.slice(0, 3).map((item: any) => ({ 
            id: item.id, 
            name: item.ingredient.name, 
            userId: item.userId 
          }))
        });

        // Фильтрация по количественной доступности
        const availableRecipes = allRecipes.filter((recipe: Recipe) => {
          if (currentFilter === 'all') return true;
          const statuses = (recipe.ingredients as any[]).map(ing => classifyIngredient(ing));
          const total = statuses.length;
          const availCount = statuses.filter(s => s === 'available').length;
          const partialCount = statuses.filter(s => s === 'partial').length;
          const haveAny = availCount + partialCount > 0;
          const allAvailable = availCount === total && total > 0;
          switch (currentFilter) {
            case 'available':
              return allAvailable;
            case 'partial':
              return haveAny && !allAvailable;
            case 'missing':
              return !haveAny;
            default:
              return true;
          }
        });
        
        // Детальная отладка фильтрации
        const filterDebug = allRecipes.slice(0, 3).map((recipe: Recipe) => {
          const statuses = (recipe.ingredients as any[]).map(ing => classifyIngredient(ing));
          const totalI = statuses.length;
          const avail = statuses.filter(s => s === 'available').length;
          const part = statuses.filter(s => s === 'partial').length;
          return {
            title: recipe.title,
            totalIngredients: totalI,
            available: avail,
            partial: part,
          };
        });
        
        console.log('Filter debug (first 3 recipes):', filterDebug);
        
        console.log('Filtered recipes:', {
          filteredCount: availableRecipes.length,
          currentFilter,
          recipes: availableRecipes.slice(0, 3).map(r => ({ id: r.id, title: r.title }))
        });
        
        setRecipes(availableRecipes);
      } catch (error) {
        console.error('Ошибка загрузки рецептов:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [allRecipes, fridgeItems, currentFilter, recipesLoading]);



  const handleFilterChange = (filter: FilterType) => {
    setCurrentFilter(filter);
    setCurrentIndex(0); // Сбрасываем индекс при смене фильтра
  };

  if (loading || recipesLoading) {
    return (
      <div className={styles.discoverPage}>
        <div className={styles.cardsContainer}>
          <DiscoverCardSkeleton />
        </div>
      </div>
    );
  }

  if (recipes.length === 0 && currentFilter !== 'all') {
    return (
      <div className={styles.discoverPage}>
        <div className={styles.cardsContainer}>
          <EmptyDiscoverCard filterType={currentFilter} />
        </div>
      </div>
    );
  }

  const availableIngredients = fridgeItems.map((item: any) => item.ingredient.id);

  return (
    <div className={styles.discoverPage}>
      <div className={styles.cardsContainer}>
        <CardsFeed
          recipes={recipes}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          availableIngredients={availableIngredients}
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
          onRecipeSelect={(recipe) => {
            setSelectedRecipeTitle(recipe.title);
            setShowNotification(true);
            console.log('Рецепт выбран:', recipe.id);
          }}
        />
        

        
        
      </div>
      
      <RecipeSelectedNotification
        recipeTitle={selectedRecipeTitle}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />
      
      
    </div>
  );
};

export default DiscoverPage; 