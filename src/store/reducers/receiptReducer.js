import {METADATA} from '../../common/metadata';
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

const initialState = {
  transactions: { ...METADATA.default, data: null, hasMore: true },
  transactionsUsers: { ...METADATA.default, data: null, hasMore: true },
  orgTransactionsReceipts: { ...METADATA.default, data: null, hasMore: true },
  orgTransactions: null,
  receiptSaleDetail: { ...METADATA.default, data: null},
  rentReceiptDetail: { ...METADATA.default, data: null},
  receiptDetail: null,
  receipts: null,
  preprocessTransaction: null,
};

const receiptReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ORG_TRANSACTIONS:
      return { ...state, orgTransactions: action.payload };
    case SET_RECEIPT_SALE_DETAIL:
      return { ...state, receiptSaleDetail: action.payload };
    case SET_RECEIPT_DETAIL:
      return { ...state, receiptDetail: action.payload };
    case SET_RECEIPTS:
      return { ...state, receipts: action.payload };
    case GET_TRANSACTIONS.REQUEST:
      return { ...state, transactions: { ...state.transactions, ...METADATA.request }};
    case GET_TRANSACTIONS.SUCCESS:
      return { ...state, transactions: { ...METADATA.success, ...action.calculatedData }};
    case GET_TRANSACTIONS.FAILURE:
      return { ...state, transactions: { ...state.transactions, ...METADATA.error, error: action.error }};
    case SET_PREPROCESSTRANSACTION:
      return { ...state, preprocessTransaction: action.value };
    case GET_TRANSACTIONS_USERS.REQUEST:
      return { ...state, transactionsUsers: { ...state.transactionsUsers, ...METADATA.request }};
    case GET_TRANSACTIONS_USERS.SUCCESS:
      return { ...state, transactionsUsers: { ...state.transactionsUsers, ...METADATA.success, data: action.payload }};
    case GET_TRANSACTIONS_USERS.FAILURE:
      return { ...state, transactionsUsers: { ...state.transactionsUsers, ...METADATA.error, error: action.payload }};
    case GET_ORG_TRANSACTIONS_RECEIPTS.REQUEST:
      return { ...state, orgTransactionsReceipts: { ...state.orgTransactionsReceipts, ...METADATA.request }};
    case GET_ORG_TRANSACTIONS_RECEIPTS.SUCCESS:
      return { ...state, orgTransactionsReceipts: { ...state.orgTransactionsReceipts, ...METADATA.success, data: action.payload }};
    case GET_ORG_TRANSACTIONS_RECEIPTS.FAILURE:
      return { ...state, orgTransactionsReceipts: { ...state.orgTransactionsReceipts, ...METADATA.error, error: action.payload }};

    // Rent cases
    case GET_RENT_TRANSACTION_DETAIL.REQUEST:
      return { ...state, rentReceiptDetail: { ...state.rentReceiptDetail, ...METADATA.request }};
    case GET_RENT_TRANSACTION_DETAIL.SUCCESS:
      return { ...state, rentReceiptDetail: { ...state.rentReceiptDetail, ...METADATA.success, data: action.payload }};
    case GET_RENT_TRANSACTION_DETAIL.FAILURE:
      return { ...state, rentReceiptDetail: { ...state.rentReceiptDetail, ...METADATA.error, error: action.payload }};


    case SET_RENT_RECEIPT_DETAIL:
      return {
        ...state,
        rentReceiptDetail: {
          ...state.rentReceiptDetail,
          data: action.payload ? { ...state.rentReceiptDetail.data, ...action.payload } : null
        }
      };
    default:
      return state;
  }
};

export default receiptReducer;