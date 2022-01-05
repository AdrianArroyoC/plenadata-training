const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser();
const dhl = require('./parsing/dhl');
const pablo = require('./parsing/pablo');
const flos = require('./parsing/flos');
const db = require('./models');
const Invoice = db.invoice;
const InvoiceLineItem = db.invoiceLineItem;

async function parsing() {
  pdfParser.on('pdfParser_dataError', errData =>
    console.error(errData.parserError)
  );

  const path = `./pdfs/invoices/${process.argv[3]}/`;
  const files = fs.readdirSync(path);
  let filePath = `${path}${
    process.argv[4]
      ? process.argv[4]
      : files[Math.floor(Math.random() * files.length)]
  }`;

  pdfParser.on('pdfParser_dataReady', async pdfData => {
    let invoice;

    const pdfDataParsed = pdfData.Pages[0].Texts.map(text =>
      decodeURI(text.R[0].T)
        .replace(/%2F/g, '/')
        .replace(/%2C/g, ',')
        .replace(/%3A/g, ':')
        .replace(/%24/g, '$')
        .replace(/%23/g, '#')
    );

    // console.log(pdfDataParsed);

    if (process.argv[3] === 'dhl') {
      invoice = dhl(pdfDataParsed);
    }
    if (process.argv[3] === 'flos') {
      invoice = flos(pdfDataParsed);
    }
    if (process.argv[3] === 'pablo') {
      invoice = pablo(pdfDataParsed);
    }
    console.log(invoice);
    try {
      await Invoice.create(invoice, {include: [InvoiceLineItem]});
    } catch (error) {
      console.error('Create error', error.message);
    }
  });

  // filePath = './pdfs/invoices/dhl/821572900.pdf';
  // filePath = './pdfs/invoices/flos/Flos - INV121906 - PO30997 - 09-24-21.pdf';
  // filePath = './pdfs/invoices/pablo/Pablo - 884167 - PO30612 - 08-07-21.pdf';
  console.log(`PDF parsing for the file: ${filePath}`);
  pdfParser.loadPDF(filePath);
}

module.exports = parsing;
