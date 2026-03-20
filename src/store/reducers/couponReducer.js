const initialState = {
  selectedCoupon: null,
};

export default function couponReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_SELECTED_COUPON":
      return {
        ...state,
        selectedCoupon: action.payload,
      };

    case "CLEAR_SELECTED_COUPON":
      return {
        ...state,
        selectedCoupon: null,
      };

    default:
      return state;
  }
}
