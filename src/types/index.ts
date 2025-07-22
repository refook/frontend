// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'ru' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

// Recipe types
export interface Recipe extends BaseEntity {
  title: string;
  description: string;
  image?: string;
  prepTime: number; // в минутах
  cookTime: number; // в минутах
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutrition?: NutritionInfo;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  stats: {
    views: number;
    likes: number;
    saves: number;
    rating: number;
    reviewsCount: number;
  };
}

export interface RecipeIngredient {
  id: string;
  ingredient: Ingredient;
  amount: number;
  unit: string;
  notes?: string;
  optional?: boolean;
}

export interface RecipeStep {
  id: string;
  order: number;
  title?: string;
  description: string;
  image?: string;
  duration?: number; // в минутах
}

export interface NutritionInfo {
  calories: number;
  protein: number;  // граммы
  carbs: number;    // граммы
  fat: number;      // граммы
  fiber?: number;   // граммы
  sugar?: number;   // граммы
  sodium?: number;  // миллиграммы
}

// Ingredient types
export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  category: IngredientCategory;
  nutrition?: NutritionInfo;
  storageInstructions?: string;
  shelfLife?: number; // дни
}

export interface IngredientCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

// Fridge types
export interface FridgeItem extends BaseEntity {
  userId: string;
  ingredient: Ingredient;
  amount: number;
  unit: string;
  expirationDate?: string;
  purchaseDate?: string;
  location?: 'fridge' | 'freezer' | 'pantry';
  notes?: string;
}

// Favorites types
export interface Favorite extends BaseEntity {
  userId: string;
  recipeId: string;
  recipe?: Recipe;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and Search types
export interface RecipeFilters {
  search?: string;
  cuisine?: string[];
  difficulty?: Recipe['difficulty'][];
  prepTime?: {
    min?: number;
    max?: number;
  };
  cookTime?: {
    min?: number;
    max?: number;
  };
  servings?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  ingredients?: string[];
  missingIngredients?: {
    max?: number;
  };
  favoriteOnly?: boolean;
  availableOnly?: boolean; // только рецепты, для которых есть все ингредиенты
}

export interface RecipeSort {
  field: 'createdAt' | 'prepTime' | 'cookTime' | 'rating' | 'missingIngredients';
  order: 'asc' | 'desc';
}

// Form types
export interface CreateRecipeForm {
  title: string;
  description: string;
  image?: File;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Recipe['difficulty'];
  cuisine?: string;
  tags: string[];
  ingredients: FormIngredient[];
  steps: FormStep[];
}

export interface FormIngredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface FormStep {
  id: string;
  description: string;
  order: number;
  image?: File;
}

export interface AddFridgeItemForm {
  ingredientId: string;
  amount: number;
  unit: string;
  expirationDate?: string;
  purchaseDate?: string;
  location?: FridgeItem['location'];
  notes?: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Theme types
export type ThemeMode = 'light' | 'dark';

// Component prop types
export interface ComponentWithChildren {
  children: React.ReactNode;
}

export interface ComponentWithClassName {
  className?: string;
}

// Shopping list types
export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  amount: number;
  unit: string;
  isCompleted: boolean;
  notes?: string;
}

export interface ShoppingList extends BaseEntity {
  userId: string;
  title: string;
  recipeId?: string;
  recipeName?: string;
  items: ShoppingListItem[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface ShoppingListFormData {
  title: string;
  recipeId?: string;
  recipeName?: string;
  items: Omit<ShoppingListItem, 'id' | 'isCompleted'>[];
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>; 