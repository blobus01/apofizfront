const ENVIRONMENT = process.env.REACT_APP_ENV || "production";
const DEV_API_URL =
  process.env.REACT_APP_DEV_API_URL || "http://localhost:5000";
const API_URL = process.env.REACT_APP_API_URL || DEV_API_URL;
const SITE_KEY = process.env.REACT_APP_SITE_KEY;
const PREFIX = "/api/v1";

const baseURL = window.location.origin.toString();
export const getApiURL = () =>
  ENVIRONMENT === "development" ? DEV_API_URL : API_URL;

const config = {
  baseURL,
  domain: getApiURL(),
  apiURL: getApiURL() + PREFIX,
  localizationVersion: process.env.REACT_APP_LOCALIZATION_VERSION,
  appGooglePlayURL: process.env.REACT_APP_GOOGLE_PLAY_URL || "#",
  appAppStoreURL: process.env.REACT_APP_APPLE_STORE_URL || "#",
  appGooglePlayID: process.env.REACT_APP_GOOGLE_PLAY_APP_ID || "",
  appAppStoreID: process.env.REACT_APP_APPLE_STORE_APP_ID || "",
  instaProxy: getApiURL() + PREFIX + "/shlyuzer?url=",
  ENVIRONMENT,
  SITE_KEY,
};

export default config;
