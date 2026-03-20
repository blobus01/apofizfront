import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import {getQuery} from '../../common/utils';
import {getMessage} from '../../common/helpers';
import {
  GET_ORG_PARTNERS_STATISTIC_SUMMARY,
  GET_STATISTIC_SUMMARY,
  SET_ORG_GENERAL_STATISTICS,
  SET_ORGANIZATION_RENT_SALE_TOTALS,
  SET_RENT_DETAIL_SALE_TOTALS,
  SET_USER_EVENT_PURCHASE_TOTALS,
  SET_USER_STATISTIC_EVENT_SALE_TOTALS,
  SET_USER_STATISTIC_RENT_SALE_TOTALS,
  SET_USER_STATISTIC_RENT_TOTALS,
  SET_USER_STATISTIC_SALE_TOTALS, SET_USER_STATISTIC_TOTALS
} from '../actionTypes/statisticTypes';

export const getStatisticSummary = params => {
  return dispatch => {
    return axios.get(Pathes.Statistics.summary + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch({ type: GET_STATISTIC_SUMMARY, payload: data });
          return {...data, success: true, message};
        }

        throw new Error(message)
      }).catch(e => ({ error: e.message }));
  }
}

export const getOrgPartnerStatisticSummary = (orgID, params) => {
  return dispatch => {
    return axios.get(Pathes.Statistics.partnerStatistics(orgID) + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch({ type: GET_ORG_PARTNERS_STATISTIC_SUMMARY, payload: data });
          return {...data, success: true, message};
        }

        throw new Error(message)
      }).catch(e => ({ error: e.message }));
  }
}

// ------ //

const setUserStatisticTotals = payload => ({ type: SET_USER_STATISTIC_TOTALS, payload });
const setUserStatisticSaleTotals = payload => ({ type: SET_USER_STATISTIC_SALE_TOTALS, payload });
const setOrgGeneralStatistics = payload => ({ type: SET_ORG_GENERAL_STATISTICS, payload });

// Get user statistic sale totals
export const getUserStatisticSaleTotals = params => {
  return dispatch => {
    return axios.get(Pathes.Statistics.userSaleTotals + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setUserStatisticSaleTotals(data));
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => ({error: e.message, status: false}));
  }
};

// Get user statistic totals
export const getUserStatisticTotals = params => {
  return dispatch => {
    return axios.get(Pathes.Statistics.userTotals + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setUserStatisticTotals(data));
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => ({error: e.message, status: false}));
  }
};

// Get general statistics of organization
export const getOrgGeneralStatistics = (orgID, params) => {
  return dispatch => {
    return axios.get(Pathes.Statistics.orgGeneralStatistics(orgID) + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setOrgGeneralStatistics(data));
          return {data, success: true, message};
        }
        dispatch(setOrgGeneralStatistics(null));
        throw new Error(message)
      }).catch(e => ({error: e.message, success: false}));
  }
};

// rent
const setUserStatisticRentTotals = payload => ({ type: SET_USER_STATISTIC_RENT_TOTALS, payload });
const setUserStatisticRentSaleTotals = payload => ({ type: SET_USER_STATISTIC_RENT_SALE_TOTALS, payload });
const setOrganizationRentSaleTotals = payload => ({ type: SET_ORGANIZATION_RENT_SALE_TOTALS, payload })
const setRentDetailSaleTotals = payload => ({ type: SET_RENT_DETAIL_SALE_TOTALS, payload })

// event
const setUserStatisticEventSaleTotals = payload => ({ type: SET_USER_STATISTIC_EVENT_SALE_TOTALS, payload });
const setUserEventPurchaseTotals = payload => ({ type: SET_USER_EVENT_PURCHASE_TOTALS, payload })

export const getUserStatisticRentTotals = params => {
  return dispatch => {
    return axios.get(Pathes.Statistics.userRentPurchaseTotals + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setUserStatisticRentTotals(data));
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => ({error: e.message, status: false}));
  }
};

export const getUserStatisticRentSaleTotals = params => {
  return dispatch => {
    return axios.get(Pathes.Statistics.userRentSaleTotals + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setUserStatisticRentSaleTotals(data));
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => ({error: e.message, status: false}));
  }
};

export const getOrganizationRentSaleTotals = (orgID, params) => {
  return dispatch => {
    return axios.get(Pathes.Statistics.organizationRentSaleTotals + getQuery({
      organization: orgID,
      ...params
    })).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setOrganizationRentSaleTotals(data));
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => ({error: e.message, status: false}));
  }
};

export const getRentDetailSaleTotals = (rentID, params) => {
  return dispatch => {
    return axios.get(Pathes.Statistics.rentDetailSaleTotals + getQuery({
      item: rentID,
      ...params
    })).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setRentDetailSaleTotals(data));
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => ({error: e.message, status: false}));
  }
}

// events
export const getUserStatisticEventSaleTotals = params => {
  return dispatch => {
    return axios.get(Pathes.Statistics.userEventSaleTotals + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setUserStatisticEventSaleTotals(data));
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => ({error: e.message, success: false}));
  }
};

export const getUserEventPurchaseTotals = params => {
  return dispatch => {
    return axios.get(Pathes.Statistics.userEventPurchaseTotals + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setUserEventPurchaseTotals(data));
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => ({error: e.message, success: false}));
  }
};