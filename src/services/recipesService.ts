import { realRecipesService } from './realRecipesService';
import type { 
  Recipe, 
  RecipeFilters, 
  RecipeSort, 
  PaginatedResponse
} from '../types';
import type { CreateRecipeDto, UpdateRecipeDto, DifficultyLevel, KitchenType } from '../types/recipe.types';

export class RecipesService {
  // Получение списка рецептов с пагинацией и фильтрами
  static async getRecipes(
    page: number = 1, 
    limit: number = 12, 
    filters?: RecipeFilters, 
    sort?: RecipeSort
  ): Promise<PaginatedResponse<Recipe>> {
    try {
      return await realRecipesService.getRecipes(page, limit, filters, sort);
    } catch (error: any) {
      console.error('Ошибка при получении рецептов:', error);
      throw error;
    }
  }

  // Получение одного рецепта по ID
  static async getRecipe(id: string): Promise<Recipe> {
    try {
      const recipe = await realRecipesService.getRecipeById(id);
      
      if (!recipe) {
        throw new Error('Рецепт не найден');
      }
      
      return recipe;
    } catch (error: any) {
      console.error('Ошибка при получении рецепта:', error);
      throw error;
    }
  }

  // Создание нового рецепта
  static async createRecipe(formData: CreateRecipeDto): Promise<Recipe> {
    try {
      return await realRecipesService.createRecipe(formData);
    } catch (error: any) {
      console.error('Ошибка при создании рецепта:', error);
      throw error;
    }
  }

  // Обновление рецепта
  static async updateRecipe(id: string, updates: UpdateRecipeDto): Promise<Recipe> {
    try {
      return await realRecipesService.updateRecipe(id, updates);
    } catch (error: any) {
      console.error('Ошибка при обновлении рецепта:', error);
      throw error;
    }
  }

  // Удаление рецепта
  static async deleteRecipe(id: string): Promise<void> {
    try {
      // Пока API не поддерживает удаление, возвращаем заглушку
      console.warn('Удаление рецептов пока не поддерживается API');
      throw new Error('Функция удаления рецептов находится в разработке');
    } catch (error: any) {
      console.error('Ошибка при удалении рецепта:', error);
      throw error;
    }
  }

  // Поиск рецептов
  static async searchRecipes(query: string, page: number = 1, limit: number = 12): Promise<PaginatedResponse<Recipe>> {
    try {
      const filters: RecipeFilters = { search: query };
      return await realRecipesService.getRecipes(page, limit, filters);
    } catch (error: any) {
      console.error('Ошибка при поиске рецептов:', error);
      throw error;
    }
  }

  // Получение рецептов по сложности
  static async getRecipesByDifficulty(
    difficulty: Recipe['difficulty'], 
    page: number = 1, 
    limit: number = 12
  ): Promise<PaginatedResponse<Recipe>> {
    try {
      // Преобразуем локальную сложность в API формат
      const apiDifficulty = difficulty.toUpperCase() as DifficultyLevel;
      const filters: RecipeFilters = { difficulty: [apiDifficulty] };
      return await realRecipesService.getRecipes(page, limit, filters);
    } catch (error: any) {
      console.error('Ошибка при получении рецептов по сложности:', error);
      throw error;
    }
  }

  // Получение рецептов по кухне
  static async getRecipesByCuisine(
    cuisine: KitchenType, 
    page: number = 1, 
    limit: number = 12
  ): Promise<PaginatedResponse<Recipe>> {
    try {
      const filters: RecipeFilters = { cuisine: [cuisine] };
      return await realRecipesService.getRecipes(page, limit, filters);
    } catch (error: any) {
      console.error('Ошибка при получении рецептов по кухне:', error);
      throw error;
    }
  }

  // Получение быстрых рецептов (время приготовления < 30 минут)
  static async getQuickRecipes(page: number = 1, limit: number = 12): Promise<PaginatedResponse<Recipe>> {
    try {
      const filters: RecipeFilters = { 
        prepTime: { max: 30 } 
      };
      const sort: RecipeSort = { field: 'prepTime', order: 'asc' };
      return await realRecipesService.getRecipes(page, limit, filters, sort);
    } catch (error: any) {
      console.error('Ошибка при получении быстрых рецептов:', error);
      throw error;
    }
  }

