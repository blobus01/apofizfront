import {METADATA} from '../../common/metadata';
import {
  GET_ORG_MESSAGES,
  GET_SUBSCRIPTION_MESSAGES
} from '../actionTypes/messageTypes';

const initialState = {
  orgMessages: { ...METADATA.default, data: null },
  subscriptionMessages: { ...METADATA.default, data: null },
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ORG_MESSAGES.REQUEST:
      return { ...state, orgMessages: { ...state.orgMessages, ...METADATA.request }};
    case GET_ORG_MESSAGES.SUCCESS:
      return { ...state, orgMessages: { ...METADATA.success, data: action.payload }};
    case GET_ORG_MESSAGES.FAILURE:
      return { ...state, orgMessages: { ...state.orgMessages, ...METADATA.error, error: action.error }};
    case GET_SUBSCRIPTION_MESSAGES.REQUEST:
      return { ...state, subscriptionMessages: { ...state.subscriptionMessages, ...METADATA.request }};
    case GET_SUBSCRIPTION_MESSAGES.SUCCESS:
      return { ...state, subscriptionMessages: { ...METADATA.success, data: action.payload }};
    case GET_SUBSCRIPTION_MESSAGES.FAILURE:
      return { ...state, subscriptionMessages: { ...state.subscriptionMessages, ...METADATA.error, error: action.error }};
      
    default:
      return state;
  }
};

export default messageReducer;