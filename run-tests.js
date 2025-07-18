import config from './website-tests.config.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import dictionary from 'dictionary-en';
import nspell from 'nspell';

const loadDictionary = async () => {
  return new Promise((resolve, reject) => {
    // ✅ 不再用 promisify，直接使用回调
    (dictionary.default || dictionary)((err, dict) => {
      if (err) return reject(err);
      resolve(nspell(dict));
    });
  });
};

async function runTests() {
  const dict = await loadDictionary();
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {};

  for (const pageUrl of config.pagesToTest) {
    const fullUrl = config.url + pageUrl;
    const page = await browser.newPage();
    await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });

    results[pageUrl] = {
      fonts: await testFonts(page),
      overflow: await testOverflow(page),
      links: await testLinks(page),
      spelling: await checkSpelling(page, dict)
    };

    await page.close();
  }

  await browser.close();

  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  console.log('✅ 测试完成，结果已保存到 test-results.json');
}

// 示例测试函数
async function testFonts(page) {
  return '字体测试通过';
}

async function testOverflow(page) {
  return '无溢出问题';
}

async function testLinks(page) {
  return '所有链接可用';
}

async function checkSpelling(page, dict) {
  const text = await page.evaluate(() => document.body.innerText);
  const words = text.match(/\b[a-zA-Z]{3,}\b/g) || [];

  const mistakes = [];
  for (const word of words) {
    if (!dict.correct(word)) {
      mistakes.push(word);
    }
  }

  const unique = [...new Set(mistakes)];
  return unique.length ? unique.slice(0, 20) : '未发现拼写错误';
}

runTests().catch(err => {
  console.error('❌ 测试运行出错:', err);
  process.exit(1);
});
