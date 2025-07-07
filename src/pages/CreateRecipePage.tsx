import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { addRecipe } from '../store/slices/recipesSlice';
import type { CreateRecipeForm, Recipe } from '../types';
import RecipeForm from '../components/RecipeForm/RecipeForm';
import RecipePreview from '../components/RecipePreview/RecipePreview';
import { EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import styles from './CreateRecipePage.module.css';

const CreateRecipePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleFormChange = (newFormData: CreateRecipeForm) => {
    setFormData(newFormData);
  };

  const handleSubmit = async (formData: CreateRecipeForm) => {
    setIsSubmitting(true);
    
    try {
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Создаем объект рецепта
      const newRecipe: Recipe = {
        id: `recipe-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        image: formData.image ? URL.createObjectURL(formData.image) : undefined,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        difficulty: formData.difficulty,
        cuisine: formData.cuisine,
        tags: formData.tags,
        // Преобразуем ингредиенты в минимально совместимый формат
        // TODO: заменить на полноценный Ingredient после интеграции с API
        ingredients: (formData.ingredients.map((ing, index) => ({
          id: `ing-${index}`,
          ingredient: { id: `ingredient-${index}`, name: ing.name, category: { id: 'cat', name: 'Другое', color: '#ccc' }, defaultUnit: ing.unit, possibleUnits: [ing.unit] },
          amount: parseFloat(ing.amount) || 0,
          unit: ing.unit
        })) as any),
        steps: formData.steps.map((step, index) => ({
          ...step,
          id: `step-${index}`,
          order: index + 1,
          image: step.image ? URL.createObjectURL(step.image) : undefined
        })),
        author: {
          id: 'current-user',
          name: 'Вы',
          avatar: undefined
        },
        stats: {
          views: 0,
          likes: 0,
          saves: 0,
          rating: 0,
          reviewsCount: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Добавляем рецепт в store
      dispatch(addRecipe(newRecipe));
      
      // Переходим на страницу рецепта
      navigate(`/recipe/${newRecipe.id}`);
      
    } catch (error) {
      console.error('Ошибка при создании рецепта:', error);
      // TODO: Показать уведомление об ошибке
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title.trim() !== '' && 
                     formData.description.trim() !== '' &&
                     formData.ingredients.length > 0 &&
                     formData.steps.length > 0;

  return (
    <div className={styles.createRecipePage}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Создать рецепт</h1>
          <p className={styles.subtitle}>
            Поделитесь своим кулинарным творением с сообществом
          </p>
        </div>

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
            disabled={!isFormValid}
          >
            <EyeIcon className={styles.tabIcon} />
            Превью
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'form' ? (
            <RecipeForm
              initialData={formData}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isValid={isFormValid}
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
      </div>
    </div>
  );
};

export default CreateRecipePage; 