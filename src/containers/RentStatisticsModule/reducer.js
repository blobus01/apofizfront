import produce from "immer";
import {CHANGE_TIME_INTERVAL, SET_HAS_MORE, SET_LOADING, SET_PAGE, TOGGLE_INTERVAL_MENU} from "./actionTypes";

export const reducer = (state, {type, payload}) => produce(state, stateDraft => {
  switch (type) {
    case CHANGE_TIME_INTERVAL:
      return {
        ...stateDraft,
        start: payload.start,
        end: payload.end,
        page: 1,
        hasMore: true,
        showMenu: false,
        loading: true
      }
    case TOGGLE_INTERVAL_MENU:
      stateDraft.showIntervalMenu = payload ?? !stateDraft.showIntervalMenu
      return
    case SET_PAGE:
      stateDraft.page = payload
      return
    case SET_LOADING:
      stateDraft.loading = false
      return
    case SET_HAS_MORE:
      stateDraft.hasMore = payload
      return
    default:
      throw Error(`Unknown action: ${type}`)
  }
})