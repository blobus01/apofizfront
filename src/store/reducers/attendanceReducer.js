import {METADATA} from '../../common/metadata';
import {GET_ATTENDANCE_STATUS, GET_RECEIPTS_CALENDAR} from '../actionTypes/attendanceTypes';

const initialState = {
  attendanceStatus: {...METADATA.default, data: null},
  receiptsCalendar: {...METADATA.default, data: {calendar: [], client: null}},
};

const attendanceReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ATTENDANCE_STATUS.REQUEST:
      return { ...state, attendanceStatus: { ...state.attendanceStatus, ...METADATA.request }};
    case GET_ATTENDANCE_STATUS.SUCCESS:
      return { ...state, attendanceStatus: { ...METADATA.success, data: action.payload }};
    case GET_ATTENDANCE_STATUS.FAILURE:
      return { ...state, attendanceStatus: { ...state.attendanceStatus, ...METADATA.error, error: action.error }};
    case GET_RECEIPTS_CALENDAR.REQUEST:
      return { ...state, receiptsCalendar: { ...state.receiptsCalendar, ...METADATA.request }};
    case GET_RECEIPTS_CALENDAR.SUCCESS:
      return { ...state, receiptsCalendar: { ...METADATA.success, data: action.payload }};
    case GET_RECEIPTS_CALENDAR.FAILURE:
      return { ...state, receiptsCalendar: { ...state.receiptsCalendar, ...METADATA.error, error: action.error }};

    default:
      return state;
  }
};

export default attendanceReducer;