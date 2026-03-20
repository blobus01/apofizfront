const initialState = {
  value: localStorage.getItem("currency") || "",
};

export default function currencyReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_CURRENCY":
      localStorage.setItem("currency", action.payload); // ← сохраняем
      return {
        ...state,
        value: action.payload,
      };

    default:
      return state;
  }
}
