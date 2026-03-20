import { useState, useRef, useEffect } from "react";
import {
  BellIcon,
  MessengerIcon,
  ReadTickIcon,
  SentTickIcon,
} from "@/pages/MessengerPage/icons";
import "./index.scss";
import { useDispatch } from "react-redux";
import { setGlobalMenu } from "@store/actions/commonActions";
import { MENU_TYPES } from "@components/GlobalMenu";
import { translate } from "@locales/locales";
import {
  Link,
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import api from "@/axios-api";
import Preloader from "../../components/Preloader";
import Notify from "../../components/Notification";
import useDialog from "@components/UI/Dialog/useDialog";
import useChatSocket from "@pages/CommentsPage/useChatSocket";
import { BackArrow } from "@components/UI/Icons";
import MessengerChatPage from "@pages/MessengerChatPage";
import { useMediaQuery } from "react-responsive";
import Popup from "reactjs-popup";
import { MenuDotsIcon } from "@pages/MessengerPage/icons";
import "./index.scss";

const OrganizationMessengerPage = () => {
  const [chats, setChats] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const { confirm } = useDialog();
  const location = useLocation();
  const history = useHistory();
  const { id: organizationId } = useParams();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChatType, setSelectedChatType] = useState(null);
  const [isChatListEmpty, setIsChatListEmpty] = useState(false);
  const [isSelect, setIsSelect] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const params = new URLSearchParams(location.search);
  const forward_id = params.get("forward_id");

  const chatSocket = useChatSocket(true, {
    connect: true,
    isChatList: true,
  });
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : "",
    );
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.querySelector("#global-menu").style.zIndex = "3";
    return () => {
      document.body.style.overflow = null;
      document.querySelector("#global-menu").style.zIndex = null;
    };
  }, []);

  const fetchOrganizationInfo = async () => {
    try {
      const response = await api.get(
        `/messenger/chats/organization/${organizationId}/`,
      );
      if (response.status === 200) {
        setOrganization(response.data);
      }
    } catch (err) {
      console.error(
        translate(
          "Ошибка загрузки информации об организации",
          "messenger.organizationInfoError",
        ),
        err,
      );
    }
  };
  const fetchChats = async (sortParam = sortBy) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/messenger/chats/?organization_id=${organizationId}&sort_by=${sortParam}`,
      );

      if (
        response.status === 200 &&
        response.data &&
        Array.isArray(response.data.list)
      ) {
        setChats(response.data.list || []);
        setIsChatListEmpty(response.data.list.length === 0);
      } else {
        setError(translate("Ошибка загрузки чатов", "messenger.errorChatList"));
        Notify.error &&
          Notify.error({
            text: translate("Ошибка загрузки чатов", "messenger.errorChatList"),
          });
      }
    } catch (err) {
      setError(translate("Ошибка загрузки чатов", "messenger.errorChatList"));
      Notify.error &&
        Notify.error({
          text: translate("Ошибка загрузки чатов", "messenger.errorChatList"),
        });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchOrganizationInfo();
      fetchChats();
    }, 800);
  }, [selectedChatId, isDesktop, forward_id, organizationId]);

  // Автоматический выбор первого чата на десктопе
  useEffect(() => {
    if (isDesktop && chats.length > 0 && !selectedChatId) {
      const firstChat = chats[0];
      setSelectedChatId(firstChat.id);
      setSelectedChatType(firstChat.chat_type || "private");
    }
  }, [chats, isDesktop, selectedChatId]);

  // Обработка событий chat_updated от сокета
  useEffect(() => {
    if (!chatSocket || !chatSocket.isConnected) return;
    const unsubscribe = chatSocket.onMessage((e) => {
      try {
        const data = JSON.parse(e.data);
        if (
          data.event === "chat_updated" &&
          data.chat_id &&
          data.last_message
        ) {
          setChats((prevChats) =>
            prevChats.map((chat) =>
              String(chat.id) === String(data.chat_id)
                ? {
                    ...chat,
                    last_message: { ...data.last_message },
                  }
                : chat,
            ),
          );
        }
      } catch (err) {
        // обработка ошибки парсинга
      }
      fetchChats();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatSocket]);

  const handleDeleteSelected = async () => {
    if (!selectedChats.length) return;
    await confirm({
      title: translate("Удалить чаты", "messenger.deleteChats"),
      description: translate(
        "После удаления безвозвратно, выбранные чаты не будут доступны !",
        "messenger.deleteChatDescription",
      ),
      confirmTitle: translate("Удалить", "app.yes"),
      cancelTitle: translate("Отмена", "app.no"),
    });
    try {
      const resp = await api.post("/messenger/chats/delete/", {
        chats: selectedChats,
      });
      if (resp.status === 200 || resp.status === 201) {
        await fetchChats();
        setSelectedChats([]);
        setIsSelect(false);
        Notify.success &&
          Notify.success({
            text: `${translate(
              "Удалено чатов",
              "messenger.notificationDeleteChats",
            )}: ${resp.data.deleted}`,
          });
        // Если после удаления не осталось чатов — редирект на /messenger
        if (chats.length - selectedChats.length <= 0) {
          history.push("/messenger");
          setSelectedChatId(null);
          setSelectedChatType(null);
        }
      } else {
        Notify.error &&
          Notify.error({
            text: translate("Ошибка загрузки чатов", "messenger.errorChatList"),
          });
      }
    } catch (e) {
      Notify.error &&
        Notify.error({
          text: translate("Ошибка загрузки чатов", "messenger.errorChatList"),
        });
    }
  };

  const handleViewSelected = async () => {
    if (!selectedChats.length) return;
    try {
      const resp = await api.post("/messenger/chats/view/", {
        chats: selectedChats,
      });
      if (resp.status === 200) {
        await fetchChats();
        setSelectedChats([]);
        setIsSelect(false);
        Notify.success &&
          Notify.success({
            text: `${translate(
              "Просмотрено чатов",
              "messenger.notificationViewChats",
            )}: ${resp.data.updated}`,
          });
      } else {
        Notify.error &&
          Notify.error({
            text: translate(
              "Ошибка при просмотре чатов",
              "messenger.errorViewChat",
            ),
          });
      }
    } catch (e) {
      Notify.error &&
        Notify.error({
          text: translate(
            "Ошибка при просмотре чатов",
            "messenger.errorViewChat",
          ),
        });
    }
  };

  const handleBlockSelected = async () => {
    if (!selectedChats.length) return;
    try {
      const resp = await api.post("/messenger/chats/block/", {
        chats: selectedChats,
      });
      if (resp.status === 200) {
        await fetchChats();
        setSelectedChats([]);
        setIsSelect(false);
        Notify.success &&
          Notify.success({
            text: `${translate(
              "Заблокировано чатов",
              "messenger.notificationBlockChats",
            )}: ${resp.data.blocked_count}`,
          });
      } else {
        Notify.error &&
          Notify.error({
            text: translate(
              "Ошибка при блокировке чатов",
              "messenger.errorBlockChat",
            ),
          });
      }
    } catch (e) {
      Notify.error &&
        Notify.error({
          text: translate(
            "Ошибка при блокировке чатов",
            "messenger.errorBlockChat",
          ),
        });
    }
  };

  const onlyBlockedSelected =
    selectedChats.length > 0 &&
    selectedChats.every((id) =>
      chats.find((chat) => chat.id === id && chat.is_blocked),
    );

  const handleUnblockSelected = async () => {
    if (!selectedChats.length) return;
    try {
      const resp = await api.post("/messenger/chats/unblock/", {
        chats: selectedChats,
      });
      if (resp.status === 200) {
        await fetchChats();
        setSelectedChats([]);
        setIsSelect(false);
        Notify.success &&
          Notify.success({
            text: `${translate(
              "Разблокировано чатов",
              "messenger.notificationUnblockChats",
            )}: ${resp.data.unblocked.length}`,
          });
      } else {
        Notify.error &&
          Notify.error({
            text: translate(
              "Ошибка при разблокировке чатов",
              "messenger.errorUnblockChat",
            ),
          });
      }
    } catch (e) {
      Notify.error &&
        Notify.error({
          text: translate(
            "Ошибка при разблокировке чатов",
            "messenger.errorUnblockChat",
          ),
        });
    }
  };

  const handleViewAll = async () => {
    if (!chats.length) return;
    try {
      const resp = await api.post("/messenger/chats/view/", {
        chats: chats.map((chat) => chat.id),
      });
      if (resp.status === 200) {
        await fetchChats();
        Notify.success &&
          Notify.success({
            text: `${translate(
              "Просмотрено чатов",
              "messenger.notificationViewChats",
            )}: ${resp.data.updated}`,
          });
      } else {
        Notify.error &&
          Notify.error({
            text: translate(
              "Ошибка при просмотре чатов",
              "messenger.errorViewChat",
            ),
          });
      }
    } catch (e) {
      Notify.error &&
        Notify.error({
          text: translate(
            "Ошибка при просмотре чатов",
            "messenger.errorViewChat",
          ),
        });
    }
  };

  const handleDeleteAll = async () => {
    if (!chats.length) return;
    await confirm({
      title: translate("Удалить все чаты", "messenger.deleteAllChat"),
      description: translate(
        "После удаления безвозвратно, все чаты не будут доступны!",
        "messenger.deleteAllChatDescription",
      ),
      confirmTitle: translate("Удалить", "app.yes"),
      cancelTitle: translate("Отмена", "app.no"),
    });
    try {
      const resp = await api.post("/messenger/chats/delete/", {
        chats: chats.map((chat) => chat.id),
      });
      if (resp.status === 200 || resp.status === 201) {
        await fetchChats();
        Notify.success &&
          Notify.success({
            text: `${translate(
              "Удаление чатов",
              "messenger.notificationDeleteAllChats",
            )}: ${resp.data.deleted}`,
          });
        // После удаления всех чатов — редирект на /messenger
        history.push("/messenger");
        setSelectedChatId(null);
        setSelectedChatType(null);
      } else {
        Notify.error &&
          Notify.error({
            text: translate(
              "Ошибка при удалении всех чатов",
              "messenger.errorDeleteAllChat",
            ),
          });
      }
    } catch (e) {
      Notify.error &&
        Notify.error({
          text: translate(
            "Ошибка при удалении всех чатов",
            "messenger.errorDeleteAllChat",
          ),
        });
    }
  };

  useEffect(() => {
    if (chats.length === 0 && selectedChatId) {
      setSelectedChatId(null);
      setSelectedChatType(null);
    }
    if (
      selectedChatId &&
      !chats.some(
        (chat) =>
          chat.id === selectedChatId || chat.sender?.id === selectedChatId,
      )
    ) {
      setSelectedChatId(null);
      setSelectedChatType(null);
    }
  }, [chats, selectedChatId]);
  const handleSortChange = (value) => {
    setSortBy(value);
    fetchChats(value);
  };
  const handleOpenSortMenu = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.sort_chat_menu,
        menuLabel: translate("Сортировать", "dialog.sort"),
        onCloseAddMenu: () => {},
        handleSortChange,
        activeSort: sortBy,
        loadingChats: loading,
        isOrgMessenger: true,
        containerSelector: ".messenger-page__content",
      }),
    );
  };

  const onSelect = () => {
    setIsSelect(true);
    setSelectedChats([]);
  };

  const MessageStatus = (status) => {
    if (status === "read") {
      return <ReadTickIcon />;
    }
    if (status === "delivered") {
      return <SentTickIcon />;
    }
    if (status === "sent") {
      return <SingleCheckIcon />;
    }
    return null;
  };

  const SingleCheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
      <path
        d="M4 9l3 3 7-7"
        stroke="#868D98"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div
      className={`messenger-page organization-messenger-page${
        isDesktop && selectedChatId ? " messenger-page--split container" : ""
      }`}
    >
      <div
        className={`messenger-page__content container`}
        style={isDesktop && selectedChatId ? { position: "relative" } : null}
      >
        <div
          className="messenger-header"
          style={
            isDesktop
              ? { boxShadow: "0 4px 2px -2px rgba(0, 0, 0, 0.15)" }
              : null
          }
        >
          <div className="messenger-header-left">
            <button onClick={() => history.push("/messenger")}>
              <BackArrow />
            </button>
            <div className="messenger-header-left-title">
              <img
                src={organization?.image?.medium || organization?.image?.file}
                alt={organization?.title}
                style={{ borderRadius: "12px" }}
                className="messenger-chat-avatar"
              />
              <div className="messenger-header-left-title-info">
                <h4 className="messenger-header-left-title-name">
                  {organization?.title}
                </h4>
                <span className="messenger-header-left-title-type">
                  {organization?.types[0]?.title}
                </span>
              </div>
            </div>
          </div>
          <div className="messenger-header-right">
            <button
              className="messenger-header-right-btn"
              onClick={handleOpenSortMenu}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8L7 4M7 4L11 8M7 4V20M11 12H15M11 16H18M11 20H21"
                  stroke="#1270EC"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <Popup
              trigger={
                <button className="messenger-header-btn">
                  <MenuDotsIcon />
                </button>
              }
              position="bottom right"
              closeOnDocumentClick
            >
              {(close) => (
                <PopupContent
                  onSelect={onSelect}
                  onViewAll={handleViewAll}
                  onDeleteAll={handleDeleteAll}
                  onClick={close}
                />
              )}
            </Popup>
          </div>
        </div>
        {isSelect && (
          <div className="selected__wrap">
            <div className="selected__wrap__title">
              <h3>
                {selectedChats.length}{" "}
                {translate("Выбрано", "messenger.selected")}
              </h3>
              <button
                onClick={() => {
                  setIsSelect(false);
                  setSelectedChats([]);
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.12"
                    d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                    fill="#818C99"
                  />
                  <path
                    d="M16.7364 7.2636C17.0879 7.61508 17.0879 8.18492 16.7364 8.5364L13.273 12L16.7364 15.4636C17.0586 15.7858 17.0854 16.2915 16.817 16.6442L16.7364 16.7364C16.3849 17.0879 15.8151 17.0879 15.4636 16.7364L12 13.273L8.5364 16.7364C8.18492 17.0879 7.61508 17.0879 7.2636 16.7364C6.91213 16.3849 6.91213 15.8151 7.2636 15.4636L10.727 12L7.2636 8.5364C6.94142 8.21421 6.91457 7.70853 7.18306 7.35577L7.2636 7.2636C7.61508 6.91213 8.18492 6.91213 8.5364 7.2636L12 10.727L15.4636 7.2636C15.8151 6.91213 16.3849 6.91213 16.7364 7.2636Z"
                    fill="#007AFF"
                  />
                </svg>
              </button>
            </div>
            <div className="selected__wrap__actions">
              <button
                disabled={selectedChats.length === 0}
                style={{
                  color: selectedChats.length === 0 ? "#868D98" : "#D72C20",
                  cursor:
                    selectedChats.length === 0 ? "not-allowed" : "pointer",
                  background: "none",
                  border: "none",
                }}
                onClick={handleDeleteSelected}
              >
                {translate("Удалить", "app.delete")}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.14258 4.28564L4.09496 16.7532C4.1402 17.4736 4.78067 17.9999 5.61877 17.9999H14.3807C15.2221 17.9999 15.8507 17.4736 15.9045 16.7532L16.8569 4.28564"
                    stroke={selectedChats.length === 0 ? "#868D98" : "#D72C20"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 4.28564H18H2Z"
                    fill={selectedChats.length === 0 ? "#868D98" : "#D72C20"}
                  />
                  <path
                    d="M2 4.28564H18"
                    stroke={selectedChats.length === 0 ? "#868D98" : "#D72C20"}
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.95224 4.49351V2.93507C6.9518 2.81217 6.98106 2.69042 7.03834 2.57681C7.09562 2.4632 7.17978 2.35998 7.286 2.27308C7.39221 2.18617 7.51837 2.11731 7.65723 2.07045C7.79608 2.02358 7.94489 1.99964 8.0951 2H11.9046C12.0548 1.99964 12.2036 2.02358 12.3425 2.07045C12.4814 2.11731 12.6075 2.18617 12.7137 2.27308C12.8199 2.35998 12.9041 2.4632 12.9614 2.57681C13.0187 2.69042 13.0479 2.81217 13.0475 2.93507V4.49351M9.99986 6.98702V15.7143M6.57129 6.98702L6.95224 15.7143M13.4284 6.98702L13.0475 15.7143"
                    stroke={selectedChats.length === 0 ? "#868D98" : "#D72C20"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                disabled={selectedChats.length === 0}
                style={{
                  color: selectedChats.length === 0 ? "#868D98" : "#34A853",
                  cursor:
                    selectedChats.length === 0 ? "not-allowed" : "pointer",
                  background: "none",
                  border: "none",
                }}
                onClick={handleViewSelected}
              >
                {translate("Посмотреть", "app.see")}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_35109_14799)">
                    <path
                      d="M1.24635 10.942C1.07555 10.7637 0.993562 10.5556 1.00039 10.3177C1.00723 10.0799 1.09633 9.87181 1.2677 9.69344C1.4385 9.52993 1.63777 9.44432 1.86551 9.43659C2.09324 9.42886 2.29251 9.51447 2.46332 9.69344L5.49506 12.8595L5.79396 13.1717L6.09286 13.4838C6.26367 13.6622 6.34565 13.8703 6.33882 14.1081C6.33199 14.346 6.24289 14.5541 6.07151 14.7324C5.90071 14.8959 5.70144 14.9816 5.47371 14.9893C5.24597 14.997 5.0467 14.9114 4.8759 14.7324L1.24635 10.942ZM10.2989 12.8372L17.558 5.25645C17.7288 5.07807 17.928 4.99275 18.1558 5.00048C18.3835 5.00821 18.5828 5.10096 18.7536 5.27874C18.9102 5.45711 18.9921 5.66521 18.9995 5.90304C19.0069 6.14087 18.925 6.34897 18.7536 6.52734L10.8967 14.7324C10.7259 14.9108 10.5266 15 10.2989 15C10.0711 15 9.87187 14.9108 9.70106 14.7324L6.07151 10.942C5.91495 10.7785 5.83666 10.5743 5.83666 10.3293C5.83666 10.0844 5.91495 9.87241 6.07151 9.69344C6.24232 9.51507 6.44529 9.42588 6.68042 9.42588C6.91556 9.42588 7.11825 9.51507 7.28848 9.69344L10.2989 12.8372ZM13.9071 6.54964L10.8967 9.69344C10.7401 9.85695 10.5445 9.9387 10.31 9.9387C10.0754 9.9387 9.87243 9.85695 9.70106 9.69344C9.53026 9.51507 9.44486 9.3034 9.44486 9.05844C9.44486 8.81347 9.53026 8.60151 9.70106 8.42254L12.7115 5.27874C12.868 5.11523 13.0639 5.03348 13.299 5.03348C13.5342 5.03348 13.7368 5.11523 13.9071 5.27874C14.0779 5.45711 14.1633 5.66878 14.1633 5.91374C14.1633 6.15871 14.0779 6.37067 13.9071 6.54964Z"
                      fill={selectedChats.length === 0 ? "#868D98" : "#34A853"}
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_35109_14799">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
              {onlyBlockedSelected ? (
                <button
                  disabled={selectedChats.length === 0}
                  style={{
                    color: selectedChats.length === 0 ? "#868D98" : "#34A853",
                    cursor:
                      selectedChats.length === 0 ? "not-allowed" : "pointer",
                    background: "none",
                    border: "none",
                  }}
                  onClick={handleUnblockSelected}
                >
                  {translate("Разблокировать", "messenger.unblock")}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill={selectedChats.length === 0 ? "#868D98" : "#34A853"}
                      d="M19 14a1 1 0 00-1.22.72A7 7 0 0111 20H5.41l.64-.63a1 1 0 000-1.41 7 7 0 013.2-11.74 1.002 1.002 0 00-.5-1.94A9 9 0 004 18.62l-1.71 1.67a1 1 0 00-.21 1.09A1 1 0 003 22h8a9 9 0 008.72-6.75A.999.999 0 0019 14zm1.54-10.54a5 5 0 10-7.08 7.06 5 5 0 007.08-7.06zM14 7a3 3 0 013-3 3 3 0 011.29.3l-4 4A3.002 3.002 0 0114 7zm5.12 2.12a3.08 3.08 0 01-3.4.57l4-4A3 3 0 0120 7a3 3 0 01-.88 2.12z"
                    ></path>
                  </svg>
                </button>
              ) : (
                <button
                  disabled={selectedChats.length === 0}
                  style={{
                    color: selectedChats.length === 0 ? "#868D98" : "#D72C20",
                    cursor:
                      selectedChats.length === 0 ? "not-allowed" : "pointer",
                    background: "none",
                    border: "none",
                  }}
                  onClick={handleBlockSelected}
                >
                  {translate("Заблокировать", "messenger.block")}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill={selectedChats.length === 0 ? "#868D98" : "#D72C20"}
                      d="M19 14a1 1 0 00-1.22.72A7 7 0 0111 20H5.41l.64-.63a1 1 0 000-1.41 7 7 0 013.2-11.74 1.002 1.002 0 00-.5-1.94A9 9 0 004 18.62l-1.71 1.67a1 1 0 00-.21 1.09A1 1 0 003 22h8a9 9 0 008.72-6.75A.999.999 0 0019 14zm1.54-10.54a5 5 0 10-7.08 7.06 5 5 0 007.08-7.06zM14 7a3 3 0 013-3 3 3 0 011.29.3l-4 4A3.002 3.002 0 0114 7zm5.12 2.12a3.08 3.08 0 01-3.4.57l4-4A3 3 0 0120 7a3 3 0 01-.88 2.12z"
                    ></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {
          // loading ? (
          //   <Preloader style={{ marginTop: 16 }} />
          // ) :
          error ? (
            <div style={{ color: "red", padding: 16 }}>{error}</div>
          ) : (
            <div
              className={`messenger-chat-list${
                !(() => {
                  let chatList;
                  if (!sortBy) {
                    chatList = [...chats].sort((a, b) => {
                      const aDate = a.last_message?.created_at
                        ? new Date(a.last_message.created_at).getTime()
                        : 0;
                      const bDate = b.last_message?.created_at
                        ? new Date(b.last_message.created_at).getTime()
                        : 0;
                      return bDate - aDate;
                    });
                  } else {
                    chatList = chats;
                  }
                  return chatList.length;
                })()
                  ? " resetMargin"
                  : ""
              }`}
              style={
                isMobile && !isSelect
                  ? { maxHeight: "calc(100vh - 280px)" }
                  : isMobile && isSelect
                    ? { maxHeight: "calc(100vh - 355px)" }
                    : !isMobile && isSelect
                      ? { maxHeight: "calc(100vh - 265px)" }
                      : null
              }
            >
              {isChatListEmpty ? (
                <div className="messenger-page__not-data container">
                  <BellIcon />
                  <h4>
                    {translate(
                      "У Вас пока нет активных чатов",
                      "messenger.notFoundTitle",
                    )}
                  </h4>
                  <p>
                    {translate(
                      "В этой организации пока нет чатов",
                      "messenger.organizationNoChats",
                    )}
                  </p>
                </div>
              ) : (
                chats?.map((chat) => (
                  <Link
                    to={
                      isDesktop
                        ? "#"
                        : `/messenger/chat/${chat.id}/?type=${chat.chat_type}&organization_id=${organizationId}`
                    }
                    key={chat.id}
                    className="messenger-chat-item"
                    onClick={(e) => {
                      if (isDesktop) {
                        e.preventDefault();
                        setSelectedChatId(chat.id);
                        setSelectedChatType(chat.chat_type || "private");
                      }
                    }}
                  >
                    {isSelect && (
                      <button
                        className={`chat-select-check${
                          selectedChats.includes(chat.id) ? " checked" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedChats((selectedChats) =>
                            selectedChats.includes(chat.id)
                              ? selectedChats.filter((id) => id !== chat.id)
                              : [...selectedChats, chat.id],
                          );
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
                          {selectedChats.includes(chat.id) && (
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
                    )}
                    <div className="messenger-chat-avatar-wrap">
                      <img
                        src={
                          chat.sender?.avatar?.medium ||
                          chat.sender?.avatar?.file
                        }
                        alt={chat.sender?.full_name}
                        className="messenger-chat-avatar"
                      />
                      {chat.unread_messages_count > 0 && (
                        <div className="profile-module__icon-count f-11">
                          {chat.unread_messages_count < 1000
                            ? chat.unread_messages_count
                            : "999+"}
                        </div>
                      )}
                    </div>
                    <div className="messenger-chat-content">
                      <div className="messenger-chat-header">
                        <span
                          className="messenger-chat-name"
                          style={chat.is_blocked ? { color: "#D72C20" } : {}}
                        >
                          {chat.sender?.full_name}
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
                                chat.last_message.created_at,
                              ).toLocaleDateString()
                            : ""}{" "}
                          <span>
                            {chat.last_message?.created_at
                              ? new Date(
                                  chat.last_message.created_at,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </p>
                      </div>
                      <div className="messenger-chat-message-row">
                        {MessageStatus(chat?.last_message?.status)}
                        <span className="messenger-chat-message">
                          {chat.last_message?.is_mine === true
                            ? translate("Вы: ", "messenger.you")
                            : chat.last_message?.is_mine === false
                              ? translate("Вам: ", "messenger.toYou")
                              : ""}
                          {chat.last_message?.text ||
                            chat.last_message?.forwarded?.text ||
                            ""}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )
        }
      </div>
      {isDesktop && (forward_id || selectedChatId) && (
        <div className="messenger-page__chat-panel">
          <MessengerChatPage
            setChats={setChats}
            fetchChats={fetchChats}
           
            userId={forward_id || selectedChatId}
            setSelectedChatId={setSelectedChatId}
            selectedChatType={selectedChatType}
            organizationId={organizationId}
            isOrgMessenger={true}
          />
        </div>
      )}
    </div>
  );
};

