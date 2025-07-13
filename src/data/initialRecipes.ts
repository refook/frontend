import type { Recipe } from '../types';

export const initialRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Классический борщ',
    description: 'Традиционный украинский борщ с говядиной и свеклой',
    image: 'https://images.unsplash.com/photo-1750055449467-6a488edd16a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MDcyNjN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTI0MzY4ODF8&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 30,
    cookTime: 120,
    servings: 6,
    difficulty: 'medium',
    cuisine: 'Итальянская',
    tags: ['суп', 'борщ', 'традиционный'],
    ingredients: [
      {
        id: 'ing-1-1',
        ingredient: {
          id: 'beef',
          name: 'Говядина',
          category: { id: 'meat', name: 'Мясо', color: '#ff6b6b' }
        },
        amount: 500,
        unit: 'г'
      },
      {
        id: 'ing-1-2',
        ingredient: {
          id: 'beetroot',
          name: 'Свекла',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 3,
        unit: 'шт'
      }
    ],
    steps: [
      {
        id: 'step-1-1',
        order: 1,
        description: 'Нарежьте говядину кубиками и обжарьте на растительном масле',
        duration: 15
      },
      {
        id: 'step-1-2',
        order: 2,
        description: 'Добавьте нарезанную свеклу и тушите 10 минут',
        duration: 10
      }
    ],
    author: {
      id: 'user-1',
      name: 'Мария Петрова',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria'
    },
    stats: {
      views: 1250,
      likes: 89,
      saves: 45,
      rating: 4.8,
      reviewsCount: 23
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'recipe-2',
    title: 'Паста Карбонара',
    description: 'Классическая итальянская паста с яйцами, сыром и беконом',
    image: 'https://images.unsplash.com/photo-1750055449467-6a488edd16a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MDcyNjN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NTI0MzY4ODF8&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: 'easy',
    cuisine: 'Итальянская',
    tags: ['паста', 'итальянская', 'быстро'],
    ingredients: [
      {
        id: 'ing-2-1',
        ingredient: {
          id: 'pasta',
          name: 'Спагетти',
          category: { id: 'pasta', name: 'Макароны', color: '#ffd43b' }
        },
        amount: 400,
        unit: 'г'
      }
    ],
    steps: [
      {
        id: 'step-2-1',
        order: 1,
        description: 'Отварите спагетти в подсоленной воде',
        duration: 10
      }
    ],
    author: {
      id: 'user-2',
      name: 'Алексей Иванов',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
    },
    stats: {
      views: 890,
      likes: 67,
      saves: 34,
      rating: 4.6,
      reviewsCount: 18
    },
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  }
]; 