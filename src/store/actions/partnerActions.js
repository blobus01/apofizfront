import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import {getMessage} from '../../common/helpers';
import {getQuery} from '../../common/utils';
import {
  CHANGE_PARTNER_POSTS_VIEW,
  GET_ORG_PARTNERS,
  GET_ORG_PARTNERSHIPS, GET_PARTNER_CATEGORIES, GET_PARTNER_POSTS,
  // GET_PARTNER_SUBCATEGORIES,
  GET_PARTNERSHIP_DETAIL, MODIFY_PARTNER_POSTS,
  GET_SEARCH_PARTNER_RESULT
} from '../actionTypes/partnerTypes';
import Notify from '../../components/Notification';
import {translate} from "../../locales/locales";

const getOrgPartnersRequest = () => ({ type: GET_ORG_PARTNERS.REQUEST });
const getOrgPartnersSuccess = payload => ({ type: GET_ORG_PARTNERS.SUCCESS, payload });
const getOrgPartnersFailure = error => ({ type: GET_ORG_PARTNERS.FAILURE, error });

const getOrgPartnershipsRequest = () => ({ type: GET_ORG_PARTNERSHIPS.REQUEST });
const getOrgPartnershipsSuccess = payload => ({ type: GET_ORG_PARTNERSHIPS.SUCCESS, payload });
const getOrgPartnershipsFailure = error => ({ type: GET_ORG_PARTNERSHIPS.FAILURE, error });

const getPartnershipDetailRequest = () => ({ type: GET_PARTNERSHIP_DETAIL.REQUEST });
const getPartnershipDetailSuccess = payload => ({ type: GET_PARTNERSHIP_DETAIL.SUCCESS, payload });
const getPartnershipDetailFailure = error => ({ type: GET_PARTNERSHIP_DETAIL.FAILURE, error });


const getPartnerPostsRequest = payload => ({ type: GET_PARTNER_POSTS.REQUEST, payload });
const getPartnerPostsSuccess = payload => ({ type: GET_PARTNER_POSTS.SUCCESS, payload });
const getPartnerPostsFailure = error => ({ type: GET_PARTNER_POSTS.FAILURE, error });


const getPartnerCategoriesRequest = () => ({ type: GET_PARTNER_CATEGORIES.REQUEST });
const getPartnerCategoriesSuccess = payload => ({ type: GET_PARTNER_CATEGORIES.SUCCESS, payload });
const getPartnerCategoriesFailure = error => ({ type: GET_PARTNER_CATEGORIES.FAILURE, error });


// const getPartnerSubcategoriesRequest = () => ({ type: GET_PARTNER_SUBCATEGORIES.REQUEST });
// const getPartnerSubcategoriesSuccess = payload => ({ type: GET_PARTNER_SUBCATEGORIES.SUCCESS, payload });
// const getPartnerSubcategoriesFailure = error => ({ type: GET_PARTNER_SUBCATEGORIES.FAILURE, error });


const getSearchPartnerResultRequest = payload => ({ type: GET_SEARCH_PARTNER_RESULT.REQUEST, payload });
const getSearchPartnerResultSuccess = payload => ({ type: GET_SEARCH_PARTNER_RESULT.SUCCESS, payload });
const getSearchPartnerResultFailure = error => ({ type: GET_SEARCH_PARTNER_RESULT.FAILURE, error });


export const changePartnerPostsView = payload => ({ type: CHANGE_PARTNER_POSTS_VIEW, payload })

export const modifyPartnerPosts = payload => ({ type: MODIFY_PARTNER_POSTS, payload })

export const getOrgPartners = (orgID, params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getOrgPartnersRequest());
    return axios.get(Pathes.Partners.partners(orgID) + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().partnerStore.orgPartners.data;
          if (!isNext || !prevData) {
            dispatch(getOrgPartnersSuccess(data));
            return { ...data, success: true }
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(getOrgPartnersSuccess(updatedData));
          return { ...updatedData, success: true }
        }

        throw new Error(message)
      }).catch(e => dispatch(getOrgPartnersFailure(e.message)));
  }
}

