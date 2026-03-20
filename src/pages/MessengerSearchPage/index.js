import { canGoBack } from "@common/helpers";
import MobileTopHeader from "@components/MobileTopHeader";
import { SearchIcon } from "../MessengerPage/icons";
import { translate } from "@locales/locales";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import api from "@/axios-api";

import "./index.scss";
import { useMediaQuery } from "react-responsive";

function MessengerSearchPage() {
  const history = useHistory();
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const onlyDigits = rawValue.replace(/\D/g, "");
    setSearch(onlyDigits);
    if (rawValue !== onlyDigits && rawValue.length > 0) {
      setError(
        translate("Можно вводить только цифры", "messenger.onlyNumbersAllowed")
      );
    } else {
      setError("");
    }
    setResult(null); // сбрасываем результат при изменении
  };

  const handleSearch = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    if (!search) {
      setError(
        translate("Введите ID или номер телефона", "messenger.enterIdOrPhone")
      );
      setLoading(false);
      return;
    }
    try {
      const response = await api.get(`/messenger/users/`, {
        params: { query: search },
      });

      if (response) {
        if (response.status === 400) {
          setError(
            translate(
              "Введите корректный ID или номер телефона",
              "messenger.enterValidIdOrPhone"
            )
          );
        } else if (response.status === 404) {
          setError(
            translate("Пользователь не найден", "messenger.userNotFound")
          );
        } else if (response.status === 200) {
          setResult({
            id: response.data.id,
            avatar:
              response.data.avatar?.medium || response.data.avatar?.file || "",
            name: response.data.full_name,
            nick: response.data.username,
          });
        } else {
          setError(
            translate("Ошибка поиска пользователя", "messenger.userSearchError")
          );
        }
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError(
            translate(
              "Введите корректный ID или номер телефона",
              "messenger.enterValidIdOrPhone"
            )
          );
        } else if (err.response.status === 404) {
          setError(
            translate("Пользователь не найден", "messenger.userNotFound")
          );
        } else {
          setError(
            translate("Ошибка поиска пользователя", "messenger.userSearchError")
          );
        }
      } else {
        setError(translate("Ошибка сети", "messenger.errorNetwork"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="messenger-search-page">
      <MobileTopHeader
        title={translate("Новый чат", "messenger.newChat")}
        onBack={() =>
          canGoBack(history) ? history.goBack() : history.push(`/messenger`)
        }
      />
      <div className="messenger-search-page__content container">
        <div className="messenger-search-page__search">
          <SearchIcon />
          <input
            name="search"
            type="text"
            placeholder={translate(
              "Поиск по User ID или номеру",
              "messenger.searchPlaceholder"
            )}
            value={search}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
          />
          {search && (
            <button onClick={handleSearch}>
              {translate("Найти", "messenger.searchButton")}
            </button>
          )}
        </div>
        {error && <div className="messenger-search-page__error">{error}</div>}
        {loading && (
          <div className="messenger-search-page__loading">
            {translate("Загрузка...", "common.loading")}
          </div>
        )}
        {result && (
          <Link
            to={
              isDesktop
                ? `/messenger/?ID=${result.id}`
                : `/messenger/chat/${result.id}`
            }
            className="messenger-search-page__result"
          >
            <img
              src={result.avatar}
              alt={result.name}
              className="messenger-search-page__result-avatar"
            />
            <div className="messenger-search-page__result-info">
              <div className="messenger-search-page__result-name">
                {result.name}
              </div>
              <div className="messenger-search-page__result-nick">
                {result.nick}
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default MessengerSearchPage;
