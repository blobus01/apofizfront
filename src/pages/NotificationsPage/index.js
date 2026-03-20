import React, { useState, useEffect, useCallback } from "react";
import qs from "qs";
import { connect, useDispatch, useSelector } from "react-redux";
import { NavLink, Link, useLocation, useHistory } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import ScrollContainer from "react-indiana-drag-scroll";
import { Formik } from "formik";

import MobileTopHeader from "../../components/MobileTopHeader";
import NotificationCard from "../../components/Cards/NotificationCard";
import MobileMenu from "../../components/MobileMenu";
import RowToggle from "../../components/UI/RowToggle";
import Preloader from "../../components/Preloader";
import withScroll from "../../hoc/withScroll";
import api from "@/axios-api";

import { translate } from "@locales/locales";
import {
  getNotifications,
  setNotificationsAsRead,
} from "@store/actions/notificationActions";
import {
  acceptPartnership,
  rejectPartnership,
} from "@store/actions/partnerActions";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "@store/services/notificationServices";
import { DEFAULT_LIMIT } from "@common/constants";

import emptyNotifications from "../../assets/images/empty_notifications.svg";
import "./index.scss";
import {
  BellIcon,
  MenuDotsIcon,
  ReadTickIcon,
  SentTickIcon,
} from "../MessengerPage/icons";
import { MessengerIcon } from "@containers/ProfileModule/icons";
import defaultGroupAvatar from "@pages/MessengerPage/defaultGroupAvatar.png";
import { setDarkThemeRT } from "@store/actions/themeDark";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import classNames from "classnames";

const NOTIFICATION_MODES = [
  "discount",
  "system",
  "partner",
  "product",
  "personal",
  "rental",
  "ticket",
  "resume",
  "chat",
];

