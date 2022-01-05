function flos(pdfData) {

  let companyName = '';
  let invoiceNumber = 0;
  let processOrderNumber = 0;
  let date = '';
  let address = '';
  const invoiceLineItems = [];
  let lastColumn = '';
  const items = []; // chargeType
  const descriptions = [];
  const quantities = [];
  const unitPrices = [];
  const totalAmounts = [];
  const taxRates = [];
  for (let i = 0; i < pdfData.length; i++) {
    if (pdfData[i] === 'Bill To') {
      companyName = pdfData[i + 1];
      address = pdfData.slice(i + 2, i + 4).join(' ');
    }
    if (pdfData[i] === 'Invoice #') {
      invoiceNumber = parseInt(pdfData[i + 1].replace('INV', ''));
    }
    if (pdfData[i] === 'Date') {
      date = pdfData[i + 1];
    }
    if (pdfData[i] === 'PO #') {
      processOrderNumber = parseInt(pdfData[i + 1]);
    }
    // Invoice Line Items
    if (lastColumn === 'Item') {
      items.push(pdfData[i]);
    }
    if (lastColumn === 'Description') {
      descriptions.push(pdfData[i]);
    }
    if (lastColumn === 'Qty') {
      quantities.push(pdfData[i]);
    }
    if (lastColumn === 'Unit Price') {
      unitPrices.push(pdfData[i]);
    }
    if (lastColumn === 'Amount') {
      totalAmounts.push(pdfData[i]);
    }
    if (lastColumn === 'Tax Rate') {
      taxRates.push(pdfData[i]);
    }
    if (pdfData[i] === 'Item') {
      lastColumn = 'Item';
    }
    if (pdfData[i] === 'Description') {
      lastColumn = 'Description';
    }
    if (pdfData[i] === 'Qty') {
      lastColumn = 'Qty';
    }
    if (pdfData[i] === 'Unit Price') {
      lastColumn = 'Unit Price';
    }
    if (pdfData[i] === 'Amount') {
      lastColumn = 'Amount';
    }
    if (pdfData[i] === 'Tax Rate') {
      lastColumn = 'Tax Rate';
    }
    if (pdfData[i] === 'Price Level') {
      i = pdfData.length;
    }
  }

  const indices = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].startsWith('  ')) {
      indices.push(i);
    }
  }

  items.splice(indices[0], indices.length);
  descriptions.splice(indices[0], indices.length);
  quantities.splice(indices[0], indices.length);

  for (let i = 0; i < items.length; i++) {
    const taxRate = taxRates[i];
    const taxAmount = (parseFloat(totalAmounts[i]) * parseFloat(taxRate)) / 100;
    invoiceLineItems.push({
      charge_type: items[i],
      charge_description: descriptions[i],
      amount_excluding_tax: parseFloat(totalAmounts[i]) - taxAmount,
      tax_amount: taxAmount,
      total_amount: parseFloat(totalAmounts[i]),
      quantity: parseInt(quantities[i]),
      unit_price:
        parseFloat(unitPrices[i]) - taxAmount / parseInt(quantities[i]),
    });
  }

  invoiceLineItems.pop();

  return {
    type: 'flos',
    company_name: companyName,
    invoice_number: invoiceNumber,
    process_order_number: processOrderNumber,
    date,
    address,
    invoice_line_items: invoiceLineItems,
  };
}

module.exports = flos;
