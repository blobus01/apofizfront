import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import {getMessage} from '../../common/helpers';
import {getQuery} from '../../common/utils';
import Notify from '../../components/Notification';
import {
  GET_AVAILABLE_ORDERS_FOR_DELIVERY,
  GET_HISTORY_ORDERS_FOR_DELIVERY,
  SET_DELIVERY_AVAILABLE_ORDERS_COUNT
} from '../actionTypes/deliveryTypes';

const getAvailableOrdersForDeliveryRequest = () => ({ type: GET_AVAILABLE_ORDERS_FOR_DELIVERY.REQUEST });
const getAvailableOrdersForDeliverySuccess = payload => ({ type: GET_AVAILABLE_ORDERS_FOR_DELIVERY.SUCCESS, payload });
const getAvailableOrdersForDeliveryFailure = error => ({ type: GET_AVAILABLE_ORDERS_FOR_DELIVERY.FAILURE, error });

const getHistoryOrdersForDeliveryRequest = () => ({ type: GET_HISTORY_ORDERS_FOR_DELIVERY.REQUEST });
const getHistoryOrdersForDeliverySuccess = payload => ({ type: GET_HISTORY_ORDERS_FOR_DELIVERY.SUCCESS, payload });
const getHistoryOrdersForDeliveryFailure = error => ({ type: GET_HISTORY_ORDERS_FOR_DELIVERY.FAILURE, error });

// Get number of available orders for delivery
export const getDeliveryAvailableOrdersCount = () => {
  return dispatch => {
    return axios.get(Pathes.Delivery.deliveryItemsCount).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch({type: SET_DELIVERY_AVAILABLE_ORDERS_COUNT, count: data.count});
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => {
        dispatch({type: SET_DELIVERY_AVAILABLE_ORDERS_COUNT, count: 0});
        return {error: e.message, success: false};
    });
  }
};

// Get available orders for delivery
export const getAvailableOrdersForDelivery = (params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getAvailableOrdersForDeliveryRequest());
    return axios.get(Pathes.Delivery.availableOrders + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().deliveryStore.availableOrdersList.data;
          if (!isNext || !prevData) {
            dispatch(getAvailableOrdersForDeliverySuccess(data));
            return {data, success: true, message};
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(getAvailableOrdersForDeliverySuccess(updatedData));
          return {updatedData, success: true, message};
        }

        Notify.info({text: message})
        throw new Error(message)
      }).catch(e => dispatch(getAvailableOrdersForDeliveryFailure(e.message)));
  }
};

// Get delivery service history
export const getHistoryOrdersForDelivery = (params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getHistoryOrdersForDeliveryRequest());
    return axios.get(Pathes.Delivery.historyOrders + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().deliveryStore.historyOrdersList.data;
          if (!isNext || !prevData) {
            dispatch(getHistoryOrdersForDeliverySuccess(data));
            return {data, success: true, message};
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(getHistoryOrdersForDeliverySuccess(updatedData));
          return {updatedData, success: true, message};
        }

        Notify.info({text: message})
        throw new Error(message)
      }).catch(e => dispatch(getHistoryOrdersForDeliveryFailure(e.message)));
  }
};