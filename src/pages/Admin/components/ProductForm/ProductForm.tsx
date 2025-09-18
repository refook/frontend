import React from 'react';
import type { ApiMacrosDto, ChangeProductVariantDto, CreateProductDto } from '../../../../types/api.types';

/** Общие поля формы продукта, которые используются и для базы, и для варианта. */
type CommonFields = Pick<ChangeProductVariantDto, 'name' | 'description' | 'categoryId' | 'photo' | 'macros'>;

export type ProductFormMode = 'base' | 'variant';

/** Пропсы компонента формы продукта. */
interface ProductFormProps {
  /** Режим формы: базовый продукт или вариант */
  mode: ProductFormMode;
  /** Контролируемое значение формы */
  value: CommonFields;
  /** Колбэк изменения значения формы */
  onChange: (next: CommonFields) => void;
  /** Блокировка полей формы */
  disabled?: boolean;
}

/**
 * Унифицированная форма редактирования/создания продукта.
 * Используется как для базового продукта, так и для варианта.
 */
const ProductForm: React.FC<ProductFormProps> = ({ mode, value, onChange, disabled = false }) => {
  const macros = value.macros as ApiMacrosDto;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <label>
        Название*
        <input
          className="ui-input"
          type="text"
          value={value.name}
          maxLength={64}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          disabled={disabled}
          required
        />
      </label>
      <label>
        Описание
        <input
          className="ui-input"
          type="text"
          value={value.description ?? ''}
          maxLength={1000}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          disabled={disabled}
        />
      </label>
      <label>
        Категория (uuid)
        <input
          className="ui-input"
          type="text"
          value={value.categoryId ?? ''}
          onChange={(e) => onChange({ ...value, categoryId: e.target.value || null })}
          disabled={disabled}
        />
      </label>
      <label>
        URL фото
        <input
          className="ui-input"
          type="url"
          value={value.photo ?? ''}
          maxLength={2000}
          onChange={(e) => onChange({ ...value, photo: e.target.value || null })}
          disabled={disabled}
        />
      </label>
      <label>
        Ккал*
        <input
          className="ui-input"
          type="number"
          min={0}
          max={100000}
          step={1}
          value={macros.calories}
          onChange={(e) => onChange({ ...value, macros: { ...macros, calories: Number(e.target.value) } })}
          disabled={disabled}
          required
        />
      </label>
      <label>
        Белки*
        <input
          className="ui-input"
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={macros.proteins}
          onChange={(e) => onChange({ ...value, macros: { ...macros, proteins: Number(e.target.value) } })}
          disabled={disabled}
          required
        />
      </label>
      <label>
        Жиры*
        <input
          className="ui-input"
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={macros.fats}
          onChange={(e) => onChange({ ...value, macros: { ...macros, fats: Number(e.target.value) } })}
          disabled={disabled}
          required
        />
      </label>
      <label>
        Углеводы*
        <input
          className="ui-input"
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={macros.carbs}
          onChange={(e) => onChange({ ...value, macros: { ...macros, carbs: Number(e.target.value) } })}
          disabled={disabled}
          required
        />
      </label>
    </div>
  );
};

export default ProductForm;


