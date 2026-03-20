import {
  CHANGE_TOKEN_EXPIRED_TIME,
  DEACTIVATE_ALL_TOKENS,
  DEACTIVATE_TOKEN,
  GET_ACTIVE_DEVICES,
  GET_AUTH_HISTORY,
  GET_PHONE_NUMBERS,
  GET_SOCIALS,
  PROFILE_UPDATE,
  SET_PHONE_NUMBERS,
  SET_SOCIALS
} from './actionTypes';
import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import Notify from '../../components/Notification';
import {getMessage} from '../../common/helpers';
import {createFCMToken} from './notificationActions';
import {translate} from "../../locales/locales";
import {getQuery} from "../../common/utils";

const updateProfileRequest = () => ({ type: PROFILE_UPDATE.REQUEST });
const updateProfileSuccess = user => ({ type: PROFILE_UPDATE.SUCCESS, user });
const updateProfileFailure = error => ({ type: PROFILE_UPDATE.FAILURE, error });

const getPhoneNumbersRequest = () => ({ type: GET_PHONE_NUMBERS.REQUEST });
const getPhoneNumbersSuccess = phones => ({ type: GET_PHONE_NUMBERS.SUCCESS, phones });
const getPhoneNumbersFailure = error => ({ type: GET_PHONE_NUMBERS.FAILURE, error });

const getSocialsRequest = () => ({ type: GET_SOCIALS.REQUEST });
const getSocialsSuccess = socials => ({ type: GET_SOCIALS.SUCCESS, socials });
const getSocialsFailure = error => ({ type: GET_SOCIALS.FAILURE, error });

const setPhoneNumbersRequest = () => ({ type: SET_PHONE_NUMBERS.REQUEST });
const setPhoneNumbersSuccess = phones => ({ type: SET_PHONE_NUMBERS.SUCCESS, phones });
const setPhoneNumbersFailure = error => ({ type: SET_PHONE_NUMBERS.FAILURE, error });

const setSocialsRequest = () => ({ type: SET_SOCIALS.REQUEST });
const setSocialsSuccess = socials => ({ type: SET_SOCIALS.SUCCESS, socials });
const setSocialsFailure = error => ({ type: SET_SOCIALS.FAILURE, error });

const getActiveDevicesRequest = () => ({ type: GET_ACTIVE_DEVICES.REQUEST });
const getActiveDevicesSuccess = payload => ({ type: GET_ACTIVE_DEVICES.SUCCESS, payload });
const getActiveDevicesFailure = error => ({ type: GET_ACTIVE_DEVICES.FAILURE, error });

const deactivateAllTokensRequest = () => ({ type: DEACTIVATE_ALL_TOKENS.REQUEST });
const deactivateAllTokensSuccess = payload => ({ type: DEACTIVATE_ALL_TOKENS.SUCCESS, payload });

const deactivateTokenRequest = () => ({ type: DEACTIVATE_TOKEN.REQUEST });
const deactivateTokenSuccess = payload => ({ type: DEACTIVATE_TOKEN.SUCCESS, payload });

const getAuthHistoryRequest = () => ({ type: GET_AUTH_HISTORY.REQUEST });
const getAuthHistorySuccess = payload => ({ type: GET_AUTH_HISTORY.SUCCESS, payload });
const getAuthHistoryFailure = error => ({ type: GET_AUTH_HISTORY.FAILURE, error });

const changeTokenExpiredTimeRequest = () => ({ type: CHANGE_TOKEN_EXPIRED_TIME.REQUEST });
const changeTokenExpiredTimeSuccess = payload => ({ type: CHANGE_TOKEN_EXPIRED_TIME.SUCCESS, payload });


export const updateProfile = data => {
  const formattedData = {
    ...data,
    // if you want to set user gender to "not specified" send undefined not null.
    gender: data?.gender ?? undefined
  }
  return dispatch => {
    dispatch(updateProfileRequest())
    return axios.post(Pathes.Profile.update, formattedData).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          createFCMToken();
          dispatch(updateProfileSuccess(data));
          Notify.success({ text: translate("Вы успешно обновили профиль", "notify.profileEditSuccess")});
          return {...data, success: true, message};
        }

        throw new Error(message)
      }).catch(e => dispatch(updateProfileFailure(e.message)));
  }
};

