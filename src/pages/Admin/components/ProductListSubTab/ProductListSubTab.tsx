import React, { useCallback, useEffect, useMemo, useState } from 'react';
import EditableTable, { type EditableRow } from '../EditableTable/EditableTable';
import { productsService } from '../../../../services';
import type { UpdateProductDto, ProductMeasureResponseDto, UpdateBaseProductMeasureDto, AddBaseProductMeasureDto, ChangeProductVariantDto, AddProductVariantMeasureDto } from '../../../../types/api.types';
import ProductForm from '../ProductForm/ProductForm';
import ProductEditor from '../ProductEditor/ProductEditor';
import ModeSwitch from '../ModeSwitch/ModeSwitch';
import { PRODUCT_UNITS_ARRAY } from '../../../../constants/measures';
import MeasuresTable, { type MeasureRow } from '../MeasuresTable/MeasuresTable';
import AddBaseMeasureForm from '../AddBaseMeasureForm/AddBaseMeasureForm';
import AddVariantMeasureForm from '../AddVariantMeasureForm/AddVariantMeasureForm';
import SearchBar from '../SearchBar/SearchBar';
import styles from './ProductListSubTab.module.css';
import { useProductEditing } from './hooks/useProductEditing';
import { useVariantEditing } from './hooks/useVariantEditing';
import ListPaginationControls from '../../../../components/ListPaginationControls/ListPaginationControls';

const PAGE_SIZE = 20;

