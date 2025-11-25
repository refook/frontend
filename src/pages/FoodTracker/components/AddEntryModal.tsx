import React from 'react';
import Tabs from '../../../components/Tabs/Tabs';
import BottomSheet from './BottomSheet';
import styles from '../../FoodTrackerPage.module.css';
import type { ModalTab, PortionUnit } from '../types';
import type { ProductMeasureResponseDto, ProductResponseDto, Recipe } from '../../../types';

type ProductSelections = Record<string, { measureId?: string; amount: string }>;
type ProductMeasures = Record<string, ProductMeasureResponseDto[]>;

interface AddEntryModalProps {
  isOpen: boolean;
  mealLabel: string;
  activeTab: ModalTab;
  onTabChange: (tab: ModalTab) => void;
  onClose: () => void;
  productQuery: string;
  onProductQueryChange: (value: string) => void;
  productResults: ProductResponseDto[];
  productMeasures: ProductMeasures;
  productSelections: ProductSelections;
  onProductSelectionChange: (productId: string, selection: { measureId?: string; amount: string }) => void;
  onProductSearch: (query: string) => void;
  onAddProduct: (product: ProductResponseDto) => void;
  loadingProduct: boolean;
  recipeQuery: string;
  onRecipeQueryChange: (value: string) => void;
  recipeResults: Recipe[];
  recipeAmount: string;
  recipeUnit: PortionUnit;
  onRecipeAmountChange: (value: string) => void;
  onRecipeUnitChange: (value: PortionUnit) => void;
  onRecipeSearch: (query: string) => void;
  onAddRecipe: (recipe: Recipe) => void;
  loadingRecipe: boolean;
  manualName: string;
  manualCalories: string;
  onManualNameChange: (value: string) => void;
  onManualCaloriesChange: (value: string) => void;
  onManualAdd: () => void;
  error?: string | null;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  mealLabel,
  activeTab,
  onTabChange,
  onClose,
  productQuery,
  onProductQueryChange,
  productResults,
  productMeasures,
  productSelections,
  onProductSelectionChange,
  onProductSearch,
  onAddProduct,
  loadingProduct,
  recipeQuery,
  onRecipeQueryChange,
  recipeResults,
  recipeAmount,
  recipeUnit,
  onRecipeAmountChange,
  onRecipeUnitChange,
  onRecipeSearch,
  onAddRecipe,
  loadingRecipe,
  manualName,
  manualCalories,
  onManualNameChange,
  onManualCaloriesChange,
  onManualAdd,
  error,
}) => {
  const renderProductTab = () => (
    <div className={styles.formSection}>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          placeholder="Введите продукт"
          value={productQuery}
          onChange={(e) => onProductQueryChange(e.target.value)}
        />
        <button
          className={styles.submitButton}
          onClick={() => onProductSearch(productQuery)}
          type="button"
        >
          Поиск
        </button>
      </div>
      {loadingProduct && <span className={styles.hint}>Загрузка...</span>}
      {productResults.length > 0 && (
        <div className={styles.resultsList}>
          {productResults.map((product) => (
            <div key={product.id} className={styles.resultItem}>
              <div className={styles.resultMeta}>
                <span className={styles.resultTitle}>{product.name}</span>
                <span className={styles.hint}>
                  {product.macros?.calories ?? 0} ккал
                </span>
                {productMeasures[product.id] && productMeasures[product.id].length > 0 && (
                  <div className={styles.amountRow}>
                    <input
                      className={styles.input}
                      placeholder="Кол-во"
                      value={productSelections[product.id]?.amount ?? '1'}
                      onChange={(e) =>
                        onProductSelectionChange(product.id, {
                          measureId:
                            productSelections[product.id]?.measureId ??
                            productMeasures[product.id][0]?.id,
                          amount: e.target.value,
                        })
                      }
                      type="number"
                      min="0"
                      step="1"
                    />
                    <select
                      className={styles.select}
                      value={
                        productSelections[product.id]?.measureId ??
                        productMeasures[product.id][0]?.id
                      }
                      onChange={(e) =>
                        onProductSelectionChange(product.id, {
                          measureId: e.target.value,
                          amount: productSelections[product.id]?.amount ?? '1',
                        })
                      }
                    >
                      {productMeasures[product.id].map((measure) => (
                        <option key={measure.id} value={measure.id}>
                          {measure.name} ({measure.weight} г)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                className={styles.addButton}
                onClick={() => onAddProduct(product)}
                type="button"
                aria-label="Добавить продукт"
              >
                +
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRecipeTab = () => (
    <div className={styles.formSection}>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          placeholder="Название рецепта"
          value={recipeQuery}
          onChange={(e) => onRecipeQueryChange(e.target.value)}
        />
        <div className={styles.amountRow}>
          <input
            className={styles.input}
            placeholder="Кол-во"
            value={recipeAmount}
            onChange={(e) => onRecipeAmountChange(e.target.value)}
            type="number"
            min="0"
            step="1"
          />
          <select
            className={styles.select}
            value={recipeUnit}
            onChange={(e) => onRecipeUnitChange(e.target.value as PortionUnit)}
          >
            <option value="portion">порции</option>
            <option value="gram">граммы</option>
            <option value="piece">штуки</option>
          </select>
        </div>
        <button
          className={styles.submitButton}
          onClick={() => onRecipeSearch(recipeQuery)}
          type="button"
        >
          Поиск
        </button>
      </div>
      {loadingRecipe && <span className={styles.hint}>Загрузка...</span>}
      {recipeResults.length > 0 && (
        <div className={styles.resultsList}>
          {recipeResults.map((recipe) => (
            <div key={recipe.id} className={styles.resultItem}>
              <div className={styles.resultMeta}>
                <span className={styles.resultTitle}>{recipe.title}</span>
                <span className={styles.hint}>
                  {recipe.macros?.calories ?? 0} ккал
                </span>
              </div>
              <button
                className={styles.addButton}
                onClick={() => onAddRecipe(recipe)}
                type="button"
                aria-label="Добавить рецепт"
              >
                +
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderManualTab = () => (
    <div className={styles.formSection}>
      <input
        className={styles.input}
        placeholder="Название блюда"
        value={manualName}
        onChange={(e) => onManualNameChange(e.target.value)}
      />
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          placeholder="Калории, ккал"
          value={manualCalories}
          onChange={(e) => onManualCaloriesChange(e.target.value)}
          type="number"
          min="0"
          step="1"
        />
        <button
          className={styles.submitButton}
          onClick={onManualAdd}
          type="button"
        >
          Добавить
        </button>
      </div>
    </div>
  );

  const modalTabs = [
    {
      id: 'product',
      label: 'Продукт',
      title: 'Поиск продукта',
      render: renderProductTab,
    },
    {
      id: 'recipe',
      label: 'Рецепт',
      title: 'Рецепт из базы',
      render: renderRecipeTab,
    },
    {
      id: 'manual',
      label: 'Быстро',
      title: 'Быстрое добавление',
      render: renderManualTab,
    },
  ];

  if (!isOpen) return null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Добавление"
      subtitle={`Добавить в ${mealLabel}`}
    >
      <Tabs
        initial={activeTab}
        onChange={(id) => onTabChange(id as ModalTab)}
        tabs={modalTabs}
        ariaLabel="Выбор способа добавления блюда"
      />
      {error && <span className={styles.hint}>{error}</span>}
    </BottomSheet>
  );
};

export default AddEntryModal;
