import type { Ingredient } from '../types';

export const initialIngredients: Ingredient[] = [
  {
    id: 'beef',
    name: 'Говядина',
    category: { id: 'meat', name: 'Мясо', color: '#ff6b6b' }
  },
  {
    id: 'beetroot',
    name: 'Свекла',
    category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
  },
  {
    id: 'pasta',
    name: 'Спагетти',
    category: { id: 'pasta', name: 'Макароны', color: '#ffd43b' }
  },
  {
    id: 'chicken',
    name: 'Курица',
    category: { id: 'meat', name: 'Мясо', color: '#ff6b6b' }
  },
  {
    id: 'tomato',
    name: 'Помидор',
    category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
  },
  {
    id: 'onion',
    name: 'Лук',
    category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
  },
  {
    id: 'rice',
    name: 'Рис',
    category: { id: 'grains', name: 'Крупы', color: '#fcc419' }
  },
  {
    id: 'potato',
    name: 'Картофель',
    category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
  },
  {
    id: 'milk',
    name: 'Молоко',
    category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
  },
  {
    id: 'egg',
    name: 'Яйцо',
    category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
  },
  {
    id: 'cheese',
    name: 'Сыр',
    category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
  },
  {
    id: 'carrot',
    name: 'Морковь',
    category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
  },
  {
    id: 'bread',
    name: 'Хлеб',
    category: { id: 'bakery', name: 'Выпечка', color: '#da77f2' }
  }
]; 