export const getPhoneNumbers = () => {
  return (dispatch, getState) => {
    const userID = getState().userStore.user && getState().userStore.user.id;
    dispatch(getPhoneNumbersRequest())
    return axios.get(Pathes.Profile.phones(userID)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getPhoneNumbersSuccess(data))
          return data;
        }

        throw new Error(message)
      }).catch(e => dispatch(getPhoneNumbersFailure(e.message)));
  }
}

export const getSocials = () => {
  return (dispatch, getState) => {
    const userID = getState().userStore.user && getState().userStore.user.id;
    dispatch(getSocialsRequest())
    return axios.get(Pathes.Profile.socials(userID)).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getSocialsSuccess(data))
          return data;
        }

        throw new Error(message)
      }).catch(e => dispatch(getSocialsFailure(e.message)));
  }
}

export const setPhoneNumbers = phonesList => {
  return dispatch => {
    dispatch(setPhoneNumbersRequest())
    return axios.post(Pathes.Profile.setPhones, {phone_numbers: phonesList}).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setPhoneNumbersSuccess(data));
          Notify.success({text: translate("Контакты успешно обновлены", "notify.contactsEditSuccess")})
          return {...data, success: true};
        }

        throw new Error(message)
      }).catch(e => dispatch(setPhoneNumbersFailure(e.message)));
  }
}

export const setSocials = socialList => {
  return dispatch => {
    dispatch(setSocialsRequest())
    return axios.post(Pathes.Profile.setSocials, {networks: socialList}).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setSocialsSuccess(data));
          Notify.success({text: translate("Социальные сети успешно обновлены", "notify.socialEditSuccess")})
          return {...data, success: true};
        }

        throw new Error(message)
      }).catch(e => dispatch(setSocialsFailure(e.message)));
  }
}

export const getActiveDevices = (params, isNext=false) => {
  return (dispatch, getState) => {
    dispatch(getActiveDevicesRequest());

    return axios
      .get(Pathes.Profile.devices + getQuery(params))
      .then(res => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          const prevData = getState().profileStore.devices.data
          const resultData = isNext && prevData?.list.length > 0 ? {
            ...data,
            list: prevData.list.concat(data.list)
          } : data

          dispatch(getActiveDevicesSuccess(resultData));
          return { data, success: true };
        }
        throw new Error(message);
      })
      .catch(e => {
        getActiveDevicesFailure(e.message);
        return { error: e, success: false }
      });
  };
};

export const getAuthHistory = (params, isNext=false) => {
  return (dispatch, getState) => {
    dispatch(getAuthHistoryRequest());

    return axios
      .get(Pathes.Profile.authHistory + getQuery(params))
      .then(res => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          const prevData = getState().profileStore.authHistory.data

          const resultData = isNext && prevData !== null ? {
            ...data,
            list: prevData.list.concat(data.list)
          } : data

          dispatch(getAuthHistorySuccess(resultData));

          return { data: resultData, success: true };
        }
        throw new Error(message);
      })
      .catch(error => {
        getAuthHistoryFailure(error.message);
        return { error, success: false }
      });
  };
}

export const deactivateToken = deviceID => {
  return dispatch => {
    dispatch(deactivateTokenRequest());

    return axios
      .delete(Pathes.Profile.device(deviceID))
      .then(res => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          dispatch(deactivateTokenSuccess(deviceID));
          return { data, success: true, message };
        }
        throw new Error(message);
      })
  }
}

export const deactivateAllTokens = () => {
  return dispatch => {
    dispatch(deactivateAllTokensRequest());

    return axios
      .delete(Pathes.Profile.deactivateTokens)
      .then(res => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          dispatch(deactivateAllTokensSuccess(data));
          return { ...data, success: true };
        }
        throw new Error(message);
      })
  };
};

export const changeTokenExpiredTime = (deviceID, payload) => {
  return dispatch => {
    dispatch(changeTokenExpiredTimeRequest());

    return axios
      .post(Pathes.Profile.tokenExpiredTime(deviceID), payload)
      .then(res => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          dispatch(changeTokenExpiredTimeSuccess(data));
          return { ...data, success: true };
        }
        throw new Error(message);
      })
  };
};