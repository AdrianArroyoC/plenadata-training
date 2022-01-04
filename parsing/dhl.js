function dhl(pdfData) {
  const chargeTypes = ['Duties, Taxes and Regulatory Charges', 'DHL Charges'];
  console.log(pdfData);

  const companyName = pdfData[1];
  let invoiceNumber = 0;
  let processOrderNumber = 0;
  let date = '';
  const address = pdfData.slice(2, 5).join(' ');
  const invoiceLineItems = [];
  for (let i = 0; i < pdfData.length; i++) {
    // Invoice number
    if (pdfData[i] === 'Invoice Number:') {
      invoiceNumber = parseInt(pdfData[i + 1]);
    }
    // PO #
    // Date
    if (pdfData[i] === 'Invoice Date:') {
      date = pdfData[i + 1];
    }
    if (chargeTypes.includes(pdfData[i])) {
      const chargeType = pdfData[i];
      const chargeDescription = pdfData[i + 1];
      const amountExcludingTax = parseFloat(pdfData[i + 2]);
      const taxAmount = parseFloat(pdfData[i + 4]);
      const totalAmount = parseFloat(pdfData[i + 5]);
      const quantity = 1;
      const unitPrice = parseFloat(totalAmount);
      invoiceLineItems.push({
        charge_type: chargeType,
        charge_description: chargeDescription,
        amount_excluding_tax: amountExcludingTax,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        quantity: quantity,
        unit_price: unitPrice,
      });
    }
    if (pdfData[i] === 'Analysis of TAX') {
      i = pdfData.length;
    }
  }
  return {
    type: 'dhl',
    company_name: companyName,
    invoice_number: invoiceNumber,
    process_order_number: processOrderNumber,
    date,
    address,
    invoice_line_items: invoiceLineItems,
  };
}

module.exports = dhl;
