import React, { useState, useEffect } from 'react';
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

        // Фильтруем рецепты в зависимости от выбранного фильтра
        const availableRecipes = allRecipes.filter((recipe: Recipe) => {
          // Если фильтр "all", показываем все рецепты
          if (currentFilter === 'all') {
            return true;
          }
          
          // Для остальных фильтров проверяем доступность ингредиентов
          const availableIngredients = fridgeItems.map((item: any) => item.ingredient.id);
          const recipeIngredients = recipe.ingredients.map((ing: any) => ing.ingredient.id);
          
          // Если в холодильнике нет ингредиентов, все рецепты попадают в "missing"
          if (availableIngredients.length === 0) {
            return currentFilter === 'missing';
          }
          
          const availableCount = recipeIngredients.filter((id: string) => 
            availableIngredients.includes(id)
          ).length;
          
          const availabilityPercentage = (availableCount / recipeIngredients.length) * 100;
          
          // Фильтруем в зависимости от выбранного фильтра
          switch (currentFilter) {
            case 'available':
              return availabilityPercentage === 100;
            case 'partial':
              return availabilityPercentage >= 50 && availabilityPercentage < 100;
            case 'missing':
              return availabilityPercentage < 50;
            default:
              return availabilityPercentage >= 50;
          }
        });
        
        // Детальная отладка фильтрации
        const filterDebug = allRecipes.slice(0, 3).map((recipe: Recipe) => {
          const availableIngredients = fridgeItems.map((item: any) => item.ingredient.id);
          const recipeIngredients = recipe.ingredients.map((ing: any) => ing.ingredient.id);
          const availableCount = recipeIngredients.filter((id: string) => 
            availableIngredients.includes(id)
          ).length;
          const availabilityPercentage = (availableCount / recipeIngredients.length) * 100;
          
          return {
            title: recipe.title,
            totalIngredients: recipeIngredients.length,
            availableCount,
            availabilityPercentage: Math.round(availabilityPercentage),
            recipeIngredients: recipeIngredients.slice(0, 3),
            availableIngredients: availableIngredients.slice(0, 5)
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