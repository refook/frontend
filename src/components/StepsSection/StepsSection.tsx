import React from 'react';
import styles from './StepsSection.module.css';
import Chip from '../Chip/Chip';
import type { CreateRecipeIngredientDto, RecipeIngredientDto, StepResponseDto } from '../../types';

interface Props {
  steps: StepResponseDto[] | any[];
  isFormData: boolean;
  getIngredientName: (id: string) => string | undefined;
}

const emojis = ['🍗','🥖','🍅','🥒','🧅','🧀','🫒','🍋','🍚','🥔','🍄','🥚','🌶️','🧄'];
const emojiFor = (key: string): string => {
  let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0; return emojis[h % emojis.length];
};

const StepsSection: React.FC<Props> = ({ steps, isFormData, getIngredientName }) => {
  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Приготовление ({steps.length} шагов)</h3>
      {steps.length > 0 ? (
        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div key={index} className={`${styles.step} ${styles.stepCard}`}>
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepContent}>
                {step.name && <h4 className={styles.stepTitle}>{step.name}</h4>}
                <p className={styles.stepDescription}>{step.description || 'Описание шага'}</p>
                {step.ingredients && step.ingredients.length > 0 && (
                  <div>
                    <div className={styles.chips}>
                      {step.ingredients.map((ing: any, i: number) => {
                        const name = isFormData ? (getIngredientName((ing as CreateRecipeIngredientDto).id) || 'Ингредиент') : (ing as RecipeIngredientDto).name;
                        const amount = isFormData
                          ? `${(ing as CreateRecipeIngredientDto).count} ${(ing as CreateRecipeIngredientDto).measure.toLowerCase()}`
                          : `${(ing as RecipeIngredientDto).count} ${(ing as RecipeIngredientDto).measure.toLowerCase()}`;
                        return <Chip key={i} emoji={emojiFor(name)} label={name} amount={amount} />;
                      })}
                    </div>
                  </div>
                )}
                {step.photos && step.photos.length > 0 && (
                  <div className={styles.image}>
                    <img className={styles.img} src={`/api/v1/photo/${step.photos[0]}`} alt={`Шаг ${index + 1}`} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, color: 'var(--token-muted)', textAlign: 'center' }}>Нет шагов</p>
      )}
    </div>
  );
};

export default StepsSection;


