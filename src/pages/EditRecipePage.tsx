import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditRecipePage.module.css';
import RecipeForm from '../components/RecipeForm/RecipeForm';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchRecipe } from '../store/thunks/recipesThunks';
import { updateRecipeThunk } from '../store/thunks/recipesThunks';
import type { CreateRecipeDto, UpdateRecipeDto, ApiCreateRecipeDto } from '../types/recipe.types';
import { useEditRecipeInitialData } from './editRecipeInitialData';

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

  const initialData: CreateRecipeDto = useEditRecipeInitialData(currentRecipe);

  const onChange = (data: CreateRecipeDto) => {
    // Минимальная валидация для кнопки
    const valid = Boolean(data.name?.trim()) && Boolean(data.description?.trim()) && data.ingredients?.length > 0 && data.steps?.length > 0;
    setIsValid(valid);
  };

  const onSubmit = async (data: ApiCreateRecipeDto) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const payload: UpdateRecipeDto = {
        ...data,
        description: data.description ?? '',
      };
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
          mode="edit"
        />
      )}
    </div>
  );
};

export default EditRecipePage; 
