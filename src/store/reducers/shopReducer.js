import {
  SET_EVENT_UNPROCESSED_TRANS_COUNT,
  SET_RENT_UNPROCESSED_TRANS_COUNT,
  SET_TOTAL_CART_AMOUNT,
  SET_UNPROCESSED_TRANS_COUNT
} from '../actionTypes/shopTypes';

const initialState = {
  allCartsTotalCount: 0,
  unprocessedTransCount: 0,
  rentUnprocessedTransCount: 0,
  eventUnprocessedTransCount: 0,
};

const shopReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TOTAL_CART_AMOUNT:
      return {...state, allCartsTotalCount: action.count};
    case SET_UNPROCESSED_TRANS_COUNT:
      return {...state, unprocessedTransCount: action.count};

    case SET_RENT_UNPROCESSED_TRANS_COUNT:
      return {...state, rentUnprocessedTransCount: action.count}

    case SET_EVENT_UNPROCESSED_TRANS_COUNT:
      return {...state, eventUnprocessedTransCount: action.count}
    default:
      return state;
  }
};

export default shopReducer;