export const setInvoiceNumb = (invoiceNumber) => ({
  type: "SET_INVOICE_NUMB",
  payload: invoiceNumber,
});

export const clearInvoiceNumb = () => ({
  type: "CLEAR_INVOICE_NUMB",
});

export const setCompanyInvoiceData = (data) => ({
  type: "SET_COMPANY_INVOICE_DATA",
  payload: data,
});

export const setOwnerInvoiceData = (data) => ({
  type: "SET_OWNER_INVOICE_DATA",
  payload: data,
});

export const clearCompanyInvoiceData = () => ({
  type: "CLEAR_COMPANY_INVOICE_DATA",
});

export const clearOwnerInvoiceData = () => ({
  type: "CLEAR_OWNER_INVOICE_DATA",
});

export const setInvoiceData = (data) => ({
  type: "SET_INVOICE_DATA",
  payload: data,
});

export const clearInvoiceData = () => ({
  type: "CLEAR_INVOICE_DATA",
});

export const setInvoiceDialog = (data) => ({
  type: "SET_INVOICE_DIALOG_OPEN",
  payload: data, 
})
