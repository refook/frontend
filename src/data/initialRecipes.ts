import type { Recipe } from '../types';

export const initialRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Классический борщ',
    description: 'Традиционный украинский борщ с говядиной и свеклой',
    image: 'https://images.steamusercontent.com/ugc/17854221424440595525/543783B601D5A853E3F50907B9722A314DFD92B6/?imw=512&amp;imh=320&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true',
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
      },
      {
        id: 'ing-1-3',
        ingredient: {
          id: 'carrot',
          name: 'Морковь',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 2,
        unit: 'шт'
      },
      {
        id: 'ing-1-4',
        ingredient: {
          id: 'onion',
          name: 'Лук',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 2,
        unit: 'шт'
      },
      {
        id: 'ing-1-5',
        ingredient: {
          id: 'potato',
          name: 'Картофель',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 4,
        unit: 'шт'
      },
      {
        id: 'ing-1-6',
        ingredient: {
          id: 'tomato',
          name: 'Помидор',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 2,
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
      avatar: undefined
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
    image: 'https://images.steamusercontent.com/ugc/17854221424440595525/543783B601D5A853E3F50907B9722A314DFD92B6/?imw=512&amp;imh=320&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true',
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
      },
      {
        id: 'ing-2-2',
        ingredient: {
          id: 'egg',
          name: 'Яйцо',
          category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
        },
        amount: 4,
        unit: 'шт'
      },
      {
        id: 'ing-2-3',
        ingredient: {
          id: 'cheese',
          name: 'Сыр',
          category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
        },
        amount: 100,
        unit: 'г'
      },
      {
        id: 'ing-2-4',
        ingredient: {
          id: 'onion',
          name: 'Лук',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 1,
        unit: 'шт'
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
      avatar: undefined
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
  },
  {
    id: 'recipe-3',
    title: 'Салат Цезарь',
    description: 'Классический салат с курицей, сухариками и соусом Цезарь',
    image: 'https://images.steamusercontent.com/ugc/17854221424440595525/543783B601D5A853E3F50907B9722A314DFD92B6/?imw=512&amp;imh=320&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true',
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    difficulty: 'easy',
    cuisine: 'Американская',
    tags: ['салат', 'курица', 'быстро'],
    ingredients: [
      {
        id: 'ing-3-1',
        ingredient: {
          id: 'chicken',
          name: 'Куриная грудка',
          category: { id: 'meat', name: 'Мясо', color: '#ff6b6b' }
        },
        amount: 200,
        unit: 'г'
      },
      {
        id: 'ing-3-2',
        ingredient: {
          id: 'tomato',
          name: 'Помидор',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 1,
        unit: 'шт'
      },
      {
        id: 'ing-3-3',
        ingredient: {
          id: 'carrot',
          name: 'Морковь',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 1,
        unit: 'шт'
      },
      {
        id: 'ing-3-4',
        ingredient: {
          id: 'bread',
          name: 'Хлеб',
          category: { id: 'bakery', name: 'Выпечка', color: '#da77f2' }
        },
        amount: 100,
        unit: 'г'
      },
      {
        id: 'ing-3-5',
        ingredient: {
          id: 'cheese',
          name: 'Сыр',
          category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
        },
        amount: 50,
        unit: 'г'
      }
    ],
    steps: [
      {
        id: 'step-3-1',
        order: 1,
        description: 'Обжарьте куриную грудку на сковороде',
        duration: 15
      },
      {
        id: 'step-3-2',
        order: 2,
        description: 'Нарежьте помидоры и смешайте с курицей',
        duration: 5
      }
    ],
    author: {
      id: 'user-3',
      name: 'Елена Сидорова',
      avatar: undefined
    },
    stats: {
      views: 750,
      likes: 45,
      saves: 23,
      rating: 4.5,
      reviewsCount: 12
    },
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z'
  },
  {
    id: 'recipe-4',
    title: 'Пицца Маргарита',
    description: 'Традиционная итальянская пицца с томатами и моцареллой',
    image: 'https://images.steamusercontent.com/ugc/17854221424440595525/543783B601D5A853E3F50907B9722A314DFD92B6/?imw=512&amp;imh=320&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true',
    prepTime: 30,
    cookTime: 25,
    servings: 4,
    difficulty: 'medium',
    cuisine: 'Итальянская',
    tags: ['пицца', 'итальянская', 'сыр'],
    ingredients: [
      {
        id: 'ing-4-1',
        ingredient: {
          id: 'bread',
          name: 'Хлеб',
          category: { id: 'bakery', name: 'Выпечка', color: '#da77f2' }
        },
        amount: 300,
        unit: 'г'
      },
      {
        id: 'ing-4-2',
        ingredient: {
          id: 'cheese',
          name: 'Сыр',
          category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
        },
        amount: 200,
        unit: 'г'
      },
      {
        id: 'ing-4-3',
        ingredient: {
          id: 'tomato',
          name: 'Помидор',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 3,
        unit: 'шт'
      },
      {
        id: 'ing-4-4',
        ingredient: {
          id: 'onion',
          name: 'Лук',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 1,
        unit: 'шт'
      },
      {
        id: 'ing-4-5',
        ingredient: {
          id: 'milk',
          name: 'Молоко',
          category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
        },
        amount: 100,
        unit: 'мл'
      }
    ],
    steps: [
      {
        id: 'step-4-1',
        order: 1,
        description: 'Подготовьте основу из хлеба для пиццы',
        duration: 20
      },
      {
        id: 'step-4-2',
        order: 2,
        description: 'Выпекайте пиццу в духовке',
        duration: 25
      }
    ],
    author: {
      id: 'user-4',
      name: 'Дмитрий Козлов',
      avatar: undefined
    },
    stats: {
      views: 1200,
      likes: 78,
      saves: 34,
      rating: 4.7,
      reviewsCount: 19
    },
    createdAt: '2024-01-30T16:45:00Z',
    updatedAt: '2024-01-30T16:45:00Z'
  },
  {
    id: 'recipe-5',
    title: 'Суп Том Ям',
    description: 'Острый тайский суп с курицей и луком',
    image: 'https://images.steamusercontent.com/ugc/17854221424440595525/543783B601D5A853E3F50907B9722A314DFD92B6/?imw=512&amp;imh=320&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: 'medium',
    cuisine: 'Тайская',
    tags: ['суп', 'острый', 'курица'],
    ingredients: [
      {
        id: 'ing-5-1',
        ingredient: {
          id: 'chicken',
          name: 'Курица',
          category: { id: 'meat', name: 'Мясо', color: '#ff6b6b' }
        },
        amount: 300,
        unit: 'г'
      },
      {
        id: 'ing-5-2',
        ingredient: {
          id: 'onion',
          name: 'Лук',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 200,
        unit: 'г'
      },
      {
        id: 'ing-5-3',
        ingredient: {
          id: 'carrot',
          name: 'Морковь',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 2,
        unit: 'шт'
      },
      {
        id: 'ing-5-4',
        ingredient: {
          id: 'tomato',
          name: 'Помидор',
          category: { id: 'vegetables', name: 'Овощи', color: '#51cf66' }
        },
        amount: 2,
        unit: 'шт'
      },
      {
        id: 'ing-5-5',
        ingredient: {
          id: 'rice',
          name: 'Рис',
          category: { id: 'grains', name: 'Крупы', color: '#fcc419' }
        },
        amount: 100,
        unit: 'г'
      }
    ],
    steps: [
      {
        id: 'step-5-1',
        order: 1,
        description: 'Отварите курицу в бульоне',
        duration: 10
      },
      {
        id: 'step-5-2',
        order: 2,
        description: 'Добавьте лук и специи',
        duration: 10
      }
    ],
    author: {
      id: 'user-5',
      name: 'Анна Волкова',
      avatar: undefined
    },
    stats: {
      views: 950,
      likes: 62,
      saves: 28,
      rating: 4.6,
      reviewsCount: 15
    },
    createdAt: '2024-02-01T10:30:00Z',
    updatedAt: '2024-02-01T10:30:00Z'
  },
  {
    id: 'recipe-6',
    title: 'Тирамису',
    description: 'Классический итальянский десерт с сыром и молоком',
    image: 'https://images.steamusercontent.com/ugc/17854221424440595525/543783B601D5A853E3F50907B9722A314DFD92B6/?imw=512&amp;imh=320&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true',
    prepTime: 45,
    cookTime: 0,
    servings: 8,
    difficulty: 'hard',
    cuisine: 'Итальянская',
    tags: ['десерт', 'молоко', 'сыр'],
    ingredients: [
      {
        id: 'ing-6-1',
        ingredient: {
          id: 'cheese',
          name: 'Сыр',
          category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
        },
        amount: 500,
        unit: 'г'
      },
      {
        id: 'ing-6-2',
        ingredient: {
          id: 'milk',
          name: 'Молоко',
          category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
        },
        amount: 200,
        unit: 'мл'
      },
      {
        id: 'ing-6-3',
        ingredient: {
          id: 'egg',
          name: 'Яйцо',
          category: { id: 'dairy', name: 'Молочные продукты', color: '#74c0fc' }
        },
        amount: 6,
        unit: 'шт'
      },
      {
        id: 'ing-6-4',
        ingredient: {
          id: 'bread',
          name: 'Хлеб',
          category: { id: 'bakery', name: 'Выпечка', color: '#da77f2' }
        },
        amount: 200,
        unit: 'г'
      }
    ],
    steps: [
      {
        id: 'step-6-1',
        order: 1,
        description: 'Приготовьте крем из сыра',
        duration: 20
      },
      {
        id: 'step-6-2',
        order: 2,
        description: 'Соберите тирамису слоями',
        duration: 25
      }
    ],
    author: {
      id: 'user-6',
      name: 'Игорь Смирнов',
      avatar: undefined
    },
    stats: {
      views: 1400,
      likes: 95,
      saves: 67,
      rating: 4.9,
      reviewsCount: 28
    },
    createdAt: '2024-02-05T18:15:00Z',
    updatedAt: '2024-02-05T18:15:00Z'
  }
]; 