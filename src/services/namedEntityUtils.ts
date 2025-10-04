export interface NamedEntityDto {
  id: string;
  name: string;
}

const asRecord = (value: unknown): Record<string, unknown> | null => {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
};

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return null;
};

const extractArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  if (!record) return [];
  for (const key of ['data', 'content', 'items', 'list', 'results']) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

export const normalizeNamedEntities = (payload: unknown): NamedEntityDto[] => {
  return extractArray(payload)
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      const id = asNonEmptyString(record.id ?? record.uuid ?? record.value ?? record.key);
      if (!id) return null;
      const name = asNonEmptyString(record.name ?? record.title ?? record.label ?? record.displayName);
      if (!name) return null;
      return { id, name } satisfies NamedEntityDto;
    })
    .filter((entity): entity is NamedEntityDto => entity !== null);
};

export const ensureNamedEntityArray = <T extends NamedEntityDto>(payload: unknown): T[] => {
  return normalizeNamedEntities(payload) as T[];
};
