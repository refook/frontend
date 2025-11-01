import React, { useState } from 'react';
import { API_BASE_URL } from '../../../../../services/api';
import { getAuthHeaders, authorizedFetch } from '../../../../../services/auth';
import type { BadgeSubjectType, BadgeRarityType, BadgeConditionDto } from '../../../../../types/recipe.types';
import styles from './CreateBadgeForm.module.css';

/**
 * Свойства компонента формы создания бейджа.
 *
 * @interface CreateBadgeFormProps
 * @property {() => void} [onCreated] - Колбэк, вызываемый после успешного создания бейджа.
 *   Используется для обновления списка бейджей или выполнения других действий.
 */
interface CreateBadgeFormProps {
  onCreated?: () => void;
}

/**
 * Компонент формы для создания нового бейджа.
 *
 * @component
 * @description
 * Предоставляет полную форму для создания бейджа со всеми необходимыми полями:
 * - Название бейджа (title)
 * - Уникальный код (code)
 * - Описание (description)
 * - Тип субъекта (subjectType): USER или RECIPE
 * - Раритетность (rarity): UNCOMMON, COMMON, RARE, EPIC, LEGENDARY
 * - Иконка (icon): URL или emoji
 * - Условия получения (conditions): массив условий с действием, количеством и описанием
 *
 * @features
 * - Валидация формы: все поля обязательны, требуется минимум одно условие
 * - Динамическое добавление/удаление условий получения бейджа
 * - Отображение статуса отправки (загрузка/успех/ошибка)
 * - Автоматическая очистка формы после успешного создания
 * - Обработка ошибок API с отображением сообщений пользователю
 *
 * @example
 * ```tsx
 * <CreateBadgeForm
 *   onCreated={() => {
 *     console.log('Бейдж создан');
 *     refreshBadgesList();
 *   }}
 * />
 * ```
 *
 * @remarks
 * - Форма отправляет POST запрос на `/v1/badges`
 * - Требуется авторизация через `getAuthHeaders()`
 * - Все поля обязательны для заполнения
 * - Необходимо добавить хотя бы одно условие для создания бейджа
 */
