import React, { useEffect, useRef, useState } from "react";
import { translate } from "../../../locales/locales";
import { CloseIcon, SearchIcon, SearchIconOrg } from "../Icons";
import OrgAvatar from "../OrgAvatar";
import {
  getDataFromLocalStorage,
  saveDataToLocalStorage,
} from "../../../store/localStorage";
import "./index.scss";
import { SearchIconAll } from "./icons";

const SearchAutocompleteField = ({
  name,
  value,
  placeholder,
  onSubmit,
  onChange,
  disableForm,
  items,
  onSearchSuggestSelect,
  onShowAllResults,
  autoFocus = true,
  hideOverflowOnSearchWithSuggestions = true,
}) => {
  const searchResultsEl = useRef(null);
  const [historySearch, setHistorySearch] = useState([]);

  useEffect(() => {
    const historySearch = getDataFromLocalStorage("historySearch");

    if (historySearch) {
      const arr = [...historySearch].filter((item) => {
        return item.name.toLowerCase().startsWith(value.toLowerCase());
      });

      if (items) {
        const arrConcat = [...arr, ...items.results];
        const arrFilter = arrConcat.filter((item, index, self) => {
          return index === self.findIndex((i) => item.id === i.id);
        });

        setHistorySearch(arrFilter);
      }
    } else {
      setHistorySearch(items.results);
    }
  }, [items, value, hideOverflowOnSearchWithSuggestions]);

  const onRemoveHistoryPost = (id) => {
    let history = getDataFromLocalStorage("historySearch");
    history = history.filter((item) => item.id !== id);
    saveDataToLocalStorage("historySearch", history);

    setHistorySearch(historySearch.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const isOpen = value.length > 0 && hideOverflowOnSearchWithSuggestions;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [value, hideOverflowOnSearchWithSuggestions]);

  console.log("ASD");

  const content = (
    <>
      <button
        type="submit"
        onSubmit={onSubmit}
        style={{ width: "24px", height: "24px" }}
      >
        <SearchIcon />
      </button>

      {/*NOTE: this is to disable initial autocomplete of the searchbar */}
      <input
        autoComplete="false"
        name="hidden"
        type="text"
        style={{ display: "none" }}
      />

      <input
        type="text"
        name={name || "search"}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        placeholder={placeholder || translate("Поиск", "app.search")}
        className="search-field__input"
      />

      {value.length > 0 && (
        <div className="search-results" ref={searchResultsEl}>
          <div className="container">
            <button
              onClick={onShowAllResults}
              style={{
                margin: "10px 0 15px",
                color: "#007AFF",
                fill: "#007AFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
              type="button"
            >
              {translate("Показать все", "app.showAll")}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.71 19.29L17.31 15.9C18.407 14.5025 19.0022 12.7767 19 11C19 9.41775 18.5308 7.87103 17.6518 6.55544C16.7727 5.23985 15.5233 4.21447 14.0615 3.60897C12.5997 3.00347 10.9911 2.84504 9.43928 3.15372C7.88743 3.4624 6.46197 4.22433 5.34315 5.34315C4.22433 6.46197 3.4624 7.88743 3.15372 9.43928C2.84504 10.9911 3.00347 12.5997 3.60897 14.0615C4.21447 15.5233 5.23985 16.7727 6.55544 17.6518C7.87103 18.5308 9.41775 19 11 19C12.7767 19.0022 14.5025 18.407 15.9 17.31L19.29 20.71C19.383 20.8037 19.4936 20.8781 19.6154 20.9289C19.7373 20.9797 19.868 21.0058 20 21.0058C20.132 21.0058 20.2627 20.9797 20.3846 20.9289C20.5064 20.8781 20.617 20.8037 20.71 20.71C20.8037 20.617 20.8781 20.5064 20.9289 20.3846C20.9797 20.2627 21.0058 20.132 21.0058 20C21.0058 19.868 20.9797 19.7373 20.9289 19.6154C20.8781 19.4936 20.8037 19.383 20.71 19.29ZM5 11C5 9.81332 5.3519 8.65328 6.01119 7.66658C6.67047 6.67989 7.60755 5.91085 8.7039 5.45673C9.80026 5.0026 11.0067 4.88378 12.1705 5.11529C13.3344 5.3468 14.4035 5.91825 15.2426 6.75736C16.0818 7.59648 16.6532 8.66558 16.8847 9.82946C17.1162 10.9933 16.9974 12.1997 16.5433 13.2961C16.0892 14.3925 15.3201 15.3295 14.3334 15.9888C13.3467 16.6481 12.1867 17 11 17C9.4087 17 7.88258 16.3679 6.75736 15.2426C5.63214 14.1174 5 12.5913 5 11Z"
                  fill="#2F80ED"
                  style={{ fill: "#2F80ED" }}
                />
              </svg>
            </button>

            {historySearch.length > 0 ? (
              historySearch.map((item) => (
                <div key={item.id} className="dfc search-results__wrap-item">
                  <div
                    className="dfc"
                    style={{ cursor: "pointer" }}
                    onClick={() => onSearchSuggestSelect(item)}
                  >
                    <OrgAvatar
                      size={32}
                      src={item.images.length > 0 ? item.images[0].small : ""}
                    />
                    <div style={{ marginLeft: "6px" }}>{item.name}</div>
                  </div>
                  {item.history && (
                    <button
                      type="button"
                      className="search-results__btn"
                      onClick={() => onRemoveHistoryPost(item.id)}
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div>
                {translate(
                  "По Вашему запросу ничего не найдено",
                  "search.requestNoResult",
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return disableForm ? (
    <div className="search-field">{content}</div>
  ) : (
    <form
      className="search-field"
      onSubmit={onSubmit ? onSubmit : (e) => e.preventDefault()}
    >
      {content}
    </form>
  );
};

export default SearchAutocompleteField;
