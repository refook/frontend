import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { FridgeProducts } from '../components/FridgeProducts';
import { RecipeSuggestions } from '../components/RecipeSuggestions';
import { ShoppingLists } from '../components/ShoppingLists';
import styles from './FridgePage.module.css';
import Tabs, { type TabId } from '../components/Tabs/Tabs';

type TabType = 'products' | 'recipes' | 'shopping';

export const FridgePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: fridgeItems } = useAppSelector(state => state.fridge);

  const tabs = [
    { id: 'products' as TabType, label: 'Мои продукты' },
    { id: 'recipes' as TabType, label: 'Идеи рецептов' },
    { id: 'shopping' as TabType, label: 'Список покупок' }
  ];

  const [activeTab, setActiveTab] = React.useState<TabType>('products');

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerBlock}>
        <h1 className={styles.title}>Мой холодильник</h1>
        <p className={styles.subtitle}>
          Управляйте своими продуктами и получайте персональные рекомендации рецептов
        </p>
      </div>

      <div className={styles.tabsBlock}>
        <Tabs initial={activeTab as TabId} onChange={(t) => setActiveTab(t as TabType)} tabs={tabs} ariaLabel="Fridge sections" storageKey="refook_fridge"/>
        {activeTab === 'products' && fridgeItems.length > 0 && (
          <span className={styles.counter}>{fridgeItems.length}</span>
        )}
      </div>

      <div className={styles.contentBlock}>
        {activeTab === 'products' && <FridgeProducts />}
        {activeTab === 'recipes' && <RecipeSuggestions />}
        {activeTab === 'shopping' && <ShoppingLists />}
      </div>
    </div>
  );
};