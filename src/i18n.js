// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ru from "./locales/ru.json";
import en from "./locales/en.json";
import de from "./locales/de.json";
import tr from "./locales/tr.json";
import zh from "./locales/zh.json";

const getSystemLang = () => {
  // navigator.language может быть "ru-RU" или "en-US" — берём только часть до "-"
  const lang = (navigator.language || navigator.userLanguage || "en").split(
    "-"
  )[0];
  const supported = ["ru", "en", "de", "tr", "zh"];
  return supported.includes(lang) ? lang : "en";
};

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
    de: { translation: de },
    tr: { translation: tr },
    zh: { translation: zh },
  },
  lng: getSystemLang(), // <- язык по умолчанию: системный, если поддержан
  fallbackLng: "en",
  supportedLngs: ["ru", "en", "de", "tr", "zh"],
  interpolation: { escapeValue: false },
});

export default i18n;
