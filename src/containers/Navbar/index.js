import React, { useEffect, useRef, useState, useCallback } from "react";
import * as classnames from "classnames";
import Portal from "../../components/Portal";
import {
  HomeIcon,
  MarketIcon,
  NotificationIcon,
  RoundCheckIcon,
} from "@ui/Icons";
import { Link, NavLink, withRouter } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
import { setNotificationsAsRead } from "@store/actions/notificationActions";
import AndroidStore from "../../assets/images/android_store.svg";
import AppleStore from "../../assets/images/apple_store.svg";
import {
  isMobile,
  removeAccount,
  getSavedAccounts,
  switchToAccount,
} from "@common/utils";
import config from "../../config";
import { translate } from "@locales/locales";
import "./index.scss";
import { DEFAULT_LIMIT } from "@common/constants";
import MobileMenu from "@components/MobileMenu";
import { AddUserIcon, SettingsIcon } from "./icons";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { LOGIN_USER } from "@store/actions/actionTypes";
import AccountSwitcher from "@components/AccountSwitcher/AccountSwitcher";

const EXCLUDED_PATHES = [
  "^\\/(auth|forgot|proceed-discount|scan|faq|payment-success|payment-failure)",
  "^\\/profile\\/edit",
  "^\\/organizations\\/\\d+\\/(posts|events|rent|resumes)\\/\\d+\\/edit",
  "\\/create(\\/|)$",
  "^\\/organizations\\/\\d+\\/(edit|roles|employees|attendance-scan|partners|banners|hotlinks|promotion)",
  "^/clients/\\d+/rent-activation/\\d+",
  "^\\/print",
  "^\\/organizations\\/\\d+\\/subscription-plans",
  "^\\/organizations\\/\\d+\\/payment",
  "^\\/referral",
  "^\\/apps/edit",
  "^\\/apps/create",
  "^\\/apps/refferal",
  "^\\/apps/refferal/sold",
  "^\\/messenger/chat/\\d+",
  "^\\/comments/post/\\d+",
  "^/organizations/\\d+/chat(\\?.*)?$",
];

