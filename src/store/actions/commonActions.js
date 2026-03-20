import axios from "../../axios-api";
import Pathes from "../../common/pathes";
import Notify from "../../components/Notification";
import { getMessage } from "../../common/helpers";
import { getQuery } from "../../common/utils";
import { translate } from "../../locales/locales";
import {
  CLEAR_CONVERTED_ITEMS,
  CLEAR_SERVICE_DATA,
  CLEAR_TRANSLATE_ITEMS,
  GET_CITIES_AND_COUNTRIES,
  GET_COMMENTED_ITEMS,
  GET_CURRENCY,
  GET_CURRENCY_CONVERSION,
  GET_LANGUAGE_TRANSLATE_LIST,
  GET_SERVICE_CATEGORIES,
  GET_SERVICE_ORGANIZATIONS,
  GET_TRANSLATION_SHOP_ITEM,
  GET_USER_EMAIL_BY_PHONE_NUMBER,
  SET_AUTH_CHANGE_CODE,
  SET_GLOBAL_MENU,
  SET_ORGANIZATIONS_MAP_REGION,
  SET_PLAYING_VIDEO_ID,
  SET_SERVICES_LIST,
  SET_TOOLTIP_PLAYER,
  SET_TYPE_RESEND_CODE,
  SET_USER_DETAIL,
  SET_USER_GEO,
  SET_VIEWS,
  SET_SELECTED_ADDRESS,
} from "./actionTypes";
import {
  getCommentedItems,
  getCurrencyConversionResult,
  getLanguagesList,
  getServiceCategoriesList,
  translateShopItem,
  getUserEmail,
} from "../services/commonServices";

const getCurrenciesRequest = () => ({ type: GET_CURRENCY.REQUEST });
const getCurrenciesSuccess = (currency) => ({
  type: GET_CURRENCY.SUCCESS,
  currency,
});
const getCurrenciesFailure = (error) => ({ type: GET_CURRENCY.FAILURE, error });

const getCitiesAndCountriesRequest = () => ({
  type: GET_CITIES_AND_COUNTRIES.REQUEST,
});
const getCitiesAndCountriesSuccess = (calculatedData) => ({
  type: GET_CITIES_AND_COUNTRIES.SUCCESS,
  calculatedData,
});
const getCitiesAndCountriesFailure = (error) => ({
  type: GET_CITIES_AND_COUNTRIES.FAILURE,
  error,
});

const getServiceOrganizationsRequest = () => ({
  type: GET_SERVICE_ORGANIZATIONS.REQUEST,
});
const getServiceOrganizationsSuccess = (payload) => ({
  type: GET_SERVICE_ORGANIZATIONS.SUCCESS,
  payload,
});
const getServiceOrganizationsFailure = (error) => ({
  type: GET_SERVICE_ORGANIZATIONS.FAILURE,
  error,
});

const getTranslateShopItemRequest = () => ({
  type: GET_TRANSLATION_SHOP_ITEM.REQUEST,
});
const getTranslateShopItemSuccess = (translate, code) => ({
  type: GET_TRANSLATION_SHOP_ITEM.SUCCESS,
  payload: { translate, code },
});
const getTranslateShopItemFailure = (error) => ({
  type: GET_TRANSLATION_SHOP_ITEM.FAILURE,
  payload: error,
});

const getLanguageTranslateListRequest = () => ({
  type: GET_LANGUAGE_TRANSLATE_LIST.REQUEST,
});
const getLanguageTranslateListSuccess = (language) => ({
  type: GET_LANGUAGE_TRANSLATE_LIST.SUCCESS,
  payload: language,
});
const getLanguageTranslateListFailure = (error) => ({
  type: GET_LANGUAGE_TRANSLATE_LIST.FAILURE,
  payload: error,
});

const getCurrencyConversionRequest = (id) => ({
  type: GET_CURRENCY_CONVERSION.REQUEST,
  payload: id,
});
const getCurrencyConversionSuccess = (price, id, currency, name) => ({
  type: GET_CURRENCY_CONVERSION.SUCCESS,
  payload: { price, id, currency, name },
});
const getCurrencyConversionFailure = (error) => ({
  type: GET_CURRENCY_CONVERSION.SUCCESS,
  payload: error,
});

const getServiceCategoriesRequest = () => ({
  type: GET_SERVICE_CATEGORIES.REQUEST,
});
const getServiceCategoriesSuccess = (categories) => ({
  type: GET_SERVICE_CATEGORIES.SUCCESS,
  payload: categories,
});
const getServiceCategoriesFailure = (error) => ({
  type: GET_SERVICE_CATEGORIES.FAILURE,
  payload: error,
});

