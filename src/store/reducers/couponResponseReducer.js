import {
  SET_PRODUCTS_RESPONSE,
  SET_DISCOUNT_RESPONSE,
  CLEAR_RESPONSES,
} from "../actions/couponDsicount";

// читаем из localStorage
const savedProducts = localStorage.getItem("productsResponse");
const savedDiscount = localStorage.getItem("discountResponse");

const initialState = {
  productsResponse: savedProducts ? JSON.parse(savedProducts) : null,
  discountResponse: savedDiscount ? JSON.parse(savedDiscount) : null,
};

const couponResponseReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PRODUCTS_RESPONSE:
      localStorage.setItem("productsResponse", JSON.stringify(action.payload));
      return {
        ...state,
        productsResponse: action.payload,
      };

    case SET_DISCOUNT_RESPONSE:
      localStorage.setItem("discountResponse", JSON.stringify(action.payload));
      return {
        ...state,
        discountResponse: action.payload,
      };

    case CLEAR_RESPONSES:
      localStorage.removeItem("productsResponse");
      localStorage.removeItem("discountResponse");
      return {
        productsResponse: null,
        discountResponse: null,
      };

    default:
      return state;
  }
};

export default couponResponseReducer;
