import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import {getQuery} from '../../common/utils';
import {GET_BANNER_DETAIL, GET_BANNER_ORGANIZATIONS, GET_BANNERS_LIST} from '../actionTypes/bannerTypes';
import Notify from '../../components/Notification';
import {translate} from "../../locales/locales";

const getBannerOrganizationsRequest = () => ({ type: GET_BANNER_ORGANIZATIONS.REQUEST });
const getBannerOrganizationsSuccess = payload => ({ type: GET_BANNER_ORGANIZATIONS.SUCCESS, payload });
const getBannerOrganizationsFailure = error => ({ type: GET_BANNER_ORGANIZATIONS.FAILURE, error });

const getBannersListRequest = () => ({ type: GET_BANNERS_LIST.REQUEST });
const getBannersListSuccess = payload => ({ type: GET_BANNERS_LIST.SUCCESS, payload });
const getBannersListFailure = error => ({ type: GET_BANNERS_LIST.FAILURE, error });

const getBannerDetailRequest = () => ({ type: GET_BANNER_DETAIL.REQUEST });
const getBannerDetailSuccess = payload => ({ type: GET_BANNER_DETAIL.SUCCESS, payload });
const getBannerDetailFailure = error => ({ type: GET_BANNER_DETAIL.FAILURE, error });

export const getBannerOrganizations = (id, params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getBannerOrganizationsRequest());
    return axios.get(Pathes.Partners.partners(id) + getQuery(params)).then(
      res => {
        const {status, data} = res;
        if (status === 200) {
          const prevData = getState().bannerStore.bannerOrganizations.data;
          if (!isNext || !prevData) {
            dispatch(getBannerOrganizationsSuccess(data));
            return { ...data, success: true }
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(getBannerOrganizationsSuccess(updatedData));
          return { ...updatedData, success: true }
        }

        throw new Error('Не удалось получить')
      }).catch(e => dispatch(getBannerOrganizationsFailure(e.message)));
  }
}

export const createBanner = payload => {
  return () => {
    return axios.post(Pathes.Banner.banners, payload).then(
      res => {
        const {status, data} = res;
        if (status === 201) {
          Notify.success({ text: translate("Вы успешно добавили баннер", "notify.bannerAddSuccess") })
            return { ...data, success: true }
        }

        throw new Error('Не удалось получить')
      }).catch(e => ({ error: e.message }));
  }
}

export const updateBanner = (id, payload) => {
  return () => {
    return axios.put(Pathes.Banner.detail(id), payload).then(
      res => {
        const {status, data} = res;
        if (status === 200) {
          Notify.success({ text: translate("Вы успешно обновили баннер", "notify.bannerEditSuccess")})
          return { ...data, success: true }
        }

        throw new Error('Не удалось получить')
      }).catch(e => ({ error: e.message }));
  }
}

export const deleteBanner = bannerID => {
  return () => {
    return axios.delete(Pathes.Banner.detail(bannerID)).then(
      res => {
        const {status, data} = res;
        if (status === 200 || status === 204) {
          Notify.success({ text: translate("Вы успешно удалили баннер", "notify.bannerRemoveSuccess") })
          return { ...data, success: true }
        }

        throw new Error('Не удалось получить')
      }).catch(e => ({ error: e.message }));
  }
}

export const getBannersList = (params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getBannersListRequest());
    return axios.get(Pathes.Banner.banners + getQuery(params)).then(
      res => {
        const {status, data} = res;
        if (status === 200) {
          const prevData = getState().bannerStore.bannersList.data;
          if (!isNext || !prevData) {
            dispatch(getBannersListSuccess({
              total_pages: 1,
              total_count: data.length,
              list: data
            }));
            return {...data, success: true}
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list]
          }
          dispatch(getBannersListSuccess(updatedData));
          return {...updatedData, success: true}
        }

        throw new Error('Не удалось получить')
      }).catch(e => dispatch(getBannersListFailure(e.message)));
  }
}

export const getBannerDetail = id => {
  return dispatch => {
    dispatch(getBannerDetailRequest());
    return axios.get(Pathes.Banner.detail(id)).then(
      res => {
        const {status, data} = res;
        if (status === 200) {
          dispatch(getBannerDetailSuccess(data))
          return { ...data, success: true }
        }

        throw new Error('Не удалось получить')
      }).catch(e => dispatch(getBannerDetailFailure(e.message)));
  }
}