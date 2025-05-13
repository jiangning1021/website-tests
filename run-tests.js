const config = require('./website-tests.config.js');
const puppeteer = require('puppeteer');
const fs = require('fs');

async function runTests() {
  const browser = await puppeteer.launch();
  const results = {};
  
  for (const pageUrl of config.pagesToTest) {
    const fullUrl = config.url + pageUrl;
    const page = await browser.newPage();
    await page.goto(fullUrl);
    
    // 运行所有测试
    results[pageUrl] = {
      fonts: await testFonts(page),
      overflow: await testOverflow(page),
      links: await testLinks(page)
    };
    
    await page.close();
  }
  
  await browser.close();
  
  // 保存结果
  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  console.log('测试完成，结果已保存到 test-results.json');
}

// 实现各种测试函数...
