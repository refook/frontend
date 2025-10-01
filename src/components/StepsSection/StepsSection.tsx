import React from 'react';
import styles from './StepsSection.module.css';
import Chip from '../Chip/Chip';
import { getEmojiByKey } from '../../utils/emoji';
import type {
  CreateRecipeIngredientDto,
  RecipeIngredientDto,
  StepResponseDto,
  ApiUpdateRecipeIngredientDto,
} from '../../types';
import { formatMeasureLabel } from '../../utils/measureLabel';

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
  measureLabels?: Record<string, string>;
}

// Используем единый набор эмодзи для ингредиентов

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
const StepsSection: React.FC<Props> = ({ steps, isFormData, getIngredientName, measureLabels = {} }) => {
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
                        const ingredientId = (ing as CreateRecipeIngredientDto)?.id ?? (ing as ApiUpdateRecipeIngredientDto)?.id;
                        const explicitName = (ing as RecipeIngredientDto)?.name;
                        const name = explicitName || (isFormData && ingredientId ? getIngredientName(ingredientId) : undefined) || 'Ингредиент';
                        const measureId = (ing as RecipeIngredientDto).productMeasureId
                          ?? (ing as ApiUpdateRecipeIngredientDto).productMeasureId;
                        const fallbackUnit = (ing as any).productUnit || (ing as any).measure || '';
                        const unitSource = measureId && measureLabels[measureId] ? measureLabels[measureId] : fallbackUnit;
                        const unit = formatMeasureLabel(unitSource ? String(unitSource) : undefined);
                        const suffix = unit ? ` ${unit}` : '';
                        const amount = `${(ing as any).count}${suffix}`;
                        return <Chip key={i} emoji={getEmojiByKey(name)} label={name} amount={amount} />;
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
