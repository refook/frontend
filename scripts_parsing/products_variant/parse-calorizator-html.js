/**
 * Node.js скрипт для парсинга HTML-данных продуктов из файла calorizator-tbody.html
 * 
 * Файл содержит HTML-разметку таблицы с продуктами (может быть несколько блоков <tbody>):
 * - Название продукта (в ссылке)
 * - Ссылка на страницу продукта
 * - Белки, жиры, углеводы, калории
 * 
 * Использование:
 * npm run parse-products:calorizator-html
 * или
 * node scripts_parsing/products_variant/parse-calorizator-html.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

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

function parseProductsFromHTML() {
  console.log('🚀 Запуск парсинга продуктов из HTML файла calorizator-tbody.html...\n');

  const inputPath = path.join(__dirname, 'calorizator-tbody.html');
  const outputPath = path.join(__dirname, 'products-calorizator-html.json');

  // Проверяем существование файла
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Файл не найден: ${inputPath}`);
  }

  console.log(`📖 Чтение HTML файла: ${inputPath}`);
  let htmlContent = fs.readFileSync(inputPath, 'utf-8').trim();

  // Если файл содержит только tbody (или несколько tbody), оборачиваем их в полную структуру таблицы
  if (htmlContent.startsWith('<tbody>') || htmlContent.includes('<tbody>')) {
    // Если уже есть обертка table, не добавляем еще одну
    if (!htmlContent.includes('<table>')) {
      htmlContent = `<table>${htmlContent}</table>`;
    }
  }

  // Загружаем HTML в cheerio с опциями для более гибкого парсинга
  const $ = cheerio.load(htmlContent, {
    xml: false,
    decodeEntities: false,
    lowerCaseAttributeNames: false
  });

  console.log('🔍 Парсинг HTML структуры...');

  const products = [];
  const skippedProducts = []; // Массив для хранения информации о пропущенных продуктах

  // Находим все блоки tbody (может быть несколько)
  const tbodyElements = $('tbody');
  const totalTbodyCount = tbodyElements.length;
  
  console.log(`📊 Найдено блоков <tbody>: ${totalTbodyCount}`);

  let globalRowIndex = 0; // Глобальный индекс строки для нумерации пропущенных продуктов

  // Обрабатываем каждый блок tbody
  tbodyElements.each((tbodyIndex, tbodyElement) => {
    const $tbody = $(tbodyElement);
    const rows = $tbody.find('tr');
    const rowsCount = rows.length;
    
    console.log(`   Обработка блока <tbody> ${tbodyIndex + 1}/${totalTbodyCount}: ${rowsCount} строк`);

    rows.each((rowIndex, element) => {
      globalRowIndex++;
    try {
      const $row = $(element);
      const cells = $row.find('td');

      if (cells.length < 6) {
        skippedProducts.push({
          tbodyNumber: tbodyIndex + 1,
          rowNumber: globalRowIndex,
          reason: `недостаточно ячеек (${cells.length}, ожидалось минимум 6)`,
          rawHtml: $row.html().substring(0, 200)
        });
        return;
      }

      // Извлекаем данные из ячеек
      // Ячейка 0: изображение (пропускаем)
      // Ячейка 1: название и ссылка
      const $nameCell = $(cells[1]);
      const $nameLink = $nameCell.find('a');
      const name = $nameLink.text().trim();
      const productUrl = $nameLink.attr('href') || null;

      // Ячейка 2: белки
      const proteins = normalizeNumber($(cells[2]).text());

      // Ячейка 3: жиры
      const fats = normalizeNumber($(cells[3]).text());

      // Ячейка 4: углеводы
      const carbs = normalizeNumber($(cells[4]).text());

      // Ячейка 5: калории
      const calories = normalizeNumber($(cells[5]).text());

      // Проверяем, что есть название продукта
      if (!name) {
        skippedProducts.push({
          tbodyNumber: tbodyIndex + 1,
          rowNumber: globalRowIndex,
          reason: 'пустое название',
          extractedData: { name, proteins, fats, carbs, calories, productUrl }
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
        productUrl: productUrl ? `https://calorizator.ru${productUrl}` : null, // Сохраняем полную ссылку
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
        tbodyNumber: tbodyIndex + 1,
        rowNumber: globalRowIndex,
        reason: `ошибка при обработке: ${error.message}`,
        rawHtml: $(element).html().substring(0, 200)
      });
    }
    });
  });

  console.log(`✅ Обработано продуктов: ${products.length}`);

  // Выводим информацию о пропущенных продуктах
  if (skippedProducts.length > 0) {
    console.log(`\n⚠️  Пропущено продуктов: ${skippedProducts.length}`);
    console.log('\n❌ Список пропущенных продуктов:');
    skippedProducts.forEach(skipped => {
      console.log(`\n   Блок <tbody> ${skipped.tbodyNumber}, Строка ${skipped.rowNumber}:`);
      console.log(`   Причина: ${skipped.reason}`);
      if (skipped.extractedData) {
        console.log(`   Извлеченные данные:`, skipped.extractedData);
      }
      if (skipped.rawHtml) {
        console.log(`   HTML (первые 200 символов): "${skipped.rawHtml}"`);
      }
    });
  } else {
    console.log('\n✅ Все продукты успешно обработаны!');
  }

  console.log('\n📋 Примеры успешно обработанных продуктов:');
  products.slice(0, 5).forEach(p => {
    console.log(`   - ${p.name}: ${p.macros.calories} ккал (Б:${p.macros.proteins}г, Ж:${p.macros.fats}г, У:${p.macros.carbs}г)`);
    if (p.productUrl) {
      console.log(`     Ссылка: ${p.productUrl}`);
    }
  });

  // Сохраняем результат
  const jsonOutput = JSON.stringify(products, null, 2);
  fs.writeFileSync(outputPath, jsonOutput, 'utf-8');

  // Подсчитываем общее количество строк
  const totalRows = tbodyElements.toArray().reduce((sum, tbody) => {
    return sum + $(tbody).find('tr').length;
  }, 0);

  console.log(`\n💾 Результат сохранен в: ${outputPath}`);
  console.log(`\n✨ Итоговая статистика:`);
  console.log(`   Всего блоков <tbody>: ${totalTbodyCount}`);
  console.log(`   Всего строк в таблице: ${totalRows}`);
  console.log(`   Успешно обработано: ${products.length}`);
  console.log(`   Пропущено: ${skippedProducts.length}`);

  return products;
}

// Запуск парсинга
try {
  parseProductsFromHTML();
  console.log('\n🎉 Парсинг завершен успешно!');
  process.exit(0);
} catch (error) {
  console.error('\n💥 Ошибка:', error);
  process.exit(1);
}

