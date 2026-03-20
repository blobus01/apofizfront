import React, { useEffect, useRef } from "react";
import * as classnames from "classnames";
import { BackArrow, MenuDots } from "../UI/Icons";
import PropTypes from "prop-types";
import { translate } from "../../locales/locales";
import OrgVerification from "../UI/OrgVerification";
// import BackArrowOrg from "../../assets/icons/backArrowOrg.svg";
import "./index.scss";

import { ReactComponent as BackIcon } from "@assets/icons/back.svg";
import { ReactComponent as MenuDotsOrg } from "@assets/icons/burgerMenu.svg";
import { DarkTheme, LightTheme } from "./icons";
import { useDispatch } from "react-redux";
import { setDarkThemeRT } from "@store/actions/themeDark";

const MobileTopHeader = (props) => {
  const {
    title = "",
    onBack,
    onNext,
    onSubmit,
    onClick,
    isSubmitting,
    submitLabel = translate("Сохранить", "app.save"),
    nextLabel = translate("Далее", "app.next"),
    onMenu,
    disabled,
    disabledGroup,
    renderLeft,
    renderRight,
    renderCenter,
    verification_status,
    icon = null,
    className,
    aiTitle,
    style,
    filterCount,
    whatsTitle,
    changeTheme,
    darkTheme,
    setDarkTheme,
    titleLeft,
    visible
  } = props;
  const headerRef = useRef(null);
  const prevScrollY = useRef(window.scrollY);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      // Проверяем, открыто ли модальное окно
      if (window.isModalOpen) return;

      const currentScrollY = window.scrollY;
      if (currentScrollY < prevScrollY.current) {
        // скролл вверх
        headerRef.current.style.zIndex = "10";
      } else {
        // скролл вниз
        headerRef.current.style.zIndex = "";
      }
      prevScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={classnames("mobile-top-header__wrap", className)}
      style={style}
      ref={headerRef}
    >
      <div className="container">
        <div className="mobile-top-header" style={{ overflow: visible ? "visible" : "hidden" }}>
          <div className="mobile-top-header__left">
            {renderLeft && renderLeft()}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mobile-top-header__back"
              >
                {className &&
                (className === "organization-module__top" ||
                  className.includes("referral-dashboard__header") ||
                  className.includes("referral-subscriptions__header")) ? (
                  <BackIcon />
                ) : (
                  <BackArrow />
                )}
              </button>
            )}
            {changeTheme && (
              <span
                onClick={() => {
                  const newValue = !darkTheme;
                  setDarkTheme(newValue);
                  dispatch(setDarkThemeRT(newValue));
                }}
                className={`theme-switch ${darkTheme ? "dark" : "light"}`}
              >
                <span className="theme-switch__icon">
                  {darkTheme ? <DarkTheme /> : <LightTheme />}
                </span>
              </span>
            )}
          </div>

          {aiTitle && (
            <a
              className="mobile-top-header__title dfc justify-center f-16 f-700"
              href={`https://t.me/${aiTitle.replace("@", "")}`}
              target="_blank"
              style={{ color: "#007aff", fontWeight: "500" }}
              rel="noopener noreferrer"
            >
              {aiTitle}
            </a>
          )}

          {whatsTitle && (
            <a
              className="mobile-top-header__title dfc justify-center f-16 f-700"
              href={`https://wa.me/${whatsTitle.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#25D366", fontWeight: "500" }}
            >
              {whatsTitle}
            </a>
          )}

          {icon ? (
            <h1 className="mobile-top-header__title dfc justify-center f-16 f-700">
              <span className="mobile-top-header__icon">{icon}</span>
              {title}
            </h1>
          ) : (
            <div className="mobile-top-header__center">
              {renderCenter && renderCenter() ? (
                renderCenter()
              ) : (
                <h1 className="mobile-top-header__title tl f-16 f-600" style={{ color: darkTheme ? "#FFF" : '' }}>
                  <OrgVerification status={verification_status} />
                  {title}
                  {filterCount > 0 && (
                    <span className="filter-count">{filterCount}</span>
                  )}
                </h1>
              )}
            </div>
          )}

          <div className="mobile-top-header__right">
            {renderRight && renderRight()}
            {onSubmit && (
              <button
                type="submit"
                onSubmit={onSubmit}
                onClick={onClick}
                disabled={disabled || isSubmitting}
                className={classnames(
                  "mobile-top-header__submit f-14 f-600",
                  (submitLabel === "Сохранение" || submitLabel === "Saving") &&
                    "mobile-top-header__submit-loading",
                )}
              >
                {submitLabel}
              </button>
            )}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                disabled={disabled || isSubmitting || disabledGroup}
                className={classnames(
                  "mobile-top-header__next f-14 f-600",
                  // (disabled || isSubmitting) &&
                  //   "mobile-top-header__next-loading"
                )}
                style={
                  disabledGroup ? { opacity: "0.5", cursor: "unset" } : null
                }
              >
                {nextLabel}
              </button>
            )}
            {onMenu && (
              <button
                type="button"
                onClick={onMenu}
                className={`mobile-top-header__menu f-14 ${
                  className ? "org" : ""
                }`}
              >
                {className === "organization-module__top" ? (
                  <MenuDotsOrg />
                ) : (
                  <MenuDots />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

MobileTopHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onBack: PropTypes.func,
  onNext: PropTypes.func,
  onSubmit: PropTypes.func,
  submitLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  nextLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onMenu: PropTypes.func,
  renderLeft: PropTypes.func,
  renderRight: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default MobileTopHeader;
