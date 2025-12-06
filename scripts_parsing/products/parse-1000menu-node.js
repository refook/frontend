/**
 * Node.js скрипт для парсинга таблицы калорийности продуктов с сайта 1000.menu/food-table
 * 
 * Использование:
 * npm run parse-products
 * или
 * node scripts_parsing/products/parse-1000menu-node.js
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Список слов, которые указывают на бренды (исключаем такие продукты)
const brandKeywords = [
  'меридиан', 'мирамар', 'vici', 'санта бремор', 'данон', 'доктор бифи',
  'dr.körner', 'dr.korner', 'cinzano', 'martini', 'baileys', 'amaretto',
  'куантро', 'калуа', 'малибу', 'очаковский'
];

function containsBrand(name) {
  const lowerName = name.toLowerCase();
  return brandKeywords.some(keyword => lowerName.includes(keyword));
}

function cleanProductName(name) {
  let cleaned = name
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*-\s*(i|ii|iii|iv|v)\s*категории/gi, '')
    .replace(/\s*%\s*-?\s*ной\s*жирности/gi, '')
    .replace(/\s*\d+\s*%\s*-?\s*ной\s*жирности/gi, '')
    .replace(/\s*в\/с/gi, '')
    .replace(/\s*высшего\s*сорта/gi, '')
    .replace(/\s*1\s*сорта/gi, '')
    .replace(/\s*2\s*сорта/gi, '')
    .trim();

  if (cleaned.length > 50) {
    const parts = cleaned.split(/\s+/);
    const mainParts = [];
    for (const part of parts) {
      if (part.match(/^(сырой|вареный|жареный|копченый|соленый|свежий|свежезамороженный|консервированный|маринованный|отварной|на пару|с гриля|соте|топленый|сгущенное|с сахаром|без сахара|в масле|в собственном соке|в томатном соусе|в сметане|в растительном масле|в упаковке|мгновенного приготовления|готовый к употреблению|обваренный паром|с длинными зернами|витаминизированный|обезжиренный|жирный|мягкий|диетический|утренний|фруктовый|яичные|молочные|русские|армянский|на раст\.масле|на олив\.масле|безалкогольное|легкое|темное|светлое|светлая|темная|черный|белый|красный|коричневый|зеленый|зеленая|сладкая|сочные|снежный краб)$/i)) {
        break;
      }
      mainParts.push(part);
    }
    if (mainParts.length > 0) {
      cleaned = mainParts.join(' ');
    }
  }

  return cleaned.trim();
}

function getDefaultMeasure(productName) {
  // Всегда возвращаем граммы для всех продуктов
  return {
    name: 'Грамм',
    weight: 100,
    isDefault: true,
    density: 1
  };
}

async function parseProducts() {
  console.log('🚀 Запуск парсинга продуктов с сайта 1000.menu...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    console.log('📡 Загрузка страницы...');
    await page.goto('https://1000.menu/food-table', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('⏳ Ожидание загрузки таблицы...');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    console.log('🔍 Извлечение данных из таблицы...');
    const products = await page.evaluate(() => {
      const brandKeywords = [
        'меридиан', 'мирамар', 'vici', 'санта бремор', 'данон', 'доктор бифи',
        'dr.körner', 'dr.korner', 'cinzano', 'martini', 'baileys', 'amaretto',
        'куантро', 'калуа', 'малибу', 'очаковский'
      ];

      function containsBrand(name) {
        const lowerName = name.toLowerCase();
        return brandKeywords.some(keyword => lowerName.includes(keyword));
      }

      function cleanProductName(name) {
        let cleaned = name
          .replace(/\s*\([^)]*\)/g, '')
          .replace(/\s*-\s*(i|ii|iii|iv|v)\s*категории/gi, '')
          .replace(/\s*%\s*-?\s*ной\s*жирности/gi, '')
          .replace(/\s*\d+\s*%\s*-?\s*ной\s*жирности/gi, '')
          .replace(/\s*в\/с/gi, '')
          .replace(/\s*высшего\s*сорта/gi, '')
          .replace(/\s*1\s*сорта/gi, '')
          .replace(/\s*2\s*сорта/gi, '')
          .trim();

        if (cleaned.length > 50) {
          const parts = cleaned.split(/\s+/);
          const mainParts = [];
          for (const part of parts) {
            if (part.match(/^(сырой|вареный|жареный|копченый|соленый|свежий|свежезамороженный|консервированный|маринованный|отварной|на пару|с гриля|соте|топленый|сгущенное|с сахаром|без сахара|в масле|в собственном соке|в томатном соусе|в сметане|в растительном масле|в упаковке|мгновенного приготовления|готовый к употреблению|обваренный паром|с длинными зернами|витаминизированный|обезжиренный|жирный|мягкий|диетический|утренний|фруктовый|яичные|молочные|русские|армянский|на раст\.масле|на олив\.масле|безалкогольное|легкое|темное|светлое|светлая|темная|черный|белый|красный|коричневый|зеленый|зеленая|сладкая|сочные|снежный краб)$/i)) {
              break;
            }
            mainParts.push(part);
          }
          if (mainParts.length > 0) {
            cleaned = mainParts.join(' ');
          }
        }

        return cleaned.trim();
      }

      function getDefaultMeasure(productName) {
        // Всегда возвращаем граммы для всех продуктов
        return {
          name: 'Грамм',
          weight: 100,
          isDefault: true,
          density: 1
        };
      }

      const table = document.querySelector('table');
      if (!table) return [];

      const rows = table.querySelectorAll('tbody tr, tbody > tr');
      const products = [];
      const seenNames = new Set();

      rows.forEach((row) => {
        try {
          const cells = row.querySelectorAll('td');
          if (cells.length < 5) return;

          const name = cells[0].textContent.trim();
          if (!name) return;
          if (containsBrand(name)) return;

          const cleanedName = cleanProductName(name);
          if (seenNames.has(cleanedName.toLowerCase())) return;
          seenNames.add(cleanedName.toLowerCase());

          const proteins = parseFloat(cells[1].textContent.trim()) || 0;
          const fats = parseFloat(cells[2].textContent.trim()) || 0;
          const carbs = parseFloat(cells[3].textContent.trim()) || 0;
          const calories = parseFloat(cells[4].textContent.trim()) || 0;

          if (calories === 0 && proteins === 0 && fats === 0 && carbs === 0) return;

          const isEmpty = calories < 1 && proteins < 0.1 && fats < 0.1 && carbs < 0.1;
          const defaultMeasure = getDefaultMeasure(cleanedName);

          const product = {
            name: cleanedName,
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
          console.error('Ошибка при обработке строки:', error);
        }
      });

      return products;
    });

    console.log(`✅ Обработано продуктов: ${products.length}`);
    console.log('\n📋 Примеры продуктов:');
    products.slice(0, 5).forEach(p => {
      console.log(`   - ${p.name}: ${p.macros.calories} ккал (Б:${p.macros.proteins}г, Ж:${p.macros.fats}г, У:${p.macros.carbs}г)`);
    });

    // Сохраняем результат
    const outputPath = path.join(__dirname, 'products-1000menu.json');
    const jsonOutput = JSON.stringify(products, null, 2);
    fs.writeFileSync(outputPath, jsonOutput, 'utf-8');

    console.log(`\n💾 Результат сохранен в: ${outputPath}`);
    console.log(`\n✨ Готово! Всего продуктов: ${products.length}`);

    return products;
  } catch (error) {
    console.error('❌ Ошибка при парсинге:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Запуск парсинга
parseProducts()
  .then(() => {
    console.log('\n🎉 Парсинг завершен успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Ошибка:', error);
    process.exit(1);
  });

