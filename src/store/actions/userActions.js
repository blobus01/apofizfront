import axios from "../../axios-api";
import { push } from "react-router-redux";
import Pathes from "../../common/pathes";
import Notify from "../../components/Notification";
import { getMessage } from "../../common/helpers";
import { deleteFCMToken } from "../../firebase_init";
import {
  AUTHENTICATE_USER,
  LOGIN_USER,
  GET_USER,
  SET_TOKEN,
  SET_USER_LOCATION,
  LOGOUT_USER,
  SET_REGION,
  SET_LOCALE,
  SET_PRINT_PAPER_WIDTH,
} from "./actionTypes";
import { translate } from "../../locales/locales";

const authenticateRequest = () => ({ type: AUTHENTICATE_USER.REQUEST });
const authenticateSuccess = (payload) => ({
  type: AUTHENTICATE_USER.SUCCESS,
  payload,
});
const authenticateFailure = (error) => ({
  type: AUTHENTICATE_USER.FAILURE,
  error,
});

const loginUserRequest = () => ({ type: LOGIN_USER.REQUEST });
const loginUserSuccess = (payload) => ({ type: LOGIN_USER.SUCCESS, payload });
const loginUserFailure = (error) => ({ type: LOGIN_USER.FAILURE, error });

const setToken = (token) => ({ type: SET_TOKEN, token });

const getUserRequest = () => ({ type: GET_USER.REQUEST });
const getUserSuccess = (user) => ({ type: GET_USER.SUCCESS, user });
const getUserFailure = (error) => ({ type: GET_USER.FAILURE, error });

export const authenticate = (params) => {
  return (dispatch) => {
    dispatch(authenticateRequest());
    return axios
      .post(Pathes.Auth.authenticate, params)
      .then(async (response) => {
        const { status, data } = response;
        const message = getMessage(data);
        const res = {
          data: null,
          message,
          success: false,
        };

        if (status === 200) {
          dispatch(authenticateSuccess(response.data));

          return { ...res, data, success: true };
        }

        if (status === 422 && message === "Limit exceeded") {
          Notify.success({
            text: translate("Повторите через 30 минут", "notify.smsCode"),
          });
          return res;
        }

        if (status === 429) {
          return res;
        }

        // when recaptcha v2 token is invalid and when user is deleted
        if (status === 403) {
          Notify.error({ text: message });
          return res;
        }

        Notify.error({ text: message });
        throw new Error(message);
      })
      .catch((e) => dispatch(authenticateFailure(e.message)));
  };
};

export const loginUser = (userData) => {
  return (dispatch) => {
    dispatch(loginUserRequest());
    return axios
      .post(Pathes.Auth.login, userData)
      .then(async (response) => {
        const { status, data } = response;
        const message = getMessage(data);
        if (status === 200) {
          data.user.has_empty_fields &&
            localStorage.setItem("has_empty_fields", "1");
          dispatch(loginUserSuccess(response.data));

          dispatch(push("/home/posts"));
          const message = translate(
            "Добро пожаловать, {name}",
            "notify.welcome",
            { name: response.data.user.full_name }
          );
          Notify.success({ text: message });
          return { ...data, success: true };
        }

        throw new Error(message);
      })
      .catch((e) => {
        dispatch(loginUserFailure(e.message));
        return {
          error: e.message,
          is_wrong_psw: e.message === "Wrong credentials",
          success: false,
        };
      });
  };
};

export const logoutUser = () => {
  return async (dispatch, getState) => {
    const token = getState().userStore.token;
    token &&
      (await axios
        .post(Pathes.Auth.logout, null, {
          headers: {
            Authorization: `Token ${token}`,
          },
        })
        .catch(() => {}));
    dispatch({ type: LOGOUT_USER });

    dispatch(push("/auth"));
    await deleteFCMToken();
  };
};

