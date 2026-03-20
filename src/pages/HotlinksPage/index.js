import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams, useLocation } from "react-router-dom";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import { getOrgHotlinks } from "@store/actions/organizationActions";
import "./index.scss";
import classNames from "classnames";
import Preloader from "@components/Preloader";
import EmptyBox from "@components/EmptyBox";
import HotlinkCard from "@components/Cards/HotlinkCard";
import { NavLink } from "react-router-dom/cjs/react-router-dom.min";
import { SearchIcon } from "@components/UI/Icons";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import { setDarkThemeRT } from "@store/actions/themeDark";

function HotlinksPage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();
  const orgHotlinks = useSelector(
    (state) => state.organizationStore.orgHotlinks,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleBack = () => {
    history.push(`/organizations/${id}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modeParam = params.get("mode");

    setMode(modeParam || "all");
  }, [location.search]);

  const getMode = useCallback((modeParam) => {}, []);

  // State initialization
  const [mode, setMode] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const hotlinks = orgHotlinks?.data?.list || [];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500); // 500ms задержка

    return () => clearTimeout(handler);
  }, [searchValue]);

  useEffect(() => {
    const fetchHotlinks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await dispatch(
          getOrgHotlinks({
            organization: id,
            search: debouncedSearch || undefined,
          }),
        );
      } catch (e) {
        setError(
          e.message ||
            translate(
              "Произошла ошибка при загрузке быстрых ссылок",
              "hotlink.loadError",
            ),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotlinks();
  }, [dispatch, id, debouncedSearch]);

  const filteredHotlinks = hotlinks.filter((hotlink) => {
    if (mode === "links") return hotlink.link_type === "link";
    if (mode === "collections") return hotlink.link_type === "collection";
    return true; // all
  });

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classNames("services-page", {
        dark: darkTheme,
      })}
    >
      <div style={{ position: "sticky", zIndex: "999999", top: "0" }}>
        {isSearchOpen && (
          <div className="services-page__search-overlay">
            <div className="services-page__search-wrapper">
              <div className="services-page__search-wrapper-input">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  autoFocus
                />
              </div>
              <button
                type="button"
                style={{ color: "#007aff", fontSize: "14px" }}
                onClick={() => {
                  setSearchValue("");
                  setIsSearchOpen(false);
                }}
              >
                {translate("Отменить", "app.cancel")}
              </button>
            </div>
          </div>
        )}
        <MobileTopHeader
          onBack={handleBack}
          darkTheme={darkTheme}
          style={{
            background: darkTheme ? "#090027" : "",
            borderRadius: "0 0 12px 12px",
          }}
          title={translate("Ссылки и подборки", "hotlink.titleNew2")}
          renderRight={() => (
            <div style={{ display: "flex", gap: "15px" }}>
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
              <div
                style={{ marginRight: "10px", cursor: "pointer" }}
                onClick={() => setIsSearchOpen(true)}
              >
                <SearchIcon />
              </div>
            </div>
          )}
        />
      </div>

      <div className="container">
        {isLoading ? (
          <Preloader />
        ) : error ? (
          <EmptyBox title="Ошибка" description={error} />
        ) : hotlinks.length === 0 ? (
          <EmptyBox title="Нет быстрых ссылок" />
        ) : (
          <div>
            <div className="services-page__controls">
              <NavLink
                to="?mode=all"
                className="services-page__nav-link"
                activeClassName="services-page__nav-link-active"
                isActive={() => !mode || mode === "all"}
              >
                {translate("Все", "notifications.all")}
              </NavLink>

              <NavLink
                to="?mode=links"
                className="services-page__nav-link"
                activeClassName="services-page__nav-link-active"
                isActive={() => mode && mode === "links"}
              >
                {translate("Ссылки", "app.linksNew")}
              </NavLink>

              <NavLink
                to="?mode=collections"
                className="services-page__nav-link"
                activeClassName="services-page__nav-link-active"
                isActive={() => mode && mode === "collections"}
              >
                {translate("Подборки", "app.hotLinkNew")}
              </NavLink>
            </div>
            {mode !== "collections" && (
              <>
                <h2 className="services-page__title">
                  {translate("Ссылки", "app.linksNew")}
                </h2>
                <div className="services-page__grid">
                  {filteredHotlinks
                    .filter((h) => h.link_type === "link")
                    .map((hotlink) => (
                      <HotlinkCard
                        key={hotlink.id}
                        orgID={id}
                        hotlink={hotlink}
                        className="hotlinks-page_card"
                      />
                    ))}
                </div>
              </>
            )}

            {mode !== "links" && (
              <>
                <h2 className="services-page__title">
                  {translate("Подборки", "app.hotLinkNew")}
                </h2>
                <div className="services-page__grid">
                  {filteredHotlinks
                    .filter((h) => h.link_type === "collection")
                    .map((hotlink) => (
                      <HotlinkCard
                        key={hotlink.id}
                        orgID={id}
                        hotlink={hotlink}
                        className="hotlinks-page_card"
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HotlinksPage;
