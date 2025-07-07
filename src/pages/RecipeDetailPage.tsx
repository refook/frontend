import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import type { Recipe } from '../types';
import styles from './RecipeDetailPage.module.css';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipe = useAppSelector(state => state.recipes.items.find(r => r.id === id));

  if (!recipe) {
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

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className={styles.detailPage}>
      <div className="container">
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          ← Назад
        </button>
        <div className={styles.header}>
          <h1 className={styles.title}>{recipe.title}</h1>
          <p className={styles.description}>{recipe.description}</p>
        </div>

        {recipe.image && (
          <div className={styles.imageWrapper}>
            <img src={recipe.image} alt={recipe.title} className={styles.image} />
          </div>
        )}

        <div className={styles.meta}>
          <span>⏱️ {totalTime} мин</span>
          <span>🍽️ {recipe.servings} порции</span>
          <span>⭐ {recipe.difficulty === 'easy' ? 'Легко' : recipe.difficulty === 'medium' ? 'Средне' : 'Сложно'}</span>
          {recipe.cuisine && <span>🌎 {recipe.cuisine}</span>}
        </div>

        <section className={styles.section}>
          <h2>Ингредиенты</h2>
          {recipe.ingredients.length > 0 ? (
            <ul className={styles.ingredientsList}>
              {recipe.ingredients.map(ing => (
                <li key={ing.id}>
                  {ing.ingredient?.name ?? 'Ингредиент'} — {ing.amount} {ing.unit}
                </li>
              ))}
            </ul>
          ) : (
            <p>Нет ингредиентов</p>
          )}
        </section>

        <section className={styles.section}>
          <h2>Шаги приготовления</h2>
          {recipe.steps.length > 0 ? (
            <ol className={styles.stepsList}>
              {recipe.steps.map(step => (
                <li key={step.id} className={styles.step}>
                  {step.image && (
                    <img src={step.image} alt={`Шаг ${step.order}`} className={styles.stepImg}/>
                  )}
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p>Нет шагов</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default RecipeDetailPage; 