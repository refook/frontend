import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchRecipe } from '../store/thunks';
import { RecipesService } from '../services/recipesService';
import { PencilIcon } from '@heroicons/react/24/outline';
import RecipePreview from '../components/RecipePreview';
import styles from './RecipeDetailPage.module.css';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentRecipe, loading, error } = useAppSelector(state => state.recipes);
  
  // Загружаем рецепт при изменении ID
  useEffect(() => {
    if (id) {
      dispatch(fetchRecipe(id));
    }
  }, [dispatch, id]);

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
          <button onClick={handleEdit} className={styles.editBtn}>
            <PencilIcon className={styles.editIcon} />
            Редактировать
          </button>
        </div>
        
        <RecipePreview 
          recipe={recipe}
          showActions={false}
        />
      </div>
    </div>
  );
};

export default RecipeDetailPage; 