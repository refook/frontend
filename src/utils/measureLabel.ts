const MEASURE_SHORTCUTS: Record<string, string> = {
  'миллилитры': 'Мл',
  'миллилитр': 'Мл',
  'мл': 'МЛ',
  'граммы': 'Гр',
  'грамм': 'Гр',
  'гр': 'Гр',
  'килограммы': 'Кг',
  'килограмм': 'Кг',
  'кг': 'Кг',
  'штука': 'Шт',
  'штуки': 'Шт',
  'шт': 'Шт',
  'литры': 'Л',
  'литр': 'Л',
  'л': 'Л',
  'чайная ложка': 'ч.л.',
  'чайные ложки': 'ч.л.',
  'столовая ложка': 'ст.л.',
  'столовые ложки': 'ст.л.',
  'стакан': 'стак.',
  'миллиграмм': 'Мг',
};

/**
 * Приводит название меры к сокращенному виду, если есть соответствие в словаре.
 */
export const formatMeasureLabel = (label?: string | null): string => {
  if (!label) return '';
  const trimmed = label.trim();
  if (!trimmed) return '';
  const normalized = trimmed.toLowerCase();
  return MEASURE_SHORTCUTS[normalized] ?? trimmed;
};

export default formatMeasureLabel;
