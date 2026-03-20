import {METADATA} from '../../common/metadata';
import {
  CHANGE_PARTNER_POSTS_VIEW,
  GET_ORG_PARTNERS,
  GET_ORG_PARTNERSHIPS,
  GET_PARTNER_CATEGORIES,
  GET_PARTNER_POSTS,
  GET_PARTNERSHIP_DETAIL,
  MODIFY_PARTNER_POSTS,
  GET_SEARCH_PARTNER_RESULT
} from '../actionTypes/partnerTypes';
import {POSTS_VIEWS} from "../../common/constants";

const initialState = {
  orgPartners: { ...METADATA.default, data: null },
  orgPartnerships: { ...METADATA.default, data: null },
  partnershipDetail: { ...METADATA.default, data: null },
  partnerPosts: {
    ...METADATA.default,
    page: 1,
    hasMore: true,
    limit: 18,
    data: null,
    view: POSTS_VIEWS.FEED,
    category: null,
    search: ''
  },
  partnerCategories: { ...METADATA.default, data: null },
  searchPartnerResult: {
    ...METADATA.default,
    page: 1,
    limit: 21,
    data: null,
    search: '',
    hasMore: true
  },
};

const partnerReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ORG_PARTNERS.REQUEST:
      return { ...state, orgPartners: { ...state.orgPartners, ...METADATA.request }};
    case GET_ORG_PARTNERS.SUCCESS:
      return { ...state, orgPartners: { ...METADATA.success, data: action.payload }};
    case GET_ORG_PARTNERS.FAILURE:
      return { ...state, orgPartners: { ...state.orgPartners, ...METADATA.error, error: action.error }};
    case GET_ORG_PARTNERSHIPS.REQUEST:
      return { ...state, orgPartnerships: { ...state.orgPartnerships, ...METADATA.request }};
    case GET_ORG_PARTNERSHIPS.SUCCESS:
      return { ...state, orgPartnerships: { ...METADATA.success, data: action.payload }};
    case GET_ORG_PARTNERSHIPS.FAILURE:
      return { ...state, orgPartnerships: { ...state.orgPartnerships, ...METADATA.error, error: action.error }};
    case GET_PARTNERSHIP_DETAIL.REQUEST:
      return { ...state, partnershipDetail: { ...METADATA.request, data: null }};
    case GET_PARTNERSHIP_DETAIL.SUCCESS:
      return { ...state, partnershipDetail: { ...METADATA.success, data: action.payload }};
    case GET_PARTNERSHIP_DETAIL.FAILURE:
      return { ...state, partnershipDetail: { ...state.partnershipDetail, ...METADATA.error, error: action.error }};

    case GET_PARTNER_POSTS.REQUEST:
      return { ...state, partnerPosts: { ...state.partnerPosts, ...METADATA.request, ...action.payload }};
    case GET_PARTNER_POSTS.SUCCESS:
      return { ...state, partnerPosts: {
        ...state.partnerPosts,
        ...METADATA.success,
        data: action.payload,
      }};
    case GET_PARTNER_POSTS.FAILURE:
      return { ...state, partnerPosts: { ...state.partnerPosts, ...METADATA.error, error: action.error }};
    case CHANGE_PARTNER_POSTS_VIEW:
      return { ...state, partnerPosts: { ...state.partnerPosts, view: action.payload } }
    case MODIFY_PARTNER_POSTS:
      return { ...state, partnerPosts: { ...state.partnerPosts, ...action.payload }}

    case GET_PARTNER_CATEGORIES.REQUEST:
      return { ...state, partnerCategories: { ...state.partnerCategories, ...METADATA.request }}
    case GET_PARTNER_CATEGORIES.SUCCESS:
      return { ...state, partnerCategories: { ...state.partnerCategories, data: action.payload, ...METADATA.success }}
    case GET_PARTNER_CATEGORIES.FAILURE:
      return { ...state, partnerCategories: { ...state.partnerCategories, ...METADATA.error, error: action.error }}

    case GET_SEARCH_PARTNER_RESULT.REQUEST:
      return { ...state, searchPartnerResult: { ...state.searchPartnerResult, ...METADATA.request, ...action.payload }};
    case GET_SEARCH_PARTNER_RESULT.SUCCESS:
      return {
        ...state,
        searchPartnerResult: {
          ...state.searchPartnerResult,
          ...METADATA.success,
          data: action.payload,
          hasMore: action.payload.total_pages !== state.searchPartnerResult.page
        }};
    case GET_SEARCH_PARTNER_RESULT.FAILURE:
      return { ...state, searchPartnerResult: { ...state.searchPartnerResult, ...METADATA.error, error: action.error, hasMore: false }};

    default:
      return state;
  }
};

export default partnerReducer;