const getCommentedItemsRequest = () => ({ type: GET_COMMENTED_ITEMS.REQUEST });
const getCommentedItemsSuccess = (data) => ({
  type: GET_COMMENTED_ITEMS.SUCCESS,
  payload: data,
});
const getCommentedItemsFailure = (error) => ({
  type: GET_COMMENTED_ITEMS.FAILURE,
  payload: error,
});

const setServicesList = (payload) => ({ type: SET_SERVICES_LIST, payload });

export const clearTranslateItems = () => ({ type: CLEAR_TRANSLATE_ITEMS });
export const clearConvertedItem = (id, name) => ({
  type: CLEAR_CONVERTED_ITEMS,
  payload: { id, name },
});
export const clearServiceData = () => ({ type: CLEAR_SERVICE_DATA });

const getUserEmailByPhoneNumberRequest = () => ({
  type: GET_USER_EMAIL_BY_PHONE_NUMBER.REQUEST,
});
const getUserEmailByPhoneNumberSuccess = (payload) => ({
  type: GET_USER_EMAIL_BY_PHONE_NUMBER.SUCCESS,
  payload,
});
const getUserEmailByPhoneNumberFailure = (payload) => ({
  type: GET_USER_EMAIL_BY_PHONE_NUMBER.FAILURE,
  payload,
});

export const setTypeResendCode = (payload) => ({
  type: SET_TYPE_RESEND_CODE,
  payload,
});

export const setOrganizationsMapRegion = (payload) => ({
  type: SET_ORGANIZATIONS_MAP_REGION,
  payload,
});

export const setSelectedAddress = (payload) => ({
  type: SET_SELECTED_ADDRESS,
  payload,
});

export const uploadFile = (fileObj) => {
  return () => {
    let file;
    if (fileObj instanceof FormData) {
      file = fileObj;
    } else {
      file = new FormData();
      file.append("file", fileObj);
    }

    return axios
      .post(Pathes.File.upload, file)
      .then(
        (response) =>
          response &&
          response.status === 201 && { ...response.data, success: true }
      )
      .catch(() =>
        Notify.info({
          text: translate(
            "Не удалось загрузить изображение",
            "notify.imageUploadError"
          ),
        })
      );
  };
};

export const getCurrencies = () => {
  return (dispatch) => {
    dispatch(getCurrenciesRequest());
    return axios
      .get(Pathes.Common.currency)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getCurrenciesSuccess(data));
          return { ...data, success: true };
        }

        throw new Error(message);
      })
      .catch((e) => dispatch(getCurrenciesFailure(e.message)));
  };
};

export const setAuthChangeCode = (code) => {
  return (dispatch) => {
    dispatch({ type: SET_AUTH_CHANGE_CODE, code });
  };
};

export const setUserGEO = (geo) => {
  return (dispatch) => dispatch({ type: SET_USER_GEO, geo });
};

export const setTooltipPlayer = (player) => {
  return (dispatch) => dispatch({ type: SET_TOOLTIP_PLAYER, player });
};

export const setGlobalMenu = (value) => {
  return (dispatch) => dispatch({ type: SET_GLOBAL_MENU, value });
};

export const getCitiesAndCountries = (params, nextLink) => {
  return (dispatch, getState) => {
    dispatch(getCitiesAndCountriesRequest());
    let url = nextLink
      ? nextLink
      : Pathes.Common.citiesAndCountries + getQuery(params, ["isLoading"]);
    return axios
      .get(url)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const items = [];
          Object.keys(data.results).forEach((key) => {
            data.results[key].forEach((item) =>
              items.push({
                type: key,
                ...item,
              })
            );
          });

          const prevData = getState().commonStore.citiesAndCountries.data;
          if (!nextLink || !prevData) {
            const parsedData = {
              hasMore: !!data.next,
              data: { ...data, results: items },
            };
            dispatch(getCitiesAndCountriesSuccess(parsedData));
            return { data: parsedData, success: true };
          }

          const mergedData = {
            hasMore: !!data.next,
            data: { ...data, results: [...prevData.results, ...items] },
          };
          dispatch(getCitiesAndCountriesSuccess(mergedData));
          return { data: mergedData, success: true };
        }
        throw new Error(message);
      })
      .catch((e) => dispatch(getCitiesAndCountriesFailure(e.message)));
  };
};

