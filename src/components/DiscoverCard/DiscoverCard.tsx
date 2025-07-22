import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { createShoppingListThunk } from '../../store/thunks/shoppingListThunks';
import type { Recipe, RecipeIngredient } from '../../types';
import type { FilterType } from './FilterSettings';
import { 
  HeartIcon, 
  BookmarkIcon, 
  ShareIcon, 
  ClockIcon,
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import styles from './DiscoverCard.module.css';

interface DiscoverCardProps {
  recipe: Recipe;
  availableIngredients: string[];
  missingIngredients: RecipeIngredient[];
  onSelect: () => void;
  currentFilter?: FilterType;
  onFilterChange?: (filter: FilterType) => void;
}

const DiscoverCard: React.FC<DiscoverCardProps> = ({
  recipe,
  availableIngredients,
  missingIngredients,
  onSelect,
  currentFilter,
  onFilterChange
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, time: 0 });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleFilterToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFilterDropdown(!showFilterDropdown);
  };

  const handleFilterSelect = (filter: FilterType, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onFilterChange) {
      onFilterChange(filter);
    }
    setShowFilterDropdown(false);
  };

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'all':
        return 'Все рецепты';
      case 'available':
        return 'Полностью доступные';
      case 'partial':
        return 'Частично доступные';
      case 'missing':
        return 'Недостающие ингредиенты';
      default:
        return 'Все рецепты';
    }
  };

  const getAvailabilityPercentage = () => {
    const total = recipe.ingredients.length;
    if (total === 0) return 0;
    
    const available = recipe.ingredients.filter(ing => 
      availableIngredients.includes(ing.ingredient.id)
    ).length;
    return Math.round((available / total) * 100);
  };

  const availabilityPercentage = getAvailabilityPercentage();

  // Сброс ошибки изображения при смене рецепта
  React.useEffect(() => {
    setImageError(false);
  }, [recipe.id]);

  const handleCardClick = () => {
    // Переход к деталям рецепта только если не было свайпа
    if (!isDragging) {
      navigate(`/recipe/${recipe.id}`);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ 
      x: e.clientX, 
      y: e.clientY, 
      time: Date.now() 
    });
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart.time === 0) return;
    
    const deltaX = Math.abs(e.clientX - dragStart.x);
    const deltaY = Math.abs(e.clientY - dragStart.y);
    
    // Если движение больше 5 пикселей, считаем это свайпом
    if (deltaX > 5 || deltaY > 5) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    // Сбрасываем состояние через небольшую задержку
    setTimeout(() => {
      setIsDragging(false);
      setDragStart({ x: 0, y: 0, time: 0 });
    }, 50);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragStart({ 
      x: touch.clientX, 
      y: touch.clientY, 
      time: Date.now() 
    });
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart.time === 0) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - dragStart.x);
    const deltaY = Math.abs(touch.clientY - dragStart.y);
    
    // Если движение больше 5 пикселей, считаем это свайпом
    if (deltaX > 5 || deltaY > 5) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = () => {
    // Сбрасываем состояние через небольшую задержку
    setTimeout(() => {
      setIsDragging(false);
      setDragStart({ x: 0, y: 0, time: 0 });
    }, 50);
  };

  const handleCreateShoppingList = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const ingredientsToBuy = availableIngredients.length === 0 
      ? recipe.ingredients 
      : missingIngredients;
    
    // Создаем список в Redux store
    try {
      const formData = {
        title: `Список для "${recipe.title}"`,
        recipeId: recipe.id,
        recipeName: recipe.title,
        items: ingredientsToBuy.map((ingredient: any) => ({
          ingredientName: ingredient.ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          notes: ''
        }))
      };
      
      await dispatch(createShoppingListThunk({
        userId: 'current-user', // В реальном приложении получаем из auth
        formData
      })).unwrap();
      
      // Показываем уведомление об успешном создании
      console.log('Список покупок создан и сохранен!');
      
    } catch (error) {
      console.error('Ошибка создания списка покупок:', error);
    }
    
    // Также создаем текстовый список для sharing/копирования
    const shoppingList = ingredientsToBuy.map((ingredient: any) => 
      `${ingredient.ingredient.name} - ${ingredient.amount} ${ingredient.unit}`
    ).join('\n');
    
    const listText = `Список покупок для рецепта "${recipe.title}":\n\n${shoppingList}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Список покупок: ${recipe.title}`,
        text: listText
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(listText).then(() => {
        console.log('Список покупок скопирован в буфер обмена');
      });
    } else {
      // Fallback для старых браузеров
      const textarea = document.createElement('textarea');
      textarea.value = listText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  return (
    <div 
      className={styles.card}
      onDragStart={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleCardClick}
    >
      {/* Основное изображение */}
      <div className={styles.imageContainer}>
        {recipe.image && !imageError ? (
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className={styles.recipeImage}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className={styles.placeholderImage}>
            <span>🍽️</span>
          </div>
        )}
        
        {/* Градиент поверх изображения */}
        <div className={styles.imageOverlay} />
        
        {/* Информация о рецепте поверх изображения */}
        <div className={styles.recipeInfo}>
          <div className={styles.recipeHeader}>
            <h2 className={styles.recipeTitle}>{recipe.title}</h2>
            <div className={styles.recipeStats}>
              <div className={styles.stat}>
                <ClockIcon className={styles.statIcon} />
                <span>{recipe.prepTime + recipe.cookTime} мин</span>
              </div>
              <div className={styles.stat}>
                <UserIcon className={styles.statIcon} />
                <span>{recipe.servings} порций</span>
              </div>
              <div className={styles.stat}>
                <StarIcon className={styles.statIcon} />
                <span>{recipe.stats.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <p className={styles.recipeDescription}>{recipe.description}</p>
          
          {/* Индикатор доступности ингредиентов */}
          <div className={styles.availabilityIndicator}>
            <div className={styles.availabilityBar}>
              <div 
                className={styles.availabilityProgress}
                style={{ width: `${availabilityPercentage}%` }}
              />
            </div>
            <span className={styles.availabilityText}>
              {availableIngredients.length === 0 
                ? 'Нет ингредиентов в холодильнике'
                : `${availabilityPercentage}% ингредиентов доступно`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Боковые кнопки действий */}
      <div 
        className={styles.actionButtons}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
          onClick={handleLike}
        >
          {isLiked ? (
            <HeartSolidIcon className={styles.actionIcon} />
          ) : (
            <HeartIcon className={styles.actionIcon} />
          )}
          <span className={styles.actionCount}>{recipe.stats.likes}</span>
        </button>
        
        <button 
          className={`${styles.actionButton} ${isSaved ? styles.saved : ''}`}
          onClick={handleSave}
        >
          <BookmarkIcon className={styles.actionIcon} />
          <span className={styles.actionCount}>{recipe.stats.saves}</span>
        </button>
        
        <button className={styles.actionButton} onClick={handleShare}>
          <ShareIcon className={styles.actionIcon} />
        </button>
        
        {/* Информация об авторе */}
        <div className={styles.authorProfile}>
          <div className={styles.authorAvatar}>
            <UserIcon className={styles.authorIcon} />
          </div>
        </div>
      </div>





      {/* Панель ингредиентов и фильтра */}
      <div 
        className={styles.ingredientsPanel}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className={styles.panelButtons}>
          <button 
            className={styles.ingredientsToggle}
            onClick={(e) => {
              e.stopPropagation();
              setShowIngredients(!showIngredients);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowIngredients(!showIngredients);
            }}
          >
            {showIngredients ? 'Скрыть' : 'Показать'} ингредиенты
          </button>
          
          {onFilterChange && (
            <div className={styles.filterContainer}>
              <button 
                className={styles.filterToggle}
                onClick={handleFilterToggle}
                onTouchEnd={handleFilterToggle}
              >
                <FunnelIcon className={styles.filterIcon} />
                <span>{currentFilter ? getFilterLabel(currentFilter) : 'Фильтр'}</span>
              </button>
              
              {showFilterDropdown && (
                <div className={styles.filterDropdown}>
                  {(['all', 'available', 'partial', 'missing'] as FilterType[]).map((filter) => (
                    <button
                      key={filter}
                      className={`${styles.filterOption} ${currentFilter === filter ? styles.active : ''}`}
                      onClick={(e) => handleFilterSelect(filter, e)}
                      onTouchEnd={(e) => handleFilterSelect(filter, e)}
                    >
                      {getFilterLabel(filter)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {showIngredients && (
          <div className={styles.ingredientsList}>
            <h3>Ингредиенты:</h3>
            <div className={styles.ingredientsGrid}>
              {recipe.ingredients.map((ingredient) => {
                const isAvailable = availableIngredients.includes(ingredient.ingredient.id);
                const hasNoIngredients = availableIngredients.length === 0;
                return (
                  <div 
                    key={ingredient.id} 
                    className={`${styles.ingredientItem} ${hasNoIngredients ? styles.missing : (isAvailable ? styles.available : styles.missing)}`}
                  >
                    <div className={styles.ingredientIcon}>
                      {hasNoIngredients ? (
                        <ExclamationTriangleIcon className={styles.warningIcon} />
                      ) : isAvailable ? (
                        <CheckCircleIcon className={styles.checkIcon} />
                      ) : (
                        <ExclamationTriangleIcon className={styles.warningIcon} />
                      )}
                    </div>
                    <span className={styles.ingredientText}>
                      {ingredient.ingredient.name} ({ingredient.amount} {ingredient.unit})
                    </span>
                  </div>
                );
              })}
            </div>
            
            {availableIngredients.length === 0 ? (
              <div className={styles.missingIngredients}>
                <div className={styles.missingHeader}>
                  <h4>Все ингредиенты:</h4>
                  <button 
                    className={styles.shoppingListBtn}
                    onClick={handleCreateShoppingList}
                    onTouchEnd={handleCreateShoppingList}
                    title="Составить список покупок"
                  >
                    <ListBulletIcon className={styles.shoppingListIcon} />
                    Список покупок
                  </button>
                </div>
                <ul>
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.id}>
                      {ingredient.ingredient.name} - {ingredient.amount} {ingredient.unit}
                    </li>
                  ))}
                </ul>
              </div>
            ) : missingIngredients.length > 0 && (
              <div className={styles.missingIngredients}>
                <div className={styles.missingHeader}>
                  <h4>Нужно докупить:</h4>
                  <button 
                    className={styles.shoppingListBtn}
                    onClick={handleCreateShoppingList}
                    onTouchEnd={handleCreateShoppingList}
                    title="Составить список покупок"
                  >
                    <ListBulletIcon className={styles.shoppingListIcon} />
                    Список покупок
                  </button>
                </div>
                <ul>
                  {missingIngredients.map((ingredient) => (
                    <li key={ingredient.id}>
                      {ingredient.ingredient.name} - {ingredient.amount} {ingredient.unit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
};

export default DiscoverCard; 