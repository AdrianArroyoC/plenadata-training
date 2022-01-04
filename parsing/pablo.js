function pablo(pdfData) {
  console.log(pdfData);

  let companyName = '';
  let invoiceNumber = 0;
  let processOrderNumber = 0;
  let date = '';
  let address = '';
  const invoiceLineItems = [];

  for (let i = 0; i < pdfData.length; i++) {
    if (pdfData[i] === 'Bill To') {
      companyName = pdfData[i + 1];
      address = `${pdfData[i + 2]} ${pdfData.slice(i + 4, i + 5).join(' ')}`;
    }
    if (pdfData[i] === 'Invoice #') {
      invoiceNumber = parseInt(pdfData[i + 1]);
    }
    if (pdfData[i] === 'Date') {
      date = pdfData[i + 1];
    }
    if (pdfData[i] === 'P.O. No.') {
      processOrderNumber = parseInt(pdfData[i + 1].replace('PO', ''));
    }
    if (pdfData[i] === 'Backordered') {
      let charge = '';
      let position = i + 3;
      while (position < pdfData.length) {
        if (position + 3 < pdfData.length && pdfData[position + 3] === '0') {
          invoiceLineItems.push({
            charge_type: charge.trimEnd(),
            charge_description: '',
            quantity: pdfData[position],
            unit_price: parseFloat(pdfData[position + 1]),
            total_amount: parseFloat(pdfData[position + 2]),
            amount_excluding_tax: parseFloat(pdfData[position + 2]),
            tax_amount: 0,
          });
          position += 3;
        } else {
          charge += `${pdfData[position]} `;
        }
        position++;
      }
      i = pdfData.length;
    }
  }

  return {
    type: 'pablo',
    company_name: companyName,
    invoice_number: invoiceNumber,
    process_order_number: processOrderNumber,
    date,
    address,
    invoice_line_items: invoiceLineItems,
  };
}

module.exports = pablo;