export const getOrgPartnerships = (orgID, params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getOrgPartnershipsRequest());
    return axios.get(Pathes.Partners.partnerships(orgID) + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().partnerStore.orgPartnerships.data;
          if (!isNext || !prevData) {
            dispatch(getOrgPartnershipsSuccess(data));
            return { ...data, success: true }
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(getOrgPartnershipsSuccess(updatedData));
          return { ...updatedData, success: true }
        }
        throw new Error(message)
      }).catch(e => dispatch(getOrgPartnershipsFailure(e.message)));
  }
}

export const createPartnership = payload => {
  return dispatch => {
    return axios.post(Pathes.Partners.createPartnership, payload).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          Notify.success({ text: translate("Запрос на партнерство успешно отправлено", "notify.partnershipRequestSuccess")});
          return {...data, success: true };
        }

        if (status === 406) {
          Notify.success({ text: translate("Партнер уже добавлен", "notify.partnershipAddExist")});
        }

        if (status === 400) {
          Notify.error({ text: "Не удалось создать запрос на партнерство"});
        }

        throw new Error(message)
      }).catch(e => dispatch(getOrgPartnershipsFailure(e.message)));
  }
}

export const getPartnershipDetail = id => {
  return dispatch => {
    dispatch(getPartnershipDetailRequest());
    return axios.get(Pathes.Partners.partnershipDetail(id)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getPartnershipDetailSuccess(data))
          return {...data, success: true};
        }
        throw new Error(message)
      }).catch(e => dispatch(getPartnershipDetailFailure(e.message)));
  }
}

export const acceptPartnership = partnershipID => {
  return () => {
    return axios.post(Pathes.Partners.createPartnership, {partnership_id: partnershipID}).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          return {data, success: true};
        }
        Notify.error({text: message});
        throw new Error(message)
      }).catch(e => ({ success: false, error: e.message }));
  }
}

export const setPartnershipPermissions = (id, payload) => {
  return () => {
    return axios.put(Pathes.Partners.partnershipDetail(id), payload).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          return {...data, success: true};
        }
        Notify.error({text: message});
        throw new Error(message)
      }).catch(e => ({ error: e.message }));
  }
}

export const rejectPartnership = (id, successMessage) => {
  return () => {
    return axios.delete(Pathes.Partners.partnershipDetail(id)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 204) {
          Notify.success({ text: successMessage || translate("Вы отклонили партнерство", "notify.partnershipDeny")})
          return {...data, success: true};
        }
        throw new Error(message)
      }).catch(e => ({ error: e.message }));
  }
}

export const getPartnerPosts = (partnerID, stateModifier={}) => {
  return (dispatch, getState) => {
    dispatch(getPartnerPostsRequest(stateModifier));

    const {page, limit, category, search, data: prevData} = getState().partnerStore.partnerPosts
    const params = {
      page,
      limit,
      category,
      search: !!search ? search : undefined
    }
    return axios.get(Pathes.Partners.partnersPosts(partnerID) + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          if (page === 1 || !prevData) {
            dispatch(getPartnerPostsSuccess(data));
            return { ...data, success: true }
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(getPartnerPostsSuccess(updatedData));
          return { ...updatedData, success: true }
        }
        throw new Error(message)
      }).catch(e => dispatch(getPartnerPostsFailure(e.message)));
  }
}

export const getPartnersCategories = partnerID => {
  return dispatch => {
    dispatch(getPartnerCategoriesRequest());
    return axios.get(Pathes.Partners.partnersCategories(partnerID)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getPartnerCategoriesSuccess(data))
          return {...data, success: true};
        }
        throw new Error(message)
      }).catch(e => dispatch(getPartnerCategoriesFailure(e.message)));
  }
}

export const getSearchPartnerResult = (partnerID, stateModifier={}) => {
  return (dispatch, getState) => {
    dispatch(getSearchPartnerResultRequest(stateModifier));
    const {page, limit, search, data: prevData} = getState().partnerStore.searchPartnerResult
    const params = {
      page,
      limit,
      search
    }
    return axios.get(Pathes.Partners.partnersSearch(partnerID) + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          if (page === 1 || !prevData) {
            dispatch(getSearchPartnerResultSuccess(data));
            return { ...data, success: true }
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(getSearchPartnerResultSuccess(updatedData));
          return { ...updatedData, success: true }
        }
        throw new Error(message)
      }).catch(e => dispatch(getSearchPartnerResultFailure(e.message)));
  }
}