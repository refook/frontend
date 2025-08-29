import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './RecipesSection.module.css';
import SectionHeader from '../../components/SectionHeader';
import { SparklesIcon } from '@heroicons/react/24/outline';
import RecipeCard from '../../../../components/RecipeCard/RecipeCard';
import type { Recipe } from '../../../../types';
import { RecipesService } from '../../../../services/recipesService';
import { KeycloakContext } from '../../../../providers/KeycloakProvider';

// Мета для карточек в профиле теперь не используется

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
  const keycloakCtx = useContext(KeycloakContext);
  const isAuthenticated = !!keycloakCtx?.authenticated;
  // Получаем userId из токена (sub), так как в user нет sub
  const userId = (keycloakCtx?.keycloak?.tokenParsed as any)?.sub as string | undefined;
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!isAuthenticated || !userId) {
        setUserRecipes([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const mine = await RecipesService.getUserRecipes(String(userId));
        if (isMounted) setUserRecipes(mine);
      } catch (e: any) {
        if (isMounted) setError(e?.message ?? 'Не удалось загрузить рецепты');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [isAuthenticated, userId]);

  return (
    <div className={styles.wrapper}>
      <SectionHeader
        title="My Recipes"
        description="Recipes you've created and shared"
        stats={[{ label: 'Published', value: userRecipes.length, tone: 'success' }]}
        actionLabel="NEW RECIPE"
        onActionClick={() => {
          const next = new URLSearchParams(searchParams);
          next.set('tab', 'recipes');
          next.set('mode', 'create');
          setSearchParams(next, { replace: true });
        }}
        actionVariant="ghost"
      />

      {isLoading && <div>Загрузка...</div>}
      {error && <div role="alert">{error}</div>}
      {!isLoading && !error && (
        <div className={styles.grid}>
          {userRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
          {isAuthenticated && userRecipes.length === 0 && (
            <div>У вас пока нет рецептов. Нажмите «NEW RECIPE», чтобы создать.</div>
          )}
          {!isAuthenticated && (
            <div>Войдите, чтобы увидеть свои рецепты.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipesSection;