const PopupContent = ({
  onSelect,
  onDelete,
  onBlock,
  onViewAll,
  onDeleteAll,
  ...rest
}) => {
  return (
    <div className="comment__popup" {...rest}>
      <button className="comment__popup-btn" onClick={onSelect}>
        {translate("Выбрать чаты", "messenger.selectChats")}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_35109_14814)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM8.823 12.14L6.058 9.373L5 10.431L8.119 13.552C8.30653 13.7395 8.56084 13.8448 8.826 13.8448C9.09116 13.8448 9.34547 13.7395 9.533 13.552L15.485 7.602L14.423 6.54L8.823 12.14Z"
              fill="#2C2D2E"
            />
          </g>
          <defs>
            <clipPath id="clip0_35109_14814">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </button>
      <button className="comment__popup-btn" onClick={onViewAll}>
        {translate("Просмотреть все", "messenger.viewAll")}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_35109_14799)">
            <path
              d="M1.24635 10.942C1.07555 10.7637 0.993562 10.5556 1.00039 10.3177C1.00723 10.0799 1.09633 9.87181 1.2677 9.69344C1.4385 9.52993 1.63777 9.44432 1.86551 9.43659C2.09324 9.42886 2.29251 9.51447 2.46332 9.69344L5.49506 12.8595L5.79396 13.1717L6.09286 13.4838C6.26367 13.6622 6.34565 13.8703 6.33882 14.1081C6.33199 14.346 6.24289 14.5541 6.07151 14.7324C5.90071 14.8959 5.70144 14.9816 5.47371 14.9893C5.24597 14.997 5.0467 14.9114 4.8759 14.7324L1.24635 10.942ZM10.2989 12.8372L17.558 5.25645C17.7288 5.07807 17.928 4.99275 18.1558 5.00048C18.3835 5.00821 18.5828 5.10096 18.7536 5.27874C18.9102 5.45711 18.9921 5.66521 18.9995 5.90304C19.0069 6.14087 18.925 6.34897 18.7536 6.52734L10.8967 14.7324C10.7259 14.9108 10.5266 15 10.2989 15C10.0711 15 9.87187 14.9108 9.70106 14.7324L6.07151 10.942C5.91495 10.7785 5.83666 10.5743 5.83666 10.3293C5.83666 10.0844 5.91495 9.87241 6.07151 9.69344C6.24232 9.51507 6.44529 9.42588 6.68042 9.42588C6.91556 9.42588 7.11825 9.51507 7.28848 9.69344L10.2989 12.8372ZM13.9071 6.54964L10.8967 9.69344C10.7401 9.85695 10.5445 9.9387 10.31 9.9387C10.0754 9.9387 9.87243 9.85695 9.70106 9.69344C9.53026 9.51507 9.44486 9.3034 9.44486 9.05844C9.44486 8.81347 9.53026 8.60151 9.70106 8.42254L12.7115 5.27874C12.868 5.11523 13.0639 5.03348 13.299 5.03348C13.5342 5.03348 13.7368 5.11523 13.9071 5.27874C14.0779 5.45711 14.1633 5.66878 14.1633 5.91374C14.1633 6.15871 14.0779 6.37067 13.9071 6.54964Z"
              fill="#2C2D2E"
            />
          </g>
          <defs>
            <clipPath id="clip0_35109_14799">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </button>
      <button
        className="comment__popup-btn"
        style={{ color: "#FF3B30" }}
        onClick={onDeleteAll}
      >
        {translate("Удалить все", "messenger.deleteAll")}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.14258 4.28564L4.09496 16.7532C4.1402 17.4736 4.78067 17.9999 5.61877 17.9999H14.3807C15.2221 17.9999 15.8507 17.4736 15.9045 16.7532L16.8569 4.28564"
            stroke="#FF3B30"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M2 4.28564H18H2Z" fill="#FF3B30" />
          <path
            d="M2 4.28564H18"
            stroke="#FF3B30"
            strokeMiterlimit="10"
            strokeLinecap="round"
          />
          <path
            d="M6.95224 4.49351V2.93507C6.9518 2.81217 6.98106 2.69042 7.03834 2.57681C7.09562 2.4632 7.17978 2.35998 7.286 2.27308C7.39221 2.18617 7.51837 2.11731 7.65723 2.07045C7.79608 2.02358 7.94489 1.99964 8.0951 2H11.9046C12.0548 1.99964 12.2036 2.02358 12.3425 2.07045C12.4814 2.11731 12.6075 2.18617 12.7137 2.27308C12.8199 2.35998 12.9041 2.4632 12.9614 2.57681C13.0187 2.69042 13.0479 2.81217 13.0475 2.93507V4.49351M9.99986 6.98702V15.7143M6.57129 6.98702L6.95224 15.7143M13.4284 6.98702L13.0475 15.7143"
            stroke="#FF3B30"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default OrganizationMessengerPage;
