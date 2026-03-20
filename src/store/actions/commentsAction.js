// comments.actions.js
import { SET_COMMENTS_CHAT_ID } from "../actionTypes/commentsTypes";

export const setCommentsChatId = (chatId) => ({
  type: SET_COMMENTS_CHAT_ID,
  payload: chatId,
});
