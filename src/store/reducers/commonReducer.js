import {METADATA} from '../../common/metadata';
import {
  CLEAR_CONVERTED_ITEMS, CLEAR_SERVICE_DATA,
  CLEAR_TRANSLATE_ITEMS,
  GET_CITIES_AND_COUNTRIES, GET_COMMENTED_ITEMS,
  GET_CURRENCY,
  GET_CURRENCY_CONVERSION,
  GET_LANGUAGE_TRANSLATE_LIST, GET_SERVICE_CATEGORIES,
  GET_SERVICE_ORGANIZATIONS,
  GET_TRANSLATION_SHOP_ITEM, GET_USER_EMAIL_BY_PHONE_NUMBER,
  SET_AUTH_CHANGE_CODE,
  SET_GLOBAL_MENU,
  SET_ORGANIZATIONS_MAP_REGION,
  SET_PLAYING_VIDEO_ID,
  SET_SELECTED_ADDRESS,
  SET_SERVICES_LIST,
  SET_SHOW_QR,
  SET_TOOLTIP_PLAYER, SET_TYPE_RESEND_CODE,
  SET_USER_DETAIL,
  SET_USER_GEO,
  SET_VIEWS
} from '../actions/actionTypes';

const initialState = {
  currency: { ...METADATA.default, data: null },
  citiesAndCountries: { ...METADATA.default, data: null, hasMore: true },
  serviceOrganizations: { ...METADATA.default, data: null },
  translateItem: { ...METADATA.default, data: null, currentCode: null },
  languageTranslateList: { ...METADATA.default, data: null},
  convertedItems: { ...METADATA.default, currentConvertedItem: null, data: {}},
  serviceCategories: { ...METADATA.default, data: null },
  commentedItems: { ...METADATA.default, data: null, hasMore: true },
  emailForConfirmation: { ...METADATA.default, data: null },
  userGEO: { lat: 42.877300695188, ltd: 74.60012376308443 },
  services: [],
  authChangeCode: null,
  tooltipPlayer: null,
  playingVideoID: null,
  views: [],
  globalMenu: null,
  userDetail: null,
  showQR: false,
  typeResendCode: null,
  organizationsMapRegion: null,
  selectedAddress: null,
};

const commonReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CURRENCY.REQUEST:
      return { ...state, currency: { ...state.currency, ...METADATA.request }}
    case GET_CURRENCY.SUCCESS:
      return { ...state, currency: { ...state.currency, ...METADATA.success, data: action.currency }}
    case GET_CURRENCY.FAILURE:
      return { ...state, currency: { ...state.currency, ...METADATA.error, error: action.error }}
    case GET_CITIES_AND_COUNTRIES.REQUEST:
      return { ...state, citiesAndCountries: { ...state.citiesAndCountries, ...METADATA.request }}
    case GET_CITIES_AND_COUNTRIES.SUCCESS:
      return { ...state, citiesAndCountries: { ...METADATA.success, ...action.calculatedData }}
    case GET_CITIES_AND_COUNTRIES.FAILURE:
      return { ...state, citiesAndCountries: { ...state.citiesAndCountries, ...METADATA.error, error: action.error }}
    case GET_SERVICE_ORGANIZATIONS.REQUEST:
      return { ...state, serviceOrganizations: { ...state.serviceOrganizations, ...METADATA.request }}
    case GET_SERVICE_ORGANIZATIONS.SUCCESS:
      return { ...state, serviceOrganizations: { ...METADATA.success, data: action.payload }}
    case GET_SERVICE_ORGANIZATIONS.FAILURE:
      return { ...state, serviceOrganizations: { ...state.serviceOrganizations, ...METADATA.error, error: action.error }}
    case GET_TRANSLATION_SHOP_ITEM.REQUEST:
      return { ...state, translateItem: { ...state.translateItem, ...METADATA.request }}
    case GET_TRANSLATION_SHOP_ITEM.SUCCESS:
      return { ...state, translateItem: { ...state.translateItem, ...METADATA.success, data: action.payload.translate, currentCode: action.payload.code}}
    case GET_TRANSLATION_SHOP_ITEM.FAILURE:
      return { ...state, translateItem: { ...state.translateItem, ...METADATA.error, error: action.payload }}
    case GET_LANGUAGE_TRANSLATE_LIST.REQUEST:
      return { ...state, languageTranslateList: { ...state.languageTranslateList, ...METADATA.request }}
    case GET_LANGUAGE_TRANSLATE_LIST.SUCCESS:
      return { ...state, languageTranslateList: { ...state.languageTranslateList, ...METADATA.success, data: action.payload }}
    case GET_LANGUAGE_TRANSLATE_LIST.FAILURE:
      return { ...state, languageTranslateList: { ...state.languageTranslateList, ...METADATA.error, error: action.payload }}
    case GET_CURRENCY_CONVERSION.REQUEST:
      return { ...state, convertedItems: { ...state.convertedItems, ...METADATA.request, currentConvertedItem: action.payload} };
    case GET_CURRENCY_CONVERSION.SUCCESS:
      return { ...state, convertedItems: {  ...state.convertedItems, ...METADATA.success, currentConvertedItem: null,
          data: {
            ...state.convertedItems.data,
            [action.payload.name]: {
              ...state.convertedItems.data[action.payload.name],
              [action.payload.id]: {
                price: action.payload.price, currency: action.payload.currency}
            }
      }}};
    case GET_CURRENCY_CONVERSION.FAILURE:
      return { ...state, convertedItems: { ...state.convertedItems, ...METADATA.error, error: action.payload} };
    case GET_SERVICE_CATEGORIES.REQUEST:
      return { ...state, serviceCategories: { ...state.serviceCategories, ...METADATA.request }};
    case GET_SERVICE_CATEGORIES.SUCCESS:
      return { ...state, serviceCategories: { ...state.serviceCategories, ...METADATA.success, data: action.payload } };
    case GET_SERVICE_CATEGORIES.FAILURE:
      return { ...state, serviceCategories: { ...state.serviceCategories, ...METADATA.error, error: action.error }};
    case GET_COMMENTED_ITEMS.REQUEST:
      return { ...state, commentedItems: { ...state.commentedItems, ...METADATA.request }};
    case GET_COMMENTED_ITEMS.SUCCESS:
      return { ...state, commentedItems: { ...state.commentedItems, ...METADATA.success, data: action.payload }};
    case GET_COMMENTED_ITEMS.FAILURE:
      return { ...state, commentedItems: { ...state.commentedItems, ...METADATA.error, error: action.payload }};
    case GET_USER_EMAIL_BY_PHONE_NUMBER.REQUEST:
      return { ...state, emailForConfirmation: { ...state.emailForConfirmation, ...METADATA.request }};
    case GET_USER_EMAIL_BY_PHONE_NUMBER.SUCCESS:
      return { ...state, emailForConfirmation: { ...state.emailForConfirmation, ...METADATA.success, data: action.payload }};
    case GET_USER_EMAIL_BY_PHONE_NUMBER.FAILURE:
      return { ...state, emailForConfirmation: { ...state.emailForConfirmation, ...METADATA.error, error: action.payload }};
    case CLEAR_CONVERTED_ITEMS:
      return {...state,  convertedItems: {  ...state.convertedItems, data: {}}};
    case CLEAR_TRANSLATE_ITEMS:
      return { ...state, translateItem: { ...state.translateItem, data: null, currentCode: null}}
    case CLEAR_SERVICE_DATA:
      return { ...state, serviceOrganizations: { ...METADATA.default, data: null }, serviceCategories: { ...METADATA.default, data: null }}
    case SET_AUTH_CHANGE_CODE:
      return { ...state, authChangeCode: action.code}
    case SET_USER_GEO:
      return { ...state, userGEO: action.geo }
    case SET_TOOLTIP_PLAYER:
      return { ...state, tooltipPlayer: action.player }
    case SET_PLAYING_VIDEO_ID:
      return { ...state, playingVideoID: action.id }
    case SET_VIEWS:
      return { ...state, views: action.views }
    case SET_USER_DETAIL:
      return { ...state, userDetail: action.user }
    case SET_GLOBAL_MENU:
      return { ...state, globalMenu: action.value }
    case SET_SERVICES_LIST:
      return { ...state, services: action.payload }
    case SET_SHOW_QR:
      return { ...state, showQR: !state.showQR }
    case SET_TYPE_RESEND_CODE:
      return { ...state, typeResendCode: action.payload }

    case SET_ORGANIZATIONS_MAP_REGION:
      return { ...state, organizationsMapRegion: action.payload }

    case SET_SELECTED_ADDRESS:
      return { ...state, selectedAddress: action.payload }

    default:
      return state;
  }
};

export default commonReducer;