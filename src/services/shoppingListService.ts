import type { ShoppingList, ShoppingListFormData, ShoppingListItem } from '../types';

const STORAGE_KEY = 'refook_shopping_lists';

// Генерация ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Получить все списки покупок пользователя
export const getShoppingLists = (userId: string): ShoppingList[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const allLists: ShoppingList[] = JSON.parse(stored);
    return allLists.filter(list => list.userId === userId);
  } catch (error) {
    console.error('Error getting shopping lists:', error);
    return [];
  }
};

// Создать новый список покупок
export const createShoppingList = (userId: string, formData: ShoppingListFormData): ShoppingList => {
  const now = new Date().toISOString();
  
  const newList: ShoppingList = {
    id: generateId(),
    userId,
    title: formData.title,
    recipeId: formData.recipeId,
    recipeName: formData.recipeName,
    items: formData.items.map(item => ({
      ...item,
      id: generateId(),
      isCompleted: false
    })),
    isCompleted: false,
    createdAt: now,
    updatedAt: now
  };
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allLists: ShoppingList[] = stored ? JSON.parse(stored) : [];
    
    allLists.push(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLists));
    
    return newList;
  } catch (error) {
    console.error('Error creating shopping list:', error);
    throw error;
  }
};

// Обновить список покупок
export const updateShoppingList = (listId: string, updates: Partial<ShoppingList>): ShoppingList | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const allLists: ShoppingList[] = JSON.parse(stored);
    const listIndex = allLists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) return null;
    
    const updatedList = {
      ...allLists[listIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    allLists[listIndex] = updatedList;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLists));
    
    return updatedList;
  } catch (error) {
    console.error('Error updating shopping list:', error);
    return null;
  }
};

// Переключить статус элемента списка
export const toggleShoppingListItem = (listId: string, itemId: string): ShoppingList | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const allLists: ShoppingList[] = JSON.parse(stored);
    const listIndex = allLists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) return null;
    
    const list = allLists[listIndex];
    const itemIndex = list.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return null;
    
    // Переключаем статус элемента
    list.items[itemIndex].isCompleted = !list.items[itemIndex].isCompleted;
    
    // Проверяем, завершен ли весь список
    const allItemsCompleted = list.items.every(item => item.isCompleted);
    if (allItemsCompleted && !list.isCompleted) {
      list.isCompleted = true;
      list.completedAt = new Date().toISOString();
    } else if (!allItemsCompleted && list.isCompleted) {
      list.isCompleted = false;
      list.completedAt = undefined;
    }
    
    list.updatedAt = new Date().toISOString();
    
    allLists[listIndex] = list;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLists));
    
    return list;
  } catch (error) {
    console.error('Error toggling shopping list item:', error);
    return null;
  }
};

// Удалить список покупок
export const deleteShoppingList = (listId: string): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    
    const allLists: ShoppingList[] = JSON.parse(stored);
    const filteredLists = allLists.filter(list => list.id !== listId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLists));
    return true;
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    return false;
  }
};

// Очистить все списки покупок пользователя
export const clearShoppingLists = (userId: string): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return true;
    
    const allLists: ShoppingList[] = JSON.parse(stored);
    const filteredLists = allLists.filter(list => list.userId !== userId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLists));
    return true;
  } catch (error) {
    console.error('Error clearing shopping lists:', error);
    return false;
  }
};