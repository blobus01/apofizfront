import {METADATA} from '../../common/metadata';
import {
  GET_AVAILABLE_ORDERS_FOR_DELIVERY,
  GET_HISTORY_ORDERS_FOR_DELIVERY,
  SET_DELIVERY_AVAILABLE_ORDERS_COUNT
} from '../actionTypes/deliveryTypes';

const initialState = {
  deliveryAvailableOrdersCount: 0,
  availableOrdersList: { ...METADATA.default, data: null },
  historyOrdersList: { ...METADATA.default, data: null },
};

const deliveryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DELIVERY_AVAILABLE_ORDERS_COUNT:
      return { ...state, deliveryAvailableOrdersCount: action.count };
    case GET_AVAILABLE_ORDERS_FOR_DELIVERY.REQUEST:
      return { ...state, availableOrdersList: { ...state.availableOrdersList, ...METADATA.request }};
    case GET_AVAILABLE_ORDERS_FOR_DELIVERY.SUCCESS:
      return { ...state, availableOrdersList: { ...METADATA.success, data: action.payload }};
    case GET_AVAILABLE_ORDERS_FOR_DELIVERY.FAILURE:
      return { ...state, availableOrdersList: { ...state.availableOrdersList, ...METADATA.error, error: action.error }};
    case GET_HISTORY_ORDERS_FOR_DELIVERY.REQUEST:
      return { ...state, historyOrdersList: { ...state.historyOrdersList, ...METADATA.request }};
    case GET_HISTORY_ORDERS_FOR_DELIVERY.SUCCESS:
      return { ...state, historyOrdersList: { ...METADATA.success, data: action.payload }};
    case GET_HISTORY_ORDERS_FOR_DELIVERY.FAILURE:
      return { ...state, historyOrdersList: { ...state.historyOrdersList, ...METADATA.error, error: action.error }};

    default:
      return state;
  }
};

export default deliveryReducer;