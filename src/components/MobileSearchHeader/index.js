import React, { useEffect } from "react";
import * as classnames from "classnames";
import {
  BackArrow,
  FilterIcon,
  LocationIcon,
  LocationIconShare,
  MenuDots,
  SearchIcon,
} from "../UI/Icons";
import SearchField from "../UI/SearchField";
import { useIntl } from "react-intl";
import SearchAutocompleteField from "../UI/SearchAutocompleteField";
import "./index.scss";
import { translate } from "@locales/locales";
import OrgVerification from "@components/UI/OrgVerification";
import { useDispatch, useSelector } from "react-redux";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import { setDarkThemeRT } from "@store/actions/themeDark";

const MobileSearchHeader = ({
  title = "",
  renderLeft,
  renderHeader,
  searchName,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onFilterClick,
  filterCount,
  searchPlaceholder,
  onSearchCancel,
  onBack,
  onMenu,
  defaultState,
  disableForm,
  className,
  onShowChange,
  items,
  onSearchSuggestSelect,
  autoFocus,
  verification_status,
  hideOverflowOnSearchWithSuggestions = true,
  onMap,
  orgMobHeader,
  textCenter,
  radius,
  onShowAllResults,
  changeTheme,
  renderRight,
}) => {
  const [showSearch, setShow] = React.useState(!!defaultState);
  const intl = useIntl();

  useEffect(() => {
    onShowChange && onShowChange(showSearch);
  }, [onShowChange, showSearch]);

  const dispatch = useDispatch();

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classnames("mobile-search-header__wrap", className, {
        dark: darkTheme,
      })}
      style={{
        ...(orgMobHeader && { zIndex: 12 }),
        ...(radius && {
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          borderRadius: "0 0 16px 16px",
        }),
      }}
    >
      <div className="container">
        <div className="mobile-search-header row">
          <div
            className={classnames(
              "mobile-search-header__main",
              "row",
              !showSearch && "mobile-search-header__main-active",
            )}
          >
            {onBack && (
              <BackArrow
                className="mobile-search-header__main-back"
                onClick={onBack}
              />
            )}
            {renderLeft && renderLeft()}
            {renderHeader ? (
              renderHeader()
            ) : (
              <h5
                className="f-16 f-600 tl"
                style={{ textAlign: textCenter ? "center" : "left" }}
              >
                <OrgVerification status={verification_status} />
                {title}
              </h5>
            )}

            {(onFilterClick || onSearchChange) && (
              <div className="mobile-search-header__main-btns-group">
                {changeTheme && (
                  <span
                    onClick={() => {
                      const newValue = !darkTheme;
                      dispatch(setDarkThemeRT(newValue));
                    }}
                    className={`theme-switch ${darkTheme ? "dark" : "light"}`}
                  >
                    <span className="theme-switch__icon">
                      {darkTheme ? <DarkTheme /> : <LightTheme />}
                    </span>
                  </span>
                )}
                {onMap && (
                  <button
                    type="button"
                    onClick={onMap}
                    className="mobile-search-header__main-location"
                  >
                    <LocationIcon color="#4285F4" />
                  </button>
                )}
                {renderRight && (
                  <span
                    style={{ marginLeft: "20px" }}
                    className="theme-toggle"
                    onClick={() => dispatch(setDarkThemeRT(!darkTheme))}
                  >
                    <div
                      key={darkTheme ? "dark" : "light"}
                      className="theme-toggle__icon"
                    >
                      {darkTheme ? <DarkTheme /> : <LightTheme />}
                    </div>
                  </span>
                )}
                {onSearchChange && (
                  <button
                    type="button"
                    onClick={() => setShow(!showSearch)}
                    className="mobile-search-header__main-search"
                  >
                    <SearchIcon />
                    <p className="searchText">
                      {translate("Поиск", "app.search")}
                    </p>
                  </button>
                )}

                {onFilterClick && (
                  <button
                    type="button"
                    onClick={onFilterClick}
                    style={{ position: "relative" }}
                    className="mobile-search-header__main-filter"
                  >
                    {!!filterCount && (
                      <span
                        className="f-14"
                        style={{
                          position: "absolute",
                          width: "19px",
                          height: "16px",
                          borderRadius: "50%",
                          fontSize: "14px",
                          display: "flex",
                          fontWeight: "500",
                          alignItems: "center",
                          justifyContent: "center",
                          right: "-9px",
                          top: "-6px",
                          background: "#007AFF",
                          color: "#fff",
                          boxShadow: "0 0 2px 0 rgba(0, 0, 0, 0.25)",
                        }}
                      >
                        {filterCount}
                      </span>
                    )}
                    <FilterIcon />
                  </button>
                )}
                {onMenu && (
                  <button
                    type="button"
                    onClick={onMenu}
                    className="mobile-search-header__main-menu"
                  >
                    <MenuDots />
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            className={classnames(
              "mobile-search-header__search",
              "row",
              showSearch && "mobile-search-header__search-active",
            )}
          >
            {items ? (
              <SearchAutocompleteField
                name={searchName}
                onShowAllResults={onShowAllResults}
                value={searchValue}
                onChange={onSearchChange}
                onSubmit={onSearchSubmit}
                disableForm={disableForm}
                placeholder={searchPlaceholder}
                items={items}
                onSearchSuggestSelect={onSearchSuggestSelect}
                autoFocus={autoFocus}
                hideOverflowOnSearchWithSuggestions={
                  hideOverflowOnSearchWithSuggestions
                }
              />
            ) : (
              <SearchField
                name={searchName}
                value={searchValue}
                onChange={onSearchChange}
                onSubmit={onSearchSubmit}
                disableForm={disableForm}
                placeholder={searchPlaceholder}
              />
            )}

            <button
              type="button"
              onClick={() => {
                onSearchCancel && onSearchCancel();
                setShow(!showSearch);
              }}
              className="mobile-search-header__search-button"
            >
              {intl.formatMessage({
                id: "app.cancel",
                defaultMessage: "Отменить",
              })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSearchHeader;
