const savedOwnerData = JSON.parse(localStorage.getItem("invoice_owner_data"));
const savedCompanyData = JSON.parse(
  localStorage.getItem("invoice_company_data")
);
const savedInvoice = JSON.parse(localStorage.getItem("invoice_data"));

const initialState = {
  invoiceNumber: localStorage.getItem("invoice_number") || null,
  companyData: savedCompanyData || null,
  ownerData: savedOwnerData || null,
  invoiceData: savedInvoice || null,
  invoiceDialogOpen: false, // ✅ добавили
};

export default function invoiceReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_INVOICE_NUMB":
      localStorage.setItem("invoice_number", action.payload);
      return { ...state, invoiceNumber: action.payload };

    case "CLEAR_INVOICE_NUMB":
      localStorage.removeItem("invoice_number");
      return { ...state, invoiceNumber: null };

    case "SET_COMPANY_INVOICE_DATA":
      localStorage.setItem(
        "invoice_company_data",
        JSON.stringify(action.payload)
      );
      return { ...state, companyData: action.payload };

    case "SET_OWNER_INVOICE_DATA":
      localStorage.setItem(
        "invoice_owner_data",
        JSON.stringify(action.payload)
      );
      return { ...state, ownerData: action.payload };

    case "CLEAR_COMPANY_INVOICE_DATA":
      localStorage.removeItem("invoice_company_data");
      return { ...state, companyData: null };

    case "CLEAR_OWNER_INVOICE_DATA":
      localStorage.removeItem("invoice_owner_data");
      return { ...state, ownerData: null };

    case "SET_INVOICE_DATA":
      localStorage.setItem("invoice_data", JSON.stringify(action.payload));
      return { ...state, invoiceData: action.payload };

    case "CLEAR_INVOICE_DATA":
      localStorage.removeItem("invoice_data");
      return { ...state, invoiceData: null };

    case "SET_INVOICE_DIALOG_OPEN":
      return { ...state, invoiceDialogOpen: action.payload };


    default:
      return state;
  }
}
