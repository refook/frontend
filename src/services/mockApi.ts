import type { 
  Recipe, 
  CreateRecipeForm, 
  RecipeFilters, 
  RecipeSort, 
  PaginatedResponse, 
  ApiResponse, 
  ApiError,
  Ingredient,
  IngredientCategory,
  User,
  FridgeItem,
  Favorite
} from '../types';
import { 
  initialRecipes, 
  initialIngredients, 
  initialCategories, 
  initialUsers 
} from '../data';

// Имитация базы данных в localStorage
class MockDatabase {
  private static instance: MockDatabase;
  private storage: Storage;

  constructor() {
    this.storage = localStorage;
    this.initializeData();
  }

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  private initializeData() {
    // Инициализируем данные только если их нет
    if (!this.storage.getItem('mock_recipes')) {
      this.storage.setItem('mock_recipes', JSON.stringify(initialRecipes));
    }
    if (!this.storage.getItem('mock_ingredients')) {
      this.storage.setItem('mock_ingredients', JSON.stringify(initialIngredients));
    }
    if (!this.storage.getItem('mock_categories')) {
      this.storage.setItem('mock_categories', JSON.stringify(initialCategories));
    }
    if (!this.storage.getItem('mock_users')) {
      this.storage.setItem('mock_users', JSON.stringify(initialUsers));
    }
    if (!this.storage.getItem('mock_favorites')) {
      this.storage.setItem('mock_favorites', JSON.stringify([]));
    }
    if (!this.storage.getItem('mock_fridge')) {
      this.storage.setItem('mock_fridge', JSON.stringify([]));
    }
  }









  // CRUD операции для рецептов
  async getRecipes(page: number = 1, limit: number = 12, filters?: RecipeFilters, sort?: RecipeSort): Promise<PaginatedResponse<Recipe>> {
    await this.simulateDelay(300, 800);
    
    let recipes = JSON.parse(this.storage.getItem('mock_recipes') || '[]');
    
    // Применяем фильтры
    if (filters) {
      recipes = this.applyFilters(recipes, filters);
    }
    
    // Применяем сортировку
    if (sort) {
      recipes = this.applySort(recipes, sort);
    }
    
    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecipes = recipes.slice(startIndex, endIndex);
    
    return {
      data: paginatedRecipes,
      pagination: {
        page,
        limit,
        total: recipes.length,
        totalPages: Math.ceil(recipes.length / limit)
      }
    };
  }

  async getRecipe(id: string): Promise<Recipe> {
    await this.simulateDelay(200, 500);
    
    const recipes = JSON.parse(this.storage.getItem('mock_recipes') || '[]');
    const recipe = recipes.find((r: Recipe) => r.id === id);
    
    if (!recipe) {
      throw this.createError('NOT_FOUND', 'Рецепт не найден');
    }
    
    return recipe;
  }

