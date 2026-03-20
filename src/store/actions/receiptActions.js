import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import {getQuery} from '../../common/utils';
import {getMessage} from '../../common/helpers';
import Notify from '../../components/Notification';
import {
  GET_ORG_TRANSACTIONS_RECEIPTS,
  GET_RENT_TRANSACTION_DETAIL,
  GET_TRANSACTIONS,
  GET_TRANSACTIONS_USERS,
  SET_ORG_TRANSACTIONS,
  SET_PREPROCESSTRANSACTION,
  SET_RECEIPT_DETAIL,
  SET_RECEIPT_SALE_DETAIL,
  SET_RECEIPTS,
  SET_RENT_RECEIPT_DETAIL
} from '../actionTypes/receiptTypes';
import {transactionsReceipts, transactionsUsers} from "../services/receiptServices";

const setOrgTransactions = payload => ({type: SET_ORG_TRANSACTIONS, payload});
const ac_setReceiptSaleDetail = payload => ({type: SET_RECEIPT_SALE_DETAIL, payload});
export const setReceiptDetail = payload => ({type: SET_RECEIPT_DETAIL, payload});
const setReceipts = payload => ({type: SET_RECEIPTS, payload});

const getTransactionsRequest = () => ({type: GET_TRANSACTIONS.REQUEST});
const getTransactionsSuccess = calculatedData => ({type: GET_TRANSACTIONS.SUCCESS, calculatedData});
const getTransactionsFailure = error => ({type: GET_TRANSACTIONS.FAILURE, error});

const getTransactionsUsersRequest = () => ({type: GET_TRANSACTIONS_USERS.REQUEST});
const getTransactionsUsersSuccess = data => ({type: GET_TRANSACTIONS_USERS.SUCCESS, payload: data});
const getTransactionsUsersFailure = error => ({type: GET_TRANSACTIONS_USERS.FAILURE, payload: error});

const getOrgTransactionsReceiptsRequest = () => ({type: GET_ORG_TRANSACTIONS_RECEIPTS.REQUEST});
const getOrgTransactionsReceiptsSuccess = data => ({type: GET_ORG_TRANSACTIONS_RECEIPTS.SUCCESS, payload: data});
const getOrgTransactionsReceiptsFailure = error => ({type: GET_ORG_TRANSACTIONS_RECEIPTS.FAILURE, payload: error});

// Rent action creators
const getRentTransactionDetailRequest = () => ({type: GET_RENT_TRANSACTION_DETAIL.REQUEST});
const getRentTransactionDetailSuccess = data => ({type: GET_RENT_TRANSACTION_DETAIL.SUCCESS, payload: data});
const getRentTransactionDetailFailure = error => ({type: GET_RENT_TRANSACTION_DETAIL.FAILURE, payload: error});


// Get organization transactions
export const getOrgTransactionsReceipts = (params, isNext) => {
  return async (dispatch, getState) => {
    try {
      dispatch(getOrgTransactionsReceiptsRequest());

      let { data } = await transactionsReceipts(params);

      if (isNext) {
        const prevData = getState().receiptStore.orgTransactionsReceipts.data;

        data = {
          total_count: data.total_count,
          total_pages: data.total_pages,
          list: [...prevData.list, ...data.list]
        };
      }

      dispatch(getOrgTransactionsReceiptsSuccess(data));
    } catch (e) {
      dispatch(getOrgTransactionsReceiptsFailure(e.message))
    }
  }
}

export const getOrgTransactions = (params, isNext) => {
  return (dispatch, getState) => {
    return axios.get(Pathes.Receipts.transactions + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().receiptStore.orgTransactions;
          if (!isNext || !prevData) {
            dispatch(setOrgTransactions(data));
            return {data, success: true, message};
          }
          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list]
          }
          dispatch(setOrgTransactions(updatedData));
          return {data: updatedData, success: true, message};
        }
        throw new Error(message)
      }).catch(e => ({error: e.message, status: false}));
  }
};