export const verifyCode = (phone_number, code, location, device) => {
  return (dispatch) => {
    return axios
      .post(Pathes.Auth.verifyCode, { phone_number, code, location, device })
      .then(async (response) => {
        const { status, data } = response;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setToken(data && data.token));

          return response.data;
        }

        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const setUserToken = (token) => {
  return (dispatch) => dispatch(setToken(token));
};

export const resendCode = (phone_number, type) => {
  return () => {
    return axios
      .post(Pathes.Auth.resendCode, { phone_number, type })
      .then((response) => {
        const { status, data } = response;
        const message = getMessage(data);

        if (status === 200) {
          response.data &&
            response.data.message &&
            Notify.success({ text: response.data.message });
          return response.data;
        }

        if (status === 422 && data.message === "Limit exceeded") {
          Notify.success({
            text: translate("Повторите через 30 минут", "notify.smsCode"),
          });
        }

        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const getUserLocation = (notDispatch = false) => {
  return async (dispatch) => {
    try {
      const response = await axios.get(Pathes.Common.myLocation);
      if (response && response.status === 200) {
        const { data } = response;
        const location = {
          city: data.city,
          country: data.country_name,
          countryCode: data.country_code,
          postal: data.postal,
          state: data.state,
          ip: data.IPv4,
          lat: data.latitude,
          lon: data.longitude,
        };

        !notDispatch && dispatch({ type: SET_USER_LOCATION, location });
        return location;
      }
    } catch (e) {}
  };
};

export const setPassword = (password) => {
  return () => {
    return axios
      .post(Pathes.Auth.setPassword, { password })
      .then((response) => {
        const { status, data } = response;
        const message = getMessage(data);
        if (status === 200) {
          return { ...data, success: true };
        }

        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const forgotPassword = (phone_number) => {
  return () => {
    return axios
      .post(Pathes.Auth.forgotPassword, { phone_number })
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          return data;
        }

        if (status === 404) {
          Notify.success({ text: message });
        }

        if (status === 422 && data.message === "Limit exceeded") {
          Notify.success({
            text: translate("Повторите через 30 минут", "notify.smsCode"),
          });
        }

        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const getUser = () => {
  return (dispatch) => {
    dispatch(getUserRequest());
    return axios
      .get(Pathes.Profile.get)
      .then(async (res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getUserSuccess(data));

          return data;
        }

        throw new Error(message);
      })
      .catch((e) => dispatch(getUserFailure(e.message)));
  };
};

export const changePassword = (payload) => {
  return () => {
    return axios
      .post(Pathes.Auth.changePassword, payload)
      .then((response) => {
        const { status, data } = response;
        const message = getMessage(data);
        if (status === 200) {
          Notify.success({ text: message });
          return {
            ...response.data,
            success: true,
          };
        }

        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const validateOldNumber = () => {
  return () => {
    return axios
      .post(Pathes.Auth.validateOldNumber)
      .then((response) => {
        const { status, data } = response;
        if (status === 200) {
          return {
            ...data,
            success: true,
          };
        }

        if (status === 422 && data.message === "Limit exceeded") {
          Notify.success({
            text: translate(
              "Превышен лимит смс-запросов. Код отправлен на электронную почту",
              "notify.smsSentToEmail"
            ),
          });
        }

        throw new Error(getMessage(data));
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const sendCodeToNewNumber = (phone_number) => {
  return () => {
    return axios
      .post(Pathes.Auth.sendCodeToNewNumber, { phone_number })
      .then((response) => {
        const { status, data } = response;
        if (status === 200) {
          return {
            ...data,
            success: true,
          };
        }

        throw new Error(getMessage(data));
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const changeAuthNumber = (payload) => {
  return () => {
    return axios
      .post(Pathes.Auth.doChangeAndVerifyNewNumber, payload)
      .then((response) => {
        const { status, data } = response;
        const message = getMessage(data);
        if (status === 200) {
          Notify.success({ text: message });
          return {
            ...data,
            success: true,
          };
        }

        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const setRegion = (region) => {
  return (dispatch) => dispatch({ type: SET_REGION, region });
};

export const setAppLanguage = (locale) => {
  return (dispatch) => dispatch({ type: SET_LOCALE, locale });
};

export const setPrintPaperWidth = (size) => {
  return (dispatch) => dispatch({ type: SET_PRINT_PAPER_WIDTH, size });
};

export const setPrevPath = (path) => ({
  type: "SET_PREV_PATH",
  payload: path,
});

export const clearPrevPath = () => ({
  type: "CLEAR_PREV_PATH",
});

export const setSearchState = (data) => ({
  type: "SET_SEARCH_STATE",
  payload: data
})

// Функция для автоматического определения региона пользователя при авторизации
export const detectUserRegion = () => {
  return async (dispatch, getState) => {
    try {
      // Проверяем, есть ли уже сохраненный регион
      const currentRegion = getState().userStore.region;
      if (currentRegion) {
        return { success: true, region: currentRegion };
      }

      // Проверяем, не идет ли уже процесс определения региона
      if (getState().userStore.loading) {
        return {
          success: false,
          message: "Процесс определения региона уже запущен",
        };
      }

      // Получаем геолокацию пользователя по IP
      const location = await dispatch(getUserLocation(true));

      if (location && location.countryCode) {
        // Получаем список стран и городов для поиска подходящего региона
        const response = await axios.get(
          Pathes.Common.citiesAndCountries + "?limit=1000"
        );

        if (response && response.status === 200) {
          const { data } = response;
          let detectedRegion = null;

          // Ищем страну по коду
          if (data.results && data.results.countries) {
            detectedRegion = data.results.countries.find(
              (country) => country.code === location.countryCode
            );
          }

          // Если страна найдена, устанавливаем её как регион
          if (detectedRegion) {
            const regionData = {
              type: "countries",
              code: detectedRegion.code,
              name: detectedRegion.name,
              flag: detectedRegion.flag,
              currency: detectedRegion.currency || {
                code: location.countryCode === "KG" ? "KGS" : "USD",
                name:
                  location.countryCode === "KG"
                    ? "Kyrgystani Som"
                    : "US Dollar",
              },
            };

            dispatch(setRegion(regionData));

            // // Показываем уведомление пользователю
            // Notify.success({
            //   text: `Автоматически определен регион: ${regionData.name}. Вы можете изменить его в настройках.`,
            // });

            return {
              success: true,
              region: regionData,
              message: `Автоматически определен регион: ${regionData.name}`,
            };
          }
        }
      }

      return {
        success: false,
        message: "Не удалось автоматически определить регион",
      };
    } catch (error) {
      console.error("Ошибка при определении региона:", error);
      return {
        success: false,
        message: "Ошибка при определении региона",
      };
    }
  };
};
