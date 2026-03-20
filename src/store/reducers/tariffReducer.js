
const STORAGE_KEY = "tariff_status";

const initialState = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

export const tariffStatusReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_TARIFF_STATUS":
     
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      return action.payload;

    case "CLEAR_TARIFF_STATUS":
    
      localStorage.removeItem(STORAGE_KEY);
      return null;

    default:
      return state;
  }
};
