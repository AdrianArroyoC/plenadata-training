const db = require("./models");
const Zillow = db.zillow;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function zillow(page) {
  const url = "https://zillow.com";
  const zipCode = "84043";
  await page.goto(url, {waitUntil: "load"});

  // Type the Zip Code and search it
  const searchBoxInput = await page.waitForSelector("#search-box-input");
  await searchBoxInput.type(zipCode);
  const searchIcon = await page.waitForSelector("#search-icon");
  await searchIcon.click();

  // TODO: Review how to get it stable
  await delay(1000);
  // Skip the question about the type of listing
  await page.waitForSelector(".yui3-lightbox.interstitial");
  const typeOfListingSelector =
    ".StyledTextButton-c11n-8-48-0__sc-n1gfmh-0.jBjBRQ";
  const responses = await page.$$(typeOfListingSelector);
  if (responses.length > 0) {
    const response = responses.pop();
    await response.click();
  }

  // Review if the page is with the zip code
  const secondSearchBoxInputSelector = `input[type="text"][class="react-autosuggest__input"]`;
  const secondSearchBoxInput = await page.waitForSelector(
    secondSearchBoxInputSelector
  );
  const secondSearchBoxInputValue = await page.evaluate(() => {
    const inputElement = document.querySelector(".react-autosuggest__input");
    return inputElement ? inputElement.getAttribute("value") : "";
  });
  if (secondSearchBoxInputValue !== zipCode) {
    // Set the zip code
    await delay(1000);
    await secondSearchBoxInput.click({clickCount: 3});
    await page.keyboard.press("Backspace");
    // for (let i = 0; i < zipCode.length; i++) {
    //   await secondSearchBoxInput.type(zipCode[i]);
    // }
    await delay(1000);
    await secondSearchBoxInput.type(zipCode);
    await page.keyboard.press("Enter");
  }
  // Option go directly to the page

  // Deselect all the options
  const homeTypeSelector = "#home-type";
  const homeType = await page.waitForSelector(homeTypeSelector);
  await homeType.click();
  const deselectAllSelector = ".StyledTextButton-c11n-8-37-0__n1gfmh-0.eNDVGi";
  const deselectAll = await page.waitForSelector(deselectAllSelector);
  await deselectAll.click();

  // Loop through the options
  // First get the options
  const homeTypeOptions = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".filter-checkbox-list ul li div div label")
    ).map(label => {
      return {
        text: label.textContent,
        for: label.getAttribute("for"),
      };
    });
  });

  const urlsResults = [];
  // Then select the options
  let lastOption = "";
  for (const homeTypeOption of homeTypeOptions) {
    if (lastOption !== "") {
      const lastOptionSelector = `#${lastOption}`;
      const lastOptionElement = await page.waitForSelector(lastOptionSelector);
      await lastOptionElement.click();
    }
    await delay(1000);
    const homeTypeOptionSelector = `#${homeTypeOption.for}`;
    lastOption = homeTypeOption.for;
    const homeTypeOptionCheckbox = await page.waitForSelector(
      homeTypeOptionSelector
    );
    await homeTypeOptionCheckbox.click();
    const urls = await getResultsUrls(page, url);
    urlsResults.push({
      homeType: homeTypeOption.text,
      urls: urls,
    });
  }

  // Loop through the results, going to every page and getting the data
  for (const urlResult of urlsResults) {
    for (const url of urlResult.urls) {
      await page.goto(url, {waitUntil: "load"});
      const data = await getData(page);
      data["home_type"] = urlResult.homeType;
      data["url"] = url;
      await Zillow.create(data);
      console.log(data);
    }
  }

  // Save into the database
}

async function getData(page) {
  const data = await page.evaluate(() => {
    const priceElement = document.querySelector('span[data-testid="price"]');
    const price = priceElement ? priceElement.textContent : "";
    const bedBathItems = document.querySelectorAll(
      'span[data-testid="bed-bath-item"] strong'
    ); // strong
    const beds = bedBathItems[0].textContent || "";
    const baths = bedBathItems[1].textContent || "";
    const sqft = bedBathItems[2].textContent || "";
    const addressElement = document.querySelector(
      'span[data-testid="address"]'
    );
    const address = addressElement ? addressElement.textContent : "";
    const factsAndFeaturesItems = document.querySelectorAll(
      ".dpf__sc-xzpkxd-0.jHoFQf li .Text-c11n-8-53-2__sc-aiai24-0.dpf__sc-2arhs5-3.cvftlt.ggUolW"
    );
    const factsAndFeatures = Array.from(factsAndFeaturesItems).map(
      factAndFeat => factAndFeat.textContent
    );
    return {
      price,
      beds,
      baths,
      sqft,
      address,
      facts_and_features: factsAndFeatures.join(", "),
    };
  });
  return data;
}

async function getResultsUrls(page, url) {
  const urls = [];
  let pageNum = 1;
  let nextPage = true;
  while (nextPage) {
    // console.log(`Page ${pageNum}`);
    const pageUrls = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          ".photo-cards.photo-cards_wow.photo-cards_short.photo-cards_extra-attribution li article .list-card-info a"
        )
      ).map(a => a.getAttribute("href"));
    });
    urls.push(...pageUrls);
    // console.log(pageUrls);
    // Look for the next page
    pageNum++;
    const otherPages = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(".search-pagination nav ul li a")
      ).map(a => {
        return {
          text: a.getAttribute("title"),
          url: a.getAttribute("href"),
        };
      });
    });
    let newUrl = "";
    for (const otherPage of otherPages) {
      if (otherPage.text === `Page ${pageNum}`) {
        (newUrl = `${url}${otherPage.url}`), {waitUntil: "load"};
        break;
      }
    }
    if (newUrl === "") {
      nextPage = false;
    }
  }
  return urls;
}

module.exports = zillow;
