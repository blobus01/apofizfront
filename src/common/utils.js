import moment from "moment";
import {
  DATE_FORMAT_DD_MM_YYYY,
  DATE_FORMAT_DD_MM_YYYY_HH_MM,
  DATE_FORMAT_YYYY_MM_DD,
} from "./constants";
import qs from "qs";
import config from "../config";
import { translate } from "@locales/locales";
import React from "react";
import {
  getDataFromLocalStorage,
  saveDataToLocalStorage,
} from "@store/localStorage";
import produce from "immer";

function fallbackCopyTextToClipboard(text, onSuccess, onFailure) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    const msg = successful ? "successful" : "unsuccessful";
    onSuccess && onSuccess(text, msg);
  } catch (err) {
    onFailure && onFailure(text, "unsuccessful");
  }

  document.body.removeChild(textArea);
}
export const copyTextToClipboard = (text, onSuccess, onFailure) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text, onSuccess, onFailure);
    return;
  }
  navigator.clipboard.writeText(text).then(onSuccess, onFailure);
};

export const isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function () {
    let check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a,
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4),
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  },
};

export const getAppDownloadLink = (fallback = "") => {
  if (isMobile.Android()) {
    return config.appGooglePlayURL ?? fallback;
  }

  if (isMobile.iOS()) {
    return config.appAppStoreURL ?? fallback;
  }
  return fallback;
};

export const getClientLocation = async () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation)
      reject(new Error("Error: cannot access navigator.geolocation"));
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
      },
    );
  });

export const parseLocation = ({ latitude, longitude }) => {
  if (latitude && longitude) {
    return {
      lat: latitude,
      lng: longitude,
    };
  }
  return null;
};

export const padNumber = (id, totalLength = 6) => {
  const zeros = new Array(totalLength).fill(0).join("");
  return !id
    ? zeros
    : `${id}`.length >= totalLength
      ? `${id}`
      : (zeros + id).slice(totalLength * -1);
};

export const chunkArray = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size),
  );

export const getRandomElementFromArray = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

export const dataURItoBlob = (dataURI, mime) => {
  // convert base64/URLEncoded data component to raw binary data held in a string
  let byteString;
  if (dataURI.split(",")[0].indexOf("base64") >= 0)
    byteString = atob(dataURI.split(",")[1]);
  else byteString = unescape(dataURI.split(",")[1]);

  // separate out the mime component
  const mimeString = mime || dataURI.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to a typed array
  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
};

export const prettyDate = (datetime, showTime) => {
  const diff_sec = moment().diff(moment(datetime), "second");
  const diff_day = moment().diff(moment(datetime), "day");

  if (diff_day < 1) {
    if (diff_sec < 60) {
      return diff_sec < 1
        ? translate("только что", "time.justNow")
        : translate("{diff_second} с. назад", "time.secondAgo", {
            diff_second: diff_sec,
          });
    }
    if (diff_sec < 120) {
      return translate("1 м. назад", "time.oneMinuteAgo");
    }
    if (diff_sec < 3600) {
      return translate("{diff_minute} м. назад", "time.minuteAgo", {
        diff_minute: Math.floor(diff_sec / 60),
      });
    }
    if (diff_sec < 7200) {
      return translate("1 ч. назад", "time.oneHourAgo");
    }
    if (diff_sec < 86400) {
      return translate("{diff_hour} ч. назад", "time.hourAgo", {
        diff_hour: Math.floor(diff_sec / 3600),
      });
    }
  }

  return moment(datetime).format(
    showTime ? DATE_FORMAT_DD_MM_YYYY_HH_MM : DATE_FORMAT_DD_MM_YYYY,
  );
};

export const dateRangeConverter = ({ start, end }) => {
  const formattedStart = start
    ? moment(start).format(DATE_FORMAT_YYYY_MM_DD)
    : null;
  const formattedEnd = end ? moment(end).format(DATE_FORMAT_YYYY_MM_DD) : null;
  return { start: formattedStart, end: formattedEnd };
};

