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
    
    results[pageUrl] = {
      fonts: await testFonts(page),
      overflow: await testOverflow(page),
      links: await testLinks(page)
    };
    
    await page.close();
  }
  
  await browser.close();

  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  console.log('测试完成，结果已保存到 test-results.json');
}

runTests().catch(err => {
  console.error('测试运行出错:', err);
  process.exit(1);
});
