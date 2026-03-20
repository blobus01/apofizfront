import React, { useState, useEffect } from "react";
import MobileTopHeader from "@components/MobileTopHeader";

import api from "@/axios-api";
import Notify from "../../components/Notification";
import { useDispatch } from "react-redux";
import { setViews } from "@store/actions/commonActions";
import Preloader from "../../components/Preloader";
import { SearchIcon } from "@pages/MessengerPage/icons";
import { translate } from "@locales/locales";

function AddMembersGroupView({
  members = [],
  title = "",
  image = "",
  onBack,
  chatId,
  onCloseView,
}) {
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  // Получаем id всех участников группы
  const memberIds = Array.isArray(members) ? members.map((m) => m.id) : [];

  useEffect(() => {
    api.get("/messenger/chats/").then((res) => {
      if (res.status === 200 && Array.isArray(res.data.list)) {
        setChats(res.data.list || []);
      }
    });
  }, []);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const onlyDigits = rawValue.replace(/\D/g, "");
    setSearch(onlyDigits);
    setError(
      rawValue !== onlyDigits && rawValue.length > 0
        ? "Можно вводить только цифры"
        : ""
    );
    setResult(null);
  };

  // handleSearch: не показывать найденного пользователя, если он уже в группе
  const handleSearch = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    if (!search) {
      setError("Введите ID или номер телефона");
      setLoading(false);
      return;
    }
    try {
      const response = await api.get(`/messenger/users/`, {
        params: { query: search },
      });
      if (response && response.status === 200) {
        if (memberIds.includes(response.data.id)) {
          setError("Пользователь уже в группе");
        } else {
          setResult({
            id: response.data.id,
            avatar:
              response.data.avatar?.medium || response.data.avatar?.file || "",
            name: response.data.full_name,
            nick: response.data.username,
          });
        }
      } else if (response.status === 400) {
        setError("Введите корректный ID или номер телефона");
      } else if (response.status === 404) {
        setError("Пользователь не найден");
      } else {
        setError("Ошибка поиска пользователя");
      }
    } catch (err) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (userId) => selectedUsers.some((u) => u.id === userId);

  const handleSelectUser = (user) => {
    if (isSelected(user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const getChatUser = (chat) => ({
    id: chat.sender?.id,
    avatar: chat.sender?.avatar?.medium || chat.sender?.avatar?.file || "",
    name: chat.sender?.full_name,
    nick: chat.sender?.username,
  });

  const handleSave = async () => {
    if (!selectedUsers.length || !chatId) return;
    setIsSubmitting(true);
    try {
      const resp = await api.post(`/messenger/group/${chatId}/add-users/`, {
        users_ids: selectedUsers.map((u) => u.id),
      });
      if (resp.status === 200 || resp.status === 201) {
        Notify.success({ text: "Пользователи добавлены" });
        onCloseView();
        dispatch(setViews([]));
      } else {
        Notify.error({ text: "Ошибка при добавлении пользователей" });
      }
    } catch (e) {
      Notify.error({ text: "Ошибка при добавлении пользователей" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-members-group-view">
      <MobileTopHeader
        onBack={onBack}
        title={title || "Добавить участников"}
        nextLabel={
          isSubmitting ? (
            <Preloader style={{ width: 20, height: 20 }} />
          ) : (
            "Сохранить"
          )
        }
        onNext={handleSave}
        disabledGroup={isSubmitting || !selectedUsers.length}
      />
      <div className="messenger-search-page__content container">
        <div
          className="messenger-search-page__search"
          style={{ marginBottom: "10px" }}
        >
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
          <div className="messenger-search-page__loading">Загрузка...</div>
        )}
        {/* Результат поиска — сверху */}
        {result && (
          <div
            className="messenger-search-page__result"
            style={{ marginBottom: 12, padding: 0 }}
          >
            <button
              className={`chat-select-check${
                isSelected(result.id) ? " checked" : ""
              }`}
              onClick={() => handleSelectUser(result)}
              style={{
                border: "none",
                background: "transparent",
                marginRight: 8,
                cursor: "pointer",
                outline: "none",
                display: "flex",
                alignItems: "center",
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
                {isSelected(result.id) && (
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
          </div>
        )}
        {/* Список чатов — ниже */}
        <div className="messenger-chat-list">
          {chats
            .filter((chat) => chat.chat_type !== "group")
            .filter((chat) => {
              const user = getChatUser(chat);
              return user.id && !memberIds.includes(user.id);
            })
            .map((chat) => {
              const user = getChatUser(chat);
              if (!user.id) return null;
              return (
                <div key={chat.id} className="messenger-chat-item">
                  <button
                    className={`chat-select-check${
                      isSelected(user.id) ? " checked" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectUser(user);
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      marginRight: 8,
                      cursor: "pointer",
                      outline: "none",
                      display: "flex",
                      alignItems: "center",
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
                      {isSelected(user.id) && (
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
                      src={user.avatar}
                      alt={user.name}
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
                        {user.name}
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
                          ? "Вы: "
                          : chat.last_message?.is_mine === false
                          ? "Вам: "
                          : ""}
                        {chat.last_message?.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        {/* Выбранные пользователи */}
      </div>
    </div>
  );
}

export default AddMembersGroupView;
