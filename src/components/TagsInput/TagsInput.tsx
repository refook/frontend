import React, { useState, useRef, type KeyboardEvent } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import styles from './TagsInput.module.css';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  onChange,
  placeholder = "Добавить тег",
  maxTags = 10
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Популярные теги для автокомплита
  const popularTags = [
    'завтрак', 'обед', 'ужин', 'перекус', 'десерт',
    'быстро', 'легко', 'здоровое', 'вегетарианское',
    'острое', 'сладкое', 'горячее', 'холодное',
    'праздничное', 'детское', 'диетическое'
  ];

  const suggestions = popularTags.filter(tag => 
    tag.toLowerCase().includes(inputValue.toLowerCase()) &&
    !tags.includes(tag) &&
    inputValue.length > 0
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  const canAddMore = tags.length < maxTags;

  return (
    <div className={styles.tagsInput}>
      <div className={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className={styles.removeTag}
              title={`Удалить тег "${tag}"`}
            >
              <XMarkIcon className={styles.removeIcon} />
            </button>
          </span>
        ))}
        
        {canAddMore && (
          <div className={styles.inputContainer}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder={tags.length === 0 ? placeholder : ''}
              className={styles.input}
            />
            
            {inputValue && (
              <button
                type="button"
                onClick={() => addTag(inputValue)}
                className={styles.addButton}
                title="Добавить тег"
              >
                <PlusIcon className={styles.addIcon} />
              </button>
            )}
            
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggestions}>
                {suggestions.slice(0, 5).map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={styles.suggestion}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {!canAddMore && (
        <p className={styles.maxTagsMessage}>
          Максимум {maxTags} тегов
        </p>
      )}
      
      <p className={styles.hint}>
        Нажмите Enter или запятую для добавления тега
      </p>
    </div>
  );
};

export default TagsInput; 