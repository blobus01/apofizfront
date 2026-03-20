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
import axios from "../../axios-api";
import Pathes from "../../common/pathes";
import {getMessage} from "../../common/helpers";
import {getQuery} from "../../common/utils";

const getRentCategoriesRequest = () => ({type: GET_RENT_CATEGORIES.REQUEST})
const getRentCategoriesSuccess = payload => ({type: GET_RENT_CATEGORIES.SUCCESS, payload})
const getRentCategoriesFailure = error => ({type: GET_RENT_CATEGORIES.FAILURE, error})

const getRentSettingsRequest = () => ({type: GET_RENT_SETTINGS.REQUEST})
const getRentSettingsSuccess = payload => ({type: GET_RENT_SETTINGS.SUCCESS, payload})
const getRentSettingsFailure = error => ({type: GET_RENT_SETTINGS.FAILURE, error})
export const clearRentSettings = () => ({type: CLEAR_RENT_SETTINGS})

const getRentPeriodRequest = payload => ({type: GET_RENT_PERIOD.REQUEST, payload})
const getRentPeriodSuccess = payload => ({type: GET_RENT_PERIOD.SUCCESS, payload})
const getRentPeriodFailure = error => ({type: GET_RENT_PERIOD.FAILURE, error})

const getRentYearsRequest = payload => ({type: GET_RENT_YEARS.REQUEST, payload})
const getRentYearsSuccess = payload => ({type: GET_RENT_YEARS.SUCCESS, payload})
const getRentYearsFailure = error => ({type: GET_RENT_YEARS.FAILURE, error})

const getRentMonthsRequest = payload => ({type: GET_RENT_MONTHS.REQUEST, payload})
const getRentMonthsSuccess = payload => ({type: GET_RENT_MONTHS.SUCCESS, payload})
const getRentMonthsFailure = error => ({type: GET_RENT_MONTHS.FAILURE, error})

const getRentDaysRequest = payload => ({type: GET_RENT_DAYS.REQUEST, payload})
const getRentDaysSuccess = payload => ({type: GET_RENT_DAYS.SUCCESS, payload})
const getRentDaysFailure = error => ({type: GET_RENT_DAYS.FAILURE, error})

const getRentHoursRequest = payload => ({type: GET_RENT_HOURS.REQUEST, payload})
const getRentHoursSuccess = payload => ({type: GET_RENT_HOURS.SUCCESS, payload})
const getRentHoursFailure = error => ({type: GET_RENT_HOURS.FAILURE, error})

const getRentMinutesRequest = payload => ({type: GET_RENT_MINUTES.REQUEST, payload})
const getRentMinutesSuccess = payload => ({type: GET_RENT_MINUTES.SUCCESS, payload})
const getRentMinutesFailure = error => ({type: GET_RENT_MINUTES.FAILURE, error})

export const clearRentPeriod = () => ({type: CLEAR_RENT_PERIOD})

export const setRentFormData = (rentID, data) => ({type: SET_RENT_FORM_DATA, payload: {rentID, data}})

export const getRentCategories = () => async dispatch => {
  dispatch(getRentCategoriesRequest())
  try {
    const res = await axios.get(Pathes.Shop.rentCategories)
    if (res.status === 200) {
      dispatch(getRentCategoriesSuccess(res.data))
      return res.data
    }
    return Promise.reject(getMessage(res.data))
  } catch (e) {
    dispatch(getRentCategoriesFailure(e.message))
    return Promise.reject(e.message)
  }
}

export const getRentSettings = rentID => async dispatch => {
  dispatch(getRentSettingsRequest())
  try {
    const res = await axios.get(Pathes.Rent.getStock(rentID))
    if (res.status === 200) {
      dispatch(getRentSettingsSuccess(res.data))
      return res.data
    }
    return Promise.reject(getMessage(res.data))
  } catch (e) {
    dispatch(getRentSettingsFailure(e.message))
    return Promise.reject(e.message)
  }
}

export const getRentPeriod = rentID => async dispatch => {
  dispatch(getRentPeriodRequest())
  try {
    const res = await axios.get(Pathes.Rent.getRentPeriod(rentID))
    if (res.status === 200) {
      dispatch(getRentPeriodSuccess(res.data))
      return res.data
    }
    return Promise.reject(getMessage(res.data))
  } catch (e) {
    dispatch(getRentPeriodFailure(e.message))
    return Promise.reject(e.message)
  }
}

export const getRentYears = rentID => async dispatch => {
  dispatch(getRentYearsRequest({rentID}))
  try {
    const res = await axios.get(Pathes.Rent.years(rentID))
    if (res.status === 200) {
      dispatch(getRentYearsSuccess(res.data))
      return res.data
    }
    return Promise.reject(getMessage(res.data))
  } catch (e) {
    dispatch(getRentYearsFailure(e.message))
    return Promise.reject(e.message)
  }
}

export const getRentMonths = (rentID, params) => async dispatch => {
  dispatch(getRentMonthsRequest({rentID}))
  try {
    const res = await axios.get(Pathes.Rent.months(rentID) + getQuery(params))
    if (res.status === 200) {
      dispatch(getRentMonthsSuccess(res.data))
      return res.data
    }
    return Promise.reject(getMessage(res.data))
  } catch (e) {
    dispatch(getRentMonthsFailure(e.message))
    return Promise.reject(e.message)
  }
}

export const getRentDays = (rentID, params) => async dispatch => {
  dispatch(getRentDaysRequest({rentID}))
  try {
    const res = await axios.get(Pathes.Rent.days(rentID) + getQuery(params))
    if (res.status === 200) {
      dispatch(getRentDaysSuccess(res.data))
      return res.data
    }
    return Promise.reject(getMessage(res.data))
  } catch (e) {
    dispatch(getRentDaysFailure(e.message))
    return Promise.reject(e.message)
  }
}


export const getRentHours = (rentID, params) => async dispatch => {
  dispatch(getRentHoursRequest({rentID}))
  try {
    const res = await axios.get(Pathes.Rent.hours(rentID) + getQuery(params))
    if (res.status === 200) {
      dispatch(getRentHoursSuccess(res.data))
      return res.data
    }
    return Promise.reject(getMessage(res.data))
  } catch (e) {
    dispatch(getRentHoursFailure(e.message))
    return Promise.reject(e.message)
  }
}


export const getRentMinutes = (rentID, params) => async dispatch => {
  dispatch(getRentMinutesRequest({rentID}))
  try {
    const res = await axios.get(Pathes.Rent.minutes(rentID) + getQuery(params))
    if (res.status === 200) {
      dispatch(getRentMinutesSuccess(res.data))
      return res.data
    }
    return Promise.reject(getMessage(res.data))
  } catch (e) {
    dispatch(getRentMinutesFailure(e.message))
    return Promise.reject(e.message)
  }
}