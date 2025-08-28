import React, { useState, useEffect } from 'react';
import { AddProductForm } from './AddProductForm';
import { ProductItem } from './ProductItem';
 
import type { MeasureType } from '../../types/measures.types';
import type { FridgeProduct, FridgeResponseDto, CreateFridgeDto } from '../../types/fridge.types';
import { fridgeApiService } from '../../services/fridgeApiService';
import styles from './FridgeProducts.module.css';

export const FridgeProducts: React.FC = () => {
  const [items, setItems] = useState<FridgeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [fridges, setFridges] = useState<FridgeResponseDto[]>([]);
  const [selectedFridgeId, setSelectedFridgeId] = useState<string | undefined>(undefined);
  const activeFridgeId = selectedFridgeId || fridges[0]?.id;

  // Загрузка продуктов из API
  const loadFridgeProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!activeFridgeId) {
        setItems([]);
        setLoading(false);
        return;
      }
      const products = await fridgeApiService.getAllFridgeProducts(activeFridgeId);
      setItems(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки продуктов');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка холодильников пользователя и затем продуктов
  const loadUserFridges = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fridgeApiService.getUserFridges();
      setFridges(list);
      // Выбираем первый холодильник по умолчанию, если не выбран
      if (!selectedFridgeId && list.length > 0) {
        setSelectedFridgeId(list[0].id);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки холодильников');
      setLoading(false);
    }
  };

  const handleCreateFridge = async () => {
    try {
      const name = window.prompt('Введите название холодильника');
      if (!name || !name.trim()) return;
      const payload: CreateFridgeDto = { name: name.trim() };
      await fridgeApiService.createFridge(payload);
      await loadUserFridges();
    } catch (err) {
      console.error('Ошибка создания холодильника:', err);
      setError(err instanceof Error ? err.message : 'Не удалось создать холодильник');
    }
  };

  const handleAddProductGuard = () => {
    if (fridges.length === 0) return;
    setShowAddForm(true);
  };

  useEffect(() => {
    loadUserFridges();
  }, []);

  useEffect(() => {
    if (activeFridgeId) {
      loadFridgeProducts();
    } else {
      setItems([]);
    }
  }, [activeFridgeId]);

  const handleAddProduct = async (productData: {
    ingredient: any;
    amount: number;
    unit: string;
    baseUnit?: 'GR' | 'ML';
    expiryDate?: string;
    notes?: string;
  }) => {
    try {
      const apiData = fridgeApiService.transformLocalProductToApi(productData);
      if (!activeFridgeId) throw new Error('Холодильник не выбран');
      await fridgeApiService.createFridgeProduct(activeFridgeId, apiData);
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
      if (!activeFridgeId) throw new Error('Холодильник не выбран');
      await fridgeApiService.deleteFridgeProduct(activeFridgeId, id);
      // Обновляем список продуктов
      await loadFridgeProducts();
    } catch (error) {
      console.error('Ошибка удаления продукта:', error);
      setError('Не удалось удалить продукт');
    }
  };

  const handleUpdateProduct = async (id: string, updates: any) => {
    try {
      if (!activeFridgeId) throw new Error('Холодильник не выбран');
      const current = items.find(i => i.id === id);
      if (!current) throw new Error('Продукт не найден в списке');
      await fridgeApiService.updateFridgeProduct(activeFridgeId, id, updates, current);
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
        <p>Загрузка данных...</p>
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
          {fridges.length > 0 && (
            <select
              className={styles.select}
              value={activeFridgeId || ''}
              onChange={(e) => setSelectedFridgeId(e.target.value || undefined)}
              title="Выберите холодильник"
            >
              {fridges.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          )}
          <button 
            className={`${styles.addButton} ui-btn ui-btn--primary`}
            onClick={handleCreateFridge}
          >
            <span className={styles.addIcon}>+</span>
            Создать холодильник
          </button>
          <button 
            className={`${styles.addButton} ui-btn ui-btn--primary`}
            onClick={handleAddProductGuard}
            disabled={fridges.length === 0}
            title={fridges.length === 0 ? 'Сначала создайте холодильник' : undefined}
          >
            <span className={styles.addIcon}>+</span>
            Добавить продукт
          </button>
        </div>
      </div>

      {fridges.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🧊</div>
          <h3>У вас пока нет холодильников</h3>
          <p>Создайте холодильник, чтобы начинать добавлять продукты</p>
          <button 
            className={`${styles.emptyButton} ui-btn ui-btn--primary`}
            onClick={handleCreateFridge}
          >
            Создать холодильник
          </button>
        </div>
      )}

      {showAddForm && fridges.length > 0 && (
        <div className={styles.addFormContainer}>
          <AddProductForm
            onSubmit={handleAddProduct}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Форма предложения перенесена в /admin */}

      {fridges.length > 0 && (items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🧊</div>
          <h3>Холодильник пуст</h3>
          <p>Добавьте продукты, чтобы получать персональные рекомендации рецептов</p>
          <button 
            className={`${styles.emptyButton} ui-btn ui-btn--primary`}
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
      ))}
    </div>
  );
}; 