import qs from "qs";
import axios from "../../axios-api";
import Pathes from "../../common/pathes";
import { getMessage } from "../../common/helpers";
import { getFCMToken } from "../../firebase_init";
import {
  getDataFromLocalStorage,
  loadFromLocalStorage,
  saveDataToLocalStorage,
} from "../localStorage";
import { getUUID } from "../../common/utils";
import {
  GET_NOTIFICATIONS,
  SET_NOTIFICATION_COUNT,
} from "../actionTypes/notificationTypes";

const getNotificationsRequest = () => ({ type: GET_NOTIFICATIONS.REQUEST });
const getNotificationsSuccess = (payload) => ({
  type: GET_NOTIFICATIONS.SUCCESS,
  payload,
});
const getNotificationsFailure = (error) => ({
  type: GET_NOTIFICATIONS.FAILURE,
  error,
});

export const getNotifications = (params, isNext) => {
  return (dispatch, getState) => {
    const filteredParams = { ...params };
    delete filteredParams.hasMore;
    delete filteredParams.showMenu;
    delete filteredParams.settings;
    console.log(params);

    const query = `?${qs.stringify(filteredParams, {
      strictNullHandling: true,
      skipNulls: true,
    })}`;
    dispatch(getNotificationsRequest());
    return axios
      .get(Pathes.Notifications.notifications + query)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().notificationStore.notifications.data;
          if (!isNext || !prevData) {
            dispatch(getNotificationsSuccess(data));
            return { ...data, success: true, message };
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(getNotificationsSuccess(updatedData));
          return { ...updatedData, success: true, message };
        }

        throw new Error(message);
      })
      .catch((e) => dispatch(getNotificationsFailure(e.message)));
  };
};

export const getNotificationsCount = () => {
  // Long polling function for notification counter
  return (dispatch, getState) => {
    const DDoS_INTERVAL = 15000;

    const prevInterval = getDataFromLocalStorage("countInterval");

    if (!!prevInterval) {
      clearInterval(prevInterval);
    }

    const intervalID = setInterval(() => {
      const token = getState().userStore.token;
      if (token) {
        axios
          .get(Pathes.Notifications.count)
          .then((res) => {
            const { status, data } = res;
            const message = getMessage(data);
            const prevCounter = getState().notificationStore.count;

            if (status === 200 && prevCounter !== data.count) {
              dispatch({ type: SET_NOTIFICATION_COUNT, count: data.count });
              return { ...data, success: true, message };
            }

            if (status === 401) {
              const interval = getDataFromLocalStorage("countInterval");
              clearInterval(interval);
            }
            throw new Error("Ошибка в запросе");
          })
          .catch((e) => ({ error: e.message }));
      }
    }, DDoS_INTERVAL);

    saveDataToLocalStorage("countInterval", intervalID);
  };
};

export const setNotificationsAsRead = () => {
  return (dispatch) => {
    return axios
      .post(Pathes.Notifications.count)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          dispatch({ type: SET_NOTIFICATION_COUNT, count: 0 });
          return { ...data, success: true, message };
        }

        throw new Error("Ошибка в запросе");
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const createFCMToken = async () => {
  try {
    const currentToken = getDataFromLocalStorage("fcm");
    getFCMToken()
      .then((token) => {
        if (token && currentToken !== token) {
          saveDataToLocalStorage("fcm", token);
          return axios
            .post(Pathes.Notifications.FCM, {
              registration_id: token,
              type: "web",
              device_id: getUUID(),
              name: `Web - ${navigator.platform || "App"}`,
            })
            .then((res) => {
              if (res.status === 201) {
                const language = loadFromLocalStorage()?.userStore?.locale;
                language &&
                  updateFCMSettings({
                    registration_id: token,
                    language,
                  });
              }
              return res;
            });
        }
      })
      .catch((error) => {
        if (error.code === "messaging/permission-blocked") {
          console.log("Please Unblock Notification Request Manually");
        } else {
          console.log("Error Occurred", error);
        }
      });
  } catch (e) {}
};

/**
 * @param payload.registration_id FCM token
 * @param payload.language "en" for example
 */
export const updateFCMSettings = async (payload) => {
  const res = await axios.post(Pathes.Notifications.FCMSettings, payload);

  const { status, data } = res;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const setNotificationCounter = (count) => {
  return (dispatch, getState) => {
    dispatch({
      type: SET_NOTIFICATION_COUNT,
      count: isNaN(count) ? getState().notificationStore.count + 1 : count,
    });
  };
};
