import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditRecipePage.module.css';
import RecipeForm from '../components/RecipeForm/RecipeForm';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchRecipe } from '../store/thunks/recipesThunks';
import { updateRecipeThunk } from '../store/thunks/recipesThunks';
import type { CreateRecipeDto, UpdateRecipeDto } from '../types/recipe.types';

const EditRecipePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentRecipe, loading } = useAppSelector((state) => state.recipes);
  const [submitting, setSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (id) {
      dispatch(fetchRecipe(id));
    }
  }, [dispatch, id]);

  const initialData: CreateRecipeDto = useMemo(() => {
    if (!currentRecipe) {
      return {
        name: '',
        description: '',
        level: 'EASY',
        kitchens: [],
        cookTime: 0,
        allTime: 0,
        photos: [],
        tags: [],
        ingredients: [],
        steps: [],
      } as any;
    }
    return {
      name: currentRecipe.title,
      description: currentRecipe.description,
      level: currentRecipe.difficulty.toUpperCase() as any,
      kitchens: currentRecipe.cuisine ? [currentRecipe.cuisine] : [],
      cookTime: currentRecipe.cookTime * 60,
      allTime: (currentRecipe.prepTime + currentRecipe.cookTime) * 60,
      photos: currentRecipe.photos || [],
      tags: (currentRecipe.tags || []) as any,
      ingredients: (currentRecipe.ingredients || []).map((ing) => ({
        id: ing.id,
        count: ing.count,
        productUnit: (ing as any).productUnit || (ing as any).measure,
      })),
      steps: (currentRecipe.steps || []).map((s) => ({
        id: s.id,
        index: s.index,
        name: s.name,
        description: s.description,
        photos: s.photos || [],
        ingredients: s.ingredients || [],
        time: s.time || 0,
      })),
    } as any;
  }, [currentRecipe]);

  const onChange = (data: CreateRecipeDto) => {
    // Минимальная валидация для кнопки
    const valid = Boolean(data.name?.trim()) && Boolean(data.description?.trim()) && data.ingredients?.length > 0 && data.steps?.length > 0;
    setIsValid(valid);
  };

  const onSubmit = async (data: CreateRecipeDto) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const payload: UpdateRecipeDto = data;
      await dispatch(updateRecipeThunk({ id, updates: payload })).unwrap();
      navigate(`/recipe/${id}`);
    } catch (e) {
      // TODO: показать уведомление об ошибке
      console.error('Ошибка при обновлении рецепта', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.editRecipePage}>
      <div className={styles.header}>
        <button 
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          ← Назад
        </button>
        <h1>Редактировать рецепт</h1>
      </div>

      {loading && (
        <div className={styles.notice}>
          <div className={styles.noticeIcon}>⏳</div>
          <div className={styles.noticeContent}>
            <h2>Загружаем рецепт...</h2>
          </div>
        </div>
      )}

      {!loading && (
        <RecipeForm
          initialData={initialData}
          onChange={onChange}
          onSubmit={onSubmit}
          isSubmitting={submitting}
          isValid={isValid}
        />
      )}
    </div>
  );
};

export default EditRecipePage; 