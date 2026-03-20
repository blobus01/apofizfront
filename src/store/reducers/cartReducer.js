import { METADATA } from "../../common/metadata";
import {
  GET_CART_DETAIL,
  GET_CARTS_LIST,
  SET_CART_DETAIL,
  CLEAR_CARTS_LIST,
  REMOVE_CART_SUCCESS,
} from "../actionTypes/cartTypes";

const initialState = {
  cartDetail: { ...METADATA.default, data: null },
  cartsList: { ...METADATA.default, data: null },
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CART_DETAIL:
      return {
        ...state,
        cartDetail: { ...state.cartDetail, data: action.payload },
      };
    case GET_CARTS_LIST.REQUEST:
      return {
        ...state,
        cartsList: { ...state.cartsList, ...METADATA.request },
      };
    case GET_CARTS_LIST.SUCCESS:
      return {
        ...state,
        cartsList: { ...METADATA.success, data: action.payload },
      };
    case GET_CARTS_LIST.FAILURE:
      return {
        ...state,
        cartsList: {
          ...state.cartsList,
          ...METADATA.error,
          error: action.error,
        },
      };
    case GET_CART_DETAIL.REQUEST:
      return {
        ...state,
        cartDetail: { ...state.cartDetail, ...METADATA.request },
      };
    case GET_CART_DETAIL.SUCCESS:
      return {
        ...state,
        cartDetail: { ...METADATA.success, data: action.payload },
      };
    case GET_CART_DETAIL.FAILURE:
      return {
        ...state,
        cartDetail: {
          ...state.cartDetail,
          ...METADATA.error,
          error: action.error,
        },
      };

    case CLEAR_CARTS_LIST:
      return {
        ...state,
        cartsList: { ...METADATA.default, data: null }, // Сбрасываем в null, чтобы useEffect в компоненте сработал снова
      };

    case REMOVE_CART_SUCCESS:
      // Защита от ошибок, если данных еще нет
      if (!state.cartsList.data || !state.cartsList.data.list) return state;

      return {
        ...state,
        cartsList: {
          ...state.cartsList,
          data: {
            ...state.cartsList.data,
            // Фильтруем список: оставляем все элементы, чей ID НЕ равен удаленному
            list: state.cartsList.data.list.filter(
              (item) => item.id !== action.payload
            ),
            // Уменьшаем счетчик (опционально)
            total_count: state.cartsList.data.total_count - 1,
          },
        },
      };

    default:
      return state;
  }
};

export default cartReducer;
