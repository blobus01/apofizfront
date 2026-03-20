import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import api from "@/axios-api";
import Preloader from "../../components/Preloader";
import Notify from "../../components/Notification";

import "./index.scss";

function MessengerForwardPage() {
  const history = useHistory();
  const location = useLocation();
  const original_message_id = location.state?.original_message_id;
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/messenger/chats/");
        if (res.status === 200 && res.data && Array.isArray(res.data.list)) {
          setChats(res.data.list || []);
        }
      } catch (e) {}
    };
    document.querySelector("#global-menu").style.zIndex = "3";
    fetchChats();
    return () => (document.querySelector("#global-menu").style.zIndex = null);
  }, []);

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
    setResult(null);
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
      if (response && response.status === 200) {
        setResult({
          id: response.data.id,
          avatar:
            response.data.avatar?.medium || response.data.avatar?.file || "",
          name: response.data.full_name,
          nick: response.data.username,
        });
      } else if (response.status === 400) {
        setError(
          translate(
            "Введите корректный ID или номер телефона",
            "messenger.enterValidIdOrPhone"
          )
        );
      } else if (response.status === 404) {
        setError(translate("Пользователь не найден", "messenger.userNotFound"));
      } else {
        setError(
          translate("Ошибка поиска пользователя", "messenger.userSearchError")
        );
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(
          translate(
            "Введите корректный ID или номер телефона",
            "messenger.enterValidIdOrPhone"
          )
        );
      } else if (err.response && err.response.status === 404) {
        setError(translate("Пользователь не найден", "messenger.userNotFound"));
      } else {
        setError(translate("Ошибка сети", "messenger.errorNetwork"));
      }
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (chatId) =>
    selectedUsers.some((user) => user.id === chatId);

  const handleSelectChat = (chat) => {
    if (isSelected(chat.id)) {
      setSelectedUsers(selectedUsers.filter((item) => item.id !== chat.id));
    } else {
      setSelectedUsers([...selectedUsers, chat]);
    }
  };

  const getChatUser = (chat) => {
    return {
      id: chat.sender?.id,
      avatar: chat.sender?.avatar?.medium || chat.sender?.avatar?.file || "",
      name: chat.sender?.full_name,
      nick: chat.sender?.username,
    };
  };
  const handleForward = async () => {
    if (!original_message_id || selectedUsers.length === 0) {
      setError(
        translate("Выберите хотя бы один чат", "messenger.selectAtLeastOneChat")
      );
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const resp = await api.post("/messenger/forward-message/", {
        original_message_id,
        target_chat_ids: selectedUsers?.map((item) => item.id),
      });
      if (resp.status === 200 || resp.status === 201) {
        Notify.success({
          text: translate("Сообщение переслано", "messenger.messageForwarded"),
        });
        if (selectedUsers.length === 1) {
          history.replace(
            `/messenger/chat/${
              getChatUser(chats.find((c) => c.id === selectedUsers[0].id)).id
            }/?type=${selectedUsers[0].chat_type}`
          );
        } else {
          history.goBack();
        }
      } else {
        setError(
          translate("Ошибка при пересылке сообщения", "messenger.forwardError")
        );
        Notify.error &&
          Notify.error({
            text: translate(
              "Ошибка при пересылке сообщения",
              "messenger.forwardError"
            ),
          });
      }
    } catch (e) {
      setError(
        translate("Ошибка при пересылке сообщения", "messenger.forwardError")
      );
      Notify.error &&
        Notify.error({
          text: translate(
            "Ошибка при пересылке сообщения",
            "messenger.forwardError"
          ),
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="messenger-group-page">
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={translate("Переслать", "messenger.forward")}
        nextLabel={
          isSubmitting ? (
            <Preloader
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                width: 20,
                height: 20,
              }}
            />
          ) : (
            translate("Переслать", "messenger.forward")
          )
        }
        onNext={handleForward}
        disabledGroup={selectedUsers.length === 0 || isSubmitting}
        isSubmitting={isSubmitting}
      />
      <div className="messenger-search-page__content container">
        <div className="messenger-search-page__search">
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
        {!error || isSubmitting ? null : (
          <div className="messenger-search-page__error">{error}</div>
        )}
        {loading && (
          <div className="messenger-search-page__loading">
            {translate("Загрузка...", "common.loading")}
          </div>
        )}
        <div
          className={`messenger-chat-list ${
            !chats.length ? "resetMargin" : ""
          }`}
        >
          {chats.map((chat) => {
            const user = getChatUser(chat);
            return (
              <div key={chat.id} className="messenger-chat-item">
                <button
                  className={`chat-select-check${
                    isSelected(chat.id) ? " checked" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectChat(chat);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    marginRight: 8,
                    cursor: "pointer",
                    outline: "none",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "16px",
                    border: "1px solid #D7D8D9",
                    boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
                  }}
                >
                  <svg width="20" height="21" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="11"
                      fill="#fff"
                      stroke="#007AFF"
                      strokeWidth="2"
                    />
                    {isSelected(chat.id) && (
                      <polyline
                        points="7,13 11,17 17,9"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                </button>
                <div className="messenger-chat-avatar-wrap">
                  <img
                    src={chat.chat_type === "group" ? chat.image : user.avatar}
                    alt={chat.chat_type === "group" ? chat.title : user.name}
                    className="messenger-chat-avatar"
                  />
                </div>
                <div className="messenger-chat-content">
                  <div className="messenger-chat-header">
                    <span
                      className={`messenger-chat-name${
                        chat.is_blocked ? " messenger-chat-name--red" : ""
                      }`}
                      style={chat.is_blocked ? { color: "#D72C20" } : {}}
                    >
                      {chat.chat_type === "group" ? chat.title : user.name}
                    </span>
                    <p
                      className="messenger-chat-date"
                      style={
                        chat?.last_message?.status === "read"
                          ? { color: "#27AE60" }
                          : null
                      }
                    >
                      {chat.last_message?.created_at
                        ? new Date(
                            chat.last_message.created_at
                          ).toLocaleDateString()
                        : ""}{" "}
                      <span>
                        {chat.last_message?.created_at
                          ? new Date(
                              chat.last_message.created_at
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </p>
                  </div>
                  <div className="messenger-chat-message-row">
                    <span className="messenger-chat-message">
                      {chat.last_message?.is_mine === true
                        ? translate("Вы: ", "messenger.you")
                        : chat.last_message?.is_mine === false
                        ? translate("Вам: ", "messenger.toYou")
                        : ""}
                      {chat.last_message?.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MessengerForwardPage;