export const getQuery = (params, exclude = []) => {
  let datasets = "";
  if (params) {
    const filteredParams = {
      ...params,
      search: params.search ? params.search : null,
    };
    const excludeList = [...exclude, "showMenu", "hasMore", "step", "title"];
    excludeList.forEach((key) => {
      delete filteredParams[key];
    });
    datasets = qs.stringify(
      { ...filteredParams, ...dateRangeConverter(filteredParams) },
      { strictNullHandling: true, skipNulls: true },
    );
    if (datasets) {
      return `?${datasets}`;
    }
  }
  return "";
};

export const getUUID = () => {
  const navigator_info = window.navigator;
  const screen_info = window.screen;
  let uid = navigator_info.mimeTypes.length;
  uid += navigator_info.userAgent.replace(/\D+/g, "");
  uid += navigator_info.plugins.length;
  uid += screen_info.height || "";
  uid += screen_info.width || "";
  uid += screen_info.pixelDepth || "";
  return uid;
};

export const calculateDiscount = (percent = 0, amount = 0) => {
  const p = Number(percent);
  const a = Number(amount);
  return isNaN(p) || isNaN(a) ? 0 : amount - (a * p) / 100;
};

export const round = (num, decimalPlaces) => {
  try {
    num = Math.round(num + "e" + decimalPlaces);
    return Number(num + "e" + -decimalPlaces) || 0;
  } catch (e) {
    return 0;
  }
};

export const prettyMoney = (value, disableCurrency, currency = "") => {
  const x = parseInt(value);
  if (x) {
    const digit = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    return !disableCurrency ? `${digit} ${currency}` : `${digit}`;
  }
  return !disableCurrency ? `0 ${currency}` : "0";
};

export const prettyFloatMoney = (value, disableCurrency, currency = "") => {
  try {
    if (value === null || value === undefined || value === "") {
      return !disableCurrency ? `0.00 ${currency}` : "0.00";
    }

    const number = Number(value);
    if (isNaN(number)) {
      return !disableCurrency ? `0.00 ${currency}` : "0.00";
    }

    const fixed = number.toFixed(2); // 👈 ВСЕГДА 2 знака
    let parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return !disableCurrency
      ? `${parts.join(".")} ${currency}`
      : parts.join(".");
  } catch (e) {
    return !disableCurrency ? `0.00 ${currency}` : "0.00";
  }
};

export const inTimeRange = (start, end, format = "hh:mm:ss") => {
  if (start === end) {
    return true;
  }
  if (start !== end) {
    const currentTime = moment();
    const beforeTime = moment(start, format);
    const afterTime = moment(end, format);
    if (currentTime.isBetween(beforeTime, afterTime)) {
      return true;
    }
  }
  return false;
};

export const getRemainingTime = (datetime) => {
  const now = moment();
  const distance = moment(datetime).diff(now);
  const hours = moment(datetime).diff(now, "hours");
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const outputList = [hours, minutes]; // List of display values
  return outputList
    ?.filter((val) => val > 0)
    ?.map((num) => (num < 10 ? `0${num}` : num))
    .join(":");
};

export const throttle = (func, wait, immediate) => {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export const debounce = (func, wait, immediate) => {
  let timeout;

  return function executedFunction() {
    const context = this;
    const args = arguments;

    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
};

export const stickyActiveShadow = () => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window))
    return null;

  const sticky = document.querySelector(".sticky");

  if (!sticky) return null; // <- Prevents the error

  const observer = new IntersectionObserver(
    ([entry]) => {
      entry.target.classList.toggle(
        "is-sticky",
        entry.boundingClientRect.top < 0,
      );
    },
    { threshold: 1.0 },
  );

  observer.observe(sticky);

  return observer;
};

export const abbreviateNumber = (num, digits) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
  ];

  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find((item) => {
      return num >= item.value;
    });

  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
};

export const parseDateTime = (created_at) => {
  const datetime = prettyDate(created_at, true);

  const array = datetime.split(" ");

  if (datetime === translate("только что", "time.justNow")) {
    return datetime;
  }

  if (array.length === 2) {
    array[1] = <span key={datetime}> {array[1]} </span>;
  }

  return array;
};

