import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../../../services/api';
import { getAuthHeaders, authorizedFetch } from '../../../../../services/auth';
import type { BadgeResponseDto, BadgeSubjectType, BadgeRarityType, BadgeConditionDto } from '../../../../../types/recipe.types';
import styles from './EditBadgeModal.module.css';

/**
 * Свойства компонента модального окна редактирования бейджа.
 *
 * @interface EditBadgeModalProps
 * @property {BadgeResponseDto} badge - Объект бейджа для редактирования. Содержит все поля бейджа.
 * @property {boolean} isOpen - Флаг открытия/закрытия модального окна.
 * @property {() => void} onClose - Колбэк для закрытия модального окна. Вызывается при клике на overlay,
 *   кнопку закрытия или кнопку отмены.
 * @property {() => void | Promise<void>} onUpdated - Колбэк, вызываемый после успешного сохранения изменений.
 *   Может быть синхронным или асинхронным. Используется для обновления списка бейджей.
 */
interface EditBadgeModalProps {
  badge: BadgeResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
}

/**
 * Модальное окно для редактирования существующего бейджа.
 *
 * @component
 * @description
 * Предоставляет полнофункциональное модальное окно с формой редактирования всех полей бейджа:
 * - Название бейджа (title)
 * - Уникальный код (code)
 * - Описание (description)
 * - Тип субъекта (subjectType): USER или RECIPE
 * - Раритетность (rarity): UNCOMMON, COMMON, RARE, EPIC, LEGENDARY
 * - Иконка (icon): URL или emoji
 * - Условия получения (conditions): массив условий с действием, количеством и описанием
 *
 * @features
 * - Автоматическое заполнение формы данными редактируемого бейджа
 * - Сброс формы при изменении пропса `badge` или `isOpen`
 * - Валидация формы: все поля обязательны, требуется минимум одно условие
 * - Динамическое добавление/удаление условий получения бейджа
 * - Немедленное закрытие модального окна при нажатии "Сохранить" (без ожидания ответа API)
 * - Фоновая отправка изменений на сервер
 * - Обработка ошибок с логированием в консоль (модальное окно уже закрыто)
 *
 * @behavior
 * - При открытии модального окна форма автоматически заполняется данными из пропса `badge`
 * - При нажатии "Сохранить" модальное окно закрывается немедленно, а сохранение происходит в фоне
 * - После успешного сохранения вызывается `onUpdated()` для обновления данных
 * - При клике на overlay (затемнённую область) модальное окно закрывается
 * - При нажатии Escape модальное окно не закрывается (требуется явный клик)
 *
 * @example
 * ```tsx
 * <EditBadgeModal
 *   badge={selectedBadge}
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onUpdated={async () => {
 *     await refreshBadgesList();
 *     console.log('Бейдж обновлён');
 *   }}
 * />
 * ```
 *
 * @remarks
 * - Форма отправляет PUT запрос на `/v1/badges/${badge.id}`
 * - Требуется авторизация через `getAuthHeaders()`
 * - Все поля обязательны для заполнения
 * - Необходимо добавить хотя бы одно условие для сохранения бейджа
 * - Модальное окно не рендерится, если `isOpen === false`
 * - Ошибки при сохранении логируются в консоль, но не показываются пользователю (модальное окно уже закрыто)
 */
const EditBadgeModal: React.FC<EditBadgeModalProps> = ({ badge, isOpen, onClose, onUpdated }) => {
  const [formData, setFormData] = useState<BadgeResponseDto>(badge);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [newCondition, setNewCondition] = useState<BadgeConditionDto>({
    action: '',
    count: 0,
    description: '',
  });

  // Обновляем форму при изменении badge
  useEffect(() => {
    setFormData(badge);
    setMessage(null);
    setShowConditionForm(false);
  }, [badge, isOpen]);

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
    
    if (formData.conditions.length === 0) {
      setMessage('Ошибка: Необходимо добавить хотя бы одно условие');
      return;
    }

    // Закрываем модальное окно сразу при нажатии на сохранить
    setSubmitting(true);
    onClose();
    
    // Сохранение происходит в фоне
    try {
      const headers = getAuthHeaders();
      const body = {
        title: formData.title,
        code: formData.code,
        description: formData.description,
        subjectType: formData.subjectType,
        icon: formData.icon ?? '',
        rarity: formData.rarity,
        conditions: formData.conditions,
      };

      const response = await authorizedFetch(`${API_BASE_URL}/badges/${badge.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Обновляем данные после успешного сохранения
      const updateResult = onUpdated();
      if (updateResult instanceof Promise) {
        updateResult.catch((err: unknown) => {
          console.error('Ошибка при обновлении данных:', err);
        });
      }
    } catch (err) {
      console.error('Ошибка при сохранении бейджа:', err);
      // Можно показать уведомление об ошибке, но модальное окно уже закрыто
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Редактирование бейджа</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

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
                value={formData.icon ?? ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
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
            {message && (
              <div
                className={`${styles.message} ${
                  message.startsWith('Ошибка') ? styles.messageError : styles.messageSuccess
                }`}
              >
                {message}
              </div>
            )}
            <div className={styles.buttons}>
              <button type="button" className="ui-btn ui-btn--secondary" onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className="ui-btn ui-btn--primary" disabled={submitting}>
                {submitting ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBadgeModal;

