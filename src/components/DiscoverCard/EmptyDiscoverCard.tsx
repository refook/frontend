import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import styles from './EmptyDiscoverCard.module.css';

interface EmptyDiscoverCardProps {
  filterType?: string;
}

const EmptyDiscoverCard: React.FC<EmptyDiscoverCardProps> = ({ filterType = 'partial' }) => {
  const getEmptyMessage = () => {
    switch (filterType) {
      case 'available':
        return {
          title: 'Нет полностью доступных рецептов',
          description: 'Добавьте больше ингредиентов в холодильник, чтобы увидеть рецепты, которые можно приготовить полностью'
        };
      case 'partial':
        return {
          title: 'Нет частично доступных рецептов',
          description: 'Добавьте ингредиенты в холодильник, чтобы увидеть рецепты, которые можно приготовить частично'
        };
      case 'missing':
        return {
          title: 'Нет рецептов с недостающими ингредиентами',
          description: 'Все рецепты имеют достаточно ингредиентов или добавьте больше рецептов в базу'
        };
      default:
        return {
          title: 'Нет доступных рецептов',
          description: 'Добавьте ингредиенты в холодильник, чтобы увидеть рецепты, которые можно приготовить'
        };
    }
  };

  const message = getEmptyMessage();

  return (
    <div className={styles.emptyCard}>
      <div className={styles.emptyContent}>
        <div className={styles.emptyIcon}>
          <ShoppingBagIcon className={styles.icon} />
        </div>
        
        <h2 className={styles.emptyTitle}>
          {message.title}
        </h2>
        
        <p className={styles.emptyDescription}>
          {message.description}
        </p>
        
        <div className={styles.emptyActions}>
          <Link to="/fridge" className={styles.addIngredientsButton}>
            <PlusIcon className={styles.buttonIcon} />
            Добавить ингредиенты
          </Link>
          
          <Link to="/recipes" className={styles.browseRecipesButton}>
            Просмотреть все рецепты
          </Link>
        </div>
        
        <div className={styles.emptyTips}>
          <h3>Советы:</h3>
          <ul>
            <li>Добавьте основные ингредиенты: яйца, молоко, мука</li>
            <li>Укажите овощи и фрукты, которые у вас есть</li>
            <li>Не забудьте про специи и приправы</li>
            <li>Система покажет рецепты с доступными ингредиентами</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyDiscoverCard; 