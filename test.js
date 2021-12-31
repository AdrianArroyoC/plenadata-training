async function test(page) {
  await page.goto('https://www.zillow.com/lehi-ut-84043/houses/');
  const pageUrls = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        '.photo-cards.photo-cards_wow.photo-cards_short.photo-cards_extra-attribution li article .list-card-info a'
      )
    ).map(a => a.getAttribute('href'));
  });
  console.log(pageUrls);

  const selector2 =
    '.photo-cards.photo-cards_wow.photo-cards_short.photo-cards_extra-attribution li article .list-card-info a';
  const selector2Results = await page.$$(selector2);
  console.log(selector2Results.length);

  // Get all the urls from the page and click on them
}
module.exports = test;
