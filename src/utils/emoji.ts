// Единый набор эмодзи для ингредиентов/шагов
export const FOOD_EMOJIS: string[] = ['🍗','🥖','🍅','🥒','🧅','🧀','🫒','🍋','🍚','🥔','🍄','🥚','🌶️','🧄'];

// Дополнительный набор для карточек/placeholder (с едой и десертами)
export const FOOD_PLACEHOLDER_EMOJIS: string[] = ['🍕','🍔','🍣','🍜','🍩','🍰','🥗','🍤','🍝','🌮','🥞','🍗','🍇','🥑','🥐','🍪','🥙','🍲','🧁','🍓'];

// Универсальная хеш-функция по строке (детерминированный индекс)
export function hashStringToIndex(key: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return modulo > 0 ? hash % modulo : 0;
}

// Получить эмодзи из набора по ключу
export function getEmojiByKey(key: string, set: string[] = FOOD_EMOJIS): string {
  return set[hashStringToIndex(key, set.length)];
}


