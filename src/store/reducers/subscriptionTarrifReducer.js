const savedTariffId = localStorage.getItem("tariffId");

const initialState = {
  tariffId: savedTariffId ? savedTariffId : null,
};

export default function subscriptionReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_TARIFF_ID":
      localStorage.setItem("tariffId", action.payload);
      return { ...state, tariffId: action.payload };

    case "CLEAR_TARIFF_ID":
      localStorage.removeItem("tariffId");
      return { ...state, tariffId: null };

    default:
      return state;
  }
}
