import React from 'react';
import ProductForm from '../ProductForm/ProductForm';
import type { ChangeProductVariantDto } from '../../../../types/api.types';

/**
 * Режимы работы редактора продукта.
 * - base: редактирование базового продукта
 * - variant: создание варианта продукта
 * - variant_update: обновление существующего варианта
 */
type Mode = 'base' | 'variant' | 'variant_update';

/**
 * Свойства компонента ProductEditor.
 */
interface ProductEditorProps {
  /** Текущий режим сохранения */
  mode: Mode;
  /** Текущее значение формы */
  value: ChangeProductVariantDto;
  /** Флаг загрузки/сохранения */
  loading?: boolean;
  /** Колбэк изменения формы */
  onChange: (next: ChangeProductVariantDto) => void;
  /** Колбэк сохранения (создание/обновление) */
  onSave: () => Promise<void> | void;
}

/**
 * Обёртка над ProductForm, отображающая форму продукта и кнопку сохранения
 * в зависимости от выбранного режима (база/вариант/обновление варианта).
 */
const ProductEditor: React.FC<ProductEditorProps> = ({ mode, value, onChange, onSave, loading }) => {
  return (
    <div style={{ marginTop: 24 }}>
      <ProductForm mode={mode === 'base' ? 'base' : 'variant'} value={value} onChange={onChange} />
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="ui-btn ui-btn--primary"
          onClick={() => onSave()}
          disabled={!!loading}
        >
          {mode === 'variant' ? 'Создать вариант' : mode === 'base' ? 'Сохранить базовый продукт' : 'Обновить вариант'}
        </button>
      </div>
    </div>
  );
};

export default ProductEditor;


