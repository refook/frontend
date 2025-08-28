import React, { useState } from 'react';
import { API_BASE_URL } from '../../../../services/api';
import { BASE_UNITS_ARRAY, PRODUCT_UNITS_ARRAY } from '../../../../constants/measures';
import styles from './CreateProductForm.module.css';
import { getAuthHeaders, authorizedFetch } from '../../../../services/auth';

/**
 * Тип базовых единиц измерения из констант
 */
type BaseUnitType = (typeof BASE_UNITS_ARRAY)[number]['value'];

/**
 * Тип конкретных единиц измерения продуктов из констант
 */
type ProductUnitType = (typeof PRODUCT_UNITS_ARRAY)[number]['value'];

/**
 * Интерфейс формы создания продукта
 * @interface CreateProductDtoForm
 */
interface CreateProductDtoForm {
  /** Название продукта */
  name: string;
  /** Описание продукта */
  description: string;
  /** Базовая единица измерения */
  baseUnit: BaseUnitType;
  /** Средний вес в граммах */
  avgWeight: number;
  /** Конкретная единица измерения */
  unit: ProductUnitType;
  /** URL фотографии продукта */
  photo: string;
  /** Пищевая ценность (КБЖУ) */
  macros: {
    /** Калории */
    calories: number;
    /** Белки */
    proteins: number;
    /** Жиры */
    fats: number;
    /** Углеводы */
    carbs: number;
  };
}

/**
 * Форма создания нового продукта в админ-панели.
 * 
 * Компонент предоставляет полную форму для создания продукта с валидацией,
 * отправкой данных на сервер и отображением результата операции.
 * 
 * @component
 * @example
 * // Использование в ProductSubTabs
 * <div className={styles.card}>
 *   <div className={styles.cardTitle}>Создать продукт</div>
 *   <CreateProductForm />
 * </div>
 * 
 * @features
 * - Валидация обязательных полей
 * - Отправка данных через API
 * - Автосброс формы после успешного создания
 * - Отображение статуса операции
 * - Поддержка темной темы
 * 
 * @since 1.0.0
 * @author Frontend Team
 */
const CreateProductForm: React.FC = () => {
  /**
   * Состояние данных формы
   * @type {CreateProductDtoForm}
   */
  const [formData, setFormData] = useState<CreateProductDtoForm>({
    name: '',
    description: '',
    baseUnit: 'GR',
    avgWeight: 100,
    unit: 'GRAM',
    photo: '',
    macros: { calories: 0, proteins: 0, fats: 0, carbs: 0 },
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
   * Обработчик отправки формы создания продукта
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
      const response = await authorizedFetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      // Успешное создание - показать сообщение и сбросить форму
      setMessage('Продукт успешно создан');
      setFormData({
        name: '',
        description: '',
        baseUnit: 'GR',
        avgWeight: 100,
        unit: 'GRAM',
        photo: '',
        macros: { calories: 0, proteins: 0, fats: 0, carbs: 0 },
      });
    } catch (err) {
      // Обработка ошибок
      setMessage(`Ошибка: ${err instanceof Error ? err.message : 'Не удалось создать продукт'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formGrid}>
      {/* Основная информация о продукте */}
      <label className={styles.label}>
        Название*
        <input
          className={styles.input}
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </label>
      <label className={styles.label}>
        Описание
        <textarea
          className={styles.textarea}
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </label>
      
      {/* Единицы измерения */}
      <label className={styles.label}>
        Базовая мера*
        <select
          className={styles.select}
          value={formData.baseUnit}
          onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value as BaseUnitType })}
          required
        >
          {BASE_UNITS_ARRAY.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.label}>
        Конкретная мера*
        <select
          className={styles.select}
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnitType })}
          required
        >
          {PRODUCT_UNITS_ARRAY.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </label>
      
      {/* Дополнительные характеристики */}
      <label className={styles.label}>
        Средний вес (г)*
        <input
          className={styles.input}
          type="number"
          min={0}
          step={1}
          value={formData.avgWeight}
          onChange={(e) => setFormData({ ...formData, avgWeight: Number(e.target.value) })}
          required
        />
      </label>
      <label className={styles.label}>
        URL фото
        <input
          className={styles.input}
          type="url"
          value={formData.photo}
          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
          placeholder="https://..."
        />
      </label>
      
      {/* Пищевая ценность (КБЖУ) */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>КБЖУ*</legend>
        <div className={styles.row4}>
          <label className={styles.label}>
            Ккал
            <input
              className={styles.input}
              type="number"
              min={0}
              step={1}
              value={formData.macros.calories}
              onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, calories: Number(e.target.value) } })}
              required
            />
          </label>
          <label className={styles.label}>
            Белки
            <input
              className={styles.input}
              type="number"
              min={0}
              step={0.01}
              value={formData.macros.proteins}
              onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, proteins: Number(e.target.value) } })}
              required
            />
          </label>
          <label className={styles.label}>
            Жиры
            <input
              className={styles.input}
              type="number"
              min={0}
              step={0.01}
              value={formData.macros.fats}
              onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, fats: Number(e.target.value) } })}
              required
            />
          </label>
          <label className={styles.label}>
            Углеводы
            <input
              className={styles.input}
              type="number"
              min={0}
              step={0.01}
              value={formData.macros.carbs}
              onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, carbs: Number(e.target.value) } })}
              required
            />
          </label>
        </div>
      </fieldset>
      
      {/* Действия и результат */}
      <div className={styles.actions}>
        <button type="submit" className="ui-btn ui-btn--primary" disabled={submitting}>
          {submitting ? 'Сохранение...' : 'Создать продукт'}
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

export default CreateProductForm;