export const saveHistorySearchPost = (item) => {
  const historySearch = getDataFromLocalStorage("historySearch");

  if (!historySearch) {
    saveDataToLocalStorage("historySearch", [{ ...item, history: true }]);
  } else if (historySearch.length < 99) {
    const index = historySearch.findIndex((i) => i.id === item.id);
    if (index === -1) {
      historySearch.push({ ...item, history: true });
      saveDataToLocalStorage("historySearch", historySearch);
    }
  } else if (historySearch.length === 100) {
    historySearch[0] = { ...item, history: true };
    saveDataToLocalStorage("historySearch", historySearch);
  }
};

export const getAgentDetails = () => {
  // browser
  let nVer = navigator.appVersion;
  let nAgt = navigator.userAgent;
  let browser = navigator.appName;
  let version = "" + parseFloat(navigator.appVersion);
  let majorVersion;
  let nameOffset, verOffset, ix;

  // Opera
  if ((verOffset = nAgt.indexOf("Opera")) !== -1) {
    browser = "Opera";
    version = nAgt.substring(verOffset + 6);
    if ((verOffset = nAgt.indexOf("Version")) !== -1) {
      version = nAgt.substring(verOffset + 8);
    }
  }
  // Opera Next
  if ((verOffset = nAgt.indexOf("OPR")) !== -1) {
    browser = "Opera";
    version = nAgt.substring(verOffset + 4);
  }
  // Yandex
  if (nAgt.indexOf("YaBrowser") !== -1) {
    browser = "Yandex";
    version = nAgt.match(/(YaBrowser)\/?\s*?(\d+\.?\d*\.?\d*\.?\d*)?/i)[2];
  }
  // Legacy Edge
  else if ((verOffset = nAgt.indexOf("Edge")) !== -1) {
    browser = "Microsoft Legacy Edge";
    version = nAgt.substring(verOffset + 5);
  }
  // Edge (Chromium)
  else if ((verOffset = nAgt.indexOf("Edg")) !== -1) {
    browser = "Microsoft Edge";
    version = nAgt.substring(verOffset + 4);
  }
  // MSIE
  else if ((verOffset = nAgt.indexOf("MSIE")) !== -1) {
    browser = "Microsoft Internet Explorer";
    version = nAgt.substring(verOffset + 5);
  }
  // Chrome
  else if ((verOffset = nAgt.indexOf("Chrome")) !== -1) {
    browser = "Chrome";
    version = nAgt.substring(verOffset + 7);
  }
  // Safari
  else if ((verOffset = nAgt.indexOf("Safari")) !== -1) {
    browser = "Safari";
    version = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf("Version")) !== -1) {
      version = nAgt.substring(verOffset + 8);
    }
  }
  // Firefox
  else if ((verOffset = nAgt.indexOf("Firefox")) !== -1) {
    browser = "Firefox";
    version = nAgt.substring(verOffset + 8);
  }
  // MSIE 11+
  else if (nAgt.indexOf("Trident/") !== -1) {
    browser = "Microsoft Internet Explorer";
    version = nAgt.substring(nAgt.indexOf("rv:") + 3);
  }
  // Other browsers
  else if (
    (nameOffset = nAgt.lastIndexOf(" ") + 1) <
    (verOffset = nAgt.lastIndexOf("/"))
  ) {
    browser = nAgt.substring(nameOffset, verOffset);
    version = nAgt.substring(verOffset + 1);
    if (browser.toLowerCase() === browser.toUpperCase()) {
      browser = navigator.appName;
    }
  }
  // trim the version string
  if ((ix = version.indexOf(";")) !== -1) version = version.substring(0, ix);
  if ((ix = version.indexOf(" ")) !== -1) version = version.substring(0, ix);
  if ((ix = version.indexOf(")")) !== -1) version = version.substring(0, ix);

  majorVersion = parseInt("" + version, 10);
  if (isNaN(majorVersion)) {
    version = "" + parseFloat(navigator.appVersion);
  }

  // system
  let os = null;
  const clientStrings = [
    { s: "Windows 10", r: /(Windows 10.0|Windows NT 10.0)/ },
    { s: "Windows 8.1", r: /(Windows 8.1|Windows NT 6.3)/ },
    { s: "Windows 8", r: /(Windows 8|Windows NT 6.2)/ },
    { s: "Windows 7", r: /(Windows 7|Windows NT 6.1)/ },
    { s: "Windows Vista", r: /Windows NT 6.0/ },
    { s: "Windows Server 2003", r: /Windows NT 5.2/ },
    { s: "Windows XP", r: /(Windows NT 5.1|Windows XP)/ },
    { s: "Windows 2000", r: /(Windows NT 5.0|Windows 2000)/ },
    { s: "Windows ME", r: /(Win 9x 4.90|Windows ME)/ },
    { s: "Windows 98", r: /(Windows 98|Win98)/ },
    { s: "Windows 95", r: /(Windows 95|Win95|Windows_95)/ },
    { s: "Windows NT 4.0", r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
    { s: "Windows CE", r: /Windows CE/ },
    { s: "Windows 3.11", r: /Win16/ },
    { s: "Android", r: /Android/ },
    { s: "Open BSD", r: /OpenBSD/ },
    { s: "Sun OS", r: /SunOS/ },
    { s: "Chrome OS", r: /CrOS/ },
    { s: "Linux", r: /(Linux|X11(?!.*CrOS))/ },
    { s: "iOS", r: /(iPhone|iPad|iPod)/ },
    { s: "Mac OS X", r: /Mac OS X/ },
    { s: "Mac OS", r: /(Mac OS|MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
    { s: "QNX", r: /QNX/ },
    { s: "UNIX", r: /UNIX/ },
    { s: "BeOS", r: /BeOS/ },
    { s: "OS/2", r: /OS\/2/ },
    {
      s: "Search Bot",
      r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/,
    },
  ];
  for (let id in clientStrings) {
    let cs = clientStrings[id];
    if (cs.r.test(nAgt)) {
      os = cs.s;
      break;
    }
  }

  let osVersion = null;

  if (/Windows/.test(os)) {
    osVersion = /Windows (.*)/.exec(os)[1];
    os = "Windows";
  }

  switch (os) {
    case "Mac OS":
    case "Mac OS X":
    case "Android":
      osVersion =
        /(?:Android|Mac OS|Mac OS X|MacPPC|MacIntel|Mac_PowerPC|Macintosh) ([._\d]+)/.exec(
          nAgt,
        )[1];
      break;

    case "iOS":
      osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
      osVersion = osVersion[1] + "." + osVersion[2] + "." + (osVersion[3] | 0);
      break;
    default:
  }

  return {
    browser,
    browserVersion: version,
    os,
    osVersion,
  };
};

export const downloadFile = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
};

export function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return produce(state, (draftState) => {
        handlers[action.type](draftState, action);
      });
    } else {
      throw Error(`Action ${action.type} does not have handler`);
    }
  };
}

const TARGET_WIDTH = 1080;
const TARGET_HEIGHT = 1920;

const getCroppedImg = (image, crop) => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    TARGET_WIDTH,
    TARGET_HEIGHT,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
  });
};

export default getCroppedImg;

const STORAGE_KEY = "saved_accounts";

export const getSavedAccounts = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
};

export const saveCurrentAccount = (user, token) => {
  console.log("SAVE ACCOUNT", user, token);

  let accounts = getSavedAccounts();

  accounts = accounts.filter((a) => a.user.id !== user.id);

  accounts.push({ user, token });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

export const switchToAccount = (account) => {
  localStorage.setItem("auth_token", account.token);
  localStorage.setItem("auth_user", JSON.stringify(account.user));
};

export const removeAccount = (userId) => {
  const accounts = getSavedAccounts().filter((a) => a.user.id !== userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};