  async createRecipe(formData: CreateRecipeForm): Promise<Recipe> {
    await this.simulateDelay(1000, 2000);
    
    // Валидация
    if (!formData.title.trim()) {
      throw this.createError('VALIDATION_ERROR', 'Название рецепта обязательно');
    }
    
    if (!formData.description.trim()) {
      throw this.createError('VALIDATION_ERROR', 'Описание рецепта обязательно');
    }
    
    if (formData.ingredients.length === 0) {
      throw this.createError('VALIDATION_ERROR', 'Добавьте хотя бы один ингредиент');
    }
    
    if (formData.steps.length === 0) {
      throw this.createError('VALIDATION_ERROR', 'Добавьте хотя бы один шаг');
    }
    
    const recipes = JSON.parse(this.storage.getItem('mock_recipes') || '[]');
    const users = JSON.parse(this.storage.getItem('mock_users') || '[]');
    
    // Создаем новый рецепт
    const newRecipe: Recipe = {
      id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title,
      description: formData.description,
      image: formData.image ? await this.uploadImage(formData.image) : undefined,
      prepTime: formData.prepTime,
      cookTime: formData.cookTime,
      servings: formData.servings,
      difficulty: formData.difficulty,
      cuisine: formData.cuisine,
      tags: formData.tags,
      ingredients: await this.processIngredients(formData.ingredients),
      steps: formData.steps.map((step, index) => ({
        ...step,
        id: `step-${Date.now()}-${index}`,
        order: index + 1,
        image: step.image ? URL.createObjectURL(step.image) : undefined
      })),
      author: users[0] || { id: 'current-user', name: 'Вы', avatar: undefined },
      stats: {
        views: 0,
        likes: 0,
        saves: 0,
        rating: 0,
        reviewsCount: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Добавляем в "базу данных"
    recipes.unshift(newRecipe);
    this.storage.setItem('mock_recipes', JSON.stringify(recipes));
    
    return newRecipe;
  }

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    await this.simulateDelay(800, 1500);
    
    const recipes = JSON.parse(this.storage.getItem('mock_recipes') || '[]');
    const index = recipes.findIndex((r: Recipe) => r.id === id);
    
    if (index === -1) {
      throw this.createError('NOT_FOUND', 'Рецепт не найден');
    }
    
    const updatedRecipe = {
      ...recipes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    recipes[index] = updatedRecipe;
    this.storage.setItem('mock_recipes', JSON.stringify(recipes));
    
    return updatedRecipe;
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.simulateDelay(500, 1000);
    
    const recipes = JSON.parse(this.storage.getItem('mock_recipes') || '[]');
    const filteredRecipes = recipes.filter((r: Recipe) => r.id !== id);
    
    if (filteredRecipes.length === recipes.length) {
      throw this.createError('NOT_FOUND', 'Рецепт не найден');
    }
    
    this.storage.setItem('mock_recipes', JSON.stringify(filteredRecipes));
  }

  // CRUD операции для ингредиентов
  async getIngredients(): Promise<Ingredient[]> {
    await this.simulateDelay(200, 400);
    return JSON.parse(this.storage.getItem('mock_ingredients') || '[]');
  }

  async getCategories(): Promise<IngredientCategory[]> {
    await this.simulateDelay(100, 200);
    return JSON.parse(this.storage.getItem('mock_categories') || '[]');
  }

  // CRUD операции для избранного
  async getFavorites(userId: string): Promise<Favorite[]> {
    await this.simulateDelay(300, 600);
    const favorites = JSON.parse(this.storage.getItem('mock_favorites') || '[]');
    return favorites.filter((f: Favorite) => f.userId === userId);
  }

  async addToFavorites(userId: string, recipeId: string): Promise<Favorite> {
    await this.simulateDelay(400, 800);
    
    const favorites = JSON.parse(this.storage.getItem('mock_favorites') || '[]');
    
    // Проверяем, не добавлен ли уже
    const existing = favorites.find((f: Favorite) => f.userId === userId && f.recipeId === recipeId);
    if (existing) {
      throw this.createError('DUPLICATE_ERROR', 'Рецепт уже в избранном');
    }
    
    const newFavorite: Favorite = {
      id: `favorite-${Date.now()}`,
      userId,
      recipeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    favorites.push(newFavorite);
    this.storage.setItem('mock_favorites', JSON.stringify(favorites));
    
    return newFavorite;
  }

  async removeFromFavorites(userId: string, recipeId: string): Promise<void> {
    await this.simulateDelay(300, 600);
    
    const favorites = JSON.parse(this.storage.getItem('mock_favorites') || '[]');
    const filteredFavorites = favorites.filter((f: Favorite) => !(f.userId === userId && f.recipeId === recipeId));
    
    this.storage.setItem('mock_favorites', JSON.stringify(filteredFavorites));
  }

  // CRUD операции для холодильника
  async getFridgeItems(userId: string): Promise<FridgeItem[]> {
    await this.simulateDelay(300, 600);
    const fridgeItems = JSON.parse(this.storage.getItem('mock_fridge') || '[]');
    return fridgeItems.filter((item: FridgeItem) => item.userId === userId);
  }

  async addFridgeItem(item: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FridgeItem> {
    await this.simulateDelay(500, 1000);
    
    const fridgeItems = JSON.parse(this.storage.getItem('mock_fridge') || '[]');
    
    const newItem: FridgeItem = {
      ...item,
      id: `fridge-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    fridgeItems.push(newItem);
    this.storage.setItem('mock_fridge', JSON.stringify(fridgeItems));
    
    return newItem;
  }

  async updateFridgeItem(id: string, updates: Partial<FridgeItem>): Promise<FridgeItem> {
    await this.simulateDelay(400, 800);
    
    const fridgeItems = JSON.parse(this.storage.getItem('mock_fridge') || '[]');
    const index = fridgeItems.findIndex((item: FridgeItem) => item.id === id);
    
    if (index === -1) {
      throw this.createError('NOT_FOUND', 'Продукт не найден');
    }
    
    const updatedItem = {
      ...fridgeItems[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    fridgeItems[index] = updatedItem;
    this.storage.setItem('mock_fridge', JSON.stringify(fridgeItems));
    
    return updatedItem;
  }

  async deleteFridgeItem(id: string): Promise<void> {
    await this.simulateDelay(300, 600);
    
    const fridgeItems = JSON.parse(this.storage.getItem('mock_fridge') || '[]');
    const filteredItems = fridgeItems.filter((item: FridgeItem) => item.id !== id);
    
    this.storage.setItem('mock_fridge', JSON.stringify(filteredItems));
  }

  // Вспомогательные методы
  private async simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private createError(code: string, message: string): ApiError {
    return { code, message };
  }

  private applyFilters(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
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
      
      // Время приготовления
      if (filters.prepTime) {
        const totalPrepTime = recipe.prepTime + recipe.cookTime;
        if (filters.prepTime.min && totalPrepTime < filters.prepTime.min) return false;
        if (filters.prepTime.max && totalPrepTime > filters.prepTime.max) return false;
      }
      
      // Количество порций
      if (filters.servings) {
        if (filters.servings.min && recipe.servings < filters.servings.min) return false;
        if (filters.servings.max && recipe.servings > filters.servings.max) return false;
      }
      
      // Теги
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => recipe.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });
  }

  private applySort(recipes: Recipe[], sort: RecipeSort): Recipe[] {
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
        case 'cookTime':
          aValue = a.cookTime;
          bValue = b.cookTime;
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

  private async processIngredients(formIngredients: any[]): Promise<any[]> {
    const ingredients = JSON.parse(this.storage.getItem('mock_ingredients') || '[]');
    
    return formIngredients.map((ing, index) => {
      // Ищем существующий ингредиент или создаем новый
      let ingredient = ingredients.find((i: Ingredient) => i.name.toLowerCase() === ing.name.toLowerCase());
      
      if (!ingredient) {
        ingredient = {
          id: `ingredient-${Date.now()}-${index}`,
          name: ing.name,
          category: { id: 'other', name: 'Другое', color: '#ccc' }
        };
        
        ingredients.push(ingredient);
        this.storage.setItem('mock_ingredients', JSON.stringify(ingredients));
      }
      
      return {
        id: `ing-${Date.now()}-${index}`,
        ingredient,
        amount: parseFloat(ing.amount) || 0,
        unit: ing.unit
      };
    });
  }

  private async uploadImage(file: File): Promise<string> {
    // Симулируем загрузку изображения
    await this.simulateDelay(1000, 3000);
    
    // Создаем временную ссылку на файл
    return URL.createObjectURL(file);
  }

  // Методы для управления данными

  /**
   * Полный сброс всех данных и инициализация с начальными значениями
   */
  resetData(): void {
    this.clearAllData();
    this.initializeData();
  }

  /**
   * Очистка всех данных без инициализации
   */
  clearAllData(): void {
    this.storage.removeItem('mock_recipes');
    this.storage.removeItem('mock_ingredients');
    this.storage.removeItem('mock_categories');
    this.storage.removeItem('mock_users');
    this.storage.removeItem('mock_favorites');
    this.storage.removeItem('mock_fridge');
  }

  /**
   * Очистка только пользовательских данных (рецепты, избранное, холодильник)
   */
  clearUserData(): void {
    this.storage.removeItem('mock_recipes');
    this.storage.removeItem('mock_favorites');
    this.storage.removeItem('mock_fridge');
    // Переинициализируем только рецепты
    this.storage.setItem('mock_recipes', JSON.stringify(initialRecipes));
  }

  /**
   * Очистка только избранного
   */
  clearFavorites(): void {
    this.storage.removeItem('mock_favorites');
    this.storage.setItem('mock_favorites', JSON.stringify([]));
  }

  /**
   * Очистка только холодильника
   */
  clearFridge(): void {
    this.storage.removeItem('mock_fridge');
    this.storage.setItem('mock_fridge', JSON.stringify([]));
  }

  /**
   * Получение информации о размере данных в localStorage
   */
  getStorageInfo(): { totalSize: number; items: Record<string, number> } {
    const items: Record<string, number> = {};
    let totalSize = 0;
    
    const keys = [
      'mock_recipes',
      'mock_ingredients', 
      'mock_categories',
      'mock_users',
      'mock_favorites',
      'mock_fridge'
    ];
    
    keys.forEach(key => {
      const data = this.storage.getItem(key);
      if (data) {
        const size = new Blob([data]).size;
        items[key] = size;
        totalSize += size;
      }
    });
    
    return { totalSize, items };
  }
}

// Создаем и экспортируем экземпляр
export const mockApi = MockDatabase.getInstance(); 