import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import { getQuery } from '../../common/utils';
import { GET_CART_DETAIL, GET_CARTS_LIST, PUT_CART_DETAIL, SET_CART_DETAIL } from '../actionTypes/cartTypes';
import { getAllCartsTotalCount } from './shopActions';
import {getMessage} from "../../common/helpers";

const ac_setCartDetail = payload => ({ type: SET_CART_DETAIL, payload });
const getCartsListRequest = () => ({ type: GET_CARTS_LIST.REQUEST });
const getCartsListSuccess = payload => ({ type: GET_CARTS_LIST.SUCCESS, payload });
const getCartsListFailure = error => ({ type: GET_CARTS_LIST.FAILURE, error });

const putCartDetailRequest = () => ({ type: PUT_CART_DETAIL.REQUEST });
const putCartDetailSuccess = payload => ({ type: PUT_CART_DETAIL.SUCCESS, payload });
const putCartDetailFailure = error => ({ type: PUT_CART_DETAIL.FAILURE, error });

const getCartDetailRequest = () => ({ type: GET_CART_DETAIL.REQUEST });
const getCartDetailSuccess = payload => ({ type: GET_CART_DETAIL.SUCCESS, payload });
const getCartDetailFailure = error => ({ type: GET_CART_DETAIL.FAILURE, error });

export const getCartsList = (params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getCartsListRequest());
    return axios
      .get(Pathes.Carts.list + getQuery(params))
      .then(res => {
        const { status, data } = res;
        if (status === 200) {
          const prevData = getState().cartStore.cartsList.data;
          if (!isNext || !prevData) {
            dispatch(getCartsListSuccess(data));
            return { data, success: true };
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(getCartsListSuccess(updatedData));
          return { data: updatedData, success: true };
        }

        throw new Error('Не удалось получить');
      })
      .catch(e => dispatch(getCartsListFailure(e.message)));
  };
};

export const putCartDetail = (cartID, items) => {
  return dispatch => {
    dispatch(putCartDetailRequest());
    return axios
      .put(Pathes.Carts.cart(cartID), {
        items,
      })
      .then(res => {
        const message = getMessage(res.data)
        if (res.status === 200) {
          dispatch(putCartDetailSuccess(res));
          return { data: res.data, success: true };
        }
        if (res.status === 400) {
          throw new Error(message);
        }
        throw new Error('Не удалось обновить корзину');
      })
      .catch(e => {
        dispatch(putCartDetailFailure(e.message));
        return { success: false, error: e.message };
      });
  };
};

export const removeCart = id => {
  return (dispatch, getState) => {
    return axios
      .delete(Pathes.Carts.cart(id))
      .then(res => {
        const { status, data } = res;
        const message = getMessage(data)
        if (status === 204 || status === 200) {
          const { data } = getState().cartStore.cartsList;
          if (data) {
            const updatedData = {
              total_count: data.total_count > 0 ? data.total_count - 1 : 0,
              total_pages: data.total_pages,
              list: data.list.filter(cart => cart.id !== id),
            };
            dispatch(getCartsListSuccess(updatedData));
            dispatch(getAllCartsTotalCount());
            return { data: updatedData, success: true };
          }
        }
        throw new Error(message);
      })
      .catch(e => ({ success: false, message: e.message }));
  };
};

// Get cart details
export const getCartDetail = cartID => {
  return dispatch => {
    dispatch(getCartDetailRequest());
    return axios
      .get(Pathes.Carts.cart(cartID))
      .then(res => {
        const { status, data } = res;
        if (status === 200) {
          dispatch(getCartDetailSuccess(data));
          return { data, success: true };
        }
        throw new Error('Не удалось получить данные');
      })
      .catch(e => dispatch(getCartDetailFailure(e.message)));
  };
};

// LOCAL Set cart details
export const setCartDetail = cart => {
  return dispatch => dispatch(ac_setCartDetail(cart));
};
