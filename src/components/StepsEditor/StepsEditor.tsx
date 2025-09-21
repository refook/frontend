import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import type { CreateStepDto, CreateRecipeIngredientDto } from "../../types";
import { API_BASE_URL } from '../../services/api';
import { authorizedFetch, getAuthHeaders } from '../../services/auth';
import { PRODUCT_UNITS_ARRAY } from '../../constants/measures';

export type StepIngredientOveruse = {
  key: string;
  ingredientId: string;
  variantId?: string;
  name: string;
  over: number;
  base: number;
  used: number;
};

const getIngredientKey = (ingredient: { id?: string; variantId?: string } | null | undefined): string => {
  if (!ingredient?.id) return '';
  return ingredient.variantId ? `${ingredient.id}::${ingredient.variantId}` : ingredient.id;
};

const formatCount = (value: number): string => {
  if (!Number.isFinite(value)) return '';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.0+$/, '').replace(/(\d)0+$/, '$1');
};

interface StepsEditorProps {
  steps: CreateStepDto[];
  onChange: (steps: CreateStepDto[]) => void;
  errors?: Record<string, string>;
  baseIngredients?: CreateRecipeIngredientDto[];
  onValidationChange?: (overuses: StepIngredientOveruse[]) => void;
}

const StepsEditor: React.FC<StepsEditorProps> = ({ steps, onChange, errors = {}, baseIngredients = [], onValidationChange }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingName, setEditingName] = useState('');
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [idToName, setIdToName] = useState<Record<string, string>>({});

  useEffect(() => {
    // Подгрузим справочник продуктов для отображения названий
    const load = async () => {
      try {
        const headers = getAuthHeaders();
        const resp = await authorizedFetch(`${API_BASE_URL}/products/all`, { headers });
        if (!resp.ok) return;
        const list = await resp.json();
        const map: Record<string, string> = {};
        (list || []).forEach((p: any) => { if (p?.id) map[p.id] = p.name ?? 'Продукт'; });
        setIdToName(map);
      } catch {
        setIdToName({});
      }
    };
    load();
  }, []);

  const selectableBaseIngredients = useMemo(() => baseIngredients || [], [baseIngredients]);

  const baseTotals = useMemo(() => {
    const map = new Map<string, number>();
    (baseIngredients || []).forEach((ingredient) => {
      const key = getIngredientKey(ingredient as any);
      if (!key) return;
      const count = Number((ingredient as any)?.count) || 0;
      map.set(key, (map.get(key) || 0) + count);
    });
    return map;
  }, [baseIngredients]);

  const usedTotals = useMemo(() => {
    const map = new Map<string, number>();
    (steps || []).forEach((step) => {
      (step.ingredients || []).forEach((ingredient) => {
        const key = getIngredientKey(ingredient as any);
        if (!key) return;
        const count = Number((ingredient as any)?.count) || 0;
        map.set(key, (map.get(key) || 0) + count);
      });
    });
    return map;
  }, [steps]);

  const ingredientMeta = useMemo(() => {
    const map = new Map<string, { ingredientId: string; variantId?: string }>();
    (baseIngredients || []).forEach((ingredient) => {
      const key = getIngredientKey(ingredient as any);
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, { ingredientId: ingredient.id, variantId: (ingredient as any)?.variantId });
      }
    });
    (steps || []).forEach((step) => {
      (step.ingredients || []).forEach((ingredient) => {
        const key = getIngredientKey(ingredient as any);
        if (!key) return;
        if (!map.has(key)) {
          map.set(key, { ingredientId: ingredient.id, variantId: (ingredient as any)?.variantId });
        }
      });
    });
    return map;
  }, [baseIngredients, steps]);

  const usageSummary = useMemo(() => {
    const map = new Map<string, { base: number; used: number }>();
    const keys = new Set<string>([...baseTotals.keys(), ...usedTotals.keys()]);
    keys.forEach((key) => {
      map.set(key, {
        base: baseTotals.get(key) ?? 0,
        used: usedTotals.get(key) ?? 0,
      });
    });
    return map;
  }, [baseTotals, usedTotals]);

  const overusedList = useMemo<StepIngredientOveruse[]>(() => {
    const list: StepIngredientOveruse[] = [];
    usageSummary.forEach((entry, key) => {
      const over = entry.used - entry.base;
      if (over > 0) {
        const meta = ingredientMeta.get(key);
        const ingredientId = meta?.ingredientId || key;
        const name = idToName[ingredientId] || ingredientId;
        list.push({
          key,
          ingredientId,
          variantId: meta?.variantId,
          name,
          over,
          base: entry.base,
          used: entry.used,
        });
      }
    });
    return list;
  }, [usageSummary, ingredientMeta, idToName]);

  useEffect(() => {
    onValidationChange?.(overusedList);
  }, [overusedList, onValidationChange]);

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
                      
                      {/* Ингредиенты для шага (только из выбранных в общем списке) */}
                      <div className={styles.stepIngredients}>
                        <h5 className={styles.ingredientsTitle}>Ингредиенты для этого шага</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(step.ingredients || []).map((ing, si) => {
                            const ingredientKey = getIngredientKey(ing as any);
                            const summaryEntry = usageSummary.get(ingredientKey);
                            const over = summaryEntry ? summaryEntry.used - summaryEntry.base : 0;
                            const hasOver = over > 0;
                            return (
                              <div key={`${ing.id}-${si}`} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px auto', gap: 8, alignItems: 'center' }}>
                                <div style={{ color: 'var(--token-text)' }}>
                                  {idToName[ing.id] || ing.id}
                                  <span style={{ marginLeft: 6, color: 'var(--token-muted)', fontSize: 12 }}>
                                    {PRODUCT_UNITS_ARRAY.find(u => u.value === (ing as any).productUnit)?.label}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={Number(ing.count) || 0}
                                  onChange={(e) => {
                                    const desired = Math.max(0, parseInt(e.target.value, 10) || 0);
                                    const next = [...(step.ingredients || [])];
                                    (next[si] as any).count = desired;
                                    updateStep(index, { ingredients: next as any });
                                  }}
                                  className={`${styles.input} ${hasOver ? styles.inputError : ''}`}
                                />
                                <div style={{ color: 'var(--token-muted)', fontSize: 12 }}>
                                  {(ing as any).variantId ? 'Вариант' : 'Оригинал'}
                                </div>
                                <button type="button" className={styles.removeButton} onClick={() => {
                                  const next = (step.ingredients || []).filter((_, j) => j !== si);
                                  updateStep(index, { ingredients: next as any });
                                }}>
                                  <XMarkIcon className={styles.icon} />
                                </button>
                                {hasOver && (
                                  <div className={styles.inlineError} style={{ gridColumn: '1 / -1' }}>
                                    Превышение на {formatCount(over)} (используется {formatCount(summaryEntry?.used ?? 0)} из {formatCount(summaryEntry?.base ?? 0)})
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Добавление нового ингредиента из общего списка */}
                          {selectableBaseIngredients.length > 0 && (
                            <AddStepIngredientRow
                              baseIngredients={selectableBaseIngredients}
                              usedIds={(step.ingredients || []).map(i => i.id)}
                              idToName={idToName}
                              getRemaining={(ingredient) => {
                                const key = getIngredientKey(ingredient as any);
                                const summaryEntry = usageSummary.get(key);
                                if (!summaryEntry) return 0;
                                return summaryEntry.base - summaryEntry.used;
                              }}
                              onAdd={(base) => {
                                const next = [...(step.ingredients || [])];
                                const payload: any = { id: base.id, count: Number((base as any).count) || 0, productUnit: (base as any).productUnit };
                                if ((base as any).variantId) payload.variantId = (base as any).variantId;
                                next.push(payload);
                                updateStep(index, { ingredients: next as any });
                              }}
                            />
                          )}
                        </div>
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
export type { StepIngredientOveruse };

// Вспомогательная строка для добавления ингредиента шага на основе выбранных базовых
interface AddRowProps {
  baseIngredients: CreateRecipeIngredientDto[];
  usedIds: string[];
  idToName: Record<string, string>;
  getRemaining: (ingredient: CreateRecipeIngredientDto) => number;
  onAdd: (base: CreateRecipeIngredientDto) => void;
}

const AddStepIngredientRow: React.FC<AddRowProps> = ({ baseIngredients, usedIds, idToName, getRemaining, onAdd }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [count, setCount] = useState<number>(0);
  const candidates = useMemo(() => baseIngredients.filter(b => !usedIds.includes(b.id)), [baseIngredients, usedIds]);
  const current = candidates.find(c => c.id === selectedId);
  useEffect(() => {
    if (!current) return;
    const remaining = getRemaining(current);
    if (typeof remaining === 'number' && Number.isFinite(remaining) && remaining >= 0) {
      setCount(prev => Math.min(prev, remaining));
    }
  }, [current, getRemaining]);

  const remainingForCurrent = current ? getRemaining(current) : undefined;
  const hasFiniteRemaining = typeof remainingForCurrent === 'number' && Number.isFinite(remainingForCurrent);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: 8, alignItems: 'center', marginTop: 6 }}>
      <select className="ui-select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
        <option value="">Выберите ингредиент</option>
        {candidates.map(c => (
          <option key={c.id} value={c.id}>{idToName[c.id] || c.id}</option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        step={1}
        value={count}
        onChange={(e) => {
          const raw = Math.max(0, parseInt(e.target.value, 10) || 0);
          if (!current) {
            setCount(raw);
            return;
          }
          const remaining = getRemaining(current);
          const limited = typeof remaining === 'number' && Number.isFinite(remaining) && remaining >= 0 ? Math.min(raw, remaining) : raw;
          setCount(limited);
        }}
        className={styles.input}
      />
      <button
        type="button"
        className={styles.addButton}
        disabled={!selectedId}
        onClick={() => {
          if (!current) return;
          const remaining = getRemaining(current);
          const payload: any = { ...current, count: (typeof remaining === 'number' && Number.isFinite(remaining) && remaining >= 0) ? Math.min(count, remaining) : count };
          onAdd(payload as any);
          setCount(0);
          setSelectedId('');
        }}
      >
        Добавить
      </button>
      {current && hasFiniteRemaining && (
        <div className={remainingForCurrent! >= 0 ? styles.remainingHint : styles.inlineError} style={{ gridColumn: '1 / -1' }}>
          {remainingForCurrent! >= 0
            ? `Остаток: ${formatCount(remainingForCurrent!)}`
            : `Превышение на ${formatCount(Math.abs(remainingForCurrent!))}`}
        </div>
      )}
    </div>
  );
};
