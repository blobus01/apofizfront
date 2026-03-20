import { ERROR_MESSAGES } from "./messages";
import {
  DATE_FORMAT_DD_MM_YYYY,
  RENT_TIME_TYPES,
  REQUEST_ACTION_PREFIXES,
} from "./constants";
import moment from "moment";
import { isNaN } from "formik";
import { isMobile } from "./utils";
import config from "../config";
import Notify from "../components/Notification";
import { translate } from "@locales/locales";
import { METADATA } from "./metadata";

export const readURL = (image) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(image);
    } catch (e) {
      reject();
    }
  });
};

export const EMAIL_REGEX =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
export const PHONE_NUMBER = /^[+*][0-9]*$/g;
export const INTERNATIONAL_PHONE_NUMBER = /^\+[0-9]*$/g;
export const POST_LINK_REGEX = /https:\/\/(test.)?apofiz.com\/p\/\d*(\/)?$/g;
export const CONTACT_REGEX =
  /^((([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$)|([+*][0-9]*$)/i;
export const PROTOCOL_REGEX = /^(http:\/\/|https:\/\/)/g;
export const WEBSITE_REGEX =
  /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?(\/)?/;
export const STRICT_WEBSITE_REGEX =
  /^((ftp|http|https):\/\/)[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?(\/)?/;
// export const URL_PARSER = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/g
export const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&\/=]*)/;
export const VALID_DISCOUNT = /^[1-9][0-9]?$|^100$/g; // RegEx from 1-100 decimal number
export const DECIMAL_DIGITS = /^\d*\.?\d*$/g; // RegEx from 51.67;
export const ONLY_DIGITS = /^[0-9]*$/g; // RegEx from 124124;
export const OID_REGEX = /^OID\d*$/i;
export const getMessage = (res, customMsg) => {
  return (
    (res && res.message) ||
    (res && res.detail) ||
    customMsg ||
    translate("Что-то пошло не так", "app.fail")
  );
};
export const getRandom = (min = 1, max = 100) =>
  Math.floor(Math.random() * max) + min;
export const socialDetect = (text) => {
  if (text.includes("instagram.com")) {
    return "instagram";
  }

  if (text.includes("facebook.com") || text.includes("fb.com")) {
    return "facebook";
  }

  return text.replace(PROTOCOL_REGEX, "");
};

export const validateForSameDiscount = (discountList, isCumulative) => {
  if (discountList.length > 1) {
    const percents = [];
    const limits = [];
    const errorDiscount = new Array(discountList.length).fill(null);
    discountList.forEach((discount, index) => {
      if (index === 0) {
        isCumulative && limits.push(parseInt(discount.limit));
        percents.push(parseInt(discount.percent));
      }

      if (!percents.includes(parseInt(discount.percent))) {
        percents.push(parseInt(discount.percent));
      } else {
        errorDiscount[index] = { percent: ERROR_MESSAGES.percent_duplicate };
      }

      if (isCumulative) {
        if (!limits.includes(parseInt(discount.limit))) {
          limits.push(parseInt(discount.limit));
        } else {
          errorDiscount[index] = errorDiscount[index]
            ? { ...errorDiscount[index], limit: ERROR_MESSAGES.limit_duplicate }
            : { limit: ERROR_MESSAGES.limit_duplicate };
        }
      }
    });

    return !!errorDiscount.filter((item) => item).length && errorDiscount;
  }
};

export const shortenNumber = (num) => {
  const digit = parseInt(num);
  if (!isNaN(digit)) {
    if (digit < 1000) {
      return digit;
    }
    if (digit < 1000000) {
      return `${Math.floor(digit / 1000)}k`;
    }
    return `${Math.floor(digit / 1000000)}m`;
  }
  return 0;
};

export const checkForValidFile = (
  file,
  allowedTypes,
  allowedMaxSize,
  allowedMinSize
) => {
  const result = { isValid: true };

  if (file) {
    const { type, size } = file;
    if (allowedTypes && !allowedTypes.includes(type)) {
      result.isValid = false;
      result.type = "File type is invalid";
    }

    if (allowedMaxSize && size >= allowedMaxSize) {
      result.isValid = false;
      result.size = "File size is too big";
    }

    if (allowedMinSize && size <= allowedMinSize) {
      result.isValid = false;
      result.size = "File size is too small";
    }
  }

  return result;
};

export const getUserGEO = (setUserGEO) => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function success(position) {
        setUserGEO({
          lat: position.coords.latitude,
          ltd: position.coords.longitude,
        });
      },
      function error(error_message) {
        fetch("http://ip-api.com/json")
          .then(async (response) => {
            if (response.ok) {
              let data = await response.json();
              setUserGEO({ lat: data.lat, ltd: data.lon });
            }
          })
          .catch(() => {});
        console.warn(
          "An error has occured while retrieving location",
          error_message
        );
      }
    );
  } else {
    fetch("http://ip-api.com/json").then(async (response) => {
      if (response.ok) {
        let data = await response.json();
        setUserGEO({ lat: data.lat, ltd: data.lon });
      }
    });
  }
};

