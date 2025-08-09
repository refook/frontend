import React, { useState, useRef } from 'react';
import IngredientPicker from '../IngredientPicker/IngredientPicker';
import { 
  PlusIcon, 
  XMarkIcon, 
  PhotoIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import styles from './StepsEditor.module.css';
import type {CreateStepDto} from "../../types";

interface StepsEditorProps {
  steps: CreateStepDto[];
  onChange: (steps: CreateStepDto[]) => void;
  errors?: Record<string, string>;
}

const StepsEditor: React.FC<StepsEditorProps> = ({ steps, onChange, errors = {} }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingName, setEditingName] = useState('');
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addStep = () => {
    const newStep: CreateStepDto = {
      index: steps.length + 1,
      description: '',
      photos: [],
      ingredients: [],
      time: 0
    };
    
    onChange([...steps, newStep]);
    setEditingIndex(steps.length);
    setEditingText('');
    setEditingName('');
    
    // Автоматически раскрываем новый шаг
    const newExpandedSteps = new Set(expandedSteps);
    newExpandedSteps.add(steps.length);
    setExpandedSteps(newExpandedSteps);
    
    // Фокус на новом поле через небольшую задержку
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const updateStep = (index: number, updates: Partial<CreateStepDto>) => {
    const updatedSteps = steps.map((step, i) => 
      i === index ? { ...step, ...updates } : step
    );
    onChange(updatedSteps);
  };

  const removeStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    // Пересчитываем порядок шагов
    const reorderedSteps = updatedSteps.map((step, i) => ({
      ...step,
      index: i + 1
    }));
    onChange(reorderedSteps);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const updatedSteps = [...steps];
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    
    // Пересчитываем порядок
    const reorderedSteps = updatedSteps.map((step, i) => ({
      ...step,
      index: i + 1
    }));
    
    onChange(reorderedSteps);
  };

  const toggleStepExpansion = (index: number) => {
    const newExpandedSteps = new Set(expandedSteps);
    if (newExpandedSteps.has(index)) {
      newExpandedSteps.delete(index);
    } else {
      newExpandedSteps.add(index);
    }
    setExpandedSteps(newExpandedSteps);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingText(steps[index].description);
    setEditingName(steps[index].name || '');
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      updateStep(editingIndex, { 
        description: editingText,
        name: editingName.trim() || undefined
      });
      setEditingIndex(null);
      setEditingText('');
      setEditingName('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    // TODO: Загрузить файл на сервер и получить photoId
    const photoId = 'temp-' + Date.now();
    updateStep(index, { photos: [photoId] });
  };

  return (
    <div className={styles.stepsEditor}>
      <div className={styles.stepsList}>
        {steps.map((step, index) => (
          <div key={`step-${index}`} className={styles.stepItem}>
            <div className={styles.stepNumber}>
              {index + 1}
            </div>
            
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <button
                  type="button"
                  onClick={() => toggleStepExpansion(index)}
                  className={styles.expandButton}
                >
                  {expandedSteps.has(index) ? (
                    <ChevronDownIcon className={styles.chevron} />
                  ) : (
                    <ChevronRightIcon className={styles.chevron} />
                  )}
                </button>
                
                <div className={styles.stepTitle}>
                  {step.name ? (
                    <h4 className={styles.stepName}>{step.name}</h4>
                  ) : (
                    <h4 className={styles.stepNameEmpty}>Шаг {index + 1}</h4>
                  )}
                  
                  <div className={styles.stepPreview}>
                    {step.description ? (
                      step.description.length > 60 
                        ? `${step.description.substring(0, 60)}...`
                        : step.description
                    ) : (
                      <span className={styles.emptyText}>Добавьте описание шага</span>
                    )}
                  </div>
                </div>
              </div>

              {expandedSteps.has(index) && (
                <div className={styles.stepDetails}>
                  {editingIndex === index ? (
                    <div className={styles.editForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Название шага (опционально)</label>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Например: Подготовка ингредиентов"
                          className={styles.input}
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Описание шага *</label>
                        <textarea
                          ref={textareaRef}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Опишите шаг приготовления..."
                          className={styles.textarea}
                          rows={3}
                        />
                      </div>
                      
                      <div className={styles.editActions}>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className={styles.cancelButton}
                        >
                          Отмена
                        </button>
                        <button
                          type="button"
                          onClick={saveEdit}
                          className={styles.saveButton}
                          disabled={!editingText.trim()}
                        >
                          Сохранить
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.stepInfo}>
                      <div className={styles.stepDescription}>
                        {step.description || (
                          <span className={styles.emptyText}>
                            Нажмите "Редактировать" чтобы добавить описание шага
                          </span>
                        )}
                        {errors[`steps.${index}.description`] && (
                          <span className={styles.errorText}>
                            {errors[`steps.${index}.description`]}
                          </span>
                        )}
                      </div>
                      
                      {/* Ингредиенты для шага */}
                      <div className={styles.stepIngredients}>
                        <h5 className={styles.ingredientsTitle}>Ингредиенты для этого шага</h5>
                        <IngredientPicker
                          ingredients={step.ingredients || []}
                          onChange={(ingredients) => updateStep(index, { ingredients })}
                          errors={{}}
                          compact={true}
                        />
                      </div>
                      
                      {step.photos && step.photos.length > 0 && (
                        <div className={styles.stepImage}>
                          <img 
                            src={`/api/v1/photo/${step.photos[0]}`}
                            alt={`Шаг ${index + 1}`}
                            className={styles.image}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className={styles.stepActions}>
              {editingIndex !== index && (
                <>
                  <button
                    type="button"
                    onClick={() => startEditing(index)}
                    className={styles.editButton}
                    title="Редактировать"
                  >
                    Редактировать
                  </button>
                  
                  <label className={styles.imageButton} title="Добавить фото">
                    <PhotoIcon className={styles.icon} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(index, file);
                        }
                      }}
                      className={styles.hiddenInput}
                    />
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => moveStep(index, 'up')}
                    className={styles.moveButton}
                    disabled={index === 0}
                    title="Переместить вверх"
                  >
                    <ArrowUpIcon className={styles.icon} />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => moveStep(index, 'down')}
                    className={styles.moveButton}
                    disabled={index === steps.length - 1}
                    title="Переместить вниз"
                  >
                    <ArrowDownIcon className={styles.icon} />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className={styles.removeButton}
                    title="Удалить шаг"
                  >
                    <XMarkIcon className={styles.icon} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button
        type="button"
        onClick={addStep}
        className={styles.addButton}
      >
        <PlusIcon className={styles.plusIcon} />
        Добавить шаг
      </button>
    </div>
  );
};

export default StepsEditor; 