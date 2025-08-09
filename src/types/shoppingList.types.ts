// Shopping list types
import type {BaseEntity} from "./index.ts";

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