export const canGoBack = (history) => history && history.action !== "POP";

const minMaxValidate = (value, min, max) => {
  if (isNaN(max) && isNaN(min)) {
    return true;
  }

  if (!isNaN(max) && isNaN(min) && value <= max) {
    return true;
  }

  if (!isNaN(min) && isNaN(max) && value >= min) {
    return true;
  }

  return !isNaN(max) && !isNaN(min) && value <= max && value >= min;
};

export const validateForNumber = (val, params) => {
  const { isFloat, min, max } = params;

  const value = Number(val);
  const result = {
    isValid: false,
    isEmpty: false,
    value: val,
  };

  if (val && val.length > 1 && val[0] === "0") {
    if (val[1] !== ".") {
      result.value = "0";
      return result;
    }
  }

  if (!isNaN(value)) {
    result.isEmpty = val === "";
    if (isFloat) {
      result.isValid = minMaxValidate(value, min, max);
    } else {
      if (!val.toString().includes(".")) {
        result.value = val.replace(".", "");
        result.isValid = minMaxValidate(value, min, max);
      }
    }
  }

  return result;
};

export function delay(callback, ms) {
  let timer = 0;
  return function () {
    const context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      callback.apply(context, args);
    }, ms || 0);
  };
}

export const collectParams = (paramKeys = [], source = {}) => {
  const params = {};
  if (source) {
    paramKeys?.map((key) => (params[key] = source[key] ? source[key] : null));
  }
  return params;
};

export const getMobileAppLink = () => {
  if (isMobile.iOS()) {
    return config.appAppStoreURL;
  }
  if (isMobile.Android()) {
    return config.appGooglePlayURL;
  }
  return "";
};

export const withShlyuzerLink = (url = "") =>
  url.includes("apofiz") || url.includes("blob:")
    ? url
    : config.instaProxy + url;

export const createActionTypes = (
  actionType,
  prefixes = REQUEST_ACTION_PREFIXES
) => {
  return prefixes?.reduce((acc, prefix) => {
    return {
      [prefix]: `${actionType}_${prefix}`,
      ...acc,
    };
  }, {});
};

export const camelToUnderscore = (key) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.split(" ").join("_").toLowerCase();
};

export const camelObjectToUnderscore = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach((k) => {
    newObj[camelToUnderscore(k)] = obj[k];
  });
  return newObj;
};

export const notifyQueryResult = (
  queryPromise,
  {
    successMsg,
    errorMsg,
    onSuccess,
    onFailure,
    onFinal,
    notifySuccessRes = false,
    notifyFailureRes = true,
  } = {}
) => {
  return queryPromise
    .then((res) => {
      if (res && res.success) {
        if (successMsg || (res.message && notifySuccessRes)) {
          Notify.success({ text: successMsg ? successMsg : res.message });
        }
        onSuccess && onSuccess(res);
        return res;
      }
      if (res && res.success === false) {
        const notificationMessage = errorMsg ?? res.message ?? res.error;
        if (notifyFailureRes) {
          Notify.error({ text: notificationMessage });
        }
        console.error(notificationMessage);
        onFailure && onFailure(res);
        return res;
      }
    })
    .catch((e) => {
      if (notifyFailureRes) {
        Notify.error({ text: errorMsg ? errorMsg : e?.message });
      }
      console.error(e);
      onFailure && onFailure(e);
      return e;
    })
    .finally((res) => {
      onFinal && onFinal(res);
      return res;
    });
};

export const snakeToCamel = (str) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );

export const snakeObjectToCamel = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach((k) => {
    newObj[snakeToCamel(k)] = obj[k];
  });
  return newObj;
};

export const nullable =
  (propType) =>
  (props, propName, componentName, ...other) => {
    if (props[propName] === undefined) {
      return new Error(
        `${componentName}: Undefined ${propName} is not allowed`
      );
    }

    if (props[propName] === null) {
      return; //this is allowed when data is loading
    }

    return propType(props, propName, componentName, ...other);
  };

