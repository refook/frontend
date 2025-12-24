/**
 * Node.js скрипт для извлечения уникальных компонентов из описаний продуктов
 * 
 * Читает файл products-calorizator-html copy.json, парсит поле description каждого продукта,
 * извлекает все компоненты (включая вложенные в скобках) и создает JSON файл
 * с уникальными компонентами и подсчетом частоты использования.
 * 
 * Использование:
 * npm run extract-components:calorizator
 * или
 * node scripts_parsing/products_variant/extract-components.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'products-calorizator-html copy.json');
const OUTPUT_FILE = path.join(__dirname, 'components-calorizator.json');

/**
 * Очищает описание от префиксов типа "Состав:", "следующие ингредиенты:" и т.д.
 */
function cleanDescription(description) {
  if (!description || typeof description !== 'string') {
    return '';
  }

  // Удаляем различные префиксы
  let cleaned = description
    .replace(/^Состав\s*:\s*/i, '')
    .replace(/^.*?следующие\s+ингредиенты\s*:\s*/i, '')
    .replace(/^.*?в\s+состав\s+.*?входят\s*:\s*/i, '')
    .replace(/^.*?в\s+составе\s+.*?присутствуют\s*:\s*/i, '')
    .replace(/^.*?содержит\s+следующие\s+ингредиенты\s*:\s*/i, '')
    .replace(/^.*?в\s+состав\s+продукта\s+входят\s+/i, '')
    .replace(/^.*?в\s+состав\s+продукта\s+входит\s+/i, '')
    .replace(/^.*?в\s+составе\s+продукта\s*:\s*/i, '')
    .replace(/^.*?содержат\s+/i, '')
    .replace(/^.*?содержит\s+/i, '')
    .replace(/^.*?а\s+также\s+минеральных\s+веществ\s+таких\s+как\s*:\s*/i, '')
    .replace(/^.*?химический\s+состав\s+.*?включает\s+в\s+себя\s*:\s*/i, '')
    .replace(/^.*?а\s+также\s+/i, '')
    .replace(/^.*?витамины\s*:\s*/i, '')
    .replace(/^.*?необходимые\s+человеческому\s+организму\s+минеральные\s+вещества\s*:\s*/i, '')
    .replace(/\s+следующий\s*:\s*/gi, ' ') // Удаляем "следующий:" в середине текста
    .trim();

  return cleaned;
}

/**
 * Проверяет, является ли компонент валидным (не фразой, не служебным текстом)
 */