const NotificationsPage = (props) => {
  const {
    notifications,
    getNotifications,
    setNotificationsAsRead,
    acceptPartnership,
    rejectPartnership,
  } = props;

  const location = useLocation();
  const history = useHistory();

  // Helper to parse mode
  const getMode = useCallback((modeParam) => {
    if (!modeParam) {
      return null;
    }
    if (typeof modeParam === "string" && modeParam.includes(",")) {
      const filteredMode = modeParam
        .split(",")
        .map((modeItem) => modeItem.toLowerCase())
        .filter((modeItem) => NOTIFICATION_MODES.includes(modeItem))
        .join(",");
      return filteredMode !== "" ? filteredMode : null;
    }
    return NOTIFICATION_MODES.includes(modeParam.toLowerCase())
      ? modeParam.toLowerCase()
      : null;
  }, []);

  // State initialization
  const [mode, setMode] = useState(() => {
    const params = qs.parse(location.search.replace("?", ""));
    return getMode(params?.mode);
  });

  const [page, setPage] = useState(1);
  // eslint-disable-next-line
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [hasMore, setHasMore] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [settings, setSettings] = useState(null);

  const [chatsState, setChatsState] = useState({
    chats: [],
    chatsLoading: false,
    chatsError: "",
  });

  // Fetch Chats Logic
  const fetchChats = useCallback(() => {
    setChatsState((prev) => ({ ...prev, chatsLoading: true, chatsError: "" }));
    api
      .get("/messenger/chats/")
      .then((res) => {
        if (res.status === 200 && res.data && Array.isArray(res.data.list)) {
          setChatsState((prev) => ({
            ...prev,
            chats: res.data.list || [],
            chatsLoading: false,
          }));
        } else {
          setChatsState((prev) => ({
            ...prev,
            chatsError: "Ошибка загрузки чатов",
            chatsLoading: false,
          }));
        }
      })
      .catch(() => {
        setChatsState((prev) => ({
          ...prev,
          chatsError: "Ошибка загрузки чатов",
          chatsLoading: false,
        }));
      });
  }, []);

  useEffect(() => {
    getNotificationSettings().then(
      (res) => res && res.success && setSettings(res.data),
    );
    // В классовом компоненте чаты грузились при маунте всегда
    fetchChats();

    return () => {
      setNotificationsAsRead();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMenu]); // Run once on mount

  // Refresh Notifications Logic
  const refreshNotifications = useCallback(
    (customParams = null) => {
      const params = customParams || qs.parse(location.search.replace("?", ""));
      const newMode = getMode(params?.mode);

      setMode(newMode);
      setPage(1);
      setHasMore(true);

      getNotifications({
        mode: newMode,
        page: 1,
        limit,
        hasMore: true,
      });
    },
    [location.search, getMode, limit, getNotifications],
  );

  // Watch URL changes
  useEffect(() => {
    refreshNotifications();
  }, [location.search, refreshNotifications]);

  // Watch Mode changes (Chat specific logic)
  useEffect(() => {
    if (mode === "chat") {
      fetchChats();
    } else {
      // Clean up chats when leaving chat mode
      setChatsState((prev) => ({
        ...prev,
        chats: [],
        chatsLoading: false,
        chatsError: "",
      }));
    }
  }, [mode, fetchChats]);

  const getNext = (totalPages) => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      setHasMore(true);
      getNotifications(
        {
          mode,
          page: nextPage,
          limit,
          hasMore: true,
        },
        true,
      );
    } else {
      setHasMore(false);
    }
  };

  const toggleMenu = (menuState) => {
    setShowMenu(menuState);
  };

  const { data, loading } = notifications;
  const { chats, chatsLoading, chatsError } = chatsState;

  // Helper for message status icon
  const renderMessageStatus = (status) => {
    if (status === "read") return <ReadTickIcon />;
    if (status === "delivered") return <SentTickIcon />;
    if (status === "sent") {
      return (
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
          <path
            d="M4 9l3 3 7-7"
            stroke="#868D98"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    }
    return null;
  };

  // Стили для таба мессенджера
  const messengerTabStyle = {
    color: "rgb(39, 174, 96)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
    borderBottom: "2px solid transparent", // Базовое состояние
  };

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  const dispatch = useDispatch();

  return (
    <div
      className={darkTheme ? "notifications-page dark" : "notifications-page"}
    >
      <div
        className="container"
        style={{ maxWidth: "1000px", margin: "0 auto" }}
      >
        <MobileTopHeader
          darkTheme={darkTheme}
          style={{ background: darkTheme ? "#00193f" : "", borderRadius: '0', boxShadow: "none" }}
          title={translate("Уведомления", "app.notifications")}
          renderRight={() => (
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span
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
              <span
                onClick={() => toggleMenu(!showMenu)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MenuDotsIcon />
              </span>
            </div>
          )}
        />
        <ScrollContainer className="notifications-page__nav-container">
          <nav className="notifications-page__nav">
            <div
              onClick={() => history.push("/messenger")}
              className="notifications-page__nav-link messagesenger-link"
              style={{ cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <MessengerIcon fill="rgb(39, 174, 96)" />
              </div>
              <span style={{ color: "rgb(39, 174, 96)" }}>
                {translate("Мессенджер", "messenger.title")}
              </span>
              <style jsx>{`
                a[href="/messenger"]:hover {
                  border-bottom: 2px solid rgb(39, 174, 96) !important;
                }
              `}</style>
            </div>

            <NavLink
              to="?mode=all"
              className="notifications-page__nav-link"
              activeClassName="notifications-page__nav-link-active"
              isActive={() => !mode || mode === "all"}
            >
              {translate("Все", "notifications.all")}
            </NavLink>

            <NavLink
              to="?mode=chat"
              className="notifications-page__nav-link"
              activeClassName="notifications-page__nav-link-active"
              isActive={() => mode && mode === "chat"}
            >
              {translate("Чаты", "messenger.Chats")}
            </NavLink>

            <NavLink
              to="?mode=discount"
              className="notifications-page__nav-link"
              activeClassName="notifications-page__nav-link-active"
              isActive={() => mode && mode === "discount"}
            >
              {translate("Скидки", "notifications.discounts")}
            </NavLink>

            <NavLink
              to="?mode=personal"
              className="notifications-page__nav-link"
              activeClassName="notifications-page__nav-link-active"
              isActive={() => mode && mode === "personal"}
            >
              {translate("Личные", "notifications.personal")}
            </NavLink>

            <NavLink
              to="?mode=product"
              className="notifications-page__nav-link"
              activeClassName="notifications-page__nav-link-active"
              isActive={() => mode && mode === "product"}
            >
              {translate("Товары", "notifications.products")}
            </NavLink>

            <NavLink
              to="?mode=rental"
              className="notifications-page__nav-link"
              activeClassName="notifications-page__nav-link-active"
              isActive={() => mode && mode === "rental"}
            >
              {translate("Аренда", "rent.rent")}
            </NavLink>

            <NavLink
              to="?mode=ticket"
              className="notifications-page__nav-link"
              activeClassName="notifications-page__nav-link-active"
              isActive={() => mode && mode === "ticket"}
            >
              {translate("Билеты", "events.tickets")}
            </NavLink>

            <NavLink
              to="?mode=system"
              className="notifications-page__nav-link"
              activeClassName="notifications-page__nav-link-active"
              isActive={() => mode && mode === "system"}
            >
              {translate("Системные", "notifications.system")}
            </NavLink>
          </nav>
        </ScrollContainer>
        <div className="notifications-page__content">
          {mode === "chat" ? (
            <div className="messenger-chat-list">
              <Link to="/messenger" className="create__folder">
                <p>
                  {translate("Перейти в мессенджер", "messenger.goToMessenger")}
                </p>
                <div style={{ borderRadius: "0 16px 16px 0" }}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.28 19.6044C12.9832 19.5564 13.6806 19.444 14.3633 19.2689C15.2066 19.5224 16.0967 19.5798 16.9656 19.4367C17.0002 19.4324 17.0351 19.4298 17.07 19.4289C17.38 19.4289 17.7867 19.6067 18.38 19.9811V19.3656C18.3803 19.2583 18.4093 19.1531 18.464 19.0609C18.5187 18.9686 18.5971 18.8927 18.6911 18.8411C18.9496 18.6952 19.1885 18.5311 19.4078 18.3489C20.2722 17.6267 20.76 16.6622 20.76 15.6422C20.76 15.3056 20.7067 14.97 20.6011 14.65C20.8633 14.1678 21.0722 13.6644 21.2278 13.14C21.7278 13.8789 21.9967 14.7511 22 15.6422C22 17.0289 21.3467 18.3222 20.2144 19.2678C20.0248 19.4256 19.8267 19.5707 19.62 19.7033V21.1456C19.62 21.6411 19.04 21.9267 18.6311 21.6311C18.2437 21.346 17.8433 21.0791 17.4311 20.8311C17.312 20.7625 17.1888 20.7012 17.0622 20.6478C16.7183 20.6987 16.371 20.7243 16.0233 20.7244C14.6122 20.7244 13.3078 20.3056 12.28 19.6044ZM4.81222 16.7211C3.03 15.2289 2 13.1944 2 11.0144C2 6.56111 6.25778 3 11.4567 3C16.6567 3 20.9156 6.56 20.9156 11.0144C20.9156 15.4678 16.6567 19.0278 11.4567 19.0278C10.8722 19.0278 10.2963 18.9833 9.72889 18.8944C9.48445 18.9511 8.50445 19.5256 7.09333 20.5422C6.58222 20.9111 5.85778 20.5556 5.85778 19.9344V17.4756C5.4918 17.2493 5.14274 16.9968 4.81333 16.72M9.76333 17.3778C9.8063 17.3778 9.84963 17.3811 9.89333 17.3878C10.4044 17.4722 10.9256 17.5148 11.4567 17.5156C15.8489 17.5156 19.3633 14.5767 19.3633 11.0133C19.3633 7.45111 15.8489 4.51222 11.4578 4.51222C7.06667 4.51222 3.55 7.45333 3.55 11.0144C3.55 12.7367 4.37222 14.3589 5.82333 15.5733C6.18926 15.8785 6.58778 16.1526 7.01889 16.3956C7.13583 16.4605 7.23346 16.5552 7.30178 16.6702C7.3701 16.7852 7.40668 16.9163 7.40778 17.05V18.4678C8.52445 17.7289 9.25889 17.3778 9.76333 17.3778Z"
                      fill="#fff"
                    />
                    <path
                      d="M7.62451 12.3755C7.95603 12.3755 8.27398 12.2438 8.5084 12.0094C8.74282 11.775 8.87451 11.457 8.87451 11.1255C8.87451 10.794 8.74282 10.476 8.5084 10.2416C8.27398 10.0072 7.95603 9.87549 7.62451 9.87549C7.29299 9.87549 6.97505 10.0072 6.74063 10.2416C6.50621 10.476 6.37451 10.794 6.37451 11.1255C6.37451 11.457 6.50621 11.775 6.74063 12.0094C6.97505 12.2438 7.29299 12.3755 7.62451 12.3755ZM11.6878 12.3755C12.0194 12.3755 12.3373 12.2438 12.5717 12.0094C12.8061 11.775 12.9378 11.457 12.9378 11.1255C12.9378 10.794 12.8061 10.476 12.5717 10.2416C12.3373 10.0072 12.0194 9.87549 11.6878 9.87549C11.3563 9.87549 11.0384 10.0072 10.804 10.2416C10.5695 10.476 10.4378 10.794 10.4378 11.1255C10.4378 11.457 10.5695 11.775 10.804 12.0094C11.0384 12.2438 11.3563 12.3755 11.6878 12.3755ZM15.7501 12.3755C16.0816 12.3755 16.3995 12.2438 16.634 12.0094C16.8684 11.775 17.0001 11.457 17.0001 11.1255C17.0001 10.794 16.8684 10.476 16.634 10.2416C16.3995 10.0072 16.0816 9.87549 15.7501 9.87549C15.4185 9.87549 15.1006 10.0072 14.8662 10.2416C14.6318 10.476 14.5001 10.794 14.5001 11.1255C14.5001 11.457 14.6318 11.775 14.8662 12.0094C15.1006 12.2438 15.4185 12.3755 15.7501 12.3755Z"
                      fill="#fff"
                    />
                  </svg>
                </div>
              </Link>
              {chatsLoading ? (
                <Preloader style={{ marginTop: 16 }} />
              ) : chatsError ? (
                <div style={{ color: "red", padding: 16 }}>{chatsError}</div>
              ) : !chats.length ? (
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
                      "Вы можете добавить пользователей главном меню пользователя в мессенджере",
                      "messenger.addUsersToMessenger",
                    )}
                  </p>
                </div>
              ) : (
                [...chats]
                  .sort((a, b) => {
                    const aDate = a.last_message?.created_at
                      ? new Date(a.last_message.created_at).getTime()
                      : 0;
                    const bDate = b.last_message?.created_at
                      ? new Date(b.last_message.created_at).getTime()
                      : 0;
                    return bDate - aDate;
                  })
                  .map((chat) => (
                    <Link
                      to={`/messenger/chat/${
                        chat.chat_type === "group" ? chat.id : chat.sender?.id
                      }/?type=${chat.chat_type}`}
                      key={chat.id}
                      className="messenger-chat-item"
                    >
                      <div className="messenger-chat-avatar-wrap">
                        <img
                          src={
                            chat.chat_type === "group"
                              ? chat.image || defaultGroupAvatar
                              : chat.sender?.avatar?.medium ||
                                chat.sender?.avatar?.file ||
                                ""
                          }
                          alt={
                            chat.chat_type === "group"
                              ? chat.title
                              : chat.sender?.full_name
                          }
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
                            className={`messenger-chat-name${
                              chat.is_blocked ? " messenger-chat-name--red" : ""
                            }`}
                            style={chat.is_blocked ? { color: "#D72C20" } : {}}
                          >
                            {chat.chat_type === "group"
                              ? chat.title
                              : chat.sender?.full_name}
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
                          {renderMessageStatus(chat?.last_message?.status)}
                          <span className="messenger-chat-message">
                            {chat.last_message?.is_mine === true
                              ? translate("Вы: ", "messenger.you")
                              : chat.last_message?.is_mine === false
                                ? translate("Вам: ", "messenger.toYou")
                                : ""}
                            {chat.last_message?.text ||
                              chat.last_message?.forwarded?.text}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
              )}
            </div>
          ) : (
            <>
              {((data && !data.total_count) || (!data && !loading)) && (
                <>
                  <img
                    src={emptyNotifications}
                    className="notifications-page__empty-image"
                    alt="empty notifications"
                  />
                  <p className="notifications-page__empty-label f-16 f-500">
                    {translate(
                      "У Вас пока нет уведомлений",
                      "notifications.empty",
                    )}
                  </p>
                </>
              )}

              {data && (
                <InfiniteScroll
                  dataLength={Number(data.list.length) || 0}
                  next={() => getNext(data.total_pages)}
                  hasMore={hasMore}
                  loader={null}
                >
                  {data.list.map((item) => (
                    <NotificationCard
                      key={item.id}
                      card={item}
                      onAcceptPartnership={(id, redirectURL) =>
                        acceptPartnership(id).then(
                          (res) =>
                            res && res.success && history.push(redirectURL),
                        )
                      }
                      onRejectPartnership={(id) => rejectPartnership(id)}
                      refreshNotifications={refreshNotifications}
                      className="notifications-page__item"
                    />
                  ))}
                </InfiniteScroll>
              )}
            </>
          )}
        </div>
      </div>

      <MobileMenu
        isOpen={showMenu}
        contentLabel={translate(
          "Настройка уведомлений",
          "notifications.settings",
        )}
        onRequestClose={() => toggleMenu(false)}
      >
        <Formik
          onSubmit={() => null}
          enableReinitialize
          initialValues={{
            discount_notifications: !!(
              settings && settings.discount_notifications
            ),
            organization_notifications: !!(
              settings && settings.organization_notifications
            ),
            product_notifications: !!(
              settings && settings.product_notifications
            ),
            private_notifications: !!(
              settings && settings.private_notifications
            ),
            // delivery_notifications: !!(
            //   settings && settings.delivery_notifications
            // ),
            // rental_notifications: !!(settings && settings.rental_notifications),
          }}
        >
          {({ values, handleSubmit, setFieldValue }) => {
            const updateSettings = async (e) => {
              const name = e.target.name;
              const value = !values[name];

              // сразу обновляем UI
              setFieldValue(name, value);

              try {
                const res = await updateNotificationSettings({
                  ...values,
                  [name]: value,
                });

                // если сервер вернул обновлённые данные — синхронизируем
                if (res) {
                  Object.keys(res).forEach((key) => {
                    if (values.hasOwnProperty(key)) {
                      setFieldValue(key, res[key]);
                    }
                  });
                }
              } catch (e) {
                // если ошибка — откатываем обратно
                setFieldValue(name, !value);
              }
            };

            return (
              <form
                className="notifications-page__menu-list"
                onSubmit={handleSubmit}
              >
                <RowToggle
                  label={translate(
                    "Уведомления о скидках",
                    "notifications.menu.discount",
                  )}
                  name="discount_notifications"
                  checked={values.discount_notifications}
                  onChange={updateSettings}
                />
                <RowToggle
                  label={translate(
                    "Уведомления личные",
                    "notifications.menu.personal",
                  )}
                  name="organization_notifications"
                  checked={values.organization_notifications}
                  onChange={updateSettings}
                />
                <RowToggle
                  label={translate(
                    "Уведомления о товарах",
                    "notifications.menu.products",
                  )}
                  name="product_notifications"
                  checked={values.product_notifications}
                  onChange={updateSettings}
                />
                <RowToggle
                  label={translate(
                    "Системные уведомления",
                    "notifications.menu.system",
                  )}
                  name="private_notifications"
                  checked={values.private_notifications}
                  onChange={updateSettings}
                />
                {/* <RowToggle
                  label={translate(
                    "Уведомления о доставке",
                    "notifications.menu.aboutDelivery",
                  )}
                  name="delivery_notifications"
                  checked={values.delivery_notifications}
                  onChange={updateSettings}
                />
                <RowToggle
                  label={translate(
                    "Уведомления об аренде",
                    "notifications.menu.aboutRent",
                  )}
                  name="rental_notifications"
                  checked={values.rental_notifications}
                  onChange={updateSettings}
                /> */}
              </form>
            );
          }}
        </Formik>
      </MobileMenu>
    </div>
  );
};

const mapStateToProps = (state) => ({
  notifications: state.notificationStore.notifications,
});

const mapDispatchToProps = (dispatch) => ({
  getNotifications: (params, isNext) =>
    dispatch(getNotifications(params, isNext)),
  setNotificationsAsRead: () => dispatch(setNotificationsAsRead()),
  rejectPartnership: (id) => dispatch(rejectPartnership(id)),
  acceptPartnership: (id) => dispatch(acceptPartnership(id)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withScroll(NotificationsPage));
