/**
 * Тестовый Node.js‑скрипт для парсинга таблицы калорийности продуктов
 * с сайта https://calorizator.ru/product/all
 *
 * Сейчас парсим только САМЫЙ ПЕРВЫЙ продукт в таблице (7up)
 * и сохраняем его в JSON‑файл с базовыми макросами.
 *
 * Запуск:
 * npm run parse-products:calorizator
 * или
 * node scripts_parsing/products_variant/parse-calorizator.js
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CALORIZATOR_URL = 'https://calorizator.ru/product/all';

async function parseFirstProduct() {
  console.log('🚀 Запуск парсинга продуктов с сайта Calorizator.ru...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Устанавливаем User-Agent, чтобы сайт не блокировал нас
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('📡 Загрузка страницы...');
    await page.goto(CALORIZATOR_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });

    console.log('⏳ Ожидание загрузки таблицы (может занять до 15 секунд)...');
    // Прокручиваем страницу, чтобы загрузить контент (если есть lazy loading)
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Ждём появления строк данных в таблице с несколькими попытками
    let rowsFound = false;
    for (let i = 0; i < 15; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const hasRows = await page.evaluate(() => {
        const table = document.querySelector('table');
        if (!table) return false;
        // Пробуем разные варианты поиска строк
        const tbodyRows = table.querySelectorAll('tbody tr');
        const allRows = table.querySelectorAll('tr');
        // Исключаем заголовок (первую строку)
        return (tbodyRows.length > 0) || (allRows.length > 1);
      });
      if (hasRows) {
        rowsFound = true;
        console.log(`✅ Строки найдены после ${i + 1} секунд ожидания`);
        break;
      }
      if (i % 5 === 4) {
        // Каждые 5 секунд прокручиваем страницу
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
      }
    }
    
    if (!rowsFound) {
      console.log('⚠️  Строки в tbody не найдены, пробуем найти строки напрямую...');
      await page.waitForSelector('table tr', { timeout: 5000 }).catch(() => {});
    }

    console.log('🔍 Извлечение данных первой строки (ожидаем 7up)...');
    const result = await page.evaluate(() => {
      const table = document.querySelector('table');
      const debugInfo = {
        tableFound: !!table,
        allRows: 0,
        tbodyRows: 0,
        directRows: 0,
        cellsCount: 0,
        cellsContent: []
      };
      
      if (!table) {
        return { error: 'Таблица не найдена', debugInfo, product: null };
      }

      // Пробуем разные способы найти строки
      const allRows = table.querySelectorAll('tr');
      const tbodyRows = table.querySelectorAll('tbody tr');
      const tbody = table.querySelector('tbody');
      const directRows = tbody ? tbody.querySelectorAll('tr') : [];
      
      debugInfo.allRows = allRows.length;
      debugInfo.tbodyRows = tbodyRows.length;
      debugInfo.directRows = directRows.length;
      
      // Используем первый доступный вариант
      let rows = tbodyRows.length > 0 ? tbodyRows : (directRows.length > 0 ? directRows : allRows);
      
      if (!rows.length) {
        return { error: 'Строки в таблице не найдены', debugInfo, product: null };
      }

      const firstRow = rows[0];
      const cells = firstRow.querySelectorAll('td');
      debugInfo.cellsCount = cells.length;
      
      // Сохраняем содержимое ячеек для отладки
      cells.forEach((cell, idx) => {
        debugInfo.cellsContent.push({
          index: idx,
          text: cell.textContent.trim(),
          html: cell.innerHTML.substring(0, 100) // Первые 100 символов HTML
        });
      });

      // Ожидаем структуру:
      // 0: картинка, 1: название, 2: белки, 3: жиры, 4: углеводы, 5: калории
      if (cells.length < 6) {
        return { 
          error: `Недостаточно ячеек (ожидалось минимум 6, найдено ${cells.length})`, 
          debugInfo, 
          product: null 
        };
      }

      const normalizeNumber = (value) => {
        if (!value) return 0;
        const normalized = value.replace(',', '.').trim();
        const num = parseFloat(normalized);
        return Number.isNaN(num) ? 0 : num;
      };

      const name = cells[1].textContent.trim();
      const proteins = normalizeNumber(cells[2].textContent);
      const fats = normalizeNumber(cells[3].textContent);
      const carbs = normalizeNumber(cells[4].textContent);
      const calories = normalizeNumber(cells[5].textContent);

      return {
        error: null,
        debugInfo,
        product: {
          name,
          macros: {
            calories,
            proteins,
            fats,
            carbs
          }
        }
      };
    });

    // Выводим отладочную информацию
    if (result.debugInfo) {
      console.log(`\n📊 Отладочная информация:`);
      console.log(`   Таблица найдена: ${result.debugInfo.tableFound}`);
      console.log(`   Всего строк (tr): ${result.debugInfo.allRows}`);
      console.log(`   Строк в tbody: ${result.debugInfo.tbodyRows}`);
      console.log(`   Прямых строк (> tbody > tr): ${result.debugInfo.directRows}`);
      console.log(`   Ячеек в первой строке: ${result.debugInfo.cellsCount}`);
      if (result.debugInfo.cellsContent.length > 0) {
        console.log(`   Содержимое ячеек:`);
        result.debugInfo.cellsContent.forEach(cell => {
          console.log(`     [${cell.index}]: "${cell.text}"`);
        });
      }
    }

    if (result.error) {
      console.error(`\n❌ Ошибка: ${result.error}`);
      throw new Error(`Не удалось извлечь первую строку продукта: ${result.error}`);
    }

    const product = result.product;
    if (!product) {
      throw new Error('Не удалось извлечь первую строку продукта из таблицы Calorizator.ru');
    }

    console.log('\n✅ Успешно распарсили продукт:');
    console.log(`   Название: ${product.name}`);
    console.log(
      `   Макросы на 100 г: Б=${product.macros.proteins}г, Ж=${product.macros.fats}г, У=${product.macros.carbs}г, Ккал=${product.macros.calories}`
    );

    const outputPath = path.join(__dirname, 'product-calorizator-7up.json');
    const jsonOutput = JSON.stringify(product, null, 2);
    fs.writeFileSync(outputPath, jsonOutput, 'utf-8');

    console.log(`\n💾 JSON сохранён в файле: ${outputPath}`);

    return product;
  } catch (error) {
    console.error('❌ Ошибка при парсинге Calorizator.ru:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Запуск
parseFirstProduct()
  .then(() => {
    console.log('\n🎉 Парсинг Calorizator завершён успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Не удалось завершить парсинг Calorizator:', error);
    process.exit(1);
  });


