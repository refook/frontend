import React, { useState } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import styles from './FilterSettings.module.css';

export type FilterType = 'all' | 'available' | 'partial' | 'missing';

interface FilterSettingsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  visible: boolean;
  onClose: () => void;
}

const FilterSettings: React.FC<FilterSettingsProps> = ({
  currentFilter,
  onFilterChange,
  visible,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterSelect = (filter: FilterType) => {
    onFilterChange(filter);
    setIsOpen(false);
  };

  const getFilterIcon = (filter: FilterType) => {
    switch (filter) {
      case 'all':
        return <FunnelIcon className={styles.filterIcon} />;
      case 'available':
        return <CheckCircleIcon className={styles.filterIcon} />;
      case 'partial':
        return <ExclamationTriangleIcon className={styles.filterIcon} />;
      case 'missing':
        return <ExclamationTriangleIcon className={styles.filterIcon} />;
      default:
        return <FunnelIcon className={styles.filterIcon} />;
    }
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

  const getFilterDescription = (filter: FilterType) => {
    switch (filter) {
      case 'all':
        return 'Показать все рецепты';
      case 'available':
        return 'Все ингредиенты есть в холодильнике';
      case 'partial':
        return 'Есть 50-99% ингредиентов';
      case 'missing':
        return 'Меньше 50% ингредиентов';
      default:
        return 'Показать все рецепты';
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.filterContainer}>
      {/* Кнопка открытия фильтра */}
      <button 
        className={styles.filterButton}
        onClick={handleToggle}
        aria-label="Настройки фильтра"
      >
        <FunnelIcon className={styles.buttonIcon} />
        <span className={styles.buttonText}>Фильтр</span>
      </button>

      {/* Выпадающее меню фильтров */}
      {isOpen && (
        <div className={styles.filterDropdown}>
          <div className={styles.filterHeader}>
            <h3>Настройки фильтра</h3>
            <button 
              className={styles.closeButton}
              onClick={handleToggle}
              aria-label="Закрыть фильтр"
            >
              <XMarkIcon className={styles.closeIcon} />
            </button>
          </div>

          <div className={styles.filterOptions}>
            {(['all', 'available', 'partial', 'missing'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                className={`${styles.filterOption} ${currentFilter === filter ? styles.active : ''}`}
                onClick={() => handleFilterSelect(filter)}
              >
                <div className={styles.filterOptionContent}>
                  <div className={styles.filterOptionIcon}>
                    {getFilterIcon(filter)}
                  </div>
                  <div className={styles.filterOptionInfo}>
                    <span className={styles.filterOptionLabel}>
                      {getFilterLabel(filter)}
                    </span>
                    <span className={styles.filterOptionDescription}>
                      {getFilterDescription(filter)}
                    </span>
                  </div>
                  {currentFilter === filter && (
                    <CheckIcon className={styles.checkIcon} />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className={styles.filterFooter}>
            <button 
              className={styles.applyButton}
              onClick={handleToggle}
            >
              Применить
            </button>
          </div>
        </div>
      )}

      {/* Оверлей для закрытия */}
      {isOpen && (
        <div className={styles.overlay} onClick={handleToggle} />
      )}
    </div>
  );
};

export default FilterSettings; 