export const setPlayingVideoID = (videoID) => {
  return (dispatch) => dispatch({ type: SET_PLAYING_VIDEO_ID, id: videoID });
};

export const setViews = (value) => {
  return (dispatch, getState) => {
    if (Array.isArray(value)) {
      return dispatch({ type: SET_VIEWS, views: value });
    }
    const { views } = getState().commonStore;
    return dispatch({ type: SET_VIEWS, views: [...views, value] });
  };
};

export const setUserDetail = (user) => {
  return (dispatch) => dispatch({ type: SET_USER_DETAIL, user });
};

// Get services list - https://gitlab.com/qrcode_group/backend/-/wikis/Services#get-services-list
export const getServices = (params) => {
  return (dispatch) => {
    return axios
      .get(Pathes.Services.list + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setServicesList(data));
          return { data, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => ({ error: e.message, success: false }));
  };
};

// Get services organizations list - https://gitlab.com/qrcode_group/backend/-/wikis/Services#get-services-organizations-list
export const getServiceOrganizations = (serviceID, params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getServiceOrganizationsRequest());
    return axios
      .get(Pathes.Services.organizationByService(serviceID) + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().commonStore.serviceOrganizations.data;
          if (!isNext || !prevData) {
            dispatch(getServiceOrganizationsSuccess(data));
            return { data, success: true };
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            name: data.name,
            list: [...prevData.list, ...data.list],
          };
          dispatch(getServiceOrganizationsSuccess(updatedData));
          return { data: updatedData, success: true };
        }

        throw new Error(message);
      })
      .catch((e) => {
        dispatch(getServiceOrganizationsFailure(e.message));
        return { success: false };
      });
  };
};

export const getTranslateShopItem = (title, description, code, categories) => {
  return async (dispatch) => {
    try {
      dispatch(getTranslateShopItemRequest());
      const response = await translateShopItem(
        title,
        description,
        code,
        categories
      );
      dispatch(getTranslateShopItemSuccess(response.data, code));
    } catch (e) {
      Notify.error({ text: "Ошибка в переводе" });
      dispatch(getTranslateShopItemFailure(e.message));
    }
  };
};

export const getLanguageTranslateList = () => {
  return async (dispatch) => {
    try {
      dispatch(getLanguageTranslateListRequest());
      const response = await getLanguagesList();
      dispatch(getLanguageTranslateListSuccess(response.data));
    } catch (e) {
      dispatch(getLanguageTranslateListFailure(e.message));
    }
  };
};

export const getCurrencyConversion = (from, to, amount, id, name) => {
  return async (dispatch) => {
    try {
      dispatch(getCurrencyConversionRequest(id));
      const priceResponse = await getCurrencyConversionResult(from, to, amount);
      dispatch(
        getCurrencyConversionSuccess(priceResponse.data.amount, id, to, name)
      );
    } catch (e) {
      Notify.error({ text: e.message });
      dispatch(getCurrencyConversionFailure(e.message));
    }
  };
};

export const getServiceCategories = (serviceID, params) => {
  return async (dispatch) => {
    try {
      dispatch(getServiceCategoriesRequest());
      const { data } = await getServiceCategoriesList(serviceID, params);
      dispatch(getServiceCategoriesSuccess(data));
    } catch (e) {
      dispatch(getServiceCategoriesFailure(e.message));
    }
  };
};

export const commentedItems = (params, isNext) => {
  return async (dispatch, getState) => {
    try {
      dispatch(getCommentedItemsRequest());
      let { data } = await getCommentedItems(params);

      if (isNext) {
        const prevData = getState().commonStore.commentedItems.data;

        data = {
          total_count: data.total_count,
          total_pages: data.total_pages,
          list: [...prevData.list, ...data.list],
        };
      }

      dispatch(getCommentedItemsSuccess(data));
    } catch (e) {
      Notify.error({ text: "Что-то пошло не так" });
      dispatch(getCommentedItemsFailure(e.message));
    }
  };
};

export const getUserEmailByPhoneNumber = (phoneNumber) => {
  return async (dispatch) => {
    try {
      dispatch(getUserEmailByPhoneNumberRequest());
      const { data } = await getUserEmail(phoneNumber);
      dispatch(getUserEmailByPhoneNumberSuccess(data.email));
    } catch (e) {
      Notify.error({ text: "Не получилось получть почту по номеру" });
      dispatch(getUserEmailByPhoneNumberFailure(e.message));
    }
  };
};