const Navbar = ({
  user,
  location,
  count,
  setNotificationsAsRead,
  allCartsTotalCount,
  showQR,
  isSearchOpen,
  region,
}) => {
  const navRef = useRef(null);

  const [activeAvatar, setActiveAvatar] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const [openApp, setOpenApp] = useState(false);
  const darkTheme = useSelector((state) => state.theme.darkTheme);

  const pressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const startPress = () => {
    longPressTriggered.current = false;

    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setOpenApp(true); // 🔥 открываем меню
    }, 500);
  };

  const stopPress = () => {
    clearTimeout(pressTimer.current);
  };

  const handleClick = (e) => {
    if (longPressTriggered.current) {
      e.preventDefault(); // 🚫 отменяем переход
    }
  };

  const updateIndicatorPosition = useCallback(() => {
    if (!navRef.current) return;

    const activeLink = navRef.current.querySelector(".navbar__link-active");

    if (activeLink && !showQR) {
      const EXTRA_WIDTH = 20;

      setIndicatorStyle({
        left: activeLink.offsetLeft - EXTRA_WIDTH / 2,
        width: activeLink.offsetWidth + EXTRA_WIDTH,
        opacity: 1,
      });
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [showQR]);

  useEffect(() => {
    updateIndicatorPosition();
    window.addEventListener("resize", updateIndicatorPosition);
    return () => window.removeEventListener("resize", updateIndicatorPosition);
  }, [updateIndicatorPosition]);

  useEffect(() => {
    setActiveAvatar(location.pathname === "/profile");
    const t = setTimeout(updateIndicatorPosition, 50);
    return () => clearTimeout(t);
  }, [location.pathname, showQR, updateIndicatorPosition]);

  useEffect(() => {
    const cartEl = document.getElementById("navbar-cart");
    if (!cartEl) return;

    const keyframes = [
      { opacity: 1 },
      { opacity: 1, offset: 0.7 },
      { opacity: 0 },
    ];

    cartEl.animate(keyframes, {
      duration: 1000,
      easing: "ease-out",
    });
  }, [allCartsTotalCount]);

  const allowedRoutes = new RegExp(EXCLUDED_PATHES.join("|"), "i");
  if (allowedRoutes.test(location.pathname)) return null;
  if (isSearchOpen) return null;

  const getAppLinks = () => {
    if (isMobile.iOS()) {
      return (
        <a
          href={config.appAppStoreURL}
          target="_blank"
          rel="noopener noreferrer"
          className="navbar__guest-image-link"
        >
          <img src={AppleStore} alt="Apple Store" />
        </a>
      );
    }

    if (isMobile.Android()) {
      return (
        <a
          href={config.appGooglePlayURL}
          target="_blank"
          rel="noopener noreferrer"
          className="navbar__guest-image-link"
        >
          <img src={AndroidStore} alt="Google Play Store" />
        </a>
      );
    }

    return (
      <>
        <a
          href={config.appAppStoreURL}
          target="_blank"
          rel="noopener noreferrer"
          className="navbar__guest-image-link"
        >
          <img src={AppleStore} width={100} />
        </a>
        <a
          href={config.appGooglePlayURL}
          target="_blank"
          rel="noopener noreferrer"
          className="navbar__guest-image-link"
        >
          <img src={AndroidStore} width={100} />
        </a>
      </>
    );
  };

  return (
    <Portal elementID="menu">
      <div
        className={classnames("navbar__wrap", !user && "navbar__wrap-guest")}
      >
        <div className="container">
          {user ? (
            <nav className="navbar" ref={navRef}>
              {/* индикатор */}
              <div
                className="navbar__indicator"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                  opacity: indicatorStyle.opacity,
                }}
              />

              <NavLink
                to="/home"
                className="navbar__link"
                activeClassName={!showQR && "navbar__link-active"}
              >
                <HomeIcon />
                <p className="f-500">{translate("Главная", "app.main")}</p>
              </NavLink>

              <NavLink
                to="/subscriptions/posts"
                className="navbar__link"
                isActive={() =>
                  [
                    "/subscriptions/posts",
                    "/subscriptions/organizations",
                  ].includes(location.pathname)
                }
                activeClassName={!showQR && "navbar__link-active"}
              >
                <RoundCheckIcon />
                <p className="f-500">
                  {translate("Подписки", "app.subscriptions")}
                </p>
              </NavLink>

              <NavLink
                to="/carts"
                className="navbar__link"
                activeClassName={!showQR && "navbar__link-active"}
              >
                <div className="navbar__link-cart-wrap" id="navbar-link-cart">
                  <MarketIcon />
                  {!!allCartsTotalCount && (
                    <div className="navbar__link-cart-count f-11">
                      {allCartsTotalCount < 1000 ? allCartsTotalCount : "999+"}
                    </div>
                  )}
                </div>
                <p>{translate("Корзины", "shop.carts")}</p>
                <div
                  className={classnames(
                    "navbar__cart",
                    allCartsTotalCount > 99 && "navbar__cart--count-more",
                  )}
                  id="navbar-cart"
                >
                  <span>
                    {allCartsTotalCount < 99 ? allCartsTotalCount : "99+"}
                  </span>
                </div>
              </NavLink>

              <NavLink
                to="/notifications/"
                className="navbar__link navbar__link-notification-link"
                onClick={setNotificationsAsRead}
                activeClassName={!showQR && "navbar__link-active"}
              >
                <div
                  className={classnames(
                    "navbar__notification-icon",
                    !!count && "navbar__notification-icon-counter",
                  )}
                  data-count={count < 100 ? count : "99+"}
                >
                  <NotificationIcon />
                </div>
                <p className="f-500">
                  {translate("Уведомления", "app.notifications")}
                </p>
              </NavLink>

              <NavLink
                to="/profile"
                className="navbar__link"
                activeClassName={!showQR && "navbar__link-active"}
                onMouseDown={startPress}
                onMouseUp={stopPress}
                onMouseLeave={stopPress}
                onTouchStart={startPress}
                onTouchEnd={stopPress}
                onClick={handleClick}
              >
                <div className="navbar__avatar" id="user-avatar">
                  <div
                    className={classnames(
                      "navbar__avatar-inner",
                      activeAvatar && "active",
                    )}
                  >
                    <img
                      src={user?.avatar && user?.avatar.small}
                      alt={user.full_name}
                    />
                  </div>
                </div>
                <p className="f-500">{translate("Профиль", "app.profile")}</p>
              </NavLink>
            </nav>
          ) : (
            <div className="navbar__guest">
              <div className="navbar__guest-top">
                <div className="navbar__guest-links dfc">
                  <div className="navbar__guest-app-links">{getAppLinks()}</div>
                  <Link
                    to="/faq"
                    className="navbar__guest-faq navbar__guest-faq--desktop f-16 f-500"
                  >
                    {translate(
                      "Служба поддержки и заботы ?",
                      "faq.supportAndCare",
                    )}
                  </Link>
                </div>
                <Link to="/auth" className="navbar__guest-link f-15 f-600">
                  {translate("Войти", "app.login")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <MobileMenu
        isOpen={openApp}
        closeTimeoutMS={250}
        onRequestClose={() => setOpenApp(false, null)}
        contentLabel={translate("Аккаунт", "app.account")}
      >
        <div className="change-profile">
          <AccountSwitcher user={user} onClose={() => setOpenApp(false)} />
        </div>
      </MobileMenu>
    </Portal>
  );
};

const mapStateToProps = (state) => ({
  user: state.userStore.user,
  count: state.notificationStore.count,
  allCartsTotalCount: state.shopStore.allCartsTotalCount,
  showQR: state.commonStore.showQR,
  isSearchOpen: state.userStore.searchState,
  region: state.userStore.region,
});

const mapDispatchToProps = (dispatch) => ({
  setNotificationsAsRead: () => dispatch(setNotificationsAsRead()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Navbar));
