import React, { useState, useRef, useEffect } from 'react';
import type {Recipe, RecipeIngredient} from '../../types';
import type { FilterType } from './FilterSettings';
import DiscoverCard from './DiscoverCard';
import styles from './CardsFeed.module.css';

interface CardsFeedProps {
  recipes: Recipe[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  availableIngredients: string[];
  currentFilter?: FilterType;
  onFilterChange?: (filter: FilterType) => void;
  onRecipeSelect: (recipe: Recipe) => void;
}

const CardsFeed: React.FC<CardsFeedProps> = ({
  recipes,
  currentIndex,
  onIndexChange,
  availableIngredients,
  currentFilter,
  onFilterChange,
  onRecipeSelect
}) => {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState(0);
  const [lastWheelTime, setLastWheelTime] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(() => window.innerHeight || 0);

  const updateCardHeight = React.useCallback(() => {
    const node = feedRef.current;
    if (!node) return;
    const measured = node.getBoundingClientRect().height;
    if (!measured || Number.isNaN(measured)) return;
    setCardHeight(measured);
  }, []);

  useEffect(() => {
    updateCardHeight();
    const handleResize = () => updateCardHeight();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCardHeight]);

  useEffect(() => {
    updateCardHeight();
  }, [recipes.length, updateCardHeight]);

  // Обновляем позицию ленты при изменении индекса
  useEffect(() => {
    // Проверяем границы индекса
    if (recipes.length === 0) return;
    
    const safeIndex = Math.max(0, Math.min(currentIndex, recipes.length - 1));
    if (safeIndex !== currentIndex) {
      onIndexChange(safeIndex);
      return;
    }
    
    setPosition(-safeIndex * cardHeight);
  }, [currentIndex, cardHeight, recipes.length, onIndexChange]);

  const handleStart = (clientX: number, clientY: number) => {
    setStartPosition({ x: clientX, y: clientY });
    setStartTime(Date.now());
    setIsDragging(true);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    // Если карточек меньше 2, не разрешаем движение
    if (recipes.length < 2) return;
    
    const deltaX = clientX - startPosition.x;
    const deltaY = clientY - startPosition.y;
    
    // Ограничиваем движение только по вертикали
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      const newPosition = -currentIndex * cardHeight + deltaY;
      setPosition(newPosition);
    }
  };

  const handleEnd = (clientY: number) => {
    if (!isDragging) return;
    
    // Если карточек меньше 2, не разрешаем свайп
    if (recipes.length < 2) {
      setPosition(-currentIndex * cardHeight);
      setIsDragging(false);
      return;
    }
    
    const deltaY = clientY - startPosition.y;
    const deltaTime = Date.now() - startTime;
    const velocity = Math.abs(deltaY) / deltaTime;
    
    // Определяем, был ли это свайп
    const isSwipe = Math.abs(deltaY) > 100 || velocity > 0.5;
    
    if (isSwipe) {
      if (deltaY < 0) {
        // Свайп вверх - следующая карточка
        const nextIndex = Math.min(currentIndex + 1, recipes.length - 1);
        setPosition(-nextIndex * cardHeight);
        onIndexChange(nextIndex);
      } else {
        // Свайп вниз - предыдущая карточка
        const prevIndex = Math.max(currentIndex - 1, 0);
        setPosition(-prevIndex * cardHeight);
        onIndexChange(prevIndex);
      }
    } else {
      // Возвращаем на текущую позицию
      setPosition(-currentIndex * cardHeight);
    }
    
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handleEnd(touch.clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    handleEnd(e.clientY);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Если карточек меньше 2, не разрешаем прокрутку
    if (recipes.length < 2) return;
    
    const now = Date.now();
    if (now - lastWheelTime < 500) return; // Дебаунсинг 500мс
    
    e.preventDefault();
    const delta = e.deltaY;
    
    if (Math.abs(delta) > 50) {
      setLastWheelTime(now);
      
      if (delta > 0) {
        // Прокрутка вниз = следующая карточка
        const nextIndex = Math.min(currentIndex + 1, recipes.length - 1);
        setPosition(-nextIndex * cardHeight);
        onIndexChange(nextIndex);
      } else {
        // Прокрутка вверх = предыдущая карточка
        const prevIndex = Math.max(currentIndex - 1, 0);
        setPosition(-prevIndex * cardHeight);
        onIndexChange(prevIndex);
      }
    }
  };

  // Обработка событий мыши на document
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMouseMove(e);
      }
    };

    const handleDocumentMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        handleMouseUp(e);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [isDragging, startPosition, startTime]);

  // Если нет рецептов, показываем пустой контейнер
  if (recipes.length === 0) {
    return (
      <div className={styles.cardsFeed}>
        <div className={styles.feedContainer}>
          <div className={styles.cardWrapper}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'white',
              fontSize: '1.2rem',
              textAlign: 'center'
            }}>
              Нет доступных рецептов
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если только одна карточка, отключаем свайпы
  const canSwipe = recipes.length > 1;

  return (
    <div
      ref={feedRef}
      className={styles.cardsFeed}
      onTouchStart={canSwipe ? handleTouchStart : undefined}
      onTouchMove={canSwipe ? handleTouchMove : undefined}
      onTouchEnd={canSwipe ? handleTouchEnd : undefined}
      onMouseDown={canSwipe ? handleMouseDown : undefined}
      onWheel={canSwipe ? handleWheel : undefined}
      style={{ cursor: canSwipe ? 'grab' : 'default' }}
    >
      <div
        className={styles.feedContainer}
        style={{
          transform: `translateY(${position}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {recipes.map((recipe, index) => {
          const missingIngredients = recipe.ingredients
            .filter(ing => !availableIngredients.includes(ing.id))
            .map((ingr) => ({
              id: ingr.id,
              ingredient: {
                id: ingr.id,
                name: ingr.name,
                category: { id: 'api', name: 'Из API', color: '#4f46e5' }
              },
              amount: ingr.count,
              unit: (ingr as any).productUnit || (ingr as any).measure,
            }) as RecipeIngredient);
          
          return (
            <div key={recipe.id} className={styles.cardWrapper}>
              <DiscoverCard
                recipe={recipe}
                availableIngredients={availableIngredients}
                missingIngredients={missingIngredients}
                onSelect={() => onRecipeSelect(recipe)}
                currentFilter={currentFilter}
                onFilterChange={onFilterChange}
                isActive={index === currentIndex}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardsFeed;
