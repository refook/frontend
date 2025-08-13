import React, { useMemo, useState } from 'react';
import styles from './IngredientsSection.module.css';

export interface IngredientVM {
  id: string;
  name: string;
  amount: string;
}

interface Props {
  title: string;
  ingredients: IngredientVM[];
  baseServings: number;
}

const foodEmojis = ['🍗','🥖','🍅','🥒','🧅','🧀','🫒','🍋','🍚','🥔','🍄','🥚','🌶️','🧄'];
const getEmojiByKey = (key: string): string => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return foodEmojis[hash % foodEmojis.length];
};

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
          <button type="button" className={`ui-btn ui-btn--ghost ${styles.servingsBtn}`} onClick={() => setServings(v => Math.max(1, v - 1))}>−</button>
          <span className={styles.servingsValue}>{servings}</span>
          <button type="button" className={`ui-btn ui-btn--ghost ${styles.servingsBtn}`} onClick={() => setServings(v => v + 1)}>+</button>
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


