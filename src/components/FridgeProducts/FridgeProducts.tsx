import React, { useState, useEffect } from 'react';
import { AddProductForm } from './AddProductForm';
import { ProductItem } from './ProductItem';
 
import type { MeasureType } from '../../types/measures.types';
import type { FridgeProduct, FridgeResponseDto, CreateFridgeDto } from '../../types/fridge.types';
import { fridgeApiService } from '../../services/fridgeApiService';
import styles from './FridgeProducts.module.css';
import { StatsPanel } from './StatsPanel';

export const FridgeProducts: React.FC = () => {
  const [items, setItems] = useState<FridgeProduct[]>([]);
  const [baseItems, setBaseItems] = useState<FridgeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [fridges, setFridges] = useState<FridgeResponseDto[]>([]);
  const [selectedFridgeId, setSelectedFridgeId] = useState<string | undefined>(undefined);
  const [compactView, setCompactView] = useState(false);
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
      setBaseItems(products);
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

  const handleCreateFridge = async (): Promise<FridgeResponseDto | null> => {
    try {
      const name = window.prompt('Введите название холодильника');
      if (!name || !name.trim()) return null;
      const payload: CreateFridgeDto = { name: name.trim() };
      const created = await fridgeApiService.createFridge(payload);
      await loadUserFridges();
      if (created?.id) {
        setSelectedFridgeId(created.id);
      }
      return created;
    } catch (err) {
      console.error('Ошибка создания холодильника:', err);
      setError(err instanceof Error ? err.message : 'Не удалось создать холодильник');
      return null;
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

  // Сортировка по клику на карточки статистики (ловим кастомное событие из StatsPanel)
  useEffect(() => {
    const onSort = (e: Event) => {
      const custom = e as CustomEvent<{ mode: string; compare: (a: FridgeProduct, b: FridgeProduct) => number }>;
      const mode = (custom.detail as any)?.mode as string | undefined;
      const compare = custom.detail?.compare;
      if (mode === 'total') {
        setItems(baseItems);
        return;
      }
      if (typeof compare === 'function') {
        setItems([...baseItems].sort(compare));
      }
    };
    window.addEventListener('fridge:sort', onSort as EventListener);
    return () => window.removeEventListener('fridge:sort', onSort as EventListener);
  }, [baseItems]);

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
          {(
            <select
              className={styles.select}
              value={activeFridgeId || ''}
              onChange={async (e) => {
                const val = e.target.value;
                if (val === '__create__') {
                  await handleCreateFridge();
                } else {
                  setSelectedFridgeId(val || undefined);
                }
              }}
              title="Выберите холодильник"
            >
              {fridges.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
              <option value="__create__">+ Создать холодильник…</option>
            </select>
          )}
          <button
            className={`${styles.addButton} ui-btn`}
            onClick={() => setCompactView(v => !v)}
            aria-label={compactView ? 'Обычный вид' : 'Компактный вид'}
            title={compactView ? 'Обычный вид' : 'Компактный вид'}
          >
            {compactView ? (
              // Icon: Regular view (card)
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="3" y="3" width="8" height="8" rx="2"/>
                <rect x="13" y="3" width="8" height="5" rx="2"/>
                <rect x="13" y="10" width="8" height="11" rx="2"/>
                <rect x="3" y="13" width="8" height="8" rx="2"/>
              </svg>
            ) : (
              // Icon: Compact view (avatar + lines)
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="6.5" cy="7" r="3.5"/>
                <rect x="12" y="5" width="9" height="2" rx="1"/>
                <rect x="12" y="9" width="7" height="2" rx="1"/>
                <circle cx="6.5" cy="17" r="3.5"/>
                <rect x="12" y="15" width="9" height="2" rx="1"/>
                <rect x="12" y="19" width="7" height="2" rx="1"/>
              </svg>
            )}
          </button>
          <button 
            className={`${styles.addButton} ui-btn ui-btn--primary`}
            onClick={handleAddProductGuard}
            disabled={fridges.length === 0}
            title={fridges.length === 0 ? 'Сначала создайте холодильник' : undefined}
          >
            <span className={styles.addIcon}>+</span>
            Добавить
          </button>
        </div>
      </div>

      {/* Панель статистики */}
      {items.length > 0 && (
        <StatsPanel items={items} />
      )}

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
        <div className={`${styles.productsList} ${compactView ? styles.productsListCompact : ''}`}>
          {items.map(item => (
            <ProductItem
              key={item.id}
              item={item}
              compact={compactView}
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      ))}
    </div>
  );
}; 