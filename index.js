const zillow = require('./zillow');
const slack = require('./slack');

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin());

const db = require('./models');

// db.sequelize.sync();
db.sequelize
  .sync({force: true})
  .then(() => {
    console.log('Drop and re-sync db.');
  })
  .catch(error => {
    console.error('Drop and re-sync db error: ', error.message);
  });

async function init() {
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
    // addPopupListener(page, browser);
    await page.setDefaultNavigationTimeout(0);
    // await zillow(page);
    await slack(page);
  } catch (error) {
    console.error(error.message);
  } finally {
    await browser.close();
  }
}

init();
