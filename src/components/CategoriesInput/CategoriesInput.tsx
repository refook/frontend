import React, { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import styles from '../TagsInput/TagsInput.module.css';
import { CategoriesService } from '../../services/categoriesService';
import type { CategoryResponseDto } from '../../types/category.types';

interface CategoriesInputProps {
  categories: { id: string; name: string }[];
  onChange: (categories: { id: string; name: string }[]) => void;
  placeholder?: string;
  maxItems?: number;
}

const CategoriesInput: React.FC<CategoriesInputProps> = ({
  categories,
  onChange,
  placeholder = 'Добавить категорию',
  maxItems = 10,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [available, setAvailable] = useState<CategoryResponseDto[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const list = await CategoriesService.getAll();
      if (mounted) setAvailable(list);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return [] as CategoryResponseDto[];
    return available
      .filter((c) => c.name.toLowerCase().includes(query) && !categories.some((x) => x.id === c.id))
      .slice(0, 8);
  }, [available, categories, inputValue]);

  const canAddMore = categories.length < maxItems;

  const addByName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const found = available.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (!found) return;
    if (categories.some((c) => c.id === found.id)) return;
    if (!canAddMore) return;
    onChange([...categories, found]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeById = (id: string) => {
    onChange(categories.filter((c) => c.id !== id));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addByName(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && categories.length > 0) {
      removeById(categories[categories.length - 1].id);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={styles.tagsInput}>
      <div className={styles.tagsContainer}>
        {categories.map((c, index) => (
          <span key={c.id || `${c.name}-${index}`} className={styles.tag}>
            {c.name}
            <button
              type="button"
              onClick={() => removeById(c.id)}
              className={styles.removeTag}
              title={`Удалить категорию "${c.name}"`}
            >
              ×
            </button>
          </span>
        ))}

        {canAddMore && (
          <div className={styles.inputContainer}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                const v = e.target.value;
                setInputValue(v);
                setShowSuggestions(v.trim().length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.trim().length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder={categories.length === 0 ? placeholder : ''}
              className={styles.input}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggestions}>
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addByName(s.name)}
                    className={styles.suggestion}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!canAddMore && (
        <p className={styles.maxTagsMessage}>Максимум {maxItems} категорий</p>
      )}
      <p className={styles.hint}>Выбирайте категории из списка (ввод произвольных запрещён)</p>
    </div>
  );
};

export default CategoriesInput;


