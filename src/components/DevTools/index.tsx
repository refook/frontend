import React from 'react';
import { StorageUtils } from '../../services';
import styles from './DevTools.module.css';

const DevTools: React.FC = () => {
  const [storageInfo, setStorageInfo] = React.useState(() => StorageUtils.getStorageInfo());
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('devtools_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [position, setPosition] = React.useState(() => {
    const saved = localStorage.getItem('devtools_position');
    return saved ? JSON.parse(saved) : { x: 20, y: 20 };
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  const handleResetAll = () => {
    StorageUtils.resetAllData();
    setStorageInfo(StorageUtils.getStorageInfo());
    window.location.reload();
  };

  const handleClearUserData = () => {
    StorageUtils.clearUserData();
    setStorageInfo(StorageUtils.getStorageInfo());
  };

  const handleClearFavorites = () => {
    StorageUtils.clearFavorites();
    setStorageInfo(StorageUtils.getStorageInfo());
  };

  const handleClearFridge = () => {
    StorageUtils.clearFridge();
    setStorageInfo(StorageUtils.getStorageInfo());
  };

  const refreshInfo = () => {
    setStorageInfo(StorageUtils.getStorageInfo());
  };

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('devtools_collapsed', JSON.stringify(newCollapsed));
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
    const maxX = window.innerWidth - (isCollapsed ? 120 : 300);
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

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div 
      className={`${styles.devTools} ${isCollapsed ? styles.collapsed : ''} ${isDragging ? styles.dragging : ''}`}
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
          <button onClick={refreshInfo} className={styles.refreshBtn} title="Обновить информацию">
            🔄
          </button>
          <button onClick={toggleCollapse} className={styles.collapseBtn} title={isCollapsed ? "Развернуть" : "Свернуть"}>
            {isCollapsed ? '📂' : '📁'}
          </button>
        </div>
      </div>
      
      {!isCollapsed ? (
        <>
          <div className={styles.storageInfo}>
            <h4>📊 Storage Info</h4>
            <p>Общий размер: {(storageInfo.totalSize / 1024).toFixed(2)} KB</p>
            <ul>
              {Object.entries(storageInfo.items).map(([key, size]) => (
                <li key={key}>
                  {key}: {(size / 1024).toFixed(2)} KB
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.actions}>
            <h4>🗑️ Actions</h4>
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
        </>
      ) : (
        <div className={styles.collapsedHint}>
          <span>💾 {(storageInfo.totalSize / 1024).toFixed(1)}KB</span>
        </div>
      )}
    </div>
  );
};

export { DevTools }; 