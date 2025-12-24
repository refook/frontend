/**
 * Node.js скрипт для получения описаний (состава) продуктов со страниц Calorizator.ru
 * 
 * Скрипт читает файл products-calorizator-html.json, для каждого продукта с productUrl
 * переходит на страницу продукта, находит блок "<h3>Состав {название}</h3>" и извлекает
 * следующий блок <p> с составом, записывая его в поле "description"
 * 
 * Использование:
 * npm run fetch-descriptions:calorizator
 * или
 * node scripts_parsing/products_variant/fetch-descriptions-from-calorizator.js
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'products-calorizator-html.json');
const OUTPUT_FILE = path.join(__dirname, 'products-calorizator-html.json');

// Задержка между запросами (в миллисекундах)
const DELAY_BETWEEN_REQUESTS = 2000; // 2 секунды

async function extractDescription(page, productName) {
  try {
    // Используем более гибкий поиск через evaluate
    const description = await page.evaluate((name) => {
      // Вспомогательная функция для поиска следующего <p> после заголовка
      function findNextParagraphAfterHeader(header) {
        let nextElement = header.nextElementSibling;
        
        // Пропускаем пустые текстовые узлы и другие элементы, пока не найдем <p>
        while (nextElement) {
          if (nextElement.tagName === 'P') {
            return nextElement.textContent.trim();
          }
          nextElement = nextElement.nextElementSibling;
        }
        
        // Если не нашли <p> сразу после заголовка, попробуем найти в родительском контейнере
        const parent = header.parentElement;
        if (parent) {
          const pInParent = parent.querySelector('p');
          if (pInParent) {
            return pInParent.textContent.trim();
          }
        }
        
        return null;
      }
      
      // Вариант 1: Ищем h2 с "Состав" (более приоритетный)
      const h2Elements = Array.from(document.querySelectorAll('h2'));
      const compositionH2 = h2Elements.find(h2 => {
        const text = h2.textContent.trim().toLowerCase();
        return text.includes('состав');
      });
      
      if (compositionH2) {
        const result = findNextParagraphAfterHeader(compositionH2);
        if (result) {
          return result;
        }
      }
      
      // Вариант 2: Ищем h3 с "Состав"
      const h3Elements = Array.from(document.querySelectorAll('h3'));
      const compositionH3 = h3Elements.find(h3 => {
        const text = h3.textContent.trim().toLowerCase();
        return text.includes('состав');
      });
      
      if (compositionH3) {
        const result = findNextParagraphAfterHeader(compositionH3);
        if (result) {
          return result;
        }
      }
      
      // Вариант 3: Ищем <p> который начинается с "Состав:"
      const pElements = Array.from(document.querySelectorAll('p'));
      const compositionPWithColon = pElements.find(p => {
        const text = p.textContent.trim();
        return /^Состав\s*:/.test(text);
      });
      
      if (compositionPWithColon) {
        // Извлекаем текст, убирая префикс "Состав:"
        const text = compositionPWithColon.textContent.trim();
        const cleanedText = text.replace(/^Состав\s*:\s*/i, '').trim();
        if (cleanedText && cleanedText.length > 0) {
          return cleanedText;
        }
      }
      
      // Вариант 4: Ищем <p><strong>Состав...</strong></p>
      const compositionP = pElements.find(p => {
        const strong = p.querySelector('strong');
        if (strong) {
          const text = strong.textContent.trim().toLowerCase();
          return text.includes('состав');
        }
        return false;
      });
      
      if (compositionP) {
        // Извлекаем текст из этого <p>, убирая тег <strong>Состав...</strong>
        const pClone = compositionP.cloneNode(true);
        const strong = pClone.querySelector('strong');
        if (strong) {
          strong.remove();
        }
        const text = pClone.textContent.trim();
        
        // Если в этом <p> есть текст кроме "Состав", возвращаем его
        if (text && text.length > 0) {
          return text;
        }
        
        // Иначе ищем следующий <p> после этого
        let nextElement = compositionP.nextElementSibling;
        while (nextElement) {
          if (nextElement.tagName === 'P') {
            return nextElement.textContent.trim();
          }
          nextElement = nextElement.nextElementSibling;
        }
        
        // Если не нашли следующий <p>, возвращаем весь текст из текущего <p>
        return compositionP.textContent.trim().replace(/^Состав[:\s]*/i, '').trim();
      }
      
      return null;
    }, productName);
    
    return description;
  } catch (error) {
    console.error(`   Ошибка при извлечении описания: ${error.message}`);
    return null;
  }
}

async function fetchDescriptionsFromCalorizator() {
  console.log('🚀 Запуск получения описаний продуктов со страниц Calorizator.ru...\n');

  // Проверяем существование входного файла
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Файл не найден: ${INPUT_FILE}`);
  }

  // Читаем JSON файл
  console.log(`📖 Чтение файла: ${INPUT_FILE}`);
  const fileContent = fs.readFileSync(INPUT_FILE, 'utf-8');
  const products = JSON.parse(fileContent);

  console.log(`📊 Всего продуктов в файле: ${products.length}`);
  
  // Подсчитываем продукты с productUrl
  const productsWithUrl = products.filter(p => p.productUrl && p.productUrl.trim() !== '');
  console.log(`🔗 Продуктов с URL: ${productsWithUrl.length}`);
  
  // Подсчитываем продукты с "Ожидаем" (уже обработаны, но описание не найдено)
  const productsWithWaiting = productsWithUrl.filter(p => {
    const desc = p.description ? p.description.trim() : '';
    return desc === 'Ожидаем';
  });
  console.log(`⏳ Продуктов с "Ожидаем" (пропущено): ${productsWithWaiting.length}`);
  
  // Подсчитываем продукты без описания (исключаем те, где уже записано "Ожидаем")
  const productsWithoutDescription = productsWithUrl.filter(p => {
    const desc = p.description ? p.description.trim() : '';
    // Обрабатываем только продукты без описания или с пустым описанием, но НЕ с "Ожидаем"
    return !desc || desc === '';
  });
  console.log(`📝 Продуктов без описания: ${productsWithoutDescription.length}`);

  if (productsWithoutDescription.length === 0) {
    console.log('\n✅ Все продукты уже имеют описание!');
    return;
  }

  console.log('\n🌐 Запуск браузера...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log('✅ Браузер запущен');

  try {
    const page = await browser.newPage();
    console.log('📄 Новая страница создана');
    
    // Устанавливаем User-Agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    console.log('👤 User-Agent установлен');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Обрабатываем только продукты без описания
    for (let i = 0; i < productsWithoutDescription.length; i++) {
      const product = productsWithoutDescription[i];
      const productIndex = products.findIndex(p => p.productUrl === product.productUrl);
      
      console.log(`\n[${i + 1}/${productsWithoutDescription.length}] Обработка: ${product.name}`);
      console.log(`   URL: ${product.productUrl}`);

      try {
        // Переходим на страницу продукта
        await page.goto(product.productUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });

        // Небольшая задержка для загрузки контента
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Извлекаем описание
        const description = await extractDescription(page, product.name);

        if (description && description.length > 0) {
          // Обновляем описание в массиве продуктов
          products[productIndex].description = description;
          successCount++;
          console.log(`   ✅ Описание получено (${description.length} символов)`);
          console.log(`   📄 "${description.substring(0, 100)}${description.length > 100 ? '...' : ''}"`);
        } else {
          // Если описание не найдено, записываем "Ожидаем", чтобы не обрабатывать повторно
          products[productIndex].description = 'Ожидаем';
          skippedCount++;
          console.log(`   ⚠️  Описание не найдено на странице (записано "Ожидаем")`);
        }
        
        // Сохраняем изменения сразу после обработки каждого продукта
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2), 'utf-8');

        // Выводим прогресс каждые 10 продуктов
        if ((i + 1) % 10 === 0) {
          console.log(`\n📊 Прогресс: ${i + 1}/${productsWithoutDescription.length}`);
        }

        // Задержка между запросами
        if (i < productsWithoutDescription.length - 1) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }

      } catch (error) {
        errorCount++;
        const errorMsg = `Ошибка при обработке "${product.name}": ${error.message}`;
        errors.push({
          product: product.name,
          url: product.productUrl,
          error: error.message
        });
        console.error(`   ❌ ${errorMsg}`);
        
        // Продолжаем обработку других продуктов даже при ошибке
      }
    }

    // Финальное сохранение
    console.log(`\n💾 Финальное сохранение результатов...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2), 'utf-8');

    // Выводим статистику
    console.log(`\n✨ Итоговая статистика:`);
    console.log(`   Всего обработано: ${productsWithoutDescription.length}`);
    console.log(`   ✅ Успешно получено описаний: ${successCount}`);
    console.log(`   ⚠️  Пропущено (не найдено): ${skippedCount}`);
    console.log(`   ❌ Ошибок: ${errorCount}`);

    if (errors.length > 0) {
      console.log(`\n❌ Список ошибок:`);
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.product}: ${err.error}`);
      });
    }

  } finally {
    await browser.close();
  }
}

// Запуск парсинга
(async () => {
  try {
    await fetchDescriptionsFromCalorizator();
    console.log('\n🎉 Парсинг завершен успешно!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Ошибка:', error);
    process.exit(1);
  }
})();

