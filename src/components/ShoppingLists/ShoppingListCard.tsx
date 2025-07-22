import React, { useState } from 'react';
import { useAppDispatch } from '../../store';
import { toggleShoppingListItemThunk, deleteShoppingListThunk } from '../../store/thunks/shoppingListThunks';
import type { ShoppingList } from '../../types';
import { 
  CheckCircleIcon, 
  TrashIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import styles from './ShoppingListCard.module.css';

interface ShoppingListCardProps {
  shoppingList: ShoppingList;
}

const ShoppingListCard: React.FC<ShoppingListCardProps> = ({ shoppingList }) => {
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleItem = async (itemId: string) => {
    try {
      await dispatch(toggleShoppingListItemThunk({
        listId: shoppingList.id,
        itemId
      })).unwrap();
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteList = async () => {
    if (window.confirm('Удалить этот список покупок?')) {
      try {
        await dispatch(deleteShoppingListThunk(shoppingList.id)).unwrap();
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  };

  const completedCount = shoppingList.items.filter(item => item.isCompleted).length;
  const totalCount = shoppingList.items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${styles.card} ${shoppingList.isCompleted ? styles.completed : ''}`}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{shoppingList.title}</h3>
          {shoppingList.recipeName && (
            <span className={styles.recipeName}>из рецепта "{shoppingList.recipeName}"</span>
          )}
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.progress}>
            <span className={styles.progressText}>
              {completedCount}/{totalCount}
            </span>
            {shoppingList.isCompleted && (
              <CheckCircleSolidIcon className={styles.completedIcon} />
            )}
          </div>
          
          <button 
            className={styles.expandButton}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUpIcon className={styles.chevronIcon} />
            ) : (
              <ChevronDownIcon className={styles.chevronIcon} />
            )}
          </button>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className={styles.metadata}>
        <div className={styles.dateInfo}>
          <ClockIcon className={styles.clockIcon} />
          <span>Создан {formatDate(shoppingList.createdAt)}</span>
        </div>
        {shoppingList.completedAt && (
          <div className={styles.dateInfo}>
            <CheckCircleIcon className={styles.checkIcon} />
            <span>Завершен {formatDate(shoppingList.completedAt)}</span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className={styles.itemsList}>
          {shoppingList.items.map(item => (
            <div 
              key={item.id} 
              className={`${styles.item} ${item.isCompleted ? styles.itemCompleted : ''}`}
            >
              <button
                className={styles.checkButton}
                onClick={() => handleToggleItem(item.id)}
              >
                {item.isCompleted ? (
                  <CheckCircleSolidIcon className={styles.checkIconSolid} />
                ) : (
                  <CheckCircleIcon className={styles.checkIconOutline} />
                )}
              </button>
              
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.ingredientName}</span>
                <span className={styles.itemAmount}>{item.amount} {item.unit}</span>
              </div>
              
              {item.notes && (
                <span className={styles.itemNotes}>{item.notes}</span>
              )}
            </div>
          ))}
          
          <div className={styles.actions}>
            <button 
              className={styles.deleteButton}
              onClick={handleDeleteList}
            >
              <TrashIcon className={styles.trashIcon} />
              Удалить список
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListCard;