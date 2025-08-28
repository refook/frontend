import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchRecipe } from '../store/thunks';
import { RecipesService } from '../services/recipesService';
import { PencilIcon } from '@heroicons/react/24/outline';
import RecipePreview from '../components/RecipePreview';
import styles from './RecipeDetailPage.module.css';
import { API_BASE_URL } from '../services/api';
import { getAuthHeaders, authorizedFetch } from '../services/auth';
import type { RecipeIngredientDto, StepResponseDto } from '../types/recipe.types';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentRecipe, loading, error } = useAppSelector(state => state.recipes);
  const [compositionIngredients, setCompositionIngredients] = useState<RecipeIngredientDto[] | null>(null);
  const [compositionSteps, setCompositionSteps] = useState<StepResponseDto[] | null>(null);
  const [overrideCookTimeMin, setOverrideCookTimeMin] = useState<number | null>(null);
  const [overridePrepTimeMin, setOverridePrepTimeMin] = useState<number | null>(null);
  const [overrideServings, setOverrideServings] = useState<number | null>(null);
  const [compositionError, setCompositionError] = useState<string | null>(null);
  
  // Загружаем рецепт при изменении ID
  useEffect(() => {
    if (id) {
      dispatch(fetchRecipe(id));
    }
  }, [dispatch, id]);

  // Доп. загрузка состава по новому API (RecipeCompositionResponseDto)
  useEffect(() => {
    const loadComposition = async () => {
      if (!id) return;
      try {
        setCompositionError(null);
        const headers = getAuthHeaders();
        const resp = await authorizedFetch(`${API_BASE_URL}/recipe/details/${id}` , { headers });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const ingredients = data?.composition?.ingredients;
        if (Array.isArray(ingredients)) {
          setCompositionIngredients(ingredients as RecipeIngredientDto[]);
        } else {
          setCompositionIngredients(null);
        }

        const steps = data?.composition?.steps;
        if (Array.isArray(steps)) {
          setCompositionSteps(steps as StepResponseDto[]);
        } else {
          setCompositionSteps(null);
        }

        // Обновим времена и порции из новой структуры API
        const activeSec = Number(data?.cookingTime?.activeTime) || 0;
        const allSec = Number(data?.cookingTime?.allTime) || 0;
        const cookMin = Math.round(activeSec / 60);
        const prepMin = Math.max(0, Math.round((allSec - activeSec) / 60));
        setOverrideCookTimeMin(cookMin);
        setOverridePrepTimeMin(prepMin);

        const unitCount = Number(data?.serving?.unitCount);
        if (!Number.isNaN(unitCount) && unitCount > 0) {
          setOverrideServings(unitCount);
        } else {
          setOverrideServings(null);
        }
      } catch (e: any) {
        setCompositionError(e?.message || 'Не удалось загрузить состав рецепта');
        setCompositionIngredients(null);
      }
    };
    loadComposition();
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <p>Загрузка рецепта...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className={styles.error}>
          <h1>Ошибка загрузки рецепта</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/recipes')} className={styles.backBtn}>
            ← Назад к списку
          </button>
        </div>
      </div>
    );
  }

  if (!currentRecipe) {
    return (
      <div className="container">
        <div className={styles.notFound}>
          <h1>Рецепт не найден</h1>
          <button onClick={() => navigate('/recipes')} className={styles.backBtn}>
            ← Назад к списку
          </button>
        </div>
      </div>
    );
  }

  const recipe = currentRecipe;

  const handleEdit = () => {
    navigate(`/recipe/${recipe.id}/edit`);
  };

  return (
    <div className={styles.detailPage}>
      <div className="container">
        <div className={styles.topBar}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            ← Назад
          </button>
          <button 
          //onClick={handleEdit} 
          className={styles.editBtn}>
            <PencilIcon className={styles.editIcon} />
            Редактировать (в разработке)
          </button>
        </div>
        
        <RecipePreview 
          recipe={{
            ...recipe,
            ingredients: compositionIngredients ?? recipe.ingredients,
            steps: compositionSteps ?? recipe.steps,
            prepTime: overridePrepTimeMin ?? recipe.prepTime,
            cookTime: overrideCookTimeMin ?? recipe.cookTime,
            servings: overrideServings ?? recipe.servings
          }}
          showActions={false}
        />
      </div>
    </div>
  );
};

export default RecipeDetailPage; 