import type { FridgeItem } from '../types';

export const initialFridgeItems: Omit<FridgeItem, 'userId'>[] = [
  {
    id: 'fridge-1',
    ingredient: {
      id: 'beef',
      name: 'Говядина',
      category: { id: 'meat', name: 'Мясо', color: '#ff6b6b' }
    },
    amount: 800,
    unit: 'г',
    location: 'fridge',
    expirationDate: '2024-12-20',
    purchaseDate: '2024-12-10',
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z'
  },

  {
    id: 'fridge-3',
    ingredient: {
      id: 'milk',
      name: 'Молоко',
      category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
    },
    amount: 1,
    unit: 'л',
    location: 'fridge',
    expirationDate: '2024-12-18',
    purchaseDate: '2024-12-12',
    createdAt: '2024-12-12T09:00:00Z',
    updatedAt: '2024-12-12T09:00:00Z'
  },

  {
    id: 'fridge-5',
    ingredient: {
      id: 'cheese',
      name: 'Сыр',
      category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
    },
    amount: 300,
    unit: 'г',
    location: 'fridge',
    expirationDate: '2024-12-30',
    purchaseDate: '2024-12-09',
    createdAt: '2024-12-09T14:15:00Z',
    updatedAt: '2024-12-09T14:15:00Z'
  },
  {
    id: 'fridge-6',
    ingredient: {
      id: 'tomato',
      name: 'Помидор',
      category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
    },
    amount: 6,
    unit: 'шт',
    location: 'fridge',
    expirationDate: '2024-12-16',
    purchaseDate: '2024-12-13',
    createdAt: '2024-12-13T16:45:00Z',
    updatedAt: '2024-12-13T16:45:00Z'
  },
  {
    id: 'fridge-7',
    ingredient: {
      id: 'onion',
      name: 'Лук',
      category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
    },
    amount: 5,
    unit: 'шт',
    location: 'pantry',
    expirationDate: '2024-12-28',
    purchaseDate: '2024-12-05',
    createdAt: '2024-12-05T12:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z'
  },

  {
    id: 'fridge-9',
    ingredient: {
      id: 'potato',
      name: 'Картофель',
      category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
    },
    amount: 2,
    unit: 'кг',
    location: 'pantry',
    expirationDate: '2025-01-15',
    purchaseDate: '2024-12-06',
    createdAt: '2024-12-06T10:15:00Z',
    updatedAt: '2024-12-06T10:15:00Z'
  },
  {
    id: 'fridge-10',
    ingredient: {
      id: 'beetroot',
      name: 'Свекла',
      category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
    },
    amount: 4,
    unit: 'шт',
    location: 'fridge',
    expirationDate: '2024-12-26',
    purchaseDate: '2024-12-04',
    createdAt: '2024-12-04T14:20:00Z',
    updatedAt: '2024-12-04T14:20:00Z'
  },
  {
    id: 'fridge-11',
    ingredient: {
      id: 'pasta',
      name: 'Спагетти',
      category: { id: 'pasta', name: 'Макароны', color: '#ffd43b' }
    },
    amount: 500,
    unit: 'г',
    location: 'pantry',
    expirationDate: '2025-06-01',
    purchaseDate: '2024-12-03',
    createdAt: '2024-12-03T16:00:00Z',
    updatedAt: '2024-12-03T16:00:00Z'
  },
  {
    id: 'fridge-12',
    ingredient: {
      id: 'rice',
      name: 'Рис',
      category: { id: 'grains', name: 'Крупы', color: '#fcc419' }
    },
    amount: 1,
    unit: 'кг',
    location: 'pantry',
    expirationDate: '2025-12-01',
    purchaseDate: '2024-12-02',
    createdAt: '2024-12-02T11:45:00Z',
    updatedAt: '2024-12-02T11:45:00Z'
  },

];