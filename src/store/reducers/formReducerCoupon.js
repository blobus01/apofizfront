const initialState = {
  banner: null,
  discountPercent: 0,
  endDate: "",
  description: "",
  withoutEndDate: false,
  renewable: false,
};

// Actions
export const SET_FORM_DATA = "SET_FORM_DATA";
export const CLEAR_FORM_DATA = "CLEAR_FORM_DATA";

// Reducer
export function formReducerCoupon(state = initialState, action) {
  switch (action.type) {
    case SET_FORM_DATA:
      return {
        ...state,
        ...action.payload, // обновляем только то, что было передано
      };

    case CLEAR_FORM_DATA:
      return initialState;

    default:
      return state;
  }
}
