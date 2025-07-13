import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchFridgeItemsThunk, addFridgeItemThunk, deleteFridgeItemThunk, updateFridgeItemThunk } from '../../store/thunks/fridgeThunks';
import { AddProductForm } from './AddProductForm';
import { ProductItem } from './ProductItem';
import styles from './FridgeProducts.module.css';

export const FridgeProducts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(state => state.fridge);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(fetchFridgeItemsThunk('current-user'));
  }, [dispatch]);

  const handleAddProduct = async (productData: {
    ingredient: any;
    amount: number;
    unit: string;
    expiryDate?: string;
    notes?: string;
  }) => {
    try {
      const formData = {
        userId: 'current-user',
        formData: {
          ingredientId: productData.ingredient.id,
          amount: productData.amount,
          unit: productData.unit,
          expirationDate: productData.expiryDate,
          notes: productData.notes
        }
      };
      
      await dispatch(addFridgeItemThunk(formData)).unwrap();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await dispatch(deleteFridgeItemThunk(id)).unwrap();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateProduct = async (id: string, updates: any) => {
    try {
      await dispatch(updateFridgeItemThunk({ id, updates })).unwrap();
    } catch (error) {
      console.error('Error updating product:', error);
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
        <button onClick={() => dispatch(fetchFridgeItemsThunk('current-user'))}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className={styles.fridgeProducts}>
      <div className={styles.header}>
        <h2>Мои продукты</h2>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          <span className={styles.addIcon}>+</span>
          Добавить продукт
        </button>
      </div>

      {showAddForm && (
        <div className={styles.addFormContainer}>
          <AddProductForm
            onSubmit={handleAddProduct}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

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
            />
          ))}
        </div>
      )}
    </div>
  );
}; 