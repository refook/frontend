import React, { useState, useEffect } from 'react';
import { AddProductForm } from './AddProductForm';
import { ProductItem } from './ProductItem';
 
import type { MeasureType } from '../../types/measures.types';
import type { FridgeProduct } from '../../types/fridge.types';
import { fridgeApiService } from '../../services/fridgeApiService';
import styles from './FridgeProducts.module.css';

export const FridgeProducts: React.FC = () => {
  const [items, setItems] = useState<FridgeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Загрузка продуктов из API
  const loadFridgeProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await fridgeApiService.getAllFridgeProducts();
      setItems(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки продуктов');
    } finally {
      setLoading(false);
    }
  };

  // Предложение продукта перенесено в /admin

  useEffect(() => {
    loadFridgeProducts();
  }, []);

  const handleAddProduct = async (productData: {
    ingredient: any;
    amount: number;
    unit: string;
    expiryDate?: string;
    notes?: string;
  }) => {
    try {
      const apiData = fridgeApiService.transformLocalProductToApi(productData);
      await fridgeApiService.createFridgeProduct(apiData);
      setShowAddForm(false);
      // Обновляем список продуктов
      await loadFridgeProducts();
    } catch (error) {
      console.error('Ошибка добавления продукта:', error);
      setError('Не удалось добавить продукт');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await fridgeApiService.deleteFridgeProduct(id);
      // Обновляем список продуктов
      await loadFridgeProducts();
    } catch (error) {
      console.error('Ошибка удаления продукта:', error);
      setError('Не удалось удалить продукт');
    }
  };

  const handleUpdateProduct = async (id: string, updates: any) => {
    try {
      await fridgeApiService.updateFridgeProduct(id, updates);
      // Обновляем список продуктов
      await loadFridgeProducts();
    } catch (error) {
      console.error('Ошибка обновления продукта:', error);
      setError('Не удалось обновить продукт');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка продуктов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Ошибка загрузки продуктов: {error}</p>
        <button onClick={loadFridgeProducts}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className={styles.fridgeProducts}>
      <div className={styles.header}>
        <h2>Мои продукты</h2>
        <div className={styles.headerButtons}>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
          >
            <span className={styles.addIcon}>+</span>
            Добавить продукт
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className={styles.addFormContainer}>
          <AddProductForm
            onSubmit={handleAddProduct}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Форма предложения перенесена в /admin */}

      {items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🧊</div>
          <h3>Холодильник пуст</h3>
          <p>Добавьте продукты, чтобы получать персональные рекомендации рецептов</p>
          <button 
            className={styles.emptyButton}
            onClick={() => setShowAddForm(true)}
          >
            Добавить первый продукт
          </button>
        </div>
      ) : (
        <div className={styles.productsList}>
          {items.map(item => (
            <ProductItem
              key={item.id}
              item={item}
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 