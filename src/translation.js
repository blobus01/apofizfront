import React, { useCallback, useEffect, useState } from "react";
import { createIntl, createIntlCache, RawIntlProvider } from "react-intl";
import { useSelector } from "react-redux";
import { LOCALES } from "./locales/locales";
import { getTranslationDictionary } from "./store/services/commonServices";
import { DEFAULT_LANGUAGE } from "./common/constants";

const cache = createIntlCache();
export let intl = null;

const TranslationProvider = ({ children }) => {
  const [isLoaded, setLoading] = useState(false);
  const locale = useSelector((state) => state.userStore.locale);

  const initTranslation = useCallback(async () => {
    try {
      let response = await getTranslationDictionary(
        Object.keys(LOCALES)
          ?.map((key) => key)
          .includes(locale)
          ? locale
          : DEFAULT_LANGUAGE
      );

      if (response && response.status === 200) {
        intl = createIntl(
          {
            locale: locale,
            messages: response.data,
          },
          cache
        );
        return setLoading(true);
      }
    } catch (e) {
      // Translation load error;
    }
  }, [locale]);

  useEffect(() => {
    initTranslation();
  }, [initTranslation]);

  if (!intl || !isLoaded) {
    return null;
  }

  return <RawIntlProvider value={intl}>{children}</RawIntlProvider>;
};

export default TranslationProvider;
