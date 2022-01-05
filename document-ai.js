const fs = require('fs');
const db = require('./models');
const Check = db.check;

async function documentAi() {
  const path = './document-ai/';
  const files = fs.readdirSync(path);
  const file = process.argv[3]
    ? process.argv[3]
    : files[Math.floor(Math.random() * files.length)];
  let filePath = `${path}${file}`;

  console.log(`Document AI parsing for the file: ${filePath}`);

  const data = fs.readFileSync(filePath);

  // console.log(JSON.parse(data));

  const text = JSON.parse(data).document.text.toUpperCase();

  // Regular expression to find the check number
  const checkNumberRegExp = /(CHECK (NUMBER|NO.?)\s)?\d{5,10}/g;
  const checkNumberResult = text.match(checkNumberRegExp);
  const checkNumber = checkNumberResult[0]
    ? parseInt(
        checkNumberResult[0]
          .replace('CHECK', '')
          .replace('NUMBER', '')
          .replace('NO.', '')
          .trim()
      )
    : null;

  // Regular expression to match the amount quantity with two decimals
  const amountRegExp = /\*\s?\$?\s?\d{1,5}.\d{2,2}/g;
  const amountResult = text.match(amountRegExp);
  const amount = amountResult[0]
    ? parseFloat(amountResult[0].replace('*', '').replace('$', '').trim())
    : null;

  // Regular expression to match the date
  const dateRegExp =
    /(CHECK )?(DATE )?(ISSUED)?\s?(\d{2,2}\/\d{2,2}\/\d{2,4})/g;
  const dateResult = text.match(dateRegExp);
  const date = dateResult[0]
    ? dateResult[0]
        .replace('CHECK', '')
        .replace('DATE', '')
        .replace('ISSUED', '')
        .trim()
    : null;

  // Regular expression to match a full us address
  const addressRegExp =
    /\d{4,4}\s\w{6,6}\s\w{2,6}.?,?\s\d{2,2}(\w{2,2})?\s([F-f]?\w{1,4})?\s\w{11,13},?\s\w{2,2}\s\d{5,5}(-\d{4,4})?/g;
  const addressResult = text.match(addressRegExp);
  const address = addressResult[0]
    ? addressResult[0].replace(/\r?\n|\r/g, ' ')
    : null;

  const checkObj = {
    check_number: checkNumber,
    amount,
    date,
    address,
  };

  console.log(checkObj);

  if (checkNumber && amount && date && address) {
    try {
      await Check.create(checkObj);
    } catch (error) {
      console.error('Create error', error.message);
    }
  }
}

module.exports = documentAi;
