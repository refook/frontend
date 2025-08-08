// Favorites types
import type {BaseEntity, Recipe} from "./index.ts";

export interface Favorite extends BaseEntity {
    userId: string;
    recipeId: string;
    recipe?: Recipe;
}
