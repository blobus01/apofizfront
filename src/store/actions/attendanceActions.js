import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import {getMessage} from '../../common/helpers';
import {getQuery} from '../../common/utils';
import {GET_ATTENDANCE_STATUS, GET_RECEIPTS_CALENDAR} from '../actionTypes/attendanceTypes';
import Notify from '../../components/Notification';
import {translate} from '../../locales/locales';

const getAttendanceStatusRequest = () => ({ type: GET_ATTENDANCE_STATUS.REQUEST });
const getAttendanceStatusSuccess = payload => ({ type: GET_ATTENDANCE_STATUS.SUCCESS, payload });
const getAttendanceStatusFailure = error => ({ type: GET_ATTENDANCE_STATUS.FAILURE, error });

const getReceiptsCalendarRequest = () => ({ type: GET_RECEIPTS_CALENDAR.REQUEST });
const getReceiptsCalendarSuccess = payload => ({ type: GET_RECEIPTS_CALENDAR.SUCCESS, payload });
const getReceiptsCalendarFailure = error => ({ type: GET_RECEIPTS_CALENDAR.FAILURE, error });

export const getEmployeeInfoATD = params => {
  return () => {
    return axios.get(Pathes.Attendance.info + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          return { data, success: true }
        }

        if (status === 404 || status === 406) {
          Notify.success({ text: translate("Сотрудник не зарегистрирован с таким ID", "notify.employeeNotRegistered")})
        }

        throw new Error(message)
      }).catch(e => ({ error: e.message }));
  }
};

export const getAttendanceInfo = userID => {
  return () => {
    return axios.get(Pathes.Attendance.global + getQuery({ user: userID })).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          return { data, success: true }
        }

        throw new Error(message)
      }).catch(e => ({ error: e.message }));
  }
};

export const recordAttendance = payload => {
  return () => {
    return axios.post(Pathes.Attendance.attendance, payload).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          Notify.success({ text: data.is_active
              ? translate('Успешный вход', "notify.userPassIN")
              : translate('Успешный выход', "notify.userPassOUT")
          })
          return { data, success: true }
        }

        if (status === 406) {
          Notify.success({ text: message})
        }

        throw new Error(message)
      }).catch(e => ({ error: e.message }));
  }
};

export const getAttendanceStatus = (employeeID, params) => {
  return dispatch => {
    dispatch(getAttendanceStatusRequest())
    return axios.get(Pathes.Attendance.stats(employeeID) + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getAttendanceStatusSuccess(data));
          return { data, success: true }
        }

        throw new Error(message)
      }).catch(e =>  dispatch(getAttendanceStatusFailure(e.message)));
  }
};

export const getReceiptsCalendar = params => {
  return dispatch => {
    dispatch(getReceiptsCalendarRequest());
    return axios.get(Pathes.Attendance.receipts + getQuery(params)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getReceiptsCalendarSuccess(data));
          return {data, success: true}
        }
        throw new Error(message)
      }).catch(e => dispatch(getReceiptsCalendarFailure(e.message)));
  }
};