function isValidComponent(component) {
  if (!component || component.length < 2) {
    return false;
  }

  // Список фраз, которые не являются компонентами
  const invalidPhrases = [
    'помимо замечательного вкуса',
    'чем животных',
    'поэтому кровеносным сосудам оно не вредит',
    'в частности',
    'в состав продукта входят',
    'в состав продукта входит',
    'содержат',
    'содержит',
    'входят',
    'входит',
    'присутствуют',
    'присутствует',
    'состав катыка разный',
    '2% жирности людям с избыточным весом',
    'как любой другой кисломолочный продукт',
    'катык 6% положительно влияет систему органов пищеварения',
    'нормализует микрофлору',
    'способствует очищению',
    'состав каши 3 злака nestle молочная с яблоком',
    'способности вызвать чувство насыщения',
    'необходимого для регенерации кожи',
    'поэтому их добавляют при варке холодца',
    'крылья в kfc – это куриные крылышки',
    'на 1-2 костях',
    'которые обжариваются во фритюре в особой острой панировке',
    'рецепт которой является тайной компании',
    'calorizator',
    'аромата',
    'ароматизаторы'
  ];
  
  // Фразы-префиксы, которые нужно удалять из начала компонента
  const prefixPhrases = [
    'а также минеральных веществ таких как:',
    'химический состав.*?включает в себя:',
    'а также',
    'витамины:',
    'в состав продукта входят',
    'в состав продукта входит',
    'содержат',
    'содержит'
  ];

  const lowerComponent = component.toLowerCase().trim();
  
  // Проверяем, не является ли компонент одной из недопустимых фраз
  for (const phrase of invalidPhrases) {
    if (lowerComponent === phrase || lowerComponent.startsWith(phrase + ' ')) {
      return false;
    }
  }

  // Проверяем, не содержит ли компонент предложения с глаголами действия
  // (это обычно не компоненты, а описания)
  const actionVerbs = [
    'позволяет',
    'влияет',
    'нормализует',
    'способствует',
    'употреблять',
    'разный',
    'жирности людям',
    'вызвать',
    'необходимого для',
    'добавляют',
    'обжариваются',
    'является',
    'рецепт которой',
    'которые',
    'на костях',
    'во фритюре',
    'в особой',
    'такой как',
    'такие как'
  ];
  
  // Паттерны описательных фраз
  const descriptivePatterns = [
    /способности\s+.*?насыщения/i,
    /необходимого\s+для\s+/i,
    /поэтому\s+их\s+/i,
    /которые\s+обжариваются/i,
    /рецепт\s+которой/i,
    /на\s+\d+[-\s]\d+\s+костях/i,
    /–\s+это\s+/i,
    /такой\s+как/i,
    /такие\s+как/i
  ];
  
  // Проверяем паттерны описательных фраз
  for (const pattern of descriptivePatterns) {
    if (pattern.test(lowerComponent)) {
      return false;
    }
  }
  
  for (const verb of actionVerbs) {
    if (lowerComponent.includes(verb)) {
      // Если это короткая фраза с глаголом, скорее всего это не компонент
      if (lowerComponent.length < 100) {
        return false;
      }
    }
  }

  // Если компонент начинается с недопустимых фраз, удаляем их
  let cleaned = component;
  for (const phrase of invalidPhrases) {
    const regex = new RegExp(`^${phrase}\\s+`, 'i');
    cleaned = cleaned.replace(regex, '');
  }
  
  // Удаляем префиксы
  for (const prefix of prefixPhrases) {
    // Экранируем специальные символы для regex, кроме уже существующих паттернов
    let escapedPrefix = prefix;
    if (!prefix.includes('.*?')) {
      escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    const regex = new RegExp(`^${escapedPrefix}\\s*:?\\s*`, 'i');
    cleaned = cleaned.replace(regex, '');
  }

  // Удаляем предложения, которые начинаются с точки и содержат глаголы
  // Например: ". Как любой другой кисломолочный продукт"
  cleaned = cleaned.replace(/^\.\s+[А-ЯЁ].*?$/, '');
  
  // Удаляем части после точки, если они содержат глаголы действия
  // Например: "цинк. Достаточно низкая калорийность позволяет..."
  const dotIndex = cleaned.indexOf('. ');
  if (dotIndex > 0 && dotIndex < cleaned.length - 10) {
    // Проверяем, есть ли после точки глаголы действия
    const afterDot = cleaned.substring(dotIndex + 2).toLowerCase();
    for (const verb of actionVerbs) {
      if (afterDot.includes(verb)) {
        // Обрезаем до точки
        cleaned = cleaned.substring(0, dotIndex);
        break;
      }
    }
  }

  // Если после очистки ничего не осталось, компонент невалиден
  if (cleaned.trim().length < 2) {
    return false;
  }

  return cleaned.trim();
}

/**
 * Нормализует компонент: убирает лишние пробелы, точки в конце, обрабатывает проценты
 */
function normalizeComponent(component) {
  if (!component || typeof component !== 'string') {
    return '';
  }

  let normalized = component
    .trim()
    .replace(/\.+$/, '') // Убираем точки в конце
    .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
    .trim();

  // Обрабатываем проценты: если компонент заканчивается на процент, оставляем его
  // Например: "молоко 99%" -> "молоко 99%"
  // Но если это просто "99%" без названия, это не компонент
  if (/^\d+%$/.test(normalized)) {
    return ''; // Только процент без названия - невалидный компонент
  }

  // Если компонент начинается только с процента без названия, это не компонент
  if (/^\d+%\s*$/.test(normalized)) {
    return ''; // Только процент - невалидный компонент
  }

  // Удаляем фразы-префиксы
  normalized = normalized
    .replace(/^в\s+состав\s+продукта\s+входят\s+/i, '')
    .replace(/^в\s+состав\s+продукта\s+входит\s+/i, '')
    .replace(/^содержат\s+/i, '')
    .replace(/^содержит\s+/i, '')
    .replace(/^а\s+также\s+минеральных\s+веществ\s+таких\s+как\s*:\s*/i, '')
    .replace(/^химический\s+состав\s+.*?включает\s+в\s+себя\s*:\s*/i, '')
    .replace(/^а\s+также\s+/i, '')
    .replace(/^витамины\s*:\s*/i, '')
    .replace(/^необходимые\s+человеческому\s+организму\s+минеральные\s+вещества\s*:\s*/i, '')
    .trim();

  return normalized;
}

/**
 * Рекурсивно извлекает компоненты из строки, учитывая вложенные скобки
 * Возвращает массив компонентов
 */
function extractComponents(text) {
  const components = [];
  
  if (!text || typeof text !== 'string') {
    return components;
  }

  // Функция для парсинга с учетом скобок
  function parseWithBrackets(str, startIndex = 0) {
    const result = [];
    let current = '';
    let bracketDepth = 0;
    let i = startIndex;
    let bracketStart = -1;

    while (i < str.length) {
      const char = str[i];

      if (char === '(') {
        if (bracketDepth === 0) {
          // Сохраняем компонент перед скобкой
          const componentBeforeBracket = current.trim();
          if (componentBeforeBracket) {
            const mainComponent = normalizeComponent(componentBeforeBracket);
            if (mainComponent) {
              // Проверяем, является ли это категорией компонента (краситель, ароматизатор, усилитель вкуса)
              const lowerMain = mainComponent.toLowerCase().trim();
              const isCategory = /^(краситель|ароматизатор|ароматизаторы|усилитель\s+вкуса|усилители\s+вкуса|усилитель\s+вкуса\s+и\s+аромата|усилители\s+вкуса\s+и\s+аромата)$/i.test(lowerMain);
              
              if (!isCategory) {
                // Если это не категория, добавляем компонент
                result.push(mainComponent);
              }
              // Если это категория, не добавляем сам компонент, только содержимое скобок
            }
          }
          bracketStart = i;
          current = '';
        }
        bracketDepth++;
      } else if (char === ')') {
        bracketDepth--;
        if (bracketDepth === 0) {
          // Извлекаем содержимое скобок рекурсивно
          // Находим содержимое между bracketStart+1 и текущей позицией
          const bracketContent = str.substring(bracketStart + 1, i);
          const nestedComponents = parseWithBrackets(bracketContent, 0);
          result.push(...nestedComponents);
          bracketStart = -1;
          current = '';
        }
      } else if ((char === ',' || char === ';') && bracketDepth === 0) {
        // Запятая или точка с запятой на верхнем уровне - разделитель компонентов
        if (current.trim()) {
          const component = normalizeComponent(current);
          if (component) {
            result.push(component);
          }
        }
        current = '';
      } else if (char === '.' && bracketDepth === 0) {
        // Точка может быть разделителем, если после нее идет заглавная буква или слово "Витамины"
        const nextChar = i < str.length - 1 ? str[i + 1] : '';
        const nextFewChars = i < str.length - 10 ? str.substring(i + 1, i + 11).toLowerCase() : '';
        
        // Проверяем, является ли точка разделителем компонентов
        // (после точки пробел и заглавная буква или слово "Витамины")
        if (nextChar === ' ' && (
          /[А-ЯЁA-Z]/.test(str[i + 2]) || 
          /витамины/i.test(nextFewChars)
        )) {
          if (current.trim()) {
            const component = normalizeComponent(current);
            if (component) {
              result.push(component);
            }
          }
          current = '';
        } else {
          // Обычная точка в тексте, добавляем ее
          current += char;
        }
      } else if (bracketDepth === 0) {
        // Добавляем символ только если мы не внутри скобок
        current += char;
      }
      i++;
    }

    // Добавляем последний компонент
    if (current.trim() && bracketDepth === 0) {
      const component = normalizeComponent(current);
      if (component) {
        result.push(component);
      }
    }

    return result;
  }

  const parsed = parseWithBrackets(text);
  
  // Разбиваем компоненты, содержащие "и" на отдельные компоненты
  const splitComponents = [];
  for (const comp of parsed) {
    // Ищем "и" как отдельное слово (окруженное пробелами или в начале/конце)
    const andRegex = /\s+и\s+/i;
    if (andRegex.test(comp)) {
      // Разбиваем по "и"
      const parts = comp.split(andRegex);
      for (const part of parts) {
        if (part.trim()) {
          splitComponents.push(part.trim());
        }
      }
    } else {
      splitComponents.push(comp);
    }
  }
  
  // Фильтруем пустые компоненты, нормализуем и проверяем валидность
  const validComponents = [];
  for (const comp of splitComponents) {
    const normalized = normalizeComponent(comp);
    if (normalized && normalized.length > 0) {
      const validated = isValidComponent(normalized);
      if (validated) {
        validComponents.push(validated);
      }
    }
  }
  
  return validComponents;
}

/**
 * Основная функция извлечения компонентов
 */
function extractAllComponents() {
  console.log('🚀 Запуск извлечения компонентов из описаний продуктов...\n');

  // Проверяем существование входного файла
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Файл не найден: ${INPUT_FILE}`);
  }

  // Читаем JSON файл
  console.log(`📖 Чтение файла: ${INPUT_FILE}`);
  const fileContent = fs.readFileSync(INPUT_FILE, 'utf-8');
  const products = JSON.parse(fileContent);

  console.log(`📊 Всего продуктов в файле: ${products.length}`);

  // Словарь для подсчета частоты компонентов
  const componentsMap = new Map();

  let processedCount = 0;
  let skippedCount = 0;

  // Обрабатываем каждый продукт
  for (const product of products) {
    const description = product.description;

    if (!description || typeof description !== 'string' || description.trim() === '') {
      skippedCount++;
      continue;
    }

    // Очищаем описание
    const cleaned = cleanDescription(description);

    if (!cleaned) {
      skippedCount++;
      continue;
    }

    // Извлекаем компоненты
    const components = extractComponents(cleaned);

    // Добавляем компоненты в словарь с подсчетом частоты
    const uniqueComponentsInProduct = new Set();
    for (const component of components) {
      if (component && component.length > 0) {
        uniqueComponentsInProduct.add(component);
      }
    }

    // Увеличиваем счетчик для каждого уникального компонента в этом продукте
    for (const component of uniqueComponentsInProduct) {
      const currentCount = componentsMap.get(component) || 0;
      componentsMap.set(component, currentCount + 1);
    }

    processedCount++;

    // Прогресс каждые 1000 продуктов
    if (processedCount % 1000 === 0) {
      console.log(`   Обработано: ${processedCount}/${products.length}`);
    }
  }

  console.log(`\n✅ Обработано продуктов: ${processedCount}`);
  console.log(`⚠️  Пропущено (без описания): ${skippedCount}`);

  // Преобразуем Map в массив объектов, фильтруем компоненты с count = 1 и сортируем по частоте (по убыванию)
  const componentsArray = Array.from(componentsMap.entries())
    .map(([name, count]) => ({ name, count }))
    .filter(comp => comp.count > 1) // Фильтруем компоненты с count = 1
    .sort((a, b) => b.count - a.count);

  console.log(`\n📦 Уникальных компонентов (count > 1): ${componentsArray.length}`);

  // Выводим топ-10 самых частых компонентов
  console.log('\n🏆 Топ-10 самых частых компонентов:');
  componentsArray.slice(0, 10).forEach((comp, index) => {
    console.log(`   ${index + 1}. ${comp.name} (${comp.count} продуктов)`);
  });

  // Сохраняем результат
  const jsonOutput = JSON.stringify(componentsArray, null, 2);
  fs.writeFileSync(OUTPUT_FILE, jsonOutput, 'utf-8');

  console.log(`\n💾 Результат сохранен в: ${OUTPUT_FILE}`);
  console.log(`\n✨ Итоговая статистика:`);
  console.log(`   Всего продуктов: ${products.length}`);
  console.log(`   Обработано: ${processedCount}`);
  console.log(`   Пропущено: ${skippedCount}`);
  console.log(`   Уникальных компонентов: ${componentsArray.length}`);

  return componentsArray;
}

// Запуск извлечения
try {
  extractAllComponents();
  console.log('\n🎉 Извлечение компонентов завершено успешно!');
  process.exit(0);
} catch (error) {
  console.error('\n💥 Ошибка:', error);
  process.exit(1);
}

