import {useCallback, useEffect, useState} from 'react';
import qs from "qs";
import FaqPage from "./index";
import FaqPartners from "./partners";
import FaqRoles from "./roles";
import FaqPartnerRights from "./partner-rights";
import FaqRegistration from "./registration";
import FaqSavings from "./savings";
import FaqOrganization from "./organization";
import FaqEmployees from "./employees";
import FaqSubscriptions from "./subscriptions";
import FaqDiscounts from "./discounts";
import FaqRoleRights from "./role-rights";
import FaqOwner from "./owner";
import FaqUserAgreement from "./user-agreement";
import FaqPartnersAndConditions from "./partners-and-conditions";
import FaqOfflinePurchases from "./offline-purchases"
import FaqOnlinePayment from "./online-payment";
import FaqRefund from "./refund";
import FaqFreedomPay from "./freedom-pay";
import FaqKoverSamolet from "./kover-samolet";
import {renderRoutes} from "react-router-config";
import {useSelector} from "react-redux";
import {LOCALES} from "../../locales/locales";
import {DEFAULT_LANGUAGE} from "../../common/constants";
import {canGoBack} from "../../common/helpers";

import 'swiper/swiper.scss';

const routes = [
  {
    path: '/faq',
    component: FaqPage,
    exact: true
  },
  {
    path: '/faq/partners',
    component: FaqPartners,
    pageTitle: 'FAQ - Partners',
    exact: true
  },
  {
    path: '/faq/roles',
    component: FaqRoles,
    pageTitle: 'FAQ - Roles',
    exact: true
  },
  {
    path: '/faq/partner-rights',
    component: FaqPartnerRights,
    pageTitle: 'FAQ - Partner Rights',
    exact: true
  },
  {
    path: '/faq/registration',
    component: FaqRegistration,
    pageTitle: 'FAQ - Registration',
    exact: true
  },
  {
    path: '/faq/savings',
    component: FaqSavings,
    pageTitle: 'FAQ - Savings',
    exact: true
  },
  {
    path: '/faq/organization',
    component: FaqOrganization,
    pageTitle: 'FAQ - Organization',
    exact: true
  },
  {
    path: '/faq/employees',
    component: FaqEmployees,
    pageTitle: 'FAQ - Employees',
    exact: true
  },
  {
    path: '/faq/subscriptions',
    component: FaqSubscriptions,
    pageTitle: 'FAQ - Subscriptions',
    exact: true
  },
  {
    path: '/faq/discounts',
    component: FaqDiscounts,
    pageTitle: 'FAQ - Discounts',
    exact: true
  },
  {
    path: '/faq/role-rights',
    component: FaqRoleRights,
    pageTitle: 'FAQ - Role rights',
    exact: true
  },
  {
    path: '/faq/owner',
    component: FaqOwner,
    pageTitle: 'FAQ - Owner',
    exact: true
  },
  {
    path: '/faq/user-agreement',
    component: FaqUserAgreement,
    pageTitle: 'FAQ - User Agreement',
    exact: true
  },
  {
    path: '/faq/refund',
    component: FaqRefund,
    pageTitle: 'FAQ - Return of goods or services',
    exact: true
  },
  {
    path: '/faq/freedom-pay',
    component: FaqFreedomPay,
    pageTitle: 'FAQ - FREEDOM Pay KG Documentation',
    exact: true
  },
  {
    path: '/faq/kover-samolet',
    component: FaqKoverSamolet,
    pageTitle: 'FAQ - Kover Samolet',
    exact: true
  },
  {
    path: '/faq/partners-and-conditions',
    component: FaqPartnersAndConditions,
    pageTitle: 'FAQ - Offline Purchases',
    exact: true
  },
  {
    path: '/faq/offline-purchases',
    component: FaqOfflinePurchases,
    pageTitle: 'FAQ - Offline Purchases',
    exact: true
  },
  {
    path: '/faq/online-payment',
    component: FaqOnlinePayment,
    pageTitle: 'FAQ - Online Payment',
    exact: true
  },
]

const FaqRouter = ({location, history, ...other}) => {
  const [language, setLanguage] = useState(null);
  const locale = useSelector(state => state.userStore.locale);

  useEffect(() => {
    const { lang } = qs.parse(location.search.replace('?', ''));
    Object.keys(LOCALES).includes(lang) ? setLanguage(lang) : setLanguage(locale || DEFAULT_LANGUAGE);
  }, [location.search, locale]);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const goBack = useCallback(fallbackPath => {
    const isGoBackValid = [true, undefined].includes(location.state?.isGoBackValid)

    if (canGoBack(history) && isGoBackValid) {
      history.goBack()
    } else {
      history.push({
        pathname: fallbackPath,
        state: {isGoBackValid: false}
      })
    }
  }, [history, location.state])

  if (!language) {
    return null;
  }

  const query = qs.parse(location.search.replace('?', ''));
  const isWebviewMode = !!(query && query.mode === 'webview');
  const isIosWebviewMode = !!(query && query.mode === 'webview_ios')
  const isFirstTimeVisit = !!(query && query.is_first_time_visit)

  const isEn = language === LOCALES.en;

  return renderRoutes(routes, { history, goBack, isWebviewMode, isIosWebviewMode, isFirstTimeVisit, language, isEn, ...other });
};

export default FaqRouter;