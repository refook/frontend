import React, { useState } from 'react';
import { productsService } from '../../../../services';
import { PRODUCT_UNITS_ARRAY } from '../../../../constants/measures';
import styles from './CreateProductForm.module.css';
// import { authorizedFetch } from '../../../../services/auth';
import type { CreateProductDto, AddBaseProductMeasureDto } from '../../../../types/api.types';
import ProductForm from '../ProductForm/ProductForm';

// Локальное состояние формы будет совместимо с CreateProductDto
type CreateProductDtoForm = CreateProductDto;

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
    categoryId: null,
    photo: null,
    macros: { calories: 0, proteins: 0, fats: 0, carbs: 0, isEmpty: false },
    measures: [
      { name: '', weight: 100, isDefault: true, density: 1 },
    ],
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

      // Валидация минимальных требований схемы
      if (!formData.name || formData.name.trim().length < 1) {
        throw new Error('Укажите название продукта');
      }
      if (!formData.measures || formData.measures.length < 1) {
        throw new Error('Добавьте хотя бы одну меру продукта');
      }
      if (formData.name.length > 64) {
        throw new Error('Название не должно превышать 64 символа');
      }
      if ((formData.description ?? '').length > 1000) {
        throw new Error('Описание не должно превышать 1000 символов');
      }
      if ((formData.photo ?? '').length > 2000) {
        throw new Error('URL фото не должен превышать 2000 символов');
      }

      // Макросы: calories 0..100000 (целое), proteins/fats/carbs 0..100
      const { calories, proteins, fats, carbs } = formData.macros;
      if (calories < 0 || calories > 100000) {
        throw new Error('Ккал должны быть в диапазоне 0..100000');
      }
      if (proteins < 0 || proteins > 100) {
        throw new Error('Белки должны быть в диапазоне 0..100');
      }
      if (fats < 0 || fats > 100) {
        throw new Error('Жиры должны быть в диапазоне 0..100');
      }
      if (carbs < 0 || carbs > 100) {
        throw new Error('Углеводы должны быть в диапазоне 0..100');
      }

      // Меры: имя обязательно, вес > 0, ровно одна isDefault=true
      const defaultCount = formData.measures.filter(m => m.isDefault).length;
      if (defaultCount !== 1) {
        throw new Error('Должна быть ровно одна основная мера');
      }
      for (const m of formData.measures) {
        if (!m.name || !m.name.trim()) {
          throw new Error('У каждой меры должно быть название');
        }
        if (m.weight <= 0) {
          throw new Error('Вес меры должен быть больше 0');
        }
        if (m.density !== undefined && m.density < 0) {
          throw new Error('Плотность не может быть отрицательной');
        }
      }

      // Отправка данных на сервер через сервис
      await productsService.createProduct(formData);
      
      // Успешное создание - показать сообщение и сбросить форму
      setMessage('Продукт успешно создан');
      setFormData({
        name: '',
        description: '',
        categoryId: null,
        photo: null,
        macros: { calories: 0, proteins: 0, fats: 0, carbs: 0, isEmpty: false },
        measures: [ { name: '', weight: 100, isDefault: true, density: 1 } ],
      });
    } catch (err) {
      // Обработка ошибок
      const errorMessage = err instanceof Error ? err.message : 'Не удалось создать продукт';
      console.error('CreateProductForm error:', err);
      setMessage(`Ошибка: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formGrid}>
      {/* Основная информация о продукте */}
      
      {/* Меры продукта (минимум одна) */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Мера продукта*</legend>
        {formData.measures.map((m, idx) => (
          <div key={idx} className={styles.row4}>
            <label className={styles.label}>
              Название меры
              <select
                className={styles.select}
                value={m.name}
                onChange={(e) => {
                  const next: AddBaseProductMeasureDto[] = [...formData.measures];
                  // Сохраняем человекочитаемое имя меры в DTO (label)
                  next[idx] = { ...m, name: e.target.value };
                  setFormData({ ...formData, measures: next });
                }}
                required
              >
                {PRODUCT_UNITS_ARRAY.map((u) => (
                  <option key={u.value} value={u.label}>
                    {u.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.label}>
              Вес (г)
              <input
                className={styles.input}
                type="number"
                min={1}
                step={1}
                value={m.weight}
                onChange={(e) => {
                  const next: AddBaseProductMeasureDto[] = [...formData.measures];
                  next[idx] = { ...m, weight: Number(e.target.value) };
                  setFormData({ ...formData, measures: next });
                }}
                required
              />
            </label>
            <label className={styles.label}>
              Плотность
              <input
                className={styles.input}
                type="number"
                min={0}
                step={0.01}
                value={m.density ?? 1}
                onChange={(e) => {
                  const next: AddBaseProductMeasureDto[] = [...formData.measures];
                  next[idx] = { ...m, density: Number(e.target.value) };
                  setFormData({ ...formData, measures: next });
                }}
              />
            </label>
            <label className={styles.label}>
              Основная?
              <input
                className={styles.input}
                type="checkbox"
                checked={m.isDefault}
                onChange={(e) => {
                  const next: AddBaseProductMeasureDto[] = formData.measures.map((mm, i) => ({
                    ...mm,
                    isDefault: i === idx ? e.target.checked : false,
                  }));
                  setFormData({ ...formData, measures: next });
                }}
              />
            </label>
          </div>
        ))}
      </fieldset>
      
      {/* Дополнительные характеристики */}
      <label className={styles.label}>
        Категория (categoryId)
        <input
          className={styles.input}
          type="text"
          placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
          value={formData.categoryId ?? ''}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || null })}
          disabled
        />
      </label>
      <label className={styles.label}>
        URL фото
        <input
          className={styles.input}
          type="url"
          placeholder="https://..."
          value={formData.photo ?? ''}
          onChange={(e) => setFormData({ ...formData, photo: e.target.value || null })}
          maxLength={2000}
          disabled
        />
      </label>
      
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Основные поля</legend>
        <ProductForm
          mode="base"
          value={{
            name: formData.name,
            description: formData.description,
            categoryId: formData.categoryId ?? null,
            photo: formData.photo ?? null,
            macros: formData.macros,
          }}
          onChange={(next) => setFormData({
            ...formData,
            name: next.name,
            description: next.description ?? '',
            categoryId: next.categoryId ?? null,
            photo: next.photo ?? null,
            macros: next.macros,
          })}
        />
        <label className={styles.label}>
          Пустые значения?
          <input
            className={styles.input}
            type="checkbox"
            checked={formData.macros.isEmpty}
            onChange={(e) => setFormData({ ...formData, macros: { ...formData.macros, isEmpty: e.target.checked } })}
          />
        </label>
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

