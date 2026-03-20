import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import qs from 'qs';
import {getMessage} from '../../common/helpers';
import {getQuery} from '../../common/utils';
import {
  CLEAR_SEARCH_SUGGEST_RESULT,
  GET_HOME_ORGANIZATIONS, GET_HOME_PARTNERS,
  GET_LOCAL_BANNERS,
  GET_ORGS_BY_CATEGORIES, GET_PARTNERS_LIST,
  GET_SEARCH_RESULT, GET_SEARCH_SUGGEST_RESULT,
  SELECT_CATEGORY
} from '../actionTypes/homeTypes';
import {searchSuggestItems} from "../services/commonServices";
import Notify from "../../components/Notification";

const getHomeOrganizationsRequest = () => ({ type: GET_HOME_ORGANIZATIONS.REQUEST });
const getHomeOrganizationsSuccess = payload => ({ type: GET_HOME_ORGANIZATIONS.SUCCESS, payload });
const getHomeOrganizationsFailure = error => ({ type: GET_HOME_ORGANIZATIONS.FAILURE, error });

const getHomePartnersRequest = () => ({ type: GET_HOME_PARTNERS.REQUEST });
const getHomePartnersSuccess = payload => ({ type: GET_HOME_PARTNERS.SUCCESS, payload });
const getHomePartnersFailure = error => ({ type: GET_HOME_PARTNERS.FAILURE, error });

const getPartnersListRequest = () => ({ type: GET_PARTNERS_LIST.REQUEST });
const getPartnersListSuccess = payload => ({ type: GET_PARTNERS_LIST.SUCCESS, payload });
const getPartnersListFailure = error => ({ type: GET_PARTNERS_LIST.FAILURE, error });

const getOrgsByCategoriesRequest = () => ({ type: GET_ORGS_BY_CATEGORIES.REQUEST });
const getOrgsByCategoriesSuccess = payload => ({ type: GET_ORGS_BY_CATEGORIES.SUCCESS, payload });
const getOrgsByCategoriesFailure = error => ({ type: GET_ORGS_BY_CATEGORIES.FAILURE, error });

const getSearchResultRequest = () => ({ type: GET_SEARCH_RESULT.REQUEST });
const getSearchResultSuccess = payload => ({ type: GET_SEARCH_RESULT.SUCCESS, payload });
const getSearchResultFailure = error => ({ type: GET_SEARCH_RESULT.FAILURE, error });

const getSearchSuggestResultRequest = () => ({ type: GET_SEARCH_SUGGEST_RESULT.REQUEST });
const getSearchSuggestResultSuccess = payload => ({ type: GET_SEARCH_SUGGEST_RESULT.SUCCESS, payload });
const getSearchSuggestResultFailure = error => ({ type: GET_SEARCH_SUGGEST_RESULT.FAILURE, error });
export const clearSearchSuggestResult = () => ({type: CLEAR_SEARCH_SUGGEST_RESULT});

const getLocalBannersRequest = () => ({ type: GET_LOCAL_BANNERS.REQUEST });
const getLocalBannersSuccess = payload => ({ type: GET_LOCAL_BANNERS.SUCCESS, payload });
const getLocalBannersFailure = error => ({ type: GET_LOCAL_BANNERS.FAILURE, error });

export const getHomePartners = params => {
  return dispatch => {
    dispatch(getHomePartnersRequest());
    return axios.get(Pathes.Home.homePartners + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getHomePartnersSuccess(data));
          return { ...data, success: true }
        }

        throw new Error(message)
      }).catch(e => dispatch(getHomePartnersFailure(e.message)));
  }
}

export const getPartnersList = (params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getPartnersListRequest());
    return axios.get(Pathes.Home.partnersList + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().homeStore.partnersList.data;
          if (!isNext || !prevData) {
            dispatch(getPartnersListSuccess(data));
            return { ...data, success: true }
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(getPartnersListSuccess(updatedData));
          return { ...updatedData, success: true }
        }

        throw new Error(message)
      }).catch(e => dispatch(getPartnersListFailure(e.message)));
  }
}

export const getHomeOrganizations = (params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getHomeOrganizationsRequest());
    return axios.get(Pathes.Home.homeOrganizations + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().homeStore.homeOrganizations.data;
          if (!isNext || !prevData) {
            dispatch(getHomeOrganizationsSuccess(data));
            return { ...data, success: true }
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(getHomeOrganizationsSuccess(updatedData));
          return { ...updatedData, success: true }
        }

        throw new Error(message)
      }).catch(e => dispatch(getHomeOrganizationsFailure(e.message)));
  }
}

export const getOrgsByCategories = (params, isNext) => {
  return (dispatch, getState) => {
    const filteredParams = { ...params };
    delete filteredParams.hasMore;
    const query = `?${qs.stringify(filteredParams, { strictNullHandling: true, skipNulls: true })}`;
    dispatch(getOrgsByCategoriesRequest());
    return axios.get(Pathes.Home.orgsByCategories + query).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().homeStore.orgsByCategories.data;
          if (!isNext || !prevData) {
            dispatch(getOrgsByCategoriesSuccess(data));
            return { ...data, success: true }
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(getOrgsByCategoriesSuccess(updatedData));
          return { ...updatedData, success: true }
        }

        throw new Error(message)
      }).catch(e => dispatch(getOrgsByCategoriesFailure(e.message)));
  }
}

export const getLocalBanners = (params) => {
  return (dispatch) => {
    dispatch(getLocalBannersRequest());

    return axios
      .get(`${Pathes.Home.localBanners}${getQuery(params)}`) // передаем country и city
      .then((res) => {
        const { status, data } = res;
        if (status === 200) {
          dispatch(getLocalBannersSuccess(data));
          return { ...data, success: true };
        }
        throw new Error(getMessage(data));
      })
      .catch((e) => dispatch(getLocalBannersFailure(e.message)));
  };
};

export const getCategoryDetail = id => {
  return dispatch => {
    return axios.get(Pathes.Home.getCategoryDetail(id)).then(
      res => {
        const {status, data} = res;

        if (status === 200) {
          dispatch(selectCategory(data));
          return { ...data, success: true }
        }

        throw new Error(getMessage(data));
      }).catch(e => ({ error: e.message }));
  }
}

export const selectCategory = category => {
  return dispatch => dispatch({ type: SELECT_CATEGORY, category })
}

export const getSearchResult = (params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getSearchResultRequest());
    return axios.get(Pathes.Home.search + getQuery(params)).then(
      res => {
        const {status, data} = res;
        if (status === 200) {
          const prevData = getState().homeStore.searchResult.data;
          if (!isNext || !prevData) {
            dispatch(getSearchResultSuccess(data));
            return { ...data, success: true }
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(getSearchResultSuccess(updatedData));
          return { ...updatedData, success: true }
        }

        throw new Error('Не удалось получить')
      }).catch(e => dispatch(getSearchResultFailure(e.message)));
  }
}

export const getSearchSuggestResult = () => {
  return async (dispatch, getState) => {
    try {
      dispatch(getSearchSuggestResultRequest());

      const {country, search} = getState().postStore.posts;

      const { data } = await searchSuggestItems({
        suggest_items: search,
        country: country,
      });

      dispatch(getSearchSuggestResultSuccess(data));
    } catch (e) {
      Notify.error({ text: 'Что-то пошло не так' });
      dispatch(getSearchSuggestResultFailure(e.message));
    }
  }
}