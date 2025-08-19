import React, { useState, useRef, type KeyboardEvent, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import styles from './TagsInput.module.css';

interface TagsInputProps {
  tags: { id: string; name: string }[];
  onChange: (tags: { id: string; name: string }[]) => void;
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
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const resp = await fetch(`${API_BASE_URL}/tags/all`, { headers });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const normalized = (Array.isArray(data) ? data : []).map((t: any) => ({ id: t.id, name: t.name })).filter((t: any) => t.id && t.name);
        setAvailableTags(normalized);
      } catch (e) {
        setAvailableTags([]);
      }
    };
    loadTags();
  }, []);

  const suggestions = availableTags
    .filter(t => t.name.toLowerCase().includes(inputValue.toLowerCase()) && !tags.some(x => x.id === t.id))
    .slice(0, 8);

  const addTagByName = (tagName: string) => {
    const trimmedTag = tagName.trim();
    const found = availableTags.find(t => t.name.toLowerCase() === trimmedTag.toLowerCase());
    if (found && !tags.some(t => t.id === found.id) && tags.length < maxTags) {
      onChange([...tags, found]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTagById = (id: string) => {
    onChange(tags.filter(tag => tag.id !== id));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTagByName(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTagById(tags[tags.length - 1].id);
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

  const handleSuggestionClick = (name: string) => {
    addTagByName(name);
  };

  const canAddMore = tags.length < maxTags;

  return (
    <div className={styles.tagsInput}>
      <div className={styles.tagsContainer}>
        {tags.map((tag) => (
          <span key={tag.id} className={styles.tag}>
            {tag.name}
            <button
              type="button"
              onClick={() => removeTagById(tag.id)}
              className={styles.removeTag}
              title={`Удалить тег "${tag.name}"`}
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
            
            {inputValue && availableTags.some(t => t.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => addTagByName(inputValue)}
                className={styles.addButton}
                title="Добавить тег"
              >
                <PlusIcon className={styles.addIcon} />
              </button>
            )}
            
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggestions}>
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion.name)}
                    className={styles.suggestion}
                  >
                    {suggestion.name}
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
        Выбирайте теги из списка (ввод произвольных запрещён)
      </p>
    </div>
  );
};

export default TagsInput; 