const ProductListSubTab: React.FC = () => {
  const {
    rows,
    editing,
    setEditing,
    loading,
    updatingId,
    setUpdatingId,
    error,
    setError,
    editingId,
    setEditingId,
    form,
    setForm,
    measures,
    setMeasures,
    baseMeasures,
    setBaseMeasures,
    measureEditing,
    setMeasureEditing,
    newMeasure,
    setNewMeasure,
    fetchAll,
    searchByName,
    handleSaveRow,
    openEdit,
    saveMeasure,
    addBaseMeasure,
  } = useProductEditing();

  const {
    variant,
    setVariant,
    createMode,
    setCreateMode,
    allVariants,
    selectedVariantId,
    setSelectedVariantId,
    newVariantMeasure,
    setNewVariantMeasure,
    newVariantUnitName,
    setNewVariantUnitName,
    measures: variantMeasures,
    setMeasureEditing: setVariantMeasureEditing,
    measureEditing: variantMeasureEditing,
    loadVariant,
    loadVariantsByProduct,
    addVariantMeasure,
  } = useVariantEditing();
  const baseFormValue = form ?? { name: '', description: '', categoryId: null, photo: null, macros: { calories: 0, proteins: 0, fats: 0, carbs: 0, isEmpty: false } };

  // Доступные к добавлению единицы для варианта считаем здесь (зависим от baseMeasures из product-хука)
  const availableVariantUnitOptions = useMemo(() => {
    const currentMeasures = createMode === 'variant_update' ? variantMeasures : measures;
    const existingNames = new Set(currentMeasures.map((m) => m.name));
    const allowedBaseNames = new Set(baseMeasures.filter((b) => !existingNames.has(b.name)).map((b) => b.name));
    return PRODUCT_UNITS_ARRAY.filter((u) => allowedBaseNames.has(u.label));
  }, [baseMeasures, measures, variantMeasures, createMode]);

  // При выборе варианта в режиме обновления — подтянуть его данные и меры
  useEffect(() => {
    if (createMode !== 'variant_update') return;
    if (!selectedVariantId) return;
    void loadVariant(selectedVariantId);
  }, [createMode, selectedVariantId, loadVariant]);

  // Корректируем выбранную единицу при изменении доступных опций
  useEffect(() => {
    if (createMode !== 'variant_update') return;
    const currentOk = availableVariantUnitOptions.some((o) => o.label === newVariantUnitName);
    const first = availableVariantUnitOptions[0]?.label;
    if (!currentOk && first) {
      setNewVariantUnitName(first);
      const found = baseMeasures.find((m) => m.name === first);
      setNewVariantMeasure((prev) => ({ ...prev, baseMeasureId: found?.id ?? '' }));
    }
  }, [availableVariantUnitOptions, createMode]);

  // fetchAll и searchByName приходят из useProductEditing

  useEffect(() => {
    // При выходе из режима variant_update — вернуть базовые меры продукта
    const restoreBase = async () => {
      if (createMode === 'variant_update') return;
      if (!editingId) return;
      try {
        const ms = await productsService.getBaseMeasures(editingId);
        setMeasures(ms);
      } catch {}
    };
    void restoreBase();
  }, [createMode, editingId, setMeasures]);

  const [search, setSearch] = useState<string>('');
  const handleSave = handleSaveRow;

  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [perPage, setPerPage] = useState<number>(PAGE_SIZE);

  const displayedRows = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount]);
  const hasMore = visibleCount < rows.length;

  useEffect(() => {
    setVisibleCount(perPage);
  }, [rows, perPage]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + perPage, rows.length));
  }, [rows.length, perPage]);

  // Источник мер и их редактирования в зависимости от режима
  const displayedMeasures = createMode === 'variant_update' ? variantMeasures : measures;
  const displayedMeasureEditing = createMode === 'variant_update' ? (variantMeasureEditing as unknown as Record<string, MeasureRow>) : (measureEditing as unknown as Record<string, MeasureRow>);

  // Базовые поля редактируются через универсальную ProductForm ниже

  return (
    <div>
      {error && <div className={styles.error}>{error}</div>}
      <SearchBar
        value={search}
        placeholder="Поиск продуктов (мин. 3 символа)"
        loading={loading}
        onChange={(v) => {
          setSearch(v);
          void searchByName(v.trim());
        }}
        onRefresh={() => fetchAll()}
      />
      <EditableTable
        rows={displayedRows}
        editing={editing}
        setEditing={setEditing}
        updatingId={updatingId}
        onSave={handleSave}
        enableSave={false}
        loading={loading}
        emptyText="Продукты не найдены"
        enableCopyId
        onCopyId={(id: string) => navigator.clipboard.writeText(id)}
        onEditClick={async (id: string) => {
          setCreateMode('base');
          setSelectedVariantId('');
          // открыть базовый продукт для редактирования
          await openEdit(id);
          await loadVariantsByProduct(id);
        }}
      />
      <div className={styles.paginationWrapper}>
        <ListPaginationControls
          summary={`Показано ${displayedRows.length} из ${rows.length}`}
          hasMore={hasMore}
          onLoadMore={hasMore ? handleLoadMore : undefined}
          buttonLabel="Показать ещё продукты"
          finishedLabel="Все продукты загружены"
          perPageValue={perPage}
          onPerPageChange={setPerPage}
          perPageLabel="Показывать по"
        />
      </div>
      {editingId && form && (
        <div className={styles.mt16}>
          <div className={styles.actionsRow}>
            <button className={`ui-btn ui-btn--ghost ${styles.ml8}`} type="button" onClick={() => setEditingId(null)}>
              Отмена
            </button>
          </div>
          {/* Таблица мер продукта */}
          <div className={styles.mt16}>
            <div className={styles.row}>
              <h4 className={styles.sectionTitle}>Базовые меры</h4>
            </div>
            <MeasuresTable
              measures={displayedMeasures as MeasureRow[]}
              editing={displayedMeasureEditing}
              onChange={(id, next) => {
                if (createMode === 'variant_update') {
                  setVariantMeasureEditing((prev) => ({ ...prev, [id]: { ...(prev[id] ?? (displayedMeasures.find(m => m.id === id) as any)), ...(next as any) } }));
                } else {
                  setMeasureEditing((prev) => ({ ...prev, [id]: { ...(prev[id] ?? (displayedMeasures.find(m => m.id === id) as any)), ...(next as any) } }));
                }
              }}
              onSave={saveMeasure}
              disabled={!!updatingId}
            />
            {createMode !== 'variant_update' && (
              <AddBaseMeasureForm
                value={newMeasure}
                disabled={!!updatingId}
                onChange={setNewMeasure}
                onSubmit={addBaseMeasure}
              />
            )}
            {/* Форма добавления меры варианта (только в режиме variant_update) */}
            {createMode === 'variant_update' && (
              <AddVariantMeasureForm
                unitName={newVariantUnitName}
                baseMeasureId={newVariantMeasure.baseMeasureId}
                weight={newVariantMeasure.weight}
                density={newVariantMeasure.density}
                availableUnitLabels={availableVariantUnitOptions.map(u => u.label)}
                onChange={(next) => {
                  setNewVariantUnitName(next.unitName);
                  // автоподбор baseMeasureId по названию
                  const found = baseMeasures.find((m) => m.name === next.unitName);
                  setNewVariantMeasure({ baseMeasureId: found?.id ?? '', weight: next.weight, density: next.density });
                }}
                onSubmit={addVariantMeasure}
                disabled={!!updatingId}
              />
            )}
            {/* Форма варианта продукта */}
            <div style={{ marginTop: 24 }}>
              <ModeSwitch
                mode={createMode}
                variants={allVariants}
                selectedVariantId={selectedVariantId}
                onModeChange={(m) => setCreateMode(m)}
                onVariantChange={(id) => setSelectedVariantId(id)}
              />
              <ProductEditor
                mode={createMode}
                value={createMode === 'base' ? (baseFormValue as unknown as ChangeProductVariantDto) : variant}
                loading={!!updatingId}
                onChange={(next) => {
                  if (createMode !== 'base') {
                    setVariant({ ...variant, ...next });
                  } else if (form) {
                    setForm({ ...form, ...next });
                  } else {
                    setForm({ ...next });
                  }
                }}
                onSave={async () => {
                  if (!editingId) return;
                  try {
                    setUpdatingId(editingId);
                    if (createMode === 'variant') {
                      await productsService.saveProductVariant(editingId, variant);
                    } else if (createMode === 'base' && form) {
                      await productsService.updateProduct(editingId, form);
                    } else if (createMode === 'variant_update' && selectedVariantId) {
                      await productsService.updateProductVariant(selectedVariantId, variant);
                    }
                  } catch (e) {
                    setError('Не удалось сохранить данные');
                  } finally {
                    setUpdatingId(null);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListSubTab;
