import React, { useState } from 'react';
import { API_BASE_URL } from '../../../../services/api';
import styles from './CreateTagForm.module.css';
import { getAuthHeaders, authorizedFetch } from '../../../../services/auth';

/**
 * Интерфейс формы создания тега
 * @interface CreateTagDtoForm
 */
interface CreateTagDtoForm {
  /** Название тега */
  name: string;
}

/**
 * Форма создания нового тега в админ-панели.
 * 
 * Компонент предоставляет простую форму для создания тега с валидацией,
 * отправкой данных на сервер и отображением результата операции.
 * 
 * @component
 * @example
 * // Использование в TagSubTabs
 * <div className={styles.card}>
 *   <div className={styles.cardTitle}>Создать тег</div>
 *   <CreateTagForm />
 * </div>
 * 
 * @features
 * - Валидация обязательных полей
 * - Отправка данных через API /v1/tags
 * - Автосброс формы после успешного создания
 * - Отображение статуса операции
 * - Поддержка темной темы
 * 
 * @since 1.0.0
 * @author Frontend Team
 */
interface CreateEntityFormProps {
  apiUrl: string;
  titleLabel: string;
  placeholder: string;
  submitLabel: string;
  successMessage: string;
  onCreated?: () => void;
}

const CreateTagForm: React.FC<CreateEntityFormProps> = ({
  apiUrl,
  titleLabel,
  placeholder,
  submitLabel,
  successMessage,
  onCreated,
}) => {
  /**
   * Состояние данных формы
   * @type {CreateTagDtoForm}
   */
  const [formData, setFormData] = useState<CreateTagDtoForm>({
    name: '',
  });
  
  /**
   * Состояние загрузки при отправке формы
   * @type {boolean}
   */
  const [submitting, setSubmitting] = useState(false);
  
  /**
   * Сообщение о результате операции (успех или ошибка)
   * @type {string | null}
   */
  const [message, setMessage] = useState<string | null>(null);

  /**
   * Обработчик отправки формы создания тега
   * 
   * @async
   * @function handleSubmit
   * @param {React.FormEvent} e - Событие отправки формы
   * @returns {Promise<void>}
   * 
   * @description
   * - Предотвращает стандартное поведение формы
   * - Устанавливает состояние загрузки
   * - Отправляет данные на API
   * - Обрабатывает успешный ответ и ошибки
   * - Сбрасывает форму при успехе
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      // Получение токена авторизации
      const headers = getAuthHeaders();

      // Отправка данных на сервер
      const response = await authorizedFetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      // Успешное создание - показать сообщение и сбросить форму
      setMessage(successMessage);
      setFormData({
        name: '',
      });
      onCreated?.();
    } catch (err) {
      // Обработка ошибок
      setMessage(`Ошибка: ${err instanceof Error ? err.message : 'Не удалось создать тег'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formGrid}>
      {/* Основная информация о теге */}
      <label className={styles.label}>
        {titleLabel}
        <input
          className={styles.input}
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={placeholder}
          required
          minLength={1}
          maxLength={64}
        />
      </label>
      
      {/* Действия и результат */}
      <div className={styles.actions}>
        <button type="submit" className="ui-btn ui-btn--primary" disabled={submitting}>
          {submitting ? 'Сохранение...' : submitLabel}
        </button>
        {message && (
          <div
            aria-live="polite"
            className={`${styles.message} ${message.startsWith('Ошибка') ? styles.messageError : styles.messageSuccess}`}
          >
            {message}
          </div>
        )}
      </div>
    </form>
  );
};

export default CreateTagForm;
