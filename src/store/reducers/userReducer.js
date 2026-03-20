import { DEFAULT_LANGUAGE } from "../../common/constants";

import {
  GET_USER,
  LOGIN_USER,
  LOGOUT_USER,
  PROFILE_UPDATE,
  SET_LOCALE,
  SET_PRINT_PAPER_WIDTH,
  SET_REGION,
  SET_TOKEN,
  SET_USER_LOCATION,
} from "../actions/actionTypes";

const initialState = {
  user: null,
  token: null,
  region: null,
  locale: DEFAULT_LANGUAGE,
  userLocation: null,
  loading: false,
  error: null,
  loginError: null,
  registerError: null,
  printPaperWidth: 80,
  prevPath: null, // добавлено поле для хранения предыдущего пути
  searchState: false,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_USER.REQUEST:
      return { ...state, loading: true };
    case LOGIN_USER.SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        loginError: null,
        loading: false,
      };
    case LOGIN_USER.FAILURE:
      return { ...state, loginError: action.error, loading: false };
    case SET_USER_LOCATION:
      return { ...state, userLocation: action.location };
    case SET_TOKEN:
      return { ...state, token: action.token };
    case GET_USER.REQUEST:
      return { ...state, loading: true, error: null };
    case GET_USER.SUCCESS:
      return { ...state, user: action.user, loading: false, error: null };
    case GET_USER.FAILURE:
      return { ...state, loading: false, error: action.error };
    case LOGOUT_USER:
      return {
        ...state,
        user: null,
        token: null,
        region: null,
        prevPath: null,
      };
    case PROFILE_UPDATE.REQUEST:
      return { ...state, user: { ...state.user } };
    case PROFILE_UPDATE.SUCCESS:
      return { ...state, user: action.user };
    case PROFILE_UPDATE.FAILURE:
      return { ...state, user: { ...state.user } };
    case SET_REGION:
      return { ...state, region: action.region };
    case SET_LOCALE:
      return { ...state, locale: action.locale };
    case SET_PRINT_PAPER_WIDTH:
      return { ...state, printPaperWidth: action.size };
    case "SET_PREV_PATH":
      return { ...state, prevPath: action.payload };
    case "CLEAR_PREV_PATH":
      return { ...state, prevPath: null };
    case "SET_SEARCH_STATE":
      return { ...state, searchState: action.payload };
    default:
      return state;
  }
};

export default userReducer;
