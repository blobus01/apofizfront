import {METADATA} from '../../common/metadata';
import {
  CLEAR_SEARCH_SUGGEST_RESULT,
  GET_HOME_ORGANIZATIONS, GET_HOME_PARTNERS,
  GET_LOCAL_BANNERS,
  GET_ORGS_BY_CATEGORIES, GET_PARTNERS_LIST,
  GET_SEARCH_RESULT, GET_SEARCH_SUGGEST_RESULT,
  SELECT_CATEGORY
} from '../actionTypes/homeTypes';

const initialState = {
  homePartners: { ...METADATA.default, data: null},
  partnersList: { ...METADATA.default, data: null },
  homeOrganizations: { ...METADATA.default, data: null },
  localBanners: { ...METADATA.default, data: null },
  orgsByCategories: { ...METADATA.default, data: null },
  searchResult: { ...METADATA.default, data: null },
  searchSuggestResult: { ...METADATA.default, data: null },
  selectedCategory: null,
};

const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_HOME_ORGANIZATIONS.REQUEST:
      return { ...state, homeOrganizations: { ...state.homeOrganizations, ...METADATA.request }};
    case GET_HOME_ORGANIZATIONS.SUCCESS:
      return { ...state, homeOrganizations: { ...METADATA.success, data: action.payload }};
    case GET_HOME_ORGANIZATIONS.FAILURE:
      return { ...state, homeOrganizations: { ...state.homeOrganizations, ...METADATA.error, error: action.error }};
    case GET_HOME_PARTNERS.REQUEST:
      return { ...state, homePartners: { ...state.homePartners, ...METADATA.request }};
    case GET_HOME_PARTNERS.SUCCESS:
      return { ...state, homePartners: { ...METADATA.success, data: action.payload }};
    case GET_HOME_PARTNERS.FAILURE:
      return { ...state, homePartners: { ...state.homePartners, ...METADATA.error, error: action.error }};
    case GET_PARTNERS_LIST.REQUEST:
      return { ...state, partnersList: { ...state.partnersList, ...METADATA.request }};
    case GET_PARTNERS_LIST.SUCCESS:
      return { ...state, partnersList: { ...METADATA.success, data: action.payload }};
    case GET_PARTNERS_LIST.FAILURE:
      return { ...state, partnersList: { ...state.partnersList, ...METADATA.error, error: action.error }};
    case GET_LOCAL_BANNERS.REQUEST:
      return { ...state, localBanners: { ...state.localBanners, ...METADATA.request }};
    case GET_LOCAL_BANNERS.SUCCESS:
      return { ...state, localBanners: { ...METADATA.success, data: action.payload }};
    case GET_LOCAL_BANNERS.FAILURE:
      return { ...state, localBanners: { ...state.localBanners, ...METADATA.error, error: action.error }};
    case GET_ORGS_BY_CATEGORIES.REQUEST:
      return { ...state, orgsByCategories: { ...state.orgsByCategories, ...METADATA.request }};
    case GET_ORGS_BY_CATEGORIES.SUCCESS:
      return { ...state, orgsByCategories: { ...METADATA.success, data: action.payload }};
    case GET_ORGS_BY_CATEGORIES.FAILURE:
      return { ...state, orgsByCategories: { ...state.orgsByCategories, ...METADATA.error, error: action.error }};
    case GET_SEARCH_RESULT.REQUEST:
      return { ...state, searchResult: { ...state.searchResult, ...METADATA.request }};
    case GET_SEARCH_RESULT.SUCCESS:
      return { ...state, searchResult: { ...METADATA.success, data: action.payload }};
    case GET_SEARCH_RESULT.FAILURE:
      return { ...state, searchResult: { ...state.searchResult, ...METADATA.error, error: action.error }};
    case GET_SEARCH_SUGGEST_RESULT.REQUEST:
      return { ...state, searchSuggestResult: { ...state.searchSuggestResult, ...METADATA.request }};
    case GET_SEARCH_SUGGEST_RESULT.SUCCESS:
      return { ...state, searchSuggestResult: { ...state.searchSuggestResult, ...METADATA.success, data: action.payload }};
    case GET_SEARCH_SUGGEST_RESULT.FAILURE:
      return { ...state, searchSuggestResult: { ...state.searchSuggestResult, ...METADATA.error, ...METADATA.error, error: action.error }};
    case CLEAR_SEARCH_SUGGEST_RESULT:
      return { ...state, searchSuggestResult: { ...state.searchSuggestResult, data: null}};

    case SELECT_CATEGORY:
      return { ...state, selectedCategory: action.category };
    default:
      return state;
  }
};

export default homeReducer;