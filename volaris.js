const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin());

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const volaris = async () => {
  const browser = await puppeteer.launch({
    args: [`--window-size=1920,1080`],
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    slowMo: 10,
  });
  const results = {};
  try {
    const origin = 'Guadalajara';
    const destination = 'Cancun';
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    const url = 'https://www.volaris.com/';
    await page.goto(url, {waitUntil: 'load'});

    // Click the origin button to start the search
    const originButton = await page.waitForSelector('#mat-input-1');
    await originButton.click();
    const originInput = await page.waitForSelector('#fnameOrigin');

    // Type the origin one by one letter to charge the autocomplete
    for (let i = 0; i < origin.length; i++) {
      await originInput.type(origin[i]);
      await delay(500);
    }

    // Select the first result
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Check if the destination search box is open
    const destinationInput = await page.waitForSelector('#fnameDestination');
    for (let i = 0; i < destination.length; i++) {
      await destinationInput.type(destination[i]);
      await delay(500);
    }

    // Select the first result
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Change the month depending on the date
    const date = new Date();
    const month = date.getMonth() + 1;
    const clicks = 4 - month - 1;
    const rightButton = await page.waitForSelector(
      '.pickerright.icon-carousel-iconleft'
    );
    for (let i = 0; i < clicks; i++) {
      await rightButton.click();
      await delay(500);
    }
    await delay(2000);

    // Selector the dates
    const monthSelector =
      'div.calendar.right.ng-star-inserted div.calendar-table table tbody';
    const departureDateSelector = `${monthSelector} tr:nth-child(2) td:nth-child(7)`;
    const departureDate = await page.waitForSelector(departureDateSelector);
    await departureDate.click();
    await delay(2000);
    const returnDateSelector = `${monthSelector} tr:nth-child(3) td:nth-child(7)`;
    const returnDate = await page.waitForSelector(returnDateSelector);
    await returnDate.click();
    await delay(2000);
    const doneButton = await page.waitForSelector(
      '.btn-calendar.d-none.d-md-block.mat-flat-button.mat-button-base.mat-secondary'
    );
    await doneButton.click();
    //

    // Click the search button
    const searchButton = await page.waitForSelector(
      '.icon-airplane_horizontal.pos-left'
    );
    await searchButton.click();

    // Wait for the results
    await delay(2000);
    await page.waitForSelector('.flightLists.ng-star-inserted');
    const departureData = await getFlightsData(page);

    console.log(departureData);
    results.departure = departureData;

    // Click the first flight just to see go ahead the process
    const firstFlight = await page.waitForSelector(
      '.flightLists.ng-star-inserted .flightItem.ng-star-inserted div div:nth-child(2) div div a'
    );
    await firstFlight.click();

    // Click the basic fare
    const basicFare = await page.waitForSelector(
      '.fareTypes.fareTypeRegular div div:nth-child(1) mat-card'
    );
    await basicFare.click();

    // Wait for the results
    await delay(2000);
    await page.waitForSelector('.flightLists.ng-star-inserted');
    const returnData = await getFlightsData(page);

    console.log(returnData);
    results.return = returnData;
  } catch (error) {
    console.error(error.message);
  } finally {
    await browser.close();
    return results;
  }
};

const getFlightsData = async page => {
  const flightsData = await page.evaluate(() => {
    const flights = Array.from(
      document.querySelectorAll(
        '.flightLists.ng-star-inserted .flightItem.ng-star-inserted .row.no-gutters.flightItemDetails'
      )
    );
    console.log(flights);
    return flights.map(flight => {
      const departure = flight.querySelector('.time.timeDeparture').textContent;
      const duration = flight.querySelector('.flightDuration').textContent;
      const stops0 = flight.querySelector('.flightSegment.stop-0');
      const stops1 = flight.querySelector('.flightSegment.stop-1');
      const stops = stops0 ? '0' : stops1 ? '1' : '2';
      const arrival = flight.querySelector('.time.timeArrival').textContent;
      const price = flight.querySelector('.price.ng-star-inserted').textContent;
      return {
        departure,
        duration,
        stops,
        arrival,
        price,
      };
    });
  });
  return flightsData;
};

const init = async () => {
  // while (true) {
  const prices = await volaris();
  console.log(prices);
  // await delay(50000 * 60);
  // }
};

init();
