import type { Recipe, CreateRecipeForm, RecipeFilters, RecipeSort, PaginatedResponse } from '../types';

// API endpoint for recipes
const API_BASE_URL = import.meta.env.DEV ? '/api/v1' : 'http://82.146.39.131:8080/v1';

export interface ApiRecipe {
  id: string;
  title: string;
  description: string;
  photoId?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  tags: string[];
  ingredients: any[];
  steps: any[];
  ownerUser: {
    id: number;
    photo: string | null;
    username: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

class RealRecipesService {
  
  /**
   * Получить все рецепты из API
   */
  async getAllRecipes(): Promise<ApiRecipe[]> {
    try {
      console.log(`Загрузка рецептов из: ${API_BASE_URL}/recipe/all`);
      
      const response = await fetch(`${API_BASE_URL}/recipe/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const recipes: ApiRecipe[] = await response.json();
      console.log(`Успешно загружено ${recipes.length} рецептов из API`);
      return recipes;
    } catch (error) {
      console.error('Ошибка при загрузке рецептов из API:', error);
      // Возвращаем пустой массив вместо ошибки
      console.log('Возвращаем пустой список рецептов');
      return [];
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
      // Пока API не поддерживает пагинацию, получаем все и фильтруем локально
      const allRecipes = await this.getAllRecipes();
      let filteredRecipes = this.transformAndFilterRecipes(allRecipes, filters);
      
      if (sort) {
        filteredRecipes = this.sortRecipes(filteredRecipes, sort);
      }
      
      // Локальная пагинация
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
  async createRecipe(formData: CreateRecipeForm): Promise<Recipe> {
    try {
      console.log('Создание нового рецепта:', formData.title);
      
      // Преобразуем данные формы в формат API
      const apiRecipeData = {
        title: formData.title,
        description: formData.description,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        difficulty: formData.difficulty,
        cuisine: formData.cuisine,
        tags: formData.tags,
        ingredients: formData.ingredients,
        steps: formData.steps
      };
      
      const response = await fetch(`${API_BASE_URL}/recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRecipeData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newRecipe: ApiRecipe = await response.json();
      console.log('Рецепт успешно создан:', newRecipe.title);
      
      return this.transformApiRecipeToLocal(newRecipe);
    } catch (error) {
      console.error('Ошибка при создании рецепта:', error);
      throw new Error(`Не удалось создать рецепт: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Преобразовать API рецепт в локальный формат
   */
  transformApiRecipeToLocal(apiRecipe: ApiRecipe): Recipe {
    return {
      id: apiRecipe.id,
      title: apiRecipe.title,
      description: apiRecipe.description,
      image: apiRecipe.photoId ? `${API_BASE_URL}/photo/${apiRecipe.photoId}` : undefined,
      prepTime: apiRecipe.prepTime,
      cookTime: apiRecipe.cookTime,
      servings: apiRecipe.servings,
      difficulty: apiRecipe.difficulty,
      cuisine: apiRecipe.cuisine,
      tags: apiRecipe.tags,
      ingredients: apiRecipe.ingredients || [],
      steps: apiRecipe.steps || [],
      author: {
        id: apiRecipe.ownerUser.id.toString(),
        name: apiRecipe.ownerUser.name,
        avatar: apiRecipe.ownerUser.photo || undefined
      },
      stats: {
        views: 0,
        likes: 0,
        saves: 0,
        rating: 0,
        reviewsCount: 0
      },
      createdAt: apiRecipe.createdAt,
      updatedAt: apiRecipe.updatedAt
    };
  }

  /**
   * Преобразовать и отфильтровать рецепты
   */
  private transformAndFilterRecipes(apiRecipes: ApiRecipe[], filters?: RecipeFilters): Recipe[] {
    let recipes = apiRecipes.map(recipe => this.transformApiRecipeToLocal(recipe));
    
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
        if (!filters.difficulty.includes(recipe.difficulty)) {
          return false;
        }
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
        acc[recipe.difficulty] = (acc[recipe.difficulty] || 0) + 1;
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