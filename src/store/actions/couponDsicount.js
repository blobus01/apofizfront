export const SET_PRODUCTS_RESPONSE = "SET_PRODUCTS_RESPONSE";
export const SET_DISCOUNT_RESPONSE = "SET_DISCOUNT_RESPONSE";
export const CLEAR_RESPONSES = "CLEAR_RESPONSES";

export const setProductsState = (data) => ({
  type: SET_PRODUCTS_RESPONSE,
  payload: data,
});

export const setDiscountState = (data) => ({
  type: SET_DISCOUNT_RESPONSE,
  payload: data,
});

export const clearResponses = () => ({
  type: CLEAR_RESPONSES,
});
