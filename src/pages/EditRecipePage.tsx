import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../store';
import type { CreateRecipeForm, Recipe } from '../types';
import RecipeForm from '../components/RecipeForm/RecipeForm';
import RecipePreview from '../components/RecipePreview/RecipePreview';
import { EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { fetchRecipe } from '../store/thunks';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import { mockApi } from '../services/mockApi';
import styles from './EditRecipePage.module.css';

const EditRecipePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState<CreateRecipeForm>({
    title: '',
    description: '',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: 'easy',
    cuisine: '',
    tags: [],
    ingredients: [],
    steps: []
  });

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id) {
        navigate('/recipes');
        return;
      }

      try {
        setIsLoading(true);
        const recipeData = await mockApi.getRecipe(id);
        setRecipe(recipeData);
        
        // Преобразуем данные рецепта в формат формы
        const formDataFromRecipe: CreateRecipeForm = {
          title: recipeData.title,
          description: recipeData.description,
          prepTime: recipeData.prepTime,
          cookTime: recipeData.cookTime,
          servings: recipeData.servings,
          difficulty: recipeData.difficulty,
          cuisine: recipeData.cuisine || '',
          tags: recipeData.tags,
          ingredients: recipeData.ingredients.map(ing => ({
            id: ing.id,
            name: ing.ingredient.name,
            amount: ing.amount.toString(),
            unit: ing.unit
          })),
          steps: recipeData.steps.map(step => ({
            id: step.id,
            description: step.description,
            order: step.order
          }))
        };
        
        setFormData(formDataFromRecipe);
      } catch (error: any) {
        console.error('Ошибка при загрузке рецепта:', error);
        showError('Ошибка', 'Не удалось загрузить рецепт для редактирования');
        navigate('/recipes');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [id, navigate, showError]);

  const handleFormChange = (newFormData: CreateRecipeForm) => {
    setFormData(newFormData);
  };

  const handleSubmit = async (formData: CreateRecipeForm) => {
    if (!id || !recipe) return;
    
    setIsSubmitting(true);
    
    try {
      // Преобразуем ингредиенты
      const processedIngredients = await Promise.all(
        formData.ingredients.map(async (ing, index) => {
          // Ищем существующий ингредиент или создаем новый
          const ingredients = await mockApi.getIngredients();
          let ingredient = ingredients.find((i) => i.name.toLowerCase() === ing.name.toLowerCase());
          
          if (!ingredient) {
            ingredient = {
              id: `ingredient-${Date.now()}-${index}`,
              name: ing.name,
              category: { id: 'other', name: 'Другое', color: '#ccc' }
            };
          }
          
          return {
            id: `ing-${Date.now()}-${index}`,
            ingredient,
            amount: parseFloat(ing.amount) || 0,
            unit: ing.unit
          };
        })
      );

      // Преобразуем шаги
      const processedSteps = formData.steps.map((step, index) => ({
        id: `step-${Date.now()}-${index}`,
        order: index + 1,
        description: step.description,
        image: step.image ? URL.createObjectURL(step.image) : undefined
      }));

      // Обновляем рецепт
      const updatedRecipe = await mockApi.updateRecipe(id, {
        title: formData.title,
        description: formData.description,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        difficulty: formData.difficulty,
        cuisine: formData.cuisine,
        tags: formData.tags,
        ingredients: processedIngredients,
        steps: processedSteps,
        updatedAt: new Date().toISOString()
      });
      
      showSuccess('Успешно', 'Рецепт успешно обновлен');
      
      // Обновляем рецепт в Redux store
      dispatch(fetchRecipe(updatedRecipe.id));
      
      // Переходим на страницу рецепта
      navigate(`/recipe/${updatedRecipe.id}`);
      
    } catch (error: any) {
      console.error('Ошибка при обновлении рецепта:', error);
      showError('Ошибка', error.message || 'Произошла ошибка при обновлении рецепта');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (data: CreateRecipeForm): boolean => {
    return !!(
      data.title.trim() &&
      data.description.trim() &&
      data.prepTime > 0 &&
      data.cookTime > 0 &&
      data.servings > 0 &&
      data.ingredients.length > 0 &&
      data.steps.length > 0
    );
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка рецепта...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className={styles.error}>
        <h2>Рецепт не найден</h2>
        <p>Возможно, рецепт был удален или вы не имеете прав на его редактирование.</p>
      </div>
    );
  }

  return (
    <div className={styles.editRecipePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Редактировать рецепт</h1>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'form' ? styles.active : ''}`}
            onClick={() => setActiveTab('form')}
          >
            <DocumentTextIcon className={styles.tabIcon} />
            Редактирование
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'preview' ? styles.active : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <EyeIcon className={styles.tabIcon} />
            Предварительный просмотр
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'form' ? (
          <RecipeForm
            initialData={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isValid={validateForm(formData)}
          />
        ) : (
          <RecipePreview 
            formData={formData} 
            onEdit={() => setActiveTab('form')}
            onSubmit={() => handleSubmit(formData)}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};

export default EditRecipePage; 