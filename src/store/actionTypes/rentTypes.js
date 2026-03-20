import {createActionTypes} from "../../common/helpers";

export const GET_RENT_CATEGORIES = createActionTypes('GET_RENT_CATEGORIES')

export const GET_RENT_SETTINGS = createActionTypes('GET_RENT_SETTINGS')
export const CLEAR_RENT_SETTINGS = 'CLEAR_RENT_SETTINGS'

export const GET_RENT_YEARS = createActionTypes('GET_RENT_YEARS')
export const GET_RENT_MONTHS = createActionTypes('GET_RENT_MONTHS')
export const GET_RENT_DAYS = createActionTypes('GET_RENT_DAYS')
export const GET_RENT_HOURS = createActionTypes('GET_RENT_HOURS')
export const GET_RENT_MINUTES = createActionTypes('GET_RENT_MINUTES')

export const SET_RENT_FORM_DATA = 'SET_RENT_FORM_DATA'

export const GET_RENT_PERIOD = createActionTypes('GET_RENT_PERIOD')

export const CLEAR_RENT_PERIOD = 'CLEAR_RENT_PERIOD'