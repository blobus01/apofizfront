import {METADATA} from "../../common/metadata";
import {
  CLEAR_RENT_PERIOD,
  CLEAR_RENT_SETTINGS,
  GET_RENT_CATEGORIES,
  GET_RENT_DAYS,
  GET_RENT_HOURS,
  GET_RENT_MINUTES,
  GET_RENT_MONTHS,
  GET_RENT_PERIOD,
  GET_RENT_SETTINGS,
  GET_RENT_YEARS,
  SET_RENT_FORM_DATA
} from "../actionTypes/rentTypes";
import produce from "immer";
import {updateStateOnFailure, updateStateOnRequest, updateStateOnSuccess} from "../../common/helpers";

const initialState = {
  rentCategories: {
    ...METADATA.default,
    data: null
  },
  rentSettings: {
    ...METADATA.default,
    data: null
  },
  rentYears: {
    ...METADATA.default,
    data: [],
    rentID: null
  },
  rentMonths: {
    ...METADATA.default,
    data: [],
    rentID: null
  },
  rentDays: {
    ...METADATA.default,
    data: [],
    rentID: null
  },
  rentHours: {
    ...METADATA.default,
    data: [],
    rentID: null
  },
  rentMinutes: {
    ...METADATA.default,
    data: [],
    rentID: null
  },
  rentPeriod: {
    ...METADATA.default,
    data: null,
    rentID: null
  },
  rentFormData: {}
}

const rentReducer = (state = initialState, {type, payload, error}) => produce(state, draft => {
  switch (type) {
    case GET_RENT_CATEGORIES.REQUEST:
      return updateStateOnRequest(draft.rentCategories)
    case GET_RENT_CATEGORIES.SUCCESS:
      return updateStateOnSuccess(draft.rentCategories, payload)
    case GET_RENT_CATEGORIES.FAILURE:
      return updateStateOnFailure(draft.rentCategories, error)

    case GET_RENT_SETTINGS.REQUEST:
      return updateStateOnRequest(draft.rentSettings)
    case GET_RENT_SETTINGS.SUCCESS:
      return updateStateOnSuccess(draft.rentSettings, payload)
    case GET_RENT_SETTINGS.FAILURE:
      return updateStateOnFailure(draft.rentSettings, error)
    case CLEAR_RENT_SETTINGS:
      draft.rentSettings.data = null
      return

    case GET_RENT_PERIOD.REQUEST:
      return updateStateOnRequest(draft.rentPeriod, payload)
    case GET_RENT_PERIOD.SUCCESS:
      return updateStateOnSuccess(draft.rentPeriod, payload)
    case GET_RENT_PERIOD.FAILURE:
      return updateStateOnFailure(draft.rentPeriod, error)

    case GET_RENT_YEARS.REQUEST:
      if (draft.rentYears.rentID !== payload?.rentID || draft.rentYears.error) {
        return updateStateOnRequest(draft.rentYears, payload)
      }
      return
    case GET_RENT_YEARS.SUCCESS:
      return updateStateOnSuccess(draft.rentYears, payload)
    case GET_RENT_YEARS.FAILURE:
      return updateStateOnFailure(draft.rentYears, error)

    case GET_RENT_MONTHS.REQUEST:
      if (draft.rentMonths.rentID !== payload?.rentID || draft.rentMonths.error) {
        return updateStateOnRequest(draft.rentMonths, payload)
      }
      return
    case GET_RENT_MONTHS.SUCCESS:
      return updateStateOnSuccess(draft.rentMonths, payload)
    case GET_RENT_MONTHS.FAILURE:
      return updateStateOnFailure(draft.rentMonths, error)

    case GET_RENT_DAYS.REQUEST:
      if (draft.rentDays.rentID !== payload?.rentID || draft.rentDays.error) {
        return updateStateOnRequest(draft.rentDays, payload)
      }
      return
    case GET_RENT_DAYS.SUCCESS:
      return updateStateOnSuccess(draft.rentDays, payload)
    case GET_RENT_DAYS.FAILURE:
      return updateStateOnFailure(draft.rentDays, error)

    case GET_RENT_HOURS.REQUEST:
      if (draft.rentHours.rentID !== payload?.rentID || draft.rentHours.error) {
        return updateStateOnRequest(draft.rentHours, payload)
      }
      return
    case GET_RENT_HOURS.SUCCESS:
      return updateStateOnSuccess(draft.rentHours, payload)
    case GET_RENT_HOURS.FAILURE:
      return updateStateOnFailure(draft.rentHours, error)

    case GET_RENT_MINUTES.REQUEST:
      if (draft.rentMinutes.rentID !== payload?.rentID || draft.rentMinutes.error) {
        return updateStateOnRequest(draft.rentMinutes, payload)
      }
      return
    case GET_RENT_MINUTES.SUCCESS:
      return updateStateOnSuccess(draft.rentMinutes, payload)
    case GET_RENT_MINUTES.FAILURE:
      return updateStateOnFailure(draft.rentMinutes, error)

    case CLEAR_RENT_PERIOD:
      draft.rentPeriod = {...initialState.rentPeriod}
      return

    case SET_RENT_FORM_DATA:
      draft.rentFormData[payload.rentID] = payload.data
      return
    default:
      return
  }
})

export default rentReducer