// Get organization transactions DUPLICATE
export const getTransactions = params => {
  return (dispatch, getState) => {
    dispatch(getTransactionsRequest());
    return axios.get(Pathes.Receipts.transactions + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().receiptStore.transactions.data;
          const hasMore = params.page < data.total_pages;

          if (!prevData || params.page === 1) {
            dispatch(getTransactionsSuccess({data, hasMore}));
            return {data, success: true, message};
          }

          const mergedData = {
            hasMore,
            data: {...data, list: [...prevData.list, ...data.list]},
          }
          dispatch(getTransactionsSuccess(mergedData));
          return {data: mergedData, success: true, message};
        }
        throw new Error(message)
      }).catch(e => dispatch(getTransactionsFailure(e.message)));
  }
};

// Get transactions details with client info
export const getReceiptSaleDetail = receiptID => {
  return dispatch => {
    return axios.get(Pathes.Receipts.transaction(receiptID)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(ac_setReceiptSaleDetail(data));
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => ({error: e.message, success: false}));
  }
};

// Local set transactions details with client info
export const setReceiptSaleDetail = data => {
  return dispatch => dispatch(ac_setReceiptSaleDetail(data));
}

// Get user transactions details
export const getReceiptDetail = receiptID => {
  return dispatch => {
    return axios.get(Pathes.Receipts.receiptDetail(receiptID)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setReceiptDetail(data));
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => ({error: e.message, success: false}));
  }
};

// Get user transactions
export const getReceipts = (params, isNext) => {
  return (dispatch, getState) => {
    return axios.get(Pathes.Receipts.receipts + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().receiptStore.receipts;
          if (!isNext || !prevData) {
            dispatch(setReceipts(data));
            return {data, success: true, message};
          }
          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [ ...prevData.list, ...data.list]
          }
          dispatch(setReceipts(updatedData));
          return {data: updatedData, success: true, message};
        }

        throw new Error(message)
      }).catch(e => ({error: e.message, success: false}));
  }
}

// Employee checkout the cart to anonymous user
export const checkoutCartAsEmployee = (cartID, payload) => {
  return dispatch => {
    return axios.post(Pathes.Receipts.cartOfflineCheckout(cartID), payload)
      .then(res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(ac_setReceiptSaleDetail(data));
          Notify.success({text: 'Чек успешно создан'});
          return {data, success: true, message};
        }
        throw new Error(message);
      }).catch(e => ({error: e.message, success: false}));
  }
}

export const setPreprocessTransaction = value => {
  return dispatch => {
    dispatch({type: SET_PREPROCESSTRANSACTION, value});
  }
}

export const getOrgTransactionsUsers = (orgID, params, isNext) => {
  return async (dispatch, getState) => {
    try {
      dispatch(getTransactionsUsersRequest());

      let { data } = await transactionsUsers(orgID, params);

      if (isNext) {
        const prevData = getState().receiptStore.transactionsUsers.data;

        data = {
          total_count: data.total_count,
          total_pages: data.total_pages,
          list: [...prevData.list, ...data.list]
        };
      }

      dispatch(getTransactionsUsersSuccess(data));
    } catch (e) {
      dispatch(getTransactionsUsersFailure(e.message));
    }
  }
}

// Rent actions
export const setRentReceiptDetail = payload => ({ type: SET_RENT_RECEIPT_DETAIL, payload })

export const getRentReceiptDetail = receiptID => {
  return dispatch => {
    dispatch(getRentTransactionDetailRequest())
    return axios.get(Pathes.Receipts.bookingTransaction(receiptID)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getRentTransactionDetailSuccess(data));
          return {data, success: true, message};
        }
        throw new Error(message)
      }).catch(e => {
        dispatch(getRentTransactionDetailFailure(e.message))
        return {error: e.message, success: false}
    });
  }
};