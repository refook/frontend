import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchShoppingListsThunk } from '../../store/thunks/shoppingListThunks';
import ShoppingListCard from './ShoppingListCard';
import { ListBulletIcon, FunnelIcon } from '@heroicons/react/24/outline';
import styles from './ShoppingLists.module.css';

type FilterType = 'all' | 'active' | 'completed';

const ShoppingLists: React.FC = () => {
  const dispatch = useAppDispatch();
  const { lists, loading, error } = useAppSelector(state => state.shoppingList);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    dispatch(fetchShoppingListsThunk('current-user'));
  }, [dispatch]);

  const filteredLists = lists.filter(list => {
    switch (filter) {
      case 'active':
        return !list.isCompleted;
      case 'completed':
        return list.isCompleted;
      default:
        return true;
    }
  });

  const activeCount = lists.filter(list => !list.isCompleted).length;
  const completedCount = lists.filter(list => list.isCompleted).length;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загружаем списки покупок...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Ошибка загрузки списков: {error}</p>
          <button 
            onClick={() => dispatch(fetchShoppingListsThunk('current-user'))}
            className={styles.retryButton}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <ListBulletIcon className={styles.titleIcon} />
          <h2 className={styles.title}>Списки покупок</h2>
        </div>
        
        {lists.length > 0 && (
          <div className={styles.stats}>
            <span className={styles.stat}>
              Активных: <strong>{activeCount}</strong>
            </span>
            <span className={styles.stat}>
              Завершенных: <strong>{completedCount}</strong>
            </span>
          </div>
        )}
      </div>

      {lists.length > 0 && (
        <div className={styles.filters}>
          <FunnelIcon className={styles.filterIcon} />
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              Все ({lists.length})
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
              onClick={() => setFilter('active')}
            >
              Активные ({activeCount})
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
              onClick={() => setFilter('completed')}
            >
              Завершенные ({completedCount})
            </button>
          </div>
        </div>
      )}

      <div className={styles.content}>
        {filteredLists.length === 0 ? (
          <div className={styles.empty}>
            {lists.length === 0 ? (
              <>
                <ListBulletIcon className={styles.emptyIcon} />
                <h3>Нет списков покупок</h3>
                <p>
                  Создайте список покупок из карточки рецепта, 
                  нажав кнопку "Список покупок" в разделе ингредиентов
                </p>
              </>
            ) : (
              <>
                <h3>Нет {filter === 'active' ? 'активных' : 'завершенных'} списков</h3>
                <p>Попробуйте изменить фильтр или создать новый список</p>
              </>
            )}
          </div>
        ) : (
          <div className={styles.listGrid}>
            {filteredLists.map(list => (
              <ShoppingListCard key={list.id} shoppingList={list} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingLists;