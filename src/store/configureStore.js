import axios from "../axios-api";
import thunkMiddleware from "redux-thunk";
import Cookies from "js-cookie";
import moment from "moment";
import { createBrowserHistory } from "history";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { loadFromCookie, saveToCookie } from "./cookies";
import {
  DATE_FORMAT_YYYY_MM_T_HH_MM_SS,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
} from "../common/constants";
import { logoutUser, getUser } from "./actions/userActions";
import userReducer from "./reducers/userReducer";
import profileReducer from "./reducers/profileReducer";
import organizationReducer from "./reducers/organizationReducer";
import commonReducer from "./reducers/commonReducer";
import discountReducer from "./reducers/discountReducer";
import homeReducer from "./reducers/homeReducer";
import SubscriptionReducer from "./reducers/subscriptionReducer";
import statisticReducer from "./reducers/statisticReducer";
import {
  getDataFromLocalStorage,
  loadFromLocalStorage,
  saveToLocalStorage,
} from "./localStorage";
import notificationReducer from "./reducers/notificationReducer";
import employeeReducer from "./reducers/employeeReducer";
import messageReducer from "./reducers/messageReducer";
import partnerReducer from "./reducers/partnerReducer";
import attendanceReducer from "./reducers/attendanceReducer";
import bannerReducer from "./reducers/bannerReducer";
import postReducer from "./reducers/postReducer";
import cartReducer from "./reducers/cartReducer";
import shopReducer from "./reducers/shopReducer";
import receiptReducer from "./reducers/receiptReducer";
import deliveryReducer from "./reducers/deliveryReducer";
import postsReducer from "./reducers/postsReducer";
import stockReducer from "./reducers/stockReducer";
import subscriptionTarrifReducer from "./reducers/subscriptionTarrifReducer";
import rentReducer from "./reducers/rentReducer";
import { LOCALES } from "../locales/locales";
import nominatimApi from "../nominatim-api";
import originAxios from "axios";
import invoiceReducer from "./reducers/invoiceReducer";
import aiDataReducer from "./reducers/aiDataReducer";
import aiImagesReducer from "./reducers/aiImagesReducer";
import manualImagesReducer from "./reducers/manualImagesReducer";
import currencyReducer from "./reducers/currencyReducer";
import { tariffStatusReducer } from "./reducers/tariffReducer";
import { chosenProductReducer } from "./reducers/chosenProductReducer";
import couponReducer from "./reducers/couponReducer";
import { categoriesReducer } from "./reducers/categoriesReducer";
import { formReducerCoupon } from "./reducers/formReducerCoupon";
import { arrayReducer } from "./reducers/arrayReducer";
import couponResponseReducer from "./reducers/couponResponseReducer";
import orgIdReducer from "./reducers/orgIdReducer";
import orgDetailPerm from "./reducers/orgDetail";
import commentsReducer from "./reducers/commentsReducer";
import themeReducer from "./reducers/themeReducer";

export const history = createBrowserHistory();

const rootReducer = combineReducers({
  router: connectRouter(history),
  userStore: userReducer,
  profileStore: profileReducer,
  organizationStore: organizationReducer,
  commonStore: commonReducer,
  discountStore: discountReducer,
  homeStore: homeReducer,
  subscriptionStore: SubscriptionReducer,
  statisticStore: statisticReducer,
  notificationStore: notificationReducer,
  employeeStore: employeeReducer,
  messageStore: messageReducer,
  partnerStore: partnerReducer,
  attendanceStore: attendanceReducer,
  bannerStore: bannerReducer,
  postStore: postReducer,
  cartStore: cartReducer,
  shopStore: shopReducer,
  receiptStore: receiptReducer,
  deliveryStore: deliveryReducer,
  postsStore: postsReducer,
  stockStore: stockReducer,
  rentStore: rentReducer,
  subscriptionTarrifReducer: subscriptionTarrifReducer,
  invoice: invoiceReducer,
  aiData: aiDataReducer,
  aiImages: aiImagesReducer,
  manualImages: manualImagesReducer,
  currency: currencyReducer,
  tariffStatus: tariffStatusReducer,
  chosenProduct: chosenProductReducer,
  coupon: couponReducer,
  categories: categoriesReducer,
  dataCoupon: formReducerCoupon,
  couponBanner: arrayReducer,
  discountCoupon: couponResponseReducer,
  orgId: orgIdReducer,
  orgDetail: orgDetailPerm,
  comments: commentsReducer,
  theme: themeReducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const middleware = [thunkMiddleware, routerMiddleware(history)];

if (process.env.NODE_ENV === `development`) {
  const { createLogger } = require(`redux-logger`);
  const logger = createLogger({
    diff: true,
    collapsed: true,
    titleFormatter: (action) => `[action] ${action.type}`,
    level: { prevState: false, nextState: false, error: false },
  });
  middleware.push(logger);
}

const enhancers = composeEnhancers(applyMiddleware(...middleware));
let locale = window.navigator
  ? window.navigator.language ||
    window.navigator.systemLanguage ||
    window.navigator.userLanguage
  : DEFAULT_LANGUAGE;
locale = locale.substr(0, 2).toLowerCase();
locale = locale in LOCALES ? locale : DEFAULT_LANGUAGE;

let persistedState = {
  userStore: {
    user: null,
    token: null,
    region: null,
    locale,
    userLocation: null,
    loading: false,
    error: null,
    loginError: null,
    registerError: null,
  },
};

// SSO: Check for token in URL fragment (from EasyCard redirect)
// Fragment (#token=xxx) is more secure than query (?token=xxx):
// - Not sent to server
// - Not logged in access logs
// - Not passed in Referer header
const hash = window.location.hash.substring(1); // remove #
const hashParams = new URLSearchParams(hash);
const ssoToken = hashParams.get('token');

const cookieState = loadFromCookie();
const storageState = loadFromLocalStorage();

if (cookieState) {
  persistedState = {
    userStore: { ...persistedState.userStore, ...cookieState.userStore },
  };
}

if (storageState) {
  persistedState = {
    userStore: {
      ...persistedState.userStore,
      ...storageState.userStore,
    },
  };
}

// SSO: If token is in URL fragment, use it (overrides cookie/storage)
if (ssoToken) {
  persistedState = {
    userStore: {
      ...persistedState.userStore,
      token: ssoToken,
      user: null, // Will be fetched after store init
    },
  };
  // Clean URL (remove fragment)
  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
}

const store = createStore(rootReducer, persistedState, enhancers);

store.subscribe(() => {
  const currentState = store.getState().userStore;

  // Автоматически определяем регион, если у пользователя есть токен, но нет региона
  if (currentState.token && !currentState.region && !currentState.loading) {
    // Проверяем, не запущен ли уже процесс определения региона
    if (!store._isDetectingRegion) {
      store._isDetectingRegion = true;
    }
  }

  saveToCookie(
    {
      userStore: {
        user: currentState.user,
        token: currentState.token,
      },
    },
    { expires: 7 },
  );

  saveToLocalStorage({
    userStore: {
      region: currentState.region,
      printPaperWidth: currentState.printPaperWidth,
      locale: currentState.locale,
    },
  });
});

axios.interceptors.request.use((config) => {
  try {
    const token = store.getState().userStore.token;
    const locale = store.getState().userStore.locale;
    const currency = getDataFromLocalStorage("myCurrency") || DEFAULT_CURRENCY;

    config.headers["Device-Timestamp"] = moment().format(
      DATE_FORMAT_YYYY_MM_T_HH_MM_SS,
    );
    config.headers["Accept-Language"] = locale;
    config.headers["Currency"] = currency;

    if (token && config.headers.Authorization === undefined) {
      config.headers.Authorization = `Token ${token}`;
      config.headers["X-CSRFToken"] = Cookies.get("csrftoken");
      config.headers["X-Requested-With"] = "XMLHttpRequest";
    }
  } catch (e) {
    // do nothing, user is not logged in
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response && error.response.status === 401) {
      store.dispatch(logoutUser());
    }

    // код который мне показался правильным, оказалось нет, оставляю на память

    // if (error.response.status === 401) {
    //   const state = store.getState();
    //   const hasToken = !!state.userStore.token;

    //   if (hasToken) {
    //     store.dispatch(logoutUser({ silent: true }));
    //   }
    // }

    return error.response
      ? error.response
      : {
          data: {
            message: error.message,
            isCanceled: originAxios.isCancel(error),
          },
        };
  },
);

nominatimApi.interceptors.request.use((config) => {
  try {
    config.headers["Accept-Language"] = store.getState().userStore.locale;
  } catch (e) {
    // do nothing, user is not logged in
  }
  return config;
});

nominatimApi.interceptors.response.use(
  (response) => response,
  (error) => {
    return error.response
      ? error.response
      : { data: { message: error.message } };
  },
);

// SSO: Fetch user data if we have a token from URL
// Must be called AFTER axios interceptors are set up
if (ssoToken) {
  store.dispatch(getUser());
}

export default store;
