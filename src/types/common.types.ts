export interface NutritionInfo {
    calories: number;
    protein: number;  // граммы
    carbs: number;    // граммы
    fat: number;      // граммы
    fiber?: number;   // граммы
    sugar?: number;   // граммы
    sodium?: number;  // миллиграммы
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