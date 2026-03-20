import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import {getMessage} from '../../common/helpers';
import {
  SET_EVENT_UNPROCESSED_TRANS_COUNT,
  SET_RENT_UNPROCESSED_TRANS_COUNT,
  SET_TOTAL_CART_AMOUNT,
  SET_UNPROCESSED_TRANS_COUNT
} from '../actionTypes/shopTypes';

// Get user items amount from all carts
export const getAllCartsTotalCount = () => {
  return dispatch => {
    return axios.get(Pathes.Shop.totalUserItemsCount).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch({type: SET_TOTAL_CART_AMOUNT, count: data.count});
          return {data, success: true, message};
        }

        throw new Error(message)
      }).catch(e => ({error: e.message, success: false}));
  }
}

export const setAllCartsTotalCount = count => {
  return (dispatch, getState) => {
    const currentCount = getState().shopStore.allCartsTotalCount

    if (typeof count === 'function') {
      return dispatch({type: SET_TOTAL_CART_AMOUNT, count: count(currentCount)})
    }

    if (typeof count === 'number') {
      return dispatch({type: SET_TOTAL_CART_AMOUNT, count})
    }

    throw TypeError(`Type of 'change' is '${typeof count}'. Expected: 'number' or 'function'.`)
  }
}

// Get unprocessed transactions count
export const getUnprocessedTranCount = () => {
  return dispatch => {
    return axios.get(Pathes.Statistics.unprocessedTranCount).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch({type: SET_UNPROCESSED_TRANS_COUNT, count: data.count})
          return {data, success: true, message};
        }

        throw new Error(message)
      }).catch(e => ({error: e.message, success: false}));
  }
}

export const getRentUnprocessedTranCount = () => {
  return dispatch => {
    return axios.get(Pathes.Statistics.rentUnprocessedTranCount).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch({type: SET_RENT_UNPROCESSED_TRANS_COUNT, count: data.count})
          return {data, success: true, message};
        }

        throw new Error(message)
      }).catch(e => ({error: e.message, success: false}));
  }
}

export const getEventUnprocessedTranCount = () => {
  return dispatch => {
    return axios.get(Pathes.Statistics.eventUnprocessedTranCount).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch({type: SET_EVENT_UNPROCESSED_TRANS_COUNT, count: data.count})
          return {data, success: true, message};
        }

        throw new Error(message)
      }).catch(e => ({error: e.message, success: false}));
  }
}