const CreateBadgeForm: React.FC<CreateBadgeFormProps> = ({ onCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    subjectType: 'USER' as BadgeSubjectType,
    icon: '',
    rarity: 'COMMON' as BadgeRarityType,
    conditions: [] as BadgeConditionDto[],
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [newCondition, setNewCondition] = useState<BadgeConditionDto>({
    action: '',
    count: 0,
    description: '',
  });

  const RARITY_OPTIONS: { value: BadgeRarityType; label: string }[] = [
    { value: 'UNCOMMON', label: 'Обычный' },
    { value: 'COMMON', label: 'Стандартный' },
    { value: 'RARE', label: 'Редкий' },
    { value: 'EPIC', label: 'Эпический' },
    { value: 'LEGENDARY', label: 'Легендарный' },
  ];

  const SUBJECT_TYPE_OPTIONS: { value: BadgeSubjectType; label: string }[] = [
    { value: 'USER', label: 'Пользователь' },
    { value: 'RECIPE', label: 'Рецепт' },
  ];

  const addCondition = () => {
    if (newCondition.action && newCondition.description && newCondition.count > 0) {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, { ...newCondition }],
      });
      setNewCondition({ action: '', count: 0, description: '' });
      setShowConditionForm(false);
    }
  };

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (formData.conditions.length === 0) {
      setMessage('Ошибка: Необходимо добавить хотя бы одно условие');
      setSubmitting(false);
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await authorizedFetch(`${API_BASE_URL}/badges`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      setMessage('Бейдж успешно создан');
      setFormData({
        title: '',
        code: '',
        description: '',
        subjectType: 'USER',
        icon: '',
        rarity: 'COMMON',
        conditions: [],
      });
      onCreated?.();
    } catch (err) {
      setMessage(`Ошибка: ${err instanceof Error ? err.message : 'Не удалось создать бейдж'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Основные поля */}
      <div className={styles.section}>
        <label className={styles.label}>
          Название бейджа*
          <input
            className={styles.input}
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Например: Мастер кулинарии"
            required
            maxLength={255}
          />
        </label>

        <label className={styles.label}>
          Уникальный код*
          <input
            className={styles.input}
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Например: MASTER_CHEF"
            required
            maxLength={255}
          />
        </label>

        <label className={styles.label}>
          Описание*
          <textarea
            className={styles.textarea}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Описание условия получения бейджа"
            required
            rows={3}
          />
        </label>

        <div className={styles.row}>
          <label className={styles.label}>
            Тип субъекта*
            <select
              className={styles.select}
              value={formData.subjectType}
              onChange={(e) => setFormData({ ...formData, subjectType: e.target.value as BadgeSubjectType })}
              required
            >
              {SUBJECT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Раритетность*
            <select
              className={styles.select}
              value={formData.rarity}
              onChange={(e) => setFormData({ ...formData, rarity: e.target.value as BadgeRarityType })}
              required
            >
              {RARITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={styles.label}>
          Иконка (URL или emoji)*
          <input
            className={styles.input}
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="🏆 или https://..."
            required
          />
        </label>
      </div>

      {/* Условия */}
      <div className={styles.section}>
        <div className={styles.conditionsHeader}>
          <h3 className={styles.sectionTitle}>Условия получения*</h3>
          <button
            type="button"
            className="ui-btn ui-btn--secondary"
            onClick={() => setShowConditionForm(!showConditionForm)}
          >
            {showConditionForm ? 'Отмена' : '+ Добавить условие'}
          </button>
        </div>

        {formData.conditions.length === 0 && !showConditionForm && (
          <p className={styles.hint}>Необходимо добавить хотя бы одно условие</p>
        )}

        {showConditionForm && (
          <div className={styles.conditionForm}>
            <label className={styles.label}>
              Действие (action)*
              <input
                className={styles.input}
                type="text"
                value={newCondition.action}
                onChange={(e) => setNewCondition({ ...newCondition, action: e.target.value })}
                placeholder="Например: RECIPE_LIKE"
                required
              />
            </label>
            <label className={styles.label}>
              Количество*
              <input
                className={styles.input}
                type="number"
                min="1"
                value={newCondition.count || ''}
                onChange={(e) => setNewCondition({ ...newCondition, count: parseInt(e.target.value) || 0 })}
                required
              />
            </label>
            <label className={styles.label}>
              Описание действия*
              <input
                className={styles.input}
                type="text"
                value={newCondition.description}
                onChange={(e) => setNewCondition({ ...newCondition, description: e.target.value })}
                placeholder="Например: Лайки рецепта"
                required
              />
            </label>
            <button type="button" className="ui-btn ui-btn--primary" onClick={addCondition}>
              Добавить
            </button>
          </div>
        )}

        {formData.conditions.length > 0 && (
          <div className={styles.conditionsList}>
            {formData.conditions.map((condition, index) => (
              <div key={index} className={styles.conditionItem}>
                <span className={styles.conditionAction}>{condition.action}</span>
                <span className={styles.conditionCount}>{condition.count}</span>
                <span className={styles.conditionDesc}>{condition.description}</span>
                <button
                  type="button"
                  className="ui-btn ui-btn--danger"
                  onClick={() => removeCondition(index)}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Действия */}
      <div className={styles.actions}>
        <button type="submit" className="ui-btn ui-btn--primary" disabled={submitting}>
          {submitting ? 'Сохранение...' : 'Создать бейдж'}
        </button>
        {message && (
          <div
            className={`${styles.message} ${
              message.startsWith('Ошибка') ? styles.messageError : styles.messageSuccess
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </form>
  );
};

export default CreateBadgeForm;

