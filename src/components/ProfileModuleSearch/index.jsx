import React, { useEffect, useState } from "react";
import RowOrganizationList from "@components/RowOrganizationList";
import { translate } from "@locales/locales";
import { intl } from "translation";
import api from "../../axios-api";
import "./index.scss";
import { SearchIcon } from "./icons";
import { useSelector } from "react-redux";
import classNames from "classnames";

const ProfileModuleSearch = ({
  orgs,
  loading,
  Preloader,
  getNext,
  state,
  InfiniteScroll,
  onPinToggle,
  searchMode,
  isSearchOpen,
}) => {
  const onSearchCancel = () => {
    searchMode(false);
    setSearchQuery("");
    setSearchResults({ list: [], total_pages: 1 });
  };

  // useEffect(() => {
  //   setTimeout(() => {
  //     window.scrollTo(0, 1);
  //     window.scrollTo(0, 0);
  //   }, 100);
  // }, [isSearchOpen]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    list: [],
    total_pages: 1,
  });
  const [searchLoading, setSearchLoading] = useState(false);

  // --- Загрузка поиска ---
  const fetchSearchResults = async (query) => {
    if (!query.trim()) {
      setSearchResults({ list: [], total_pages: 1 });
      return;
    }

    try {
      setSearchLoading(true);
      const res = await api.get(
        `/organizations/?page=1&limit=21&search=${encodeURIComponent(query)}`,
      );

      // Определяем правильное поле с результатами
      const results =
        res.data.list || res.data.results || res.data.organizations || [];

      setSearchResults({
        list: results,
        total_pages: res.data.total_pages || 1,
      });
    } catch (err) {
      console.error("Ошибка при поиске организаций:", err);
      setSearchResults({ list: [], total_pages: 1 });
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePinToggle = async (orgId, pinned) => {
    try {
      await onPinToggle(orgId, pinned, () => {
        if (searchQuery.trim()) {
          fetchSearchResults(searchQuery);
        }
      });
    } catch (err) {
      console.error("Ошибка при обновлении организации:", err);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSearchResults(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchOpen) {
      window.history.pushState({ search: true }, "");
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleBack = () => {
      if (isSearchOpen) {
        searchMode(false);
        setSearchQuery("");
        setSearchResults({ list: [], total_pages: 1 });
      }
    };

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [isSearchOpen]);

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classNames(
        "module-search__wrapper",

        { dark: darkTheme },
      )}
    >
      <div className="container">
        <div className="module-search__search">
          <div className="module-search__search-file">
            <SearchIcon />
            <input
              type="text"
              className="module-search__input"
              placeholder={translate("поиск", "app.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={onSearchCancel}
            className="mobile-search-header__search-button"
          >
            {intl.formatMessage({
              id: "app.cancel",
              defaultMessage: "Отменить",
            })}
          </button>
        </div>

        <div className="module-search__orgs">
          {/* --- Если идёт поиск --- */}
          {searchQuery ? (
            <div className="module-search__results">
              {searchLoading && <Preloader />}

              {!searchLoading &&
                Array.isArray(searchResults.list) &&
                searchResults.list.length > 0 && (
                  <RowOrganizationList
                    orgs={searchResults.list}
                    onPinToggle={handlePinToggle}
                  />
                )}

              {!searchLoading &&
                Array.isArray(searchResults.list) &&
                searchResults.list.length === 0 && (
                  <div className="profile-module__organization-empty f-15 f-400">
                    {translate("Ничего не найдено", "app.noResults")}
                  </div>
                )}
            </div>
          ) : (
            // --- Если поиск не активен ---
            <div className="module-search__orgs">
              {orgs?.list ? (
                <InfiniteScroll
                  dataLength={orgs.list.length}
                  next={() => getNext(orgs.total_pages)}
                  hasMore={state.hasMore}
                  loader={<Preloader />}
                  scrollableTarget="scrollableDiv"
                >
                  <RowOrganizationList
                    orgs={orgs.list}
                    onPinToggle={handlePinToggle}
                  />
                </InfiniteScroll>
              ) : (
                <Preloader />
              )}

              {orgs &&
                Array.isArray(orgs.list) &&
                orgs.list.length === 0 &&
                !loading && (
                  <div className="profile-module__organization-empty f-15 f-400">
                    {translate("У Вас нет организаций", "app.noOrganizations")}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModuleSearch;
