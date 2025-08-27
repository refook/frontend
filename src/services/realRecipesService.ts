import type { Recipe, RecipeFilters, RecipeSort, PaginatedResponse } from '../types';
import type { CreateRecipeDto, UpdateRecipeDto, RecipeResponseDto, UserInfoResponseDto, DifficultyLevel, ApiCreateRecipeDto } from '../types/recipe.types';
import { apiLogger } from '../utils/apiLogger';

// Функция для получения авторизационных заголовков
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// API endpoint for recipes
const API_BASE_URL = import.meta.env.DEV ? '/api/v1' : 'https://api.refook.ru/v1';

// Заглушка для отсутствующего пользователя
const DEFAULT_USER: UserInfoResponseDto = {
  id: 1,
  photo: null,
  username: 'anonymous',
  name: 'Анонимный пользователь'
};

class RealRecipesService {
  
  /**
   * Получить все рецепты из API
   */
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      console.log(`Загрузка списка рецептов из: ${API_BASE_URL}/recipe/all`);
      
      const response = await fetch(`${API_BASE_URL}/recipe/all`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const recipesList = await response.json();
      console.log(`Получен список из ${recipesList.length} рецептов`);

      // Загружаем полные данные для каждого рецепта
      const fullRecipes = await Promise.all(
        recipesList.map(async (recipeInfo: { id: string }) => {
          try {
            const detailedRecipe = await this.getRecipeById(recipeInfo.id);
            return detailedRecipe;
          } catch (error) {
            console.error(`Ошибка при загрузке детальной информации рецепта ${recipeInfo.id}:`, error);
            return null;
          }
        })
      );

      // Фильтруем null значения (рецепты, которые не удалось загрузить)
      return fullRecipes.filter((recipe): recipe is Recipe => recipe !== null);
    } catch (error) {
      console.error('Ошибка при загрузке рецептов из API:', error);
      // Возвращаем пустой массив вместо ошибки
      console.log('Возвращаем пустой список рецептов');
      return [];
    }
  }

  /**
   * Получить детальную информацию о рецепте по ID
   */
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      console.log(`Загрузка рецепта по ID: ${id}`);
      
      const response = await fetch(`${API_BASE_URL}/recipe/details/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Рецепт с ID ${id} не найден`);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const recipe: RecipeResponseDto = await response.json();
      console.log(`Успешно загружен рецепт: ${recipe.name}`);

      // Добавляем заглушки для отсутствующих данных
      const processedRecipe = {
        ...recipe,
        ownerUser: recipe.ownerUser || DEFAULT_USER,
        tags: recipe.tags || null,
        photos: recipe.photos || [],
        ingredients: recipe.ingredients || [],
        steps: (recipe.steps || []).map(step => ({
          ...step,
          photos: step.photos || [],
          ingredients: step.ingredients || [],
          time: step.time || 0
        }))
      };

      return this.transformApiRecipeToLocal(processedRecipe);
    } catch (error) {
      console.error('Ошибка при загрузке рецепта по ID:', error);
      return null;
    }
  }

  /**
   * Получить короткий список рецептов пользователя
   */
  async getUserShortRecipes(userId: string): Promise<Recipe[]> {
    try {
      const url = `${API_BASE_URL}/recipe/${userId}/all`;
      console.log(`Загрузка рецептов пользователя: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const list: any[] = await response.json();
      return (list || []).map((it) => this.transformShortApiRecipeToLocal(it));
    } catch (error) {
      console.error('Ошибка при загрузке рецептов пользователя:', error);
      return [];
    }
  }

  /**
   * ИИ-поиск рецептов по промту пользователя
   * Возвращает { filter, recipes[] } где recipes — короткие карточки
   */
  async aiSearch(prompt: string): Promise<{ filter: any; recipes: Recipe[] }> {
    try {
      // Контракт: GET /v1/recipe/ai-search?promt=...
      const url = `${API_BASE_URL}/recipe/ai-search?promt=${encodeURIComponent(prompt)}`;
      const headers = getAuthHeaders();
      apiLogger.logRequest(url, 'GET', headers, undefined);
      const res = await fetch(url, {
        method: 'GET',
        headers
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP error! status: ${res.status}${text ? ` - ${text}` : ''}`);
      }
      const data = await res.json();
      try { console.debug('AI search raw response:', data); } catch {}
      // Возможные варианты ответа:
      // 1) Array<RecipeShortResponseDto>
      // 2) Array<AiRecipeSearchResponseDto> где элемент = { filter, recipes: RecipeShortResponseDto[] }
      let mapped: Recipe[] = [];
      if (Array.isArray(data)) {
        if (data.length > 0 && Array.isArray((data[0] as any)?.recipes)) {
          // Вариант 2
          mapped = (data as any[])
            .flatMap((entry: any) => Array.isArray(entry.recipes) ? entry.recipes : [])
            .map((it: any) => this.transformShortApiRecipeToLocal(it));
        } else {
          // Вариант 1
          mapped = (data as any[]).map((it: any) => this.transformShortApiRecipeToLocal(it));
        }
      } else if (data && Array.isArray((data as any).recipes)) {
        // Вариант 3: объект с полем recipes
        mapped = ((data as any).recipes as any[]).map((it: any) => this.transformShortApiRecipeToLocal(it));
      }
      return { filter: null, recipes: mapped };
    } catch (error) {
      console.error('Ошибка при ИИ-поиске рецептов:', error);
      return { filter: null, recipes: [] };
    }
  }

  /**
   * Избранные рецепты текущего пользователя (по токену)
   * GET /v1/users/favorites → Array<RecipeShortResponseDto>
   */
  async getUserFavorites(): Promise<Recipe[]> {
    try {
      const url = `${API_BASE_URL}/users/favorites`;
      const headers = getAuthHeaders();
      apiLogger.logRequest(url, 'GET', headers, undefined);
      const res = await fetch(url, { method: 'GET', headers });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP error! status: ${res.status}${text ? ` - ${text}` : ''}`);
      }
      const data: any[] = await res.json();
      return (Array.isArray(data) ? data : []).map((it: any) => this.transformShortApiRecipeToLocal(it));
    } catch (error) {
      console.error('Ошибка при загрузке избранных рецептов пользователя:', error);
      return [];
    }
  }

  /**
   * Выполнить действие над рецептом (LIKE, FAVORITE, SET_RATE)
   */
  async setRecipeAction(recipeId: string, action: 'LIKE' | 'FAVORITE' | 'SET_RATE', value: boolean | number | string): Promise<void> {
    try {
      const url = `${API_BASE_URL}/recipe/${recipeId}/action`;
      const headers = getAuthHeaders();
      // Для LIKE/FAVORITE — boolean, для SET_RATE — число 1..5
      let normalized: boolean | number;
      if (action === 'SET_RATE') {
        const num = typeof value === 'number' ? value : Number(value);
        normalized = Math.min(5, Math.max(1, isNaN(num) ? 0 : num));
      } else {
        if (typeof value === 'boolean') normalized = value;
        else if (typeof value === 'number') normalized = value !== 0;
        else normalized = String(value).toLowerCase() === 'true';
      }
      const body = { action, value: normalized } as any;
      apiLogger.logRequest(url, 'POST', headers, body);
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP error! status: ${res.status}${text ? ` - ${text}` : ''}`);
      }
    } catch (error) {
      console.error('Ошибка при выполнении действия над рецептом:', error);
      throw error;
    }
  }

  /**
   * Получить рецепты с пагинацией и фильтрами
   */
  async getRecipes(
    page: number = 1, 
    limit: number = 12, 
    filters?: RecipeFilters, 
    sort?: RecipeSort
  ): Promise<PaginatedResponse<Recipe>> {
    try {
      // Получаем все рецепты с полными данными
      const allRecipes = await this.getAllRecipes();
      console.log('Получены полные данные рецептов:', allRecipes);
      
      // Применяем фильтры
      let filteredRecipes = filters ? this.filterRecipes(allRecipes, filters) : allRecipes;
      
      // Применяем сортировку
      if (sort) {
        filteredRecipes = this.sortRecipes(filteredRecipes, sort);
      }
      
      // Применяем пагинацию
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);
      
      return {
        data: paginatedRecipes,
        pagination: {
          page,
          limit,
          total: filteredRecipes.length,
          totalPages: Math.ceil(filteredRecipes.length / limit)
        }
      };
    } catch (error) {
      console.error('Ошибка при получении рецептов:', error);
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 }
      };
    }
  }

  /**
   * Создать новый рецепт
   */
  async createRecipe(formData: CreateRecipeDto): Promise<Recipe> {
    try {
      console.log('Создание нового рецепта:', formData.name);
      console.log('📥 Данные из формы:', JSON.stringify(formData, null, 2));
      
      // Маппинг локальных данных в формат API CreateRecipeDto
      const apiRecipeData: ApiCreateRecipeDto = {
        name: formData.name,
        description: formData.description,
        level: formData.level,
        composition: {
          ingredients: formData.ingredients || [],
          steps: (formData.steps || []).map(step => ({
            index: step.index,
            name: step.name || undefined,
            description: step.description,
            photos: step.photos || [],
            ingredients: step.ingredients || [],
            time: step.time || 0
          }))
        },
        metaInfo: {
          kitchens: formData.kitchens || [],
          tags: Array.isArray(formData.tags)
            ? (formData.tags as any[])
                .map((t) => (typeof t === 'string' ? t : (t?.id ?? t?.name ?? '')))
                .filter((v) => typeof v === 'string' && v.length > 0)
            : [],
          photos: formData.photos || []
        },
        cookingTime: {
          activeTime: formData.cookTime,
          allTime: formData.allTime
        },
        serving: {
          baseUnit: (formData.baseUnit as any) || 'GR',
          totalWeight: Number(formData.avgWeight ?? 0),
          recipeUnit: (formData.recipeUnit as any) || 'PORTION',
          unitCount: 1
        },
        macros: {
          calories: Number(formData.macros?.calories ?? 0),
          proteins: Number(formData.macros?.proteins ?? 0),
          fats: Number(formData.macros?.fats ?? 0),
          carbs: Number(formData.macros?.carbs ?? 0)
        }
      };

      console.log('📤 Отправляемые данные на API:', JSON.stringify(apiRecipeData, null, 2));
      
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/recipe`;
      
      // Логируем запрос
      apiLogger.logRequest(url, 'POST', headers, apiRecipeData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(apiRecipeData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newRecipe: RecipeResponseDto = await response.json();
      console.log('Рецепт успешно создан:', newRecipe.name);
      
      return this.transformApiRecipeToLocal(newRecipe);
    } catch (error) {
      console.error('Ошибка при создании рецепта:', error);
      throw new Error(`Не удалось создать рецепт: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Обновить рецепт (PUT)
   */
  async updateRecipe(id: string, formData: UpdateRecipeDto): Promise<Recipe> {
    try {
      console.log('Обновление рецепта:', id, formData.name);

      const apiRecipeData = {
        name: formData.name,
        description: formData.description,
        kitchens: formData.kitchens,
        level: formData.level,
        activeTime: formData.cookTime,
        allTime: formData.allTime,
        photos: formData.photos || [],
        tags: formData.tags || null,
        ingredients: formData.ingredients || [],
        steps: (formData.steps || []).map(step => ({
          id: (step as any).id, // если приходит id шага — передаем, чтобы бэкенд обновлял, а не дублировал
          index: step.index,
          name: step.name || undefined,
          description: step.description,
          photos: step.photos || [],
          ingredients: step.ingredients || [],
          time: step.time || 0
        }))
      };

      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/recipe/${id}`;
      apiLogger.logRequest(url, 'PUT', headers, apiRecipeData);

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(apiRecipeData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updated: RecipeResponseDto = await response.json();
      return this.transformApiRecipeToLocal(updated);
    } catch (error) {
      console.error('Ошибка при обновлении рецепта:', error);
      throw new Error(`Не удалось обновить рецепт: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Преобразовать API рецепт в локальный формат
   */
  transformApiRecipeToLocal(apiRecipe: RecipeResponseDto): Recipe {
    // Вычисляем время подготовки как разность общего времени и времени готовки
    // Конвертируем из секунд в минуты для отображения
    const prepTimeMinutes = Math.max(0, Math.round((apiRecipe.allTime - apiRecipe.cookTime) / 60));
    const cookTimeMinutes = Math.round(apiRecipe.cookTime / 60);
    
          const photoList: string[] = (apiRecipe as any)?.metaInfo?.photos || apiRecipe.photos || [];
          const rawTags: any[] = (apiRecipe as any)?.metaInfo?.tags || (apiRecipe as any)?.tags || [];
          const tagsList: string[] = (Array.isArray(rawTags) ? rawTags : [])
            .map((t: any) => (typeof t === 'string' ? t : (t?.name ?? '')))
            .filter((s: any) => typeof s === 'string' && s.length > 0);

          return {
        id: apiRecipe.id,
        title: apiRecipe.name,
        description: apiRecipe.description,
        photos: photoList,
        image: (() => {
          const firstPhoto = photoList?.[0];
          if (!firstPhoto) return undefined;
          return /^https?:\/\//i.test(firstPhoto) ? firstPhoto : `${API_BASE_URL}/photo/${firstPhoto}`;
        })(),
        prepTime: prepTimeMinutes, // время подготовки в минутах
        cookTime: cookTimeMinutes, // время готовки в минутах  
        servings: apiRecipe.portion || 4, // количество порций с дефолтным значением
        difficulty: apiRecipe.level.toLowerCase() as Recipe['difficulty'],
        cuisine: apiRecipe.kitchen,
        tags: tagsList,
        ingredients: apiRecipe.ingredients || [],
        steps: (apiRecipe.steps || []).map(step => ({
          ...step,
          photos: step.photos || [],
          ingredients: step.ingredients || []
        })) || [],
        macros: (apiRecipe as any)?.macros ? {
          calories: Number((apiRecipe as any).macros?.calories ?? 0),
          proteins: Number((apiRecipe as any).macros?.proteins ?? 0),
          fats: Number((apiRecipe as any).macros?.fats ?? 0),
          carbs: Number((apiRecipe as any).macros?.carbs ?? 0),
        } : undefined,
        author: {
          id: apiRecipe.ownerUser.id.toString(),
          name: apiRecipe.ownerUser.name,
          avatar: apiRecipe.ownerUser.photo || undefined
        },
        stats: {
          views: (apiRecipe as any)?.statistic?.viewsCount ?? 0,
          likes: (apiRecipe as any)?.statistic?.likesCount ?? 0,
          saves: (apiRecipe as any)?.statistic?.favoritesCount ?? 0,
          rating: (apiRecipe as any)?.statistic?.avgRating ?? 0,
          reviewsCount: (apiRecipe as any)?.statistic?.commentsCount ?? 0
        },
        createdAt: apiRecipe.createdAt,
        updatedAt: apiRecipe.updatedAt
    };
  }

  /**
   * Трансформировать короткий рецепт (RecipeShortResponseDto) в локальный формат Recipe
   */
  private transformShortApiRecipeToLocal(short: any): Recipe {
    const photoList: string[] = short?.photos || short?.metaInfo?.photos || [];
    const firstPhoto: string | undefined = photoList?.[0];
    const tagsList: string[] = (Array.isArray(short?.tags) ? short.tags : [])
      .map((t: any) => (typeof t === 'string' ? t : (t?.name ?? '')))
      .filter((s: any) => typeof s === 'string' && s.length > 0);

    return {
      id: short.id,
      title: short.name,
      description: short.description ?? '',
      photos: photoList,
      image: firstPhoto ? (/^https?:\/\//i.test(firstPhoto) ? firstPhoto : `${API_BASE_URL}/photo/${firstPhoto}`) : undefined,
      prepTime: 0,
      cookTime: 0,
      servings: 4,
      difficulty: String(short.level || 'EASY').toLowerCase() as any,
      cuisine: (short.kitchens && short.kitchens[0]?.name) || undefined,
      tags: tagsList,
      ingredients: [],
      steps: [],
      author: short.ownerUser ? {
        id: String(short.ownerUser.id),
        name: short.ownerUser.name || short.ownerUser.username,
        avatar: short.ownerUser.photo || undefined
      } : undefined,
      stats: {
        views: short?.statistic?.viewsCount ?? 0,
        likes: short?.statistic?.likesCount ?? 0,
        saves: short?.statistic?.favoritesCount ?? 0,
        rating: short?.statistic?.avgRating ?? 0,
        reviewsCount: short?.statistic?.commentsCount ?? 0
      },
      createdAt: short.updatedAt,
      updatedAt: short.updatedAt
    } as Recipe;
  }

  /**
   * Преобразовать и отфильтровать рецепты
   */
  private filterRecipes(recipes: Recipe[], filters?: RecipeFilters): Recipe[] {
    if (!filters) return recipes;
    
    // Применяем фильтры
    return recipes.filter(recipe => {
      // Поиск по тексту
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      
      // Кухня
      if (filters.cuisine && filters.cuisine.length > 0) {
        if (!recipe.cuisine || !filters.cuisine.includes(recipe.cuisine)) {
          return false;
        }
      }
      
      // Сложность
      if (filters.difficulty && filters.difficulty.length > 0) {
        const recipeDifficulty = recipe.difficulty.toUpperCase() as DifficultyLevel;
        if (!filters.difficulty.includes(recipeDifficulty)) {
          return false;
        }
      }

      // Время приготовления
      if (filters.cookTime) {
        if (filters.cookTime.min !== undefined && recipe.cookTime < filters.cookTime.min) {
          return false;
        }
        if (filters.cookTime.max !== undefined && recipe.cookTime > filters.cookTime.max) {
          return false;
        }
      }

      // Время подготовки
      if (filters.prepTime) {
        if (filters.prepTime.min !== undefined && recipe.prepTime < filters.prepTime.min) {
          return false;
        }
        if (filters.prepTime.max !== undefined && recipe.prepTime > filters.prepTime.max) {
          return false;
        }
      }

      // Порции
      if (filters.servings) {
        if (filters.servings.min !== undefined && recipe.servings < filters.servings.min) {
          return false;
        }
        if (filters.servings.max !== undefined && recipe.servings > filters.servings.max) {
          return false;
        }
      }

      // Теги
      if (filters.tags && filters.tags.length > 0 && recipe.tags) {
        const hasAllTags = filters.tags.every(tag => 
          recipe.tags.some(recipeTag => recipeTag.toLowerCase() === tag.toLowerCase())
        );
        if (!hasAllTags) return false;
      }
      
      return true;
    });
  }

  /**
   * Сортировка рецептов
   */
  private sortRecipes(recipes: Recipe[], sort: RecipeSort): Recipe[] {
    return [...recipes].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sort.field) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'prepTime':
          aValue = a.prepTime + a.cookTime;
          bValue = b.prepTime + b.cookTime;
          break;
        case 'rating':
          aValue = a.stats.rating;
          bValue = b.stats.rating;
          break;
        default:
          aValue = a[sort.field as keyof Recipe];
          bValue = b[sort.field as keyof Recipe];
      }
      
      if (sort.order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  /**
   * Получить статистику рецептов
   */
  async getRecipesStats(): Promise<{
    total: number;
    byDifficulty: Record<string, number>;
    byCuisine: Record<string, number>;
  }> {
    try {
      const recipes = await this.getAllRecipes();
      
      const byDifficulty = recipes.reduce((acc, recipe) => {
        const difficulty = recipe.difficulty.toUpperCase();
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const byCuisine = recipes.reduce((acc, recipe) => {
        const cuisine = recipe.cuisine || 'Не указана';
        acc[cuisine] = (acc[cuisine] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        total: recipes.length,
        byDifficulty,
        byCuisine
      };
    } catch (error) {
      console.error('Ошибка при получении статистики рецептов:', error);
      return { total: 0, byDifficulty: {}, byCuisine: {} };
    }
  }
}

// Создаем и экспортируем единственный экземпляр
export const realRecipesService = new RealRecipesService();
export default realRecipesService; 