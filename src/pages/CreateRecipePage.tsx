import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import type { CreateRecipeDto, ApiCreateRecipeDto } from '../types/recipe.types';
import { BASE_UNITS_ARRAY, PRODUCT_UNITS_ARRAY } from '../constants/measures';
import RecipeForm from '../components/RecipeForm/RecipeForm';
import RecipePreview from '../components/RecipePreview/RecipePreview';
import { EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { createRecipe } from '../store/thunks';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import styles from './CreateRecipePage.module.css';

interface CreateRecipePageProps { fullWidth?: boolean }

const CreateRecipePage: React.FC<CreateRecipePageProps> = ({ fullWidth = false }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateRecipeDto>({
    name: '',
    description: '',
    level: 'EASY',
    kitchens: [],
    cookTime: 0,
    allTime: 0,
    // portion убран из DTO — используем serving.unitCount на бэке
    photos: [],
    tags: [],
    ingredients: [],
    steps: [],
    baseUnit: 'GR',
    avgWeight: 100,
    unit: 'GRAM',
    macros: { calories: 0, proteins: 0, fats: 0, carbs: 0 }
  });

  const handleFormChange = (newFormData: CreateRecipeDto) => {
    setFormData(newFormData);
  };

  const handleSubmit = async (formData: ApiCreateRecipeDto) => {
    setIsSubmitting(true);
    
    try {
      // Используем thunk для создания рецепта
      const newRecipe = await dispatch(createRecipe(formData)).unwrap();
      
      // Переходим на страницу рецепта
      navigate(`/recipe/${newRecipe.id}`);
      
    } catch (error: any) {
      console.error('Ошибка при создании рецепта:', error);
      showError('Ошибка', error.message || 'Произошла ошибка при создании рецепта');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() !== '' && 
                     formData.description.trim() !== '' &&
                     formData.level &&
                     formData.ingredients.length > 0 &&
                     formData.steps.length > 0;

  return (
    <div className={styles.createRecipePage}>
      <div className={fullWidth ? styles.fullWidthContainer : 'container'}>
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
              onSubmit={() => handleSubmit(formData as unknown as ApiCreateRecipeDto)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
      
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </div>
  );
};

export default CreateRecipePage; 
