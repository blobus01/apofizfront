import {METADATA} from "../../../../common/metadata";
import {DEFAULT_LIMIT} from "../../../../common/constants";
import {createReducer} from "../../../../common/utils";

export const INITIAL_STATE = {
  ...METADATA.default,
  loading: true,
  rentals: null,
  hasMore: true,
  queryParams: {
    limit: DEFAULT_LIMIT,
    page: 1
  },
}

export const GET_NEXT_RENTALS_SUCCESS = 'GET_NEXT_RENTALS_SUCCESS'

export const reducer = createReducer(INITIAL_STATE, {
  [GET_NEXT_RENTALS_SUCCESS]: (state, {payload}) => {
     state.rentals = {
      ...payload,
      list: state.rentals ? state.rentals.list.concat(payload.list) : payload.list
    }
    state.loading = state.loading && false
    state.hasMore = state.queryParams.page !== payload.total_pages
    state.queryParams.page +=1
  }
})