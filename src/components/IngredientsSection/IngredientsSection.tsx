import React, { useMemo, useState } from 'react';
import styles from './IngredientsSection.module.css';
import { getEmojiByKey } from '../../utils/emoji';

/**
 * Секция ингредиентов рецепта с возможностью:
 * - масштабировать количества под выбранное число порций,
 * - отмечать/снимать ингредиенты и формировать список покупок.
 *
 * Входные данные нормализуются: если количество указано числом и единицей (например, "2,5 кг"),
 * компонент пересчитывает его пропорционально порциям и выводит округлённое значение с запятой.
 */

/**
 * Представление ингредиента.
 * @property id Внутренний идентификатор ингредиента
 * @property name Название ингредиента
 * @property amount Исходное количество и единица измерения (например, "2 шт", "150 г")
 */
export interface IngredientVM {
  id: string;
  name: string;
  amount: string;
}

/**
 * Пропсы компонента IngredientsSection.
 * @property title Заголовок секции (например, "Ингредиенты")
 * @property ingredients Массив ингредиентов
 * @property baseServings Базовое число порций, относительно которого считается масштабирование
 */
interface Props {
  title: string;
  ingredients: IngredientVM[];
  baseServings: number;
}


/**
 * Компонент IngredientsSection — выводит список ингредиентов с пересчётом под количество порций
 * и с возможностью отмечать позиции для формирования списка покупок.
 *
 * @param title Заголовок секции
 * @param ingredients Список ингредиентов для отображения
 * @param baseServings Базовое количество порций (используется как точка отсчёта для пересчёта)
 */
const IngredientsSection: React.FC<Props> = ({ title, ingredients, baseServings }) => {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [servings, setServings] = useState<number>(Math.max(1, baseServings || 1));
  const factor = servings / (baseServings || 1);
  const [listTitle, setListTitle] = useState<string>(`Список покупок: ${title}`);

  const toggle = (ing: IngredientVM) => {
    setSelected(prev => {
      if (prev[ing.id]) {
        const { [ing.id]: _, ...rest } = prev; return rest;
      }
      return { ...prev, [ing.id]: ing.name };
    });
  };

  const normalized = useMemo(() => {
    return ingredients.map(ing => {
      const m = /^(\d+(?:[\.,]\d+)?)\s+(.*)$/.exec(ing.amount);
      const base = m ? parseFloat(m[1].replace(',', '.')) : undefined;
      const unit = m ? m[2] : '';
      const scaled = base !== undefined ? `${(Math.round(base * factor * 10) / 10).toString().replace('.', ',')} ${unit}` : ing.amount;
      return { ...ing, amount: scaled };
    });
  }, [ingredients, factor]);

  const selectedCount = Object.keys(selected).length;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Ингредиенты ({ingredients.length})</h3>
        <div className={styles.servingsControl}>
          <span className={styles.servingsLabel}>Порции:</span>
          <select
            className={styles.servingsSelect}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
          >
            {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {normalized.length > 0 ? (
        <div className={styles.ingredientsGrid}>
          {normalized.map((ing, i) => (
            <button key={i} type="button" className={`${styles.ingredientCard} ${selected[ing.id] ? styles.ingredientCardSelected : ''}`} onClick={() => toggle(ing)}>
              <span className={styles.ingredientEmojiWrap}><span className={styles.ingredientEmoji}>{getEmojiByKey(ing.name)}</span></span>
              <span className={styles.ingredientTitle}>{ing.name}</span>
              <span className={styles.ingredientSubtitle}>{ing.amount}</span>
            </button>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, color: 'var(--token-muted)' }}>Нет ингредиентов</p>
      )}

      {selectedCount > 0 && (
        <div className={styles.shoppingBox}>
          <div className={styles.shoppingHeaderRow}>
            <input className={`${styles.shoppingTitleInput} ui-input`} value={listTitle} onChange={(e) => setListTitle(e.target.value)} />
            <div>({selectedCount})</div>
          </div>
          <div className={styles.shoppingChips}>
            {Object.entries(selected).map(([id, name]) => (
              <button key={id} type="button" className={styles.chip} onClick={() => toggle({ id, name, amount: '' })}>{name}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientsSection;


