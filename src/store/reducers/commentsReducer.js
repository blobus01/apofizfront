// comments.reducer.js
import { SET_COMMENTS_CHAT_ID } from "../actionTypes/commentsTypes";

const initialState = {
  chatId: null,
  list: [],
  loading: false,
};

const commentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_COMMENTS_CHAT_ID:
      return {
        ...state,
        chatId: action.payload,
      };

    default:
      return state;
  }
};

export default commentsReducer;
