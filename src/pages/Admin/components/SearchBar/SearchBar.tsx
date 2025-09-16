import React from 'react';
import styles from './SearchBar.module.css';

/**
 * Пропсы компонента строки поиска с опциональной кнопкой обновления.
 */
interface SearchBarProps {
  value: string;
  placeholder?: string;
  loading?: boolean;
  onChange: (value: string) => void;
  onRefresh?: () => void;
}

/**
 * Универсальная строка поиска c контролируемым значением и
 * кнопкой «Обновить» (если передан onRefresh).
 */
const SearchBar: React.FC<SearchBarProps> = ({ value, placeholder = 'Поиск...', loading = false, onChange, onRefresh }) => {
  return (
    <div className={styles.container}>
      <input
        className="ui-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {onRefresh && (
        <button className="ui-btn" type="button" onClick={onRefresh} disabled={loading}>
          Обновить
        </button>
      )}
    </div>
  );
};

export default SearchBar;


