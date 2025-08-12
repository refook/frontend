import React from 'react';
import { RecipeCard } from './components/RecipeCard';

// Sample recipe data
const sampleRecipe = {
  title: "Mediterranean Chicken Bowl",
  complexity: "Medium" as const,
  cookingTime: 45,
  activeTime: 20,
  servings: 4,
  ingredients: [
    { id: "1", name: "Chicken Breast", amount: "500g", icon: "🍗" },
    { id: "2", name: "Quinoa", amount: "1 cup", icon: "🌾" },
    { id: "3", name: "Cherry Tomatoes", amount: "200g", icon: "🍅" },
    { id: "4", name: "Cucumber", amount: "1 large", icon: "🥒" },
    { id: "5", name: "Red Onion", amount: "1/2 cup", icon: "🧅" },
    { id: "6", name: "Feta Cheese", amount: "100g", icon: "🧀" },
    { id: "7", name: "Olive Oil", amount: "3 tbsp", icon: "🫒" },
    { id: "8", name: "Lemon", amount: "1 whole", icon: "🍋" },
  ],
  tags: ["Healthy", "Mediterranean", "High Protein", "Gluten Free", "Quick Meal"],
  nutrition: {
    calories: 425,
    proteins: 32,
    fats: 18,
    carbohydrates: 28
  }
};

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <RecipeCard recipe={sampleRecipe} />
    </div>
  );
}