import { intl } from "../translation";

export const LOCALES = {
  ru: "ru",
  en: "en",
  de: "de",
  tr: "tr",
  zh: "zh",
};

export const translate = (defaultMessage, id, values = {}) =>
  intl ? intl.formatMessage({ id, defaultMessage }, values) : defaultMessage;
