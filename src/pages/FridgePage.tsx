import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { FridgeProducts } from '../components/FridgeProducts';
import { RecipeSuggestions } from '../components/RecipeSuggestions';
import { ShoppingLists } from '../components/ShoppingLists';
import styles from './FridgePage.module.css';

type TabType = 'products' | 'recipes' | 'shopping';

export const FridgePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const dispatch = useAppDispatch();
  const { items: fridgeItems, loading } = useAppSelector(state => state.fridge);

  const tabs = [
    { id: 'products' as TabType, label: 'Мои продукты', icon: '🧊' },
    { id: 'recipes' as TabType, label: 'Идеи рецептов', icon: '💡' },
    { id: 'shopping' as TabType, label: 'Списки покупок', icon: '🛒' }
  ];

  return (
    <div className={styles.fridgePage}>
      <div className={styles.header}>
        <h1>Мой холодильник</h1>
        <p className={styles.subtitle}>
          Управляйте своими продуктами и получайте персональные рекомендации рецептов
        </p>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.id === 'products' && fridgeItems.length > 0 && (
              <span className={styles.badge}>{fridgeItems.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'products' && <FridgeProducts />}
        {activeTab === 'recipes' && <RecipeSuggestions />}
        {activeTab === 'shopping' && <ShoppingLists />}
      </div>
    </div>
  );
}; 