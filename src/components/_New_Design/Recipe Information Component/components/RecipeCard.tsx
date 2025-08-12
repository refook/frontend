import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, ChefHat, Timer, Users } from 'lucide-react';

interface RecipeData {
  title: string;
  complexity: 'Easy' | 'Medium' | 'Hard';
  cookingTime: number; // in minutes
  activeTime: number; // in minutes
  servings: number;
  ingredients: Array<{
    id: string;
    name: string;
    amount: string;
    icon: string; // emoji or icon identifier
  }>;
  tags: string[];
  nutrition: {
    calories: number;
    proteins: number; // in grams
    fats: number; // in grams
    carbohydrates: number; // in grams
  };
}

interface RecipeCardProps {
  recipe: RecipeData;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-gray-50 border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-gray-800">{recipe.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Cooking Metrics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200">
            <ChefHat className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Complexity</p>
              <Badge className={`${getComplexityColor(recipe.complexity)} border-0 text-xs`}>
                {recipe.complexity}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200">
            <Clock className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Total Time</p>
              <p className="font-medium text-gray-800">{recipe.cookingTime} min</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200">
            <Timer className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Active Time</p>
              <p className="font-medium text-gray-800">{recipe.activeTime} min</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200">
            <Users className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Servings</p>
              <p className="font-medium text-gray-800">{recipe.servings}</p>
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h3 className="text-gray-800 mb-3">Ingredients</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {recipe.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg border border-gray-200 shadow-sm">
                  {ingredient.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{ingredient.name}</p>
                  <p className="text-xs text-gray-500">{ingredient.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h3 className="text-gray-800 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 rounded-full px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Nutrition Section */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h3 className="text-gray-800 mb-3">Nutrition per serving</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-semibold text-gray-800">{recipe.nutrition.calories}</p>
              <p className="text-xs text-gray-500">Calories</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-semibold text-gray-800">{recipe.nutrition.proteins}g</p>
              <p className="text-xs text-gray-500">Proteins</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-semibold text-gray-800">{recipe.nutrition.fats}g</p>
              <p className="text-xs text-gray-500">Fats</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-semibold text-gray-800">{recipe.nutrition.carbohydrates}g</p>
              <p className="text-xs text-gray-500">Carbs</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}