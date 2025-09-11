// Error types
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

// --- Product DTOs ---

/**
 * КБЖУ для продуктов и рецептов (из API схемы MacrosDto)
 */
export interface ApiMacrosDto {
    calories: number; // int
    proteins: number; // float
    fats: number; // float
    carbs: number; // float
    isEmpty: boolean;
}

/**
 * Добавление базовой меры продукта (из API схемы AddBaseProductMeasureDto)
 */
export interface AddBaseProductMeasureDto {
    name: string;
    weight: number; // граммы
    isDefault: boolean;
    density?: number;
}

/**
 * ДТО создания базового продукта (из API схемы CreateProductDto)
 */
export interface CreateProductDto {
    name: string;
    description?: string;
    categoryId?: string | null; // uuid
    photo?: string | null;
    macros: ApiMacrosDto;
    measures: AddBaseProductMeasureDto[]; // minItems: 1
}

/**
 * ДТО обновления продукта (см. UpdateProductDto в API)
 */
export interface UpdateProductDto {
    name: string;
    description?: string;
    categoryId?: string | null; // uuid
    photo?: string | null;
    macros: ApiMacrosDto;
}

/**
 * Ответ продукта из API для заполнения формы редактирования
 */
export interface ProductResponseDto {
    id: string;
    name: string;
    description?: string;
    categoryId?: string | null;
    photo?: string | null;
    macros: ApiMacrosDto;
}
