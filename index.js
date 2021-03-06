const zillow = require('./zillow');
const slack = require('./slack');
const test = require('./test');
const parsing = require('./parsing');
const documentAi = require('./document-ai');

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin());

const db = require('./models');

async function init() {
  const force = false;
  await db.sequelize
    .sync({force})
    .then(() => {
      if (force) {
        console.log('Drop and re-sync db.');
      } else {
        console.log('Database synced.');
      }
    })
    .catch(error => {
      console.error('Drop and re-sync db error: ', error.message);
    });

  if (process.argv[2] === 'headless') {
    const browser = await puppeteer.launch({
      args: [`--window-size=1920,1080`],
      headless: false,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      slowMo: 10,
    });
    try {
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      if (process.argv[3] === 'zillow') {
        await zillow(page);
      } else if (process.argv[3] === 'slack') {
        await slack(page);
      } else if (process.argv[3] === 'test') {
        await test(page);
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      await browser.close();
    }
  }

  if (process.argv[2] === 'parsing') {
    await parsing();
  }

  if (process.argv[2] === 'document-ai') {
    await documentAi();
  }

  if (process.argv[2] === 'volaris') {
    await volaris();
  }
}

init();
