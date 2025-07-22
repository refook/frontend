import React, { useState, useRef, useEffect } from 'react';
import type { Recipe, RecipeIngredient } from '../../types';
import type { FilterType } from './FilterSettings';
import DiscoverCard from './DiscoverCard';
import styles from './SwipeableCard.module.css';

interface SwipeableCardProps {
  recipe: Recipe;
  availableIngredients: string[];
  missingIngredients: RecipeIngredient[];
  onSelect: () => void;
  currentFilter?: FilterType;
  onFilterChange?: (filter: FilterType) => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  canSwipeUp?: boolean;
  canSwipeDown?: boolean;
  cardPosition?: 'current' | 'next' | 'prev';
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  recipe,
  availableIngredients,
  missingIngredients,
  onSelect,
  currentFilter,
  onFilterChange,
  onSwipeUp,
  onSwipeDown,
  canSwipeUp = true,
  canSwipeDown = true,
  cardPosition = 'current'
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState(0);
  const [lastWheelTime, setLastWheelTime] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number, clientY: number) => {
    if (cardPosition !== 'current') return;
    
    setStartPosition({ x: clientX, y: clientY });
    setStartTime(Date.now());
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || cardPosition !== 'current') return;
    
    const deltaX = clientX - startPosition.x;
    const deltaY = clientY - startPosition.y;
    
    // Ограничиваем движение только по вертикали
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setPosition({ x: 0, y: deltaY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  const handleEnd = (clientY: number) => {
    if (!isDragging || cardPosition !== 'current') return;
    
    const deltaY = clientY - startPosition.y;
    const deltaTime = Date.now() - startTime;
    const velocity = Math.abs(deltaY) / deltaTime;
    
    // Определяем, был ли это свайп
    const isSwipe = Math.abs(deltaY) > 100 || velocity > 0.5;
    
    if (isSwipe) {
      if (deltaY < 0 && canSwipeUp && onSwipeUp) {
        // Свайп вверх - карточка уходит вверх
        animateSwipe('up');
        onSwipeUp();
      } else if (deltaY > 0 && canSwipeDown && onSwipeDown) {
        // Свайп вниз - карточка уходит вниз
        animateSwipe('down');
        onSwipeDown();
      } else {
        // Возвращаем на место
        resetPosition();
      }
    } else {
      // Возвращаем на место
      resetPosition();
    }
    
    setIsDragging(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handleEnd(touch.clientY);
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    handleEnd(e.clientY);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (cardPosition !== 'current') return;
    
    const now = Date.now();
    if (now - lastWheelTime < 500) return; // Дебаунсинг 500мс
    
    e.preventDefault();
    const delta = e.deltaY;
    
    // Определяем направление прокрутки
    if (Math.abs(delta) > 50) {
      setLastWheelTime(now);
      
      if (delta > 0 && canSwipeUp && onSwipeUp) {
        // Прокрутка вниз = свайп вверх (следующий рецепт)
        onSwipeUp();
      } else if (delta < 0 && canSwipeDown && onSwipeDown) {
        // Прокрутка вверх = свайп вниз (предыдущий рецепт)
        onSwipeDown();
      }
    }
  };

  const animateSwipe = (direction: 'up' | 'down') => {
    const distance = direction === 'up' ? -window.innerHeight : window.innerHeight;
    setPosition({ x: 0, y: distance });
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  // Устанавливаем начальную позицию карточки в зависимости от её типа
  useEffect(() => {
    if (cardPosition === 'current') {
      setPosition({ x: 0, y: 0 });
    } else if (cardPosition === 'next') {
      setPosition({ x: 0, y: window.innerHeight });
    } else if (cardPosition === 'prev') {
      setPosition({ x: 0, y: -window.innerHeight });
    }
  }, [cardPosition, recipe.id]);

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

  return (
    <div
      ref={cardRef}
      className={`${styles.swipeableCard} ${styles.active}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: cardPosition === 'current' ? 10 : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      <DiscoverCard
        recipe={recipe}
        availableIngredients={availableIngredients}
        missingIngredients={missingIngredients}
        onSelect={onSelect}
        currentFilter={currentFilter}
        onFilterChange={onFilterChange}
      />
    </div>
  );
};

export default SwipeableCard; 