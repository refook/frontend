import React, { useMemo } from 'react';
import styles from './RecipesSection.module.css';
import SectionHeader from '../../components/SectionHeader';
import { SparklesIcon } from '@heroicons/react/24/outline';
import ProfileRecipeCard, { type ProfileRecipeMeta } from '../../components/ProfileRecipeCard';
import { initialRecipes } from '../../../../data/initialRecipes';
import type { Recipe } from '../../../../types';

/**
 * Дополнительные метаданные по рецептам для отображения в профиле.
 * Ключ — `id` рецепта, значение — объект `ProfileRecipeMeta`.
 *
 * Структура `ProfileRecipeMeta`:
 * @property {number} views Просмотры рецепта
 * @property {number} likes Лайки рецепта
 * @property {number} comments Комментарии к рецепту
 * @property {string} publishedAt Дата публикации в ISO 8601
 * @property {('PUBLISHED'|'DRAFT')} status Статус публикации
 */
const mockMeta: Record<string, ProfileRecipeMeta> = {
  'recipe-6': { views: 1240, likes: 89, comments: 23, publishedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(), status: 'PUBLISHED' }
};

/**
 * Секция «My Recipes» в расширенном профиле.
 * Отображает список собственных рецептов пользователя с базовой статистикой и
 * действиями (создание нового рецепта).
 *
 * Данные рецептов берутся из заглушки `initialRecipes` и приводятся к `Recipe[]`.
 * Каждый `Recipe` содержит ключевые поля (id, title, description, times, stats и др.).
 *
 * @param {{}} props Параметры компонента (входные свойства не требуются)
 * @returns {JSX.Element} Разметка секции с гридом карточек рецептов
 */
const RecipesSection: React.FC = () => {
  const recipes: Recipe[] = useMemo(() => initialRecipes as unknown as Recipe[], []);

  return (
    <div className={styles.wrapper}>
      <SectionHeader
        title="My Recipes"
        description="Recipes you've created and shared"
        stats={[{ label: 'Published', value: recipes.length, tone: 'success' }]}
        actionLabel="NEW RECIPE"
        actionVariant="ghost"
      />

      <div className={styles.grid}>
        {recipes.map((r) => (
          <ProfileRecipeCard key={r.id} recipe={r} meta={mockMeta[r.id] ?? { views: 0, likes: 0, comments: 0, publishedAt: new Date().toISOString(), status: 'DRAFT' }} />
        ))}
      </div>
    </div>
  );
};

export default RecipesSection;


