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
  SET_USER_STATISTIC_SALE_TOTALS,
  SET_USER_STATISTIC_TOTALS
} from '../actionTypes/statisticTypes';
import produce from "immer";

const initialState = {
  userStatisticTotals: null,
  userStatisticSaleTotals: null,
  orgGeneralStatistics: null,

  userStatisticRentTotals: null,
  userStatisticRentSaleTotals: null,
  organizationRentSaleTotals: null,
  rentDetailSaleTotals: null,

  userStatisticEventSaleTotals: null,
  userEventPurchaseTotals: null,

  orderStatistics: null,
  saleStatistics: null,
  saleSummary: null,
  summary: null,
  orgPartnersSummary: null,
};

const statisticReducer = (state = initialState, action) => produce(state, draft => {
  switch (action.type) {
    case SET_USER_STATISTIC_SALE_TOTALS:
      return { ...draft, userStatisticSaleTotals: action.payload };
    case SET_USER_STATISTIC_TOTALS:
      return { ...draft, userStatisticTotals: action.payload };
    case SET_ORG_GENERAL_STATISTICS:
      return { ...draft, orgGeneralStatistics: action.payload };

    case SET_USER_STATISTIC_RENT_SALE_TOTALS:
      draft.userStatisticRentSaleTotals = action.payload
      return
    case SET_USER_STATISTIC_RENT_TOTALS:
      draft.userStatisticRentTotals = action.payload
      return
    case SET_ORGANIZATION_RENT_SALE_TOTALS:
      draft.organizationRentSaleTotals = action.payload
      return
    case SET_RENT_DETAIL_SALE_TOTALS:
      draft.rentDetailSaleTotals = action.payload
      return
    case GET_STATISTIC_SUMMARY:
      return { ...draft, summary: action.payload };
    case GET_ORG_PARTNERS_STATISTIC_SUMMARY:
      return { ...draft, orgPartnersSummary: action.payload };

    case SET_USER_STATISTIC_EVENT_SALE_TOTALS:
      draft.userStatisticEventSaleTotals = action.payload
      return draft
    case SET_USER_EVENT_PURCHASE_TOTALS:
      draft.userEventPurchaseTotals = action.payload
      return draft

    default:
      return draft;
  }
});

export default statisticReducer;