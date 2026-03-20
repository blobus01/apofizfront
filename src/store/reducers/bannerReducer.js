import {METADATA} from '../../common/metadata';
import {GET_BANNER_DETAIL, GET_BANNER_ORGANIZATIONS, GET_BANNERS_LIST} from '../actionTypes/bannerTypes';

const initialState = {
  bannersList: { ...METADATA.default, data: null },
  bannerOrganizations: { ...METADATA.default, data: null },
  bannerDetail: { ...METADATA.default, data: null },
};

const bannerReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_BANNER_ORGANIZATIONS.REQUEST:
      return { ...state, bannerOrganizations: { ...state.bannerOrganizations, ...METADATA.request }};
    case GET_BANNER_ORGANIZATIONS.SUCCESS:
      return { ...state, bannerOrganizations: { ...METADATA.success, data: action.payload }};
    case GET_BANNER_ORGANIZATIONS.FAILURE:
      return { ...state, bannerOrganizations: { ...state.bannerOrganizations, ...METADATA.error, error: action.error }};
    case GET_BANNERS_LIST.REQUEST:
      return { ...state, bannersList: { ...state.bannersList, ...METADATA.request }};
    case GET_BANNERS_LIST.SUCCESS:
      return { ...state, bannersList: { ...METADATA.success, data: action.payload }};
    case GET_BANNERS_LIST.FAILURE:
      return { ...state, bannersList: { ...state.bannersList, ...METADATA.error, error: action.error }};
    case GET_BANNER_DETAIL.REQUEST:
      return { ...state, bannerDetail: { ...state.bannerDetail, ...METADATA.request, data: null }};
    case GET_BANNER_DETAIL.SUCCESS:
      return { ...state, bannerDetail: { ...METADATA.success, data: action.payload }};
    case GET_BANNER_DETAIL.FAILURE:
      return { ...state, bannerDetail: { ...state.bannerDetail, ...METADATA.error, error: action.error }};
    default:
      return state;
  }
};

export default bannerReducer;