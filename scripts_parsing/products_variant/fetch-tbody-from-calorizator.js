/**
 * Node.js скрипт для получения блоков <tbody> со всех страниц Calorizator.ru
 * 
 * Скрипт перебирает все страницы https://calorizator.ru/product/all?page=N,
 * находит блоки <tbody> на каждой странице и добавляет их в HTML файл
 * 
 * Использование:
 * npm run fetch-tbody:calorizator
 * или
 * node scripts_parsing/products_variant/fetch-tbody-from-calorizator.js
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://calorizator.ru/product/all';
const OUTPUT_FILE = path.join(__dirname, 'calorizator-tbody.html');

async function waitForTable(page) {
  // Ждём появления таблицы с несколькими попытками
  for (let i = 0; i < 15; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const hasTbody = await page.evaluate(() => {
      const tbody = document.querySelector('tbody');
      return !!tbody && tbody.querySelectorAll('tr').length > 0;
    });
    
    if (hasTbody) {
      return true;
    }
    
    if (i % 5 === 4) {
      // Каждые 5 секунд прокручиваем страницу
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
    }
  }
  return false;
}

async function extractTbodyFromPage(page) {
  // Извлекаем все блоки tbody
  const tbodyBlocks = await page.evaluate(() => {
    const tbodyElements = document.querySelectorAll('tbody');
    const result = [];
    
    tbodyElements.forEach((tbody, index) => {
      const rows = tbody.querySelectorAll('tr');
      result.push({
        index: index + 1,
        html: tbody.outerHTML,
        rowsCount: rows.length
      });
    });
    
    return result;
  });

  return tbodyBlocks;
}

async function fetchTbodyFromCalorizator() {
  console.log('🚀 Запуск получения <tbody> со всех страниц Calorizator.ru...\n');

  // Очищаем файл перед началом (или создаем новый)
  if (fs.existsSync(OUTPUT_FILE)) {
    fs.writeFileSync(OUTPUT_FILE, '', 'utf-8');
    console.log('📝 Файл очищен, начинаем заново\n');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Устанавливаем User-Agent, чтобы сайт не блокировал нас
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let currentPage = 0;
    let totalTbodyBlocks = 0;
    let totalRows = 0;
    let hasMorePages = true;

    while (hasMorePages) {
      const url = currentPage === 0 
        ? BASE_URL 
        : `${BASE_URL}?page=${currentPage}`;
      
      console.log(`\n📡 Страница ${currentPage + 1}: ${url}`);
      
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 90000
        });

        console.log('⏳ Ожидание загрузки таблицы...');
        const tableFound = await waitForTable(page);

        if (!tableFound) {
          console.log('⚠️  Таблица не найдена на странице, пропускаем...');
          hasMorePages = false;
          break;
        }

        console.log('🔍 Извлечение блоков <tbody>...');
        const tbodyBlocks = await extractTbodyFromPage(page);

        if (tbodyBlocks.length === 0) {
          console.log('⚠️  Блоки <tbody> не найдены, возможно страница закончилась');
          hasMorePages = false;
          break;
        }

        console.log(`   Найдено блоков <tbody>: ${tbodyBlocks.length}`);
        const pageRows = tbodyBlocks.reduce((sum, block) => sum + block.rowsCount, 0);
        console.log(`   Строк на странице: ${pageRows}`);

        // Добавляем все tbody блоки в файл (append mode)
        const tbodyHtml = tbodyBlocks.map(block => block.html).join('\n\n');
        fs.appendFileSync(OUTPUT_FILE, tbodyHtml + '\n\n', 'utf-8');

        totalTbodyBlocks += tbodyBlocks.length;
        totalRows += pageRows;

        // Проверяем, есть ли следующая страница
        const pageInfo = await page.evaluate((currentPageNum) => {
          // Ищем пагинацию
          const pagination = document.querySelector('.pager, ul.pager, .pagination');
          if (!pagination) {
            // Если пагинации нет, проверяем наличие строк
            const tbody = document.querySelector('tbody');
            return {
              hasNext: tbody && tbody.querySelectorAll('tr').length > 0,
              maxPageNum: null
            };
          }
          
          // Ищем все ссылки на страницы
          const pageLinks = pagination.querySelectorAll('a[href*="page="]');
          let maxPageNum = currentPageNum;
          
          pageLinks.forEach(link => {
            const href = link.getAttribute('href');
            const match = href.match(/page=(\d+)/);
            if (match) {
              const pageNum = parseInt(match[1]);
              if (pageNum > maxPageNum) {
                maxPageNum = pageNum;
              }
            }
          });
          
          // Проверяем наличие ссылки "следующая" или стрелки вправо
          // Ищем по тексту или классу
          let hasNextButton = false;
          const allLinks = pagination.querySelectorAll('a');
          allLinks.forEach(link => {
            const text = link.textContent.trim();
            const href = link.getAttribute('href');
            // Проверяем наличие стрелки или текста "следующая"
            if ((text === '›' || text === '→' || text.includes('следующ') || text.includes('next')) && 
                href && href.includes('page=')) {
              hasNextButton = true;
            }
          });
          
          return {
            hasNext: hasNextButton || maxPageNum > currentPageNum,
            maxPageNum: maxPageNum
          };
        }, currentPage);

        // Если на странице мало строк (меньше 5), возможно это последняя страница
        if (pageRows < 5) {
          console.log('⚠️  Мало строк на странице, возможно это последняя страница');
          hasMorePages = false;
        } else if (!pageInfo.hasNext && currentPage > 0) {
          // Если нет следующей страницы и мы не на первой странице
          console.log('✅ Достигнута последняя страница (нет следующей страницы в пагинации)');
          hasMorePages = false;
        } else if (pageInfo.maxPageNum !== null && currentPage >= pageInfo.maxPageNum) {
          // Если достигли максимального номера страницы
          console.log(`✅ Достигнута последняя страница (максимум: ${pageInfo.maxPageNum})`);
          hasMorePages = false;
        }

        currentPage++;

        // Защита от бесконечного цикла (максимум 100 страниц)
        if (currentPage >= 100) {
          console.log('⚠️  Достигнут лимит страниц (100), останавливаемся');
          hasMorePages = false;
        }

        // Небольшая задержка между запросами, чтобы не перегружать сервер
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Ошибка при обработке страницы ${currentPage + 1}:`, error.message);
        // Пробуем продолжить со следующей страницы
        currentPage++;
        if (currentPage > 10) {
          // Если много ошибок подряд, останавливаемся
          console.log('⚠️  Слишком много ошибок, останавливаемся');
          hasMorePages = false;
        }
      }
    }

    console.log(`\n💾 Все блоки <tbody> сохранены в: ${OUTPUT_FILE}`);
    console.log(`\n✨ Итоговая статистика:`);
    console.log(`   Обработано страниц: ${currentPage}`);
    console.log(`   Всего блоков <tbody>: ${totalTbodyBlocks}`);
    console.log(`   Всего строк: ${totalRows}`);

    return { totalPages: currentPage, totalTbodyBlocks, totalRows };
  } catch (error) {
    console.error('❌ Ошибка при получении данных:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Запуск
fetchTbodyFromCalorizator()
  .then(() => {
    console.log('\n🎉 Получение данных завершено успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Ошибка:', error);
    process.exit(1);
  });

