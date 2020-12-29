const puppeteer = require('puppeteer');
const fs = require('fs');

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1280,
      height: 720,
    },
  });
  const page = await browser.newPage();
  await page.goto('https://datadic.datayes.com');
  // 登陆
  await page.waitForSelector('input[name=account]');
  await page.type('input[name=account]', '18100650252');
  await page.type('input[name=password]', 'JBybd4xw');
  await page.waitForTimeout(1000);
  await page.click('.signup-btn');
  await page.waitForNavigation({waitUntil: 'networkidle0'});

  async function clickOnElement(elem, x, y) {
    const rect = await page.evaluate(el => {
      const { top, left, width, height } = el.getBoundingClientRect();
      return { top, left, width, height };
    }, elem);

    // Use given position or default to center
    const _x = x !== undefined ? x : rect.width / 2;
    const _y = y !== undefined ? y : rect.height / 2;

    await page.mouse.click(rect.left + _x, rect.top + _y);
  }

  async function dfs(node, prefix) {
    const p = await node.$('p');
    const tabName = await p.evaluate((el) => el.innerText);

    if (tabName === '数据查询' || tabName === '数据产品' || tabName === '帮助文档') return;

    await clickOnElement(p, 1);
    await page.waitForTimeout(1000);

    if (prefix === undefined) {
      prefix = tabName;
    } else {
      prefix = prefix + '_' + tabName;
    }

    if (!await node.$('ul')) {
      await page.waitForFunction((tabName) => {
        const el = document.querySelector('.parameter-list a');
        if (!el) return false;
        return el.innerText.match(/^(.*)\([A-Za-z0-9_]+\)$/)[1] === tabName;
      }, {polling: 500, timeout: 60000}, tabName);
      console.log('saving: ', prefix);
      fs.writeFileSync('output/' + prefix + '.html', await page.$eval('.ant-tabs', (el) => el.innerHTML));
    } else {
      for (const c of await node.$$('ul > li')) {
        await dfs(c, prefix);
      }
    }
  }

  const item = await page.$('.side-bar > .item');
  await dfs(item);

  await browser.close();
}

main();
