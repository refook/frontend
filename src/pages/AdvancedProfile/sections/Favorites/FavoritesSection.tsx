import React, { useMemo } from 'react';
import styles from './FavoritesSection.module.css';
import SectionHeader from '../../components/SectionHeader';
import RecipeCard from '../../../../components/RecipeCard/RecipeCard';
import { initialRecipes } from '../../../../data/initialRecipes';
import type { Recipe } from '../../../../types';

const FavoritesSection: React.FC = () => {
  // Заглушка: используем initialRecipes как избранные
  const recipes: Recipe[] = useMemo(() => initialRecipes as unknown as Recipe[], []);

  const totalLikes = useMemo(() => {
    return recipes.reduce((sum, r) => sum + (r.stats?.likes ?? 0), 0);
  }, [recipes]);

  return (
    <div className={styles.wrapper}>
      <SectionHeader
        title="Favorite Recipes"
        description="Recipes you've loved and saved"
        stats={[{ label: 'Likes', value: totalLikes, tone: 'accent' }]}
      />

      <div className={styles.grid}>
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </div>
  );
};

export default FavoritesSection;


