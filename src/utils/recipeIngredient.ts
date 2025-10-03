import type { CreateRecipeIngredientDto } from '../types/recipe.types';
import type { ProductUnitType } from '../types/measures.types';

type AnyRecord = Record<string, unknown>;

type IngredientLike = AnyRecord;

export interface IngredientIdentifiers {
  id?: string;
  baseProductId?: string;
  variantId?: string;
  isVariant: boolean;
  fetchId?: string;
}

export type NormalizedFormIngredient = CreateRecipeIngredientDto & AnyRecord;

export const pickEntityId = (...candidates: unknown[]): string | undefined => {
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) return trimmed;
    }
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return String(candidate);
    }
  }
  return undefined;
};

const toRecord = (value: unknown): AnyRecord | undefined => {
  if (value && typeof value === 'object') {
    return value as AnyRecord;
  }
  return undefined;
};

export const resolveIngredientIdentifiers = (source: unknown): IngredientIdentifiers => {
  const record = toRecord(source);
  const variantRecord = toRecord(record?.variant);
  const ingredientRecord = toRecord(record?.ingredient);

  const variantId = pickEntityId(
    record?.variantId,
    variantRecord?.id,
    record?.productVariantId,
    record?.isVariant ? record?.id : undefined,
    record?.isVariate ? record?.id : undefined
  );

  const baseProductId = pickEntityId(
    record?.baseProductId,
    record?.productId,
    record?.ingredientId,
    ingredientRecord?.id,
    record?.originalProductId,
    record?.id
  );

  const id = pickEntityId(record?.id);
  const isVariant = Boolean(variantId || record?.isVariant || record?.isVariate);
  const fetchId = variantId || baseProductId || id;

  return {
    id,
    baseProductId: baseProductId || undefined,
    variantId: variantId || undefined,
    isVariant,
    fetchId: fetchId || undefined,
  };
};

export const normalizeIngredientFromApi = (source: unknown): NormalizedFormIngredient => {
  const record = toRecord(source) ?? {};
  const meta = resolveIngredientIdentifiers(record);
  const fallbackId = meta.fetchId ?? '';

  const normalized: NormalizedFormIngredient = {
    ...(record as AnyRecord),
    id: meta.id ?? fallbackId ?? '',
    count: Number(record.count ?? 0) || 0,
    productUnit: 'GRAM',
    productMeasureId: record.productMeasureId as string | undefined,
  } as NormalizedFormIngredient;

  const baseCandidate = meta.baseProductId
    ?? (record.baseProductId as string | undefined)
    ?? (record.productId as string | undefined)
    ?? (toRecord(record.ingredient)?.id as string | undefined)
    ?? fallbackId
    ?? normalized.id;
  (normalized as AnyRecord).baseProductId = baseCandidate;

  const rawProductUnit =
    record.productUnit ??
    record.measure ??
    (typeof record.measureName === 'string' ? record.measureName : undefined) ??
    (typeof record.unit === 'string' ? record.unit : undefined);
  if (typeof rawProductUnit === 'string' && rawProductUnit.trim()) {
    normalized.productUnit = rawProductUnit.trim() as ProductUnitType;
  }

  const measureRecord = toRecord(record.measure);
  const measureId = measureRecord?.id;
  if (!normalized.productMeasureId && typeof measureId === 'string' && measureId.trim().length > 0) {
    normalized.productMeasureId = measureId.trim();
  }

  if (meta.variantId) {
    (normalized as AnyRecord).variantId = meta.variantId;
    if (!(normalized as AnyRecord).variantName) {
      const variantRecord = toRecord(record.variant);
      const resolvedName =
        (record.variantName as string | undefined)
        ?? (variantRecord?.name as string | undefined)
        ?? (variantRecord?.title as string | undefined)
        ?? (variantRecord?.label as string | undefined)
        ?? (variantRecord?.product as AnyRecord | undefined)?.name;

      if (typeof resolvedName === 'string' && resolvedName.trim().length > 0) {
        (normalized as AnyRecord).variantName = resolvedName.trim();
      }
    }
  } else {
    delete (normalized as AnyRecord).variantId;
  }

  (normalized as AnyRecord).isVariant = meta.isVariant;

  return normalized;
};