export const updateStateOnRequest = (draftState, stateModifier = {}) => {
  Object.keys(METADATA.request).forEach(
    (k) => (draftState[k] = METADATA.request[k])
  );
  Object.keys(stateModifier).forEach((k) => (draftState[k] = stateModifier[k]));
};

export const updateStateOnSuccess = (draftState, data) => {
  Object.keys(METADATA.success).forEach(
    (k) => (draftState[k] = METADATA.success[k])
  );
  draftState.data = data;
};

export const updateStateOnFailure = (draftState, error) => {
  Object.keys(METADATA.error).forEach(
    (k) => (draftState[k] = METADATA.error[k])
  );
  draftState.error = error;
};

export const getFormattedRentalPeriod = (startTime, endTime, rentTimeType) => {
  const startTimeDate =
    typeof startTime === "string" ? moment.utc(startTime).toDate() : startTime;
  const endTimeDate =
    typeof endTime === "string" ? moment.utc(endTime).toDate() : endTime;

  switch (rentTimeType) {
    case RENT_TIME_TYPES.year:
      const formattedStartYear = startTimeDate.getUTCFullYear();
      const formattedEndYear = endTimeDate
        ? endTimeDate.getUTCFullYear() + 1
        : startTimeDate.getUTCFullYear() + 1;

      return `${formattedStartYear} - ${formattedEndYear}`;
    case RENT_TIME_TYPES.month:
      return `${moment
        .utc(startTimeDate)
        .format(DATE_FORMAT_DD_MM_YYYY)} - ${moment
        .utc(endTimeDate)
        .format(DATE_FORMAT_DD_MM_YYYY)}`;
    case RENT_TIME_TYPES.day:
      return `${moment
        .utc(startTimeDate)
        .format(DATE_FORMAT_DD_MM_YYYY)} - ${moment
        .utc(endTimeDate)
        .add(1, "day")
        .format(DATE_FORMAT_DD_MM_YYYY)}`;
    case RENT_TIME_TYPES.hour:
      return `${moment.utc(startTimeDate).format("HH:mm")} - ${moment
        .utc(endTimeDate)
        .add(1, "minute")
        .format("HH:mm")} - ${moment
        .utc(startTimeDate)
        .format(DATE_FORMAT_DD_MM_YYYY)}`;
    case RENT_TIME_TYPES.minute:
      return `${moment.utc(startTimeDate).format("HH:mm")} - ${moment
        .utc(endTimeDate)
        .add(1, "minute")
        .format("HH:mm")} - ${moment
        .utc(startTimeDate)
        .format(DATE_FORMAT_DD_MM_YYYY)}`;
    default:
      return null;
  }
};

export const removeObjectsWithDuplicateProperty = (arr, propName) => {
  const uniqueProps = new Set();
  return arr.filter((obj) => {
    if (uniqueProps.has(obj[propName])) {
      return false; // object has duplicate property value
    } else {
      uniqueProps.add(obj[propName]);
      return true; // object has unique property value
    }
  });
};

export const parseExcelFileFromResponse = (requestResponse) => {
  if (!requestResponse.data) throw Error("There's no file in response.");
  const disposition = requestResponse.headers["content-disposition"];
  const serverFileName = disposition
    ? disposition.split(";")[1].split("=")[1].replace(/"/g, "")
    : null;
  const blob = new Blob([requestResponse.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  return { blob, serverFileName };
};

// TODO: add instagram data checking
export const getPostImage = (post, size = "medium") => {
  if (!post) return null;
  if (post.images[0]) return post.images[0][size];
  if (post.videos[0]) return post.videos[0].thumbnail;

  return null;
};

export function timeoutPromise(ms, promise) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Timeout"));
    }, ms);
  });

  return Promise.race([promise, timeout]);
}

export function getUrlExtension(url) {
  return url.split(/[#?]/)[0].split(".").pop().trim();
}

export const getFileExtension = (file) => file.split(".").pop();

export function createLinkOnMap(lat, lng) {
  let mapLink = getGoogleMapLink(lat, lng);

  if (isMobile.iOS()) {
    mapLink = `maps://?q=${lat},${lng}`;
  } else if (isMobile.any()) {
    mapLink = `geo:${lat},${lng}`;
  }

  return mapLink;
}

export function getGoogleMapLink(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function isImageAvailable(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
export const formatWithCommas = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
