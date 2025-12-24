/**
 * Node.js скрипт для парсинга данных продуктов из файла row_date_copy.json
 * 
 * Файл содержит данные в формате TSV (tab-separated values):
 * Название<TAB>Название<TAB>Белки<TAB>Жиры<TAB>Углеводы<TAB>Калории
 * 
 * Использование:
 * npm run parse-products:calorizator-file
 * или
 * node scripts_parsing/products_variant/parse-calorizator-from-file.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDefaultMeasure() {
  // Всегда возвращаем граммы для всех продуктов
  return {
    name: 'Грамм',
    weight: 100,
    isDefault: true,
    density: 1
  };
}

function normalizeNumber(value) {
  if (!value) return 0;
  const normalized = String(value).replace(',', '.').trim();
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? 0 : num;
}

function parseProductsFromFile() {
  console.log('🚀 Запуск парсинга продуктов из файла row_date_copy.json...\n');

  const inputPath = path.join(__dirname, 'row_date_copy.json');
  const outputPath = path.join(__dirname, 'products-calorizator.json');

  // Проверяем существование файла
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Файл не найден: ${inputPath}`);
  }

  console.log(`📖 Чтение файла: ${inputPath}`);
  const fileContent = fs.readFileSync(inputPath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim().length > 0);

  console.log(`📊 Найдено строк: ${lines.length}`);

  const products = [];
  const skippedProducts = []; // Массив для хранения информации о пропущенных продуктах

  lines.forEach((line, index) => {
    try {
      // Разделяем строку по табуляции
      const parts = line.split('\t');
      
      let name, proteins, fats, carbs, calories;
      
      // Поддерживаем два формата:
      // Формат 1 (6 колонок): Название<TAB>Название<TAB>Белки<TAB>Жиры<TAB>Углеводы<TAB>Калории
      // Формат 2 (5 колонок): Название<TAB>Белки<TAB>Жиры<TAB>Углеводы<TAB>Калории
      if (parts.length === 6) {
        // Название дублируется, используем parts[1]
        name = parts[1].trim();
        proteins = normalizeNumber(parts[2]);
        fats = normalizeNumber(parts[3]);
        carbs = normalizeNumber(parts[4]);
        calories = normalizeNumber(parts[5]);
      } else if (parts.length === 5) {
        // Название не дублируется, используем parts[0]
        name = parts[0].trim();
        proteins = normalizeNumber(parts[1]);
        fats = normalizeNumber(parts[2]);
        carbs = normalizeNumber(parts[3]);
        calories = normalizeNumber(parts[4]);
      } else {
        const reason = `неверное количество колонок (${parts.length}, ожидалось 5 или 6)`;
        skippedProducts.push({
          lineNumber: index + 1,
          rawLine: line.substring(0, 100), // Первые 100 символов для отладки
          reason: reason
        });
        return;
      }

      // Проверяем, что есть хотя бы какие-то данные
      if (!name || (calories === 0 && proteins === 0 && fats === 0 && carbs === 0)) {
        const reason = !name ? 'пустое название' : 'все значения равны нулю';
        skippedProducts.push({
          lineNumber: index + 1,
          rawLine: line.substring(0, 100),
          reason: reason,
          extractedData: { name, proteins, fats, carbs, calories }
        });
        return;
      }

      const isEmpty = calories < 1 && proteins < 0.1 && fats < 0.1 && carbs < 0.1;
      const defaultMeasure = getDefaultMeasure();

      const product = {
        name,
        description: '',
        categories: [],
        photo: null,
        macros: {
          calories: Math.round(calories),
          proteins: parseFloat(proteins.toFixed(2)),
          fats: parseFloat(fats.toFixed(2)),
          carbs: parseFloat(carbs.toFixed(2)),
          isEmpty: isEmpty
        },
        measures: [defaultMeasure]
      };

      products.push(product);
    } catch (error) {
      skippedProducts.push({
        lineNumber: index + 1,
        rawLine: line.substring(0, 100),
        reason: `ошибка при обработке: ${error.message}`
      });
    }
  });

  console.log(`✅ Обработано продуктов: ${products.length}`);
  
  // Выводим информацию о пропущенных продуктах
  if (skippedProducts.length > 0) {
    console.log(`\n⚠️  Пропущено продуктов: ${skippedProducts.length}`);
    console.log('\n❌ Список пропущенных продуктов:');
    skippedProducts.forEach(skipped => {
      console.log(`\n   Строка ${skipped.lineNumber}:`);
      console.log(`   Причина: ${skipped.reason}`);
      console.log(`   Данные: "${skipped.rawLine}"`);
      if (skipped.extractedData) {
        console.log(`   Извлеченные данные:`, skipped.extractedData);
      }
    });
  } else {
    console.log('\n✅ Все продукты успешно обработаны!');
  }
  
  console.log('\n📋 Примеры успешно обработанных продуктов:');
  products.slice(0, 5).forEach(p => {
    console.log(`   - ${p.name}: ${p.macros.calories} ккал (Б:${p.macros.proteins}г, Ж:${p.macros.fats}г, У:${p.macros.carbs}г)`);
  });

  // Сохраняем результат
  const jsonOutput = JSON.stringify(products, null, 2);
  fs.writeFileSync(outputPath, jsonOutput, 'utf-8');

  console.log(`\n💾 Результат сохранен в: ${outputPath}`);
  console.log(`\n✨ Итоговая статистика:`);
  console.log(`   Всего строк в файле: ${lines.length}`);
  console.log(`   Успешно обработано: ${products.length}`);
  console.log(`   Пропущено: ${skippedProducts.length}`);

  return products;
}

// Запуск парсинга
try {
  parseProductsFromFile();
  console.log('\n🎉 Парсинг завершен успешно!');
  process.exit(0);
} catch (error) {
  console.error('\n💥 Ошибка:', error);
  process.exit(1);
}