  // Получение популярных рецептов
  static async getPopularRecipes(page: number = 1, limit: number = 12): Promise<PaginatedResponse<Recipe>> {
    try {
      const sort: RecipeSort = { field: 'rating', order: 'desc' };
      return await realRecipesService.getRecipes(page, limit, undefined, sort);
    } catch (error: any) {
      console.error('Ошибка при получении популярных рецептов:', error);
      throw error;
    }
  }

  // Получение новых рецептов
  static async getNewRecipes(page: number = 1, limit: number = 12): Promise<PaginatedResponse<Recipe>> {
    try {
      const sort: RecipeSort = { field: 'createdAt', order: 'desc' };
      return await realRecipesService.getRecipes(page, limit, undefined, sort);
    } catch (error: any) {
      console.error('Ошибка при получении новых рецептов:', error);
      throw error;
    }
  }

  // Проверка валидности формы рецепта
  static validateRecipeForm(formData: CreateRecipeDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.name?.trim()) {
      errors.push('Название рецепта обязательно');
    }

    if (!formData.description?.trim()) {
      errors.push('Описание рецепта обязательно');
    }

    if (!formData.level) {
      errors.push('Выберите сложность рецепта');
    }

    if (formData.allTime < 0) {
      errors.push('Общее время приготовления не может быть отрицательным');
    }

    if (formData.cookTime < 0) {
      errors.push('Время готовки не может быть отрицательным');
    }

    if (formData.portion < 1) {
      errors.push('Количество порций должно быть больше 0');
    }

    if (!formData.ingredients?.length) {
      errors.push('Добавьте хотя бы один ингредиент');
    }

    if (!formData.steps?.length) {
      errors.push('Добавьте хотя бы один шаг приготовления');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Форматирование времени приготовления
  static formatCookingTime(prepTime: number, cookTime: number): string {
    const totalMinutes = prepTime + cookTime;
    
    if (totalMinutes < 60) {
      return `${totalMinutes} мин`;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (minutes === 0) {
      return `${hours} ч`;
    }
    
    return `${hours} ч ${minutes} мин`;
  }

  // Форматирование сложности
  static formatDifficulty(difficulty: Recipe['difficulty']): string {
    const difficultyMap = {
      easy: 'Легко',
      medium: 'Средне',
      hard: 'Сложно'
    };
    
    return difficultyMap[difficulty];
  }

  // Получение цвета сложности
  static getDifficultyColor(difficulty: Recipe['difficulty']): string {
    const colorMap = {
      easy: '#51cf66',
      medium: '#ffd43b',
      hard: '#ff6b6b'
    };
    
    return colorMap[difficulty];
  }

  // Подсчет общего времени приготовления
  static getTotalCookingTime(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }

  // Проверка, является ли рецепт быстрым (менее 30 минут)
  static isQuickRecipe(recipe: Recipe): boolean {
    return this.getTotalCookingTime(recipe) <= 30;
  }

  // Проверка, является ли рецепт популярным (рейтинг > 4.5)
  static isPopularRecipe(recipe: Recipe): boolean {
    return recipe.stats.rating > 4.5;
  }

  // Получение количества отзывов в текстовом формате
  static getReviewsText(reviewsCount: number): string {
    if (reviewsCount === 0) {
      return 'Нет отзывов';
    }
    
    if (reviewsCount === 1) {
      return '1 отзыв';
    }
    
    if (reviewsCount < 5) {
      return `${reviewsCount} отзыва`;
    }
    
    return `${reviewsCount} отзывов`;
  }

  // Получение статистики из API
  static async getRecipesStats() {
    try {
      return await realRecipesService.getRecipesStats();
    } catch (error) {
      console.error('Ошибка при получении статистики рецептов:', error);
      return { total: 0, byDifficulty: {}, byCuisine: {} };
    }
  }
} 