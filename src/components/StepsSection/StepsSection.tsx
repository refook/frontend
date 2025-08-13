import React from 'react';
import styles from './StepsSection.module.css';
import Chip from '../Chip/Chip';
import type { CreateRecipeIngredientDto, RecipeIngredientDto, StepResponseDto } from '../../types';

/**
 * Пропсы компонента StepsSection.
 * @property steps Массив шагов приготовления (из API или формы)
 * @property isFormData Флаг, указывающий что шаги/ингредиенты в формате формы (CreateRecipeDto)
 * @property getIngredientName Функция получения названия ингредиента по id (нужна для формата формы)
 */
interface Props {
  steps: StepResponseDto[] | any[];
  isFormData: boolean;
  getIngredientName: (id: string) => string | undefined;
}

const emojis = ['🍗','🥖','🍅','🥒','🧅','🧀','🫒','🍋','🍚','🥔','🍄','🥚','🌶️','🧄'];
const emojiFor = (key: string): string => {
  let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0; return emojis[h % emojis.length];
};

/**
 * Компонент StepsSection — отображает последовательность шагов приготовления рецепта.
 * Для каждого шага выводит номер, заголовок, описание, список ингредиентов‑чипов и, при наличии, фото шага.
 *
 * Поддерживает два источника данных:
 * 1) данные из API (StepResponseDto / RecipeIngredientDto)
 * 2) данные формы создания/редактирования (CreateRecipeDto)
 *
 * @param steps Список шагов приготовления
 * @param isFormData Если true — интерпретировать ингредиенты как CreateRecipeIngredientDto
 * @param getIngredientName Функция для получения имени ингредиента по id (используется при isFormData=true)
 */
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


