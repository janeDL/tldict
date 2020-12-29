const puppeteer = require('puppeteer');

async function main() {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://datadic.datayes.com');
  // 登陆
  await page.waitForSelector('input[name=account]');
  await page.type('input[name=account]', '18100650252');
  await page.type('input[name=password]', 'JBybd4xw');
  await page.click('.signup-btn');
  await page.waitForNavigation({waitUntil: 'networkidle0'});

  console.log(await page.$eval('.sub-nav', (el) => el.innerHTML));

  await browser.close();
}

main();
