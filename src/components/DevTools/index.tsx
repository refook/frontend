import React from 'react';
import { useDispatch } from 'react-redux';
import { StorageUtils } from '../../services';
import { addFridgeItemThunk, fetchFridgeItemsThunk } from '../../store/thunks/fridgeThunks';
import type { AppDispatch } from '../../store';
import styles from './DevTools.module.css';
import ApiLogger from './ApiLogger';

const DevTools: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('devtools_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isWide, setIsWide] = React.useState(() => {
    const saved = localStorage.getItem('devtools_wide');
    return saved ? JSON.parse(saved) : true;
  });
  const [position, setPosition] = React.useState(() => {
    const saved = localStorage.getItem('devtools_position');
    return saved ? JSON.parse(saved) : { x: 20, y: 20 };
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  const handleResetAll = () => {
    StorageUtils.clearAllData();
    window.location.reload();
  };

  const handleClearUserData = () => {
    StorageUtils.clearAllData();
  };

  const handleClearFavorites = () => {
    console.log('Очистка избранного больше не поддерживается (используется API)');
  };

  const handleClearFridge = () => {
    console.log('Очистка холодильника больше не поддерживается (используется API)');
  };

  const addTestData = async () => {
    try {
      const testItems = [
        {
          userId: 'current-user',
          formData: {
            ingredientId: 'beef',
            amount: 500,
            unit: 'г',
            expirationDate: '2024-12-31',
            notes: 'Тестовые данные'
          }
        },
        {
          userId: 'current-user',
          formData: {
            ingredientId: 'pasta',
            amount: 400,
            unit: 'г',
            expirationDate: '2024-12-31',
            notes: 'Тестовые данные'
          }
        }
      ];

      for (const item of testItems) {
        await dispatch(addFridgeItemThunk(item)).unwrap();
      }
      
      // Перезагружаем данные
      dispatch(fetchFridgeItemsThunk('current-user'));
    } catch (error) {
      console.error('Error adding test data:', error);
    }
  };

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('devtools_collapsed', JSON.stringify(newCollapsed));
  };

  const toggleWide = () => {
    const newWide = !isWide;
    setIsWide(newWide);
    localStorage.setItem('devtools_wide', JSON.stringify(newWide));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Ограничиваем позицию в пределах окна
    const devToolsWidth = isCollapsed ? 120 : (isWide ? 600 : 300);
    const maxX = window.innerWidth - devToolsWidth;
    const maxY = window.innerHeight - 100;
    
    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));
    
    setPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('devtools_position', JSON.stringify(position));
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, position, isCollapsed]);

  // Показываем DevTools в продакшн режиме для демонстрации
  // if (import.meta.env.PROD) {
  //   return null;
  // }

  return (
    <div 
      className={`${styles.devTools} ${isCollapsed ? styles.collapsed : ''} ${isWide ? styles.wide : ''} ${isDragging ? styles.dragging : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.header}>
        <h3>🔧 Dev Tools</h3>
        <div className={styles.headerButtons}>
          {!isCollapsed && (
            <button onClick={toggleWide} className={styles.collapseBtn} title={isWide ? "Узкий режим" : "Широкий режим"}>
              {isWide ? '📏' : '📐'}
            </button>
          )}
          <button onClick={toggleCollapse} className={styles.collapseBtn} title={isCollapsed ? "Развернуть" : "Свернуть"}>
            {isCollapsed ? '📂' : '📁'}
          </button>
        </div>
      </div>
      
      {!isCollapsed ? (
        <>
          <div className={styles.actions}>
            <h4>🗑️ Actions</h4>
            <button onClick={addTestData} className={styles.successBtn}>
              Add Test Data
            </button>
            <button onClick={handleResetAll} className={styles.dangerBtn}>
              Reset All Data
            </button>
            <button onClick={handleClearUserData} className={styles.warningBtn}>
              Clear User Data
            </button>
            <button onClick={handleClearFavorites} className={styles.infoBtn}>
              Clear Favorites
            </button>
            <button onClick={handleClearFridge} className={styles.infoBtn}>
              Clear Fridge
            </button>
          </div>

          <ApiLogger />
        </>
      ) : (
        <div className={styles.collapsedHint}>
          <span>🔧 DevTools</span>
        </div>
      )}
    </div>
  );
};

export { DevTools }; 