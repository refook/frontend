import React, { useState, useRef } from 'react';
import type { FormStep } from '../../types';
import { 
  PlusIcon, 
  XMarkIcon, 
  PhotoIcon, 
  ArrowUpIcon, 
  ArrowDownIcon 
} from '@heroicons/react/24/outline';
import styles from './StepsEditor.module.css';

interface StepsEditorProps {
  steps: FormStep[];
  onChange: (steps: FormStep[]) => void;
}

const StepsEditor: React.FC<StepsEditorProps> = ({ steps, onChange }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addStep = () => {
    const newStep: FormStep = {
      id: `step-${Date.now()}`,
      description: '',
      order: steps.length + 1
    };
    
    onChange([...steps, newStep]);
    setEditingIndex(steps.length);
    setEditingText('');
    
    // Фокус на новом поле через небольшую задержку
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const updateStep = (index: number, updates: Partial<FormStep>) => {
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
      order: i + 1
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
      order: i + 1
    }));
    
    onChange(reorderedSteps);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingText(steps[index].description);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      updateStep(editingIndex, { description: editingText });
      setEditingIndex(null);
      setEditingText('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
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

  const handleImageUpload = (index: number, file: File) => {
    updateStep(index, { image: file });
  };

  return (
    <div className={styles.stepsEditor}>
      <div className={styles.stepsList}>
        {steps.map((step, index) => (
          <div key={step.id} className={styles.stepItem}>
            <div className={styles.stepNumber}>
              {index + 1}
            </div>
            
            <div className={styles.stepContent}>
              {editingIndex === index ? (
                <div className={styles.editForm}>
                  <textarea
                    ref={textareaRef}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Опишите шаг приготовления..."
                    className={styles.textarea}
                    rows={3}
                  />
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
                <div className={styles.stepDescription}>
                  {step.description || (
                    <span className={styles.emptyText}>
                      Нажмите чтобы добавить описание шага
                    </span>
                  )}
                </div>
              )}
              
              {step.image && (
                <div className={styles.stepImage}>
                  <img 
                    src={URL.createObjectURL(step.image)} 
                    alt={`Шаг ${index + 1}`}
                    className={styles.image}
                  />
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