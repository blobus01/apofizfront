import React, { useRef, useState, useEffect, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import MobileTopHeader from "../../components/MobileTopHeader";
import Preloader from "../../components/Preloader";
import Comment from "../../components/Comment";
import ReplyComment from "../../components/ReplyComment";
import CommentForm from "../../components/Forms/CommentForm";
import classNames from "classnames";
import { EditIcon, ReplyIcon } from "@components/Comment/icons";
import MobileMenu from "@components/MobileMenu";
import RowButton, { ROW_BUTTON_TYPES } from "@ui/RowButton";
import ThemeMenu from "@pages/CommentsPage/ThemeMenu";
import COMMENT_THEMES from "@pages/CommentsPage/themes";
import BlockedUsersIcon from "@ui/Icons/BlockedUsersIcon";
import SelectThemeIcon from "@ui/Icons/SelectThemeIcon";
import { useHistory, useRouteMatch } from "react-router-dom";
import "../CommentsPage/index.scss";
import theme from "./theme-chat.jpg";
import Avatar from "@ui/Avatar";
import api from "@/axios-api";
import { useDispatch, useSelector } from "react-redux";
import useChatSocket from "@pages/CommentsPage/useChatSocket";
import { messengerLikeMessage } from "@store/services/messengerServices";
import Notify from "../../components/Notification";

import "./index.scss";
import { translate } from "@locales/locales";
import useDialog from "@components/UI/Dialog/useDialog";
import { setViews } from "@store/actions/commonActions";
import { VIEW_TYPES } from "@components/GlobalLayer";
import { MenuDotsIcon, ReadTickIcon } from "@pages/MessengerPage/icons";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { getApiURL } from "config";

import axios from "axios-api";
import Popup from "reactjs-popup";
import { LeavegroupIcon } from "./icons";
import SelectFoldersView from "@components/SelectFoldersView/SelectFoldersView";

const MENUS = {
  main: "main",
  themes: "themes",
};

function MessengerChatPage({
  userId: isDesctopUserId,
  setSelectedChatId,
  fetchChats,
  fetchFolders,
  selectedChatType,
  organizationId: organization_Id,
  setIsDeletingChatCheck,
  isOrgMessenger,
  setChatFolders,
  setChats,
  darkTheme,
}) {
  const match = useRouteMatch();
  const history = useHistory();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [openedMenu, setOpenedMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScroll, setIsScroll] = useState(false);
  const [replyCurrentComment, setReplyCurrentComment] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [isCommentsDisabled, setIsCommentsDisabled] = useState(false);
  const [isTogglingComments, setIsTogglingComments] = useState(false);
  const [canComment, setCanComment] = useState(true);
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    hasMore: false,
  });
  const [chat, setChat] = useState(null);
  const [organizationInfo, setOrganizationInfo] = useState(null);
  const [wallpapers, setWallpapers] = useState(null);
  const [chatMembers, setChatMembers] = useState([]);
  const [error, setError] = useState("");
  const commentInput = useRef(null);
  const messagesPaddingBottom = 190;
  const [chatScrollableTarget, setChatScrollTarget] = useState(null);
  const user = useSelector((state) => state.userStore.user);
  const [chatId, setChatId] = useState(null);
  const isMounted = useRef(true);
  const [isTogglingBlock, setIsTogglingBlock] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [currentLikeMessageId, setCurrentLikeMessageId] = useState(null);
  const { confirm } = useDialog();
  const dispatch = useDispatch();
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isExitingGroup, setIsExitingGroup] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [pendingMessages, setPendingMessages] = useState(new Map()); // Для отслеживания отправляемых сообщений
  const [openedMenuPopup, setOpenedMenuPopup] = useState(null);

  const [addFolderOpen, setAddFolderOpen] = useState(false);

  const location = useLocation();
  const paramsLocation = new URLSearchParams(location.search);
  const chatType = paramsLocation.get("type") || selectedChatType || "private";
  const organizationId =
    paramsLocation.get("organization_id") || organization_Id;
  // Получаем user_id собеседника из URL
  const userId =
    match.params.id && !isOrgMessenger
      ? Number(match.params.id)
      : isDesctopUserId
        ? isDesctopUserId
        : null;

  // Подключаем WebSocket только если есть chatId
  const chatSocket = useChatSocket(chatId, {
    connect: !!chatId,
    isMessenger: true,
  });

  // Получаем чат и сообщения
  const fetchChatAndMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (organizationId) {
        // Чат с организацией
        const orgRes = await api.get(
          `/messenger/chats/organization/${organizationId}/`,
        );
        setOrganizationInfo(orgRes.data);
        setChatId(orgRes.data.chat_id);
        // Получаем сообщения чата

        const messagesRes = await api.get(
          `/messenger/chats/${isOrgMessenger ? userId : orgRes.data.chat_id}/`,
        );
        if (userId || orgRes.data.chat_id) {
          api
            .post(
              `/messenger/chats/${
                isOrgMessenger ? userId : orgRes.data.chat_id
              }/mark-as-read/`,
            )
            .catch(() => {});
        }
        setMessages(messagesRes.data.list || []);
        setWallpapers(messagesRes.data.wallpapers || null);
        setChat(messagesRes.data.chat);
        setChatMembers(messagesRes.data.chat?.members);
        setParams((prev) => ({ ...prev, page: 1, hasMore: false }));
      } else if (!organizationId) {
        let isGroup = false;
        let groupChatId = null;
        setOrganizationInfo(null);
        try {
          const chatsRes = await api.get("/messenger/chats/");
          if (chatsRes.status === 200 && Array.isArray(chatsRes.data.list)) {
            const found = chatsRes.data.list.find(
              (c) => c.chat_type === "group" && c.id === userId,
            );
            if (found) {
              isGroup = true;
              groupChatId = found.id;
            }
          }
        } catch {}

        if (isGroup && groupChatId && chatType === "group") {
          try {
            const groupRes = await api.get(`/messenger/group/${groupChatId}/`);
            if (!groupRes || !groupRes.data || !groupRes.data.chat.id) {
              setError(
                translate(
                  "Ошибка получения группового чата",
                  "messenger.errorGroupChat",
                ),
              );
              setLoading(false);
              return;
            }

            setChat(groupRes.data.chat);
            setChatMembers(groupRes.data.chat.members || []);
            setChatId(groupRes.data.chat.id);
            setMessages(groupRes.data.list || []);
            setWallpapers(groupRes.data.wallpapers || null);
            setParams((prev) => ({ ...prev, page: 1, hasMore: false }));
          } catch (err) {
            setError(
              translate(
                "Ошибка загрузки группового чата",
                "messenger.errorLoadGroupChat",
              ),
            );
            setLoading(false);
            return;
          }
          setLoading(false);
          return;
        }
        // Private chat (old logic)
        const chatRes = await api.post("/messenger/chats/", {
          user_id: userId,
        });
        if (!chatRes || !chatRes.data || !chatRes.data.id) {
          setError(
            translate("Ошибка получения чата", "messenger.errorGetChat"),
          );
          setLoading(false);
          return;
        }
        setChat(chatRes.data);
        setChatMembers(chatRes.data.members || []);
        setChatId(chatRes.data.id);
        if (chatRes.data.id) {
          api
            .post(`/messenger/chats/${chatRes.data.id}/mark-as-read/`)
            .catch(() => {});
        }
        try {
          const chatId = chatRes.data.id;
          const messagesRes = await api.get(`/messenger/chats/${chatId}/`);
          setMessages(messagesRes.data.list || []);
          setWallpapers(messagesRes.data.wallpapers || null);
          setChat(messagesRes.data.chat || chatRes.data);
          setChatMembers(
            (messagesRes.data.chat && messagesRes.data.chat.members) ||
              chatRes.data.members ||
              [],
          );
          setParams((prev) => ({ ...prev, page: 1, hasMore: false }));
        } catch (err) {
          if (err.response) {
            setError(
              translate(
                "Ошибка загрузки сообщений чата",
                "messenger.errorLoadMessages",
              ),
            );
          } else {
            setError(
              translate(
                "Ошибка сети при загрузке сообщений",
                "messenger.errorNetworkMessages",
              ),
            );
          }
        }
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError("user_id обязателен");
        } else if (err.response.status === 403) {
          setError(
            translate(
              "Нельзя создать чат с самим собой",
              "messenger.cannotCreateSelfChat",
            ),
          );
        } else {
          setError(
            translate("Ошибка загрузки чата", "messenger.errorLoadChat"),
          );
        }
      } else {
        setError(translate("Ошибка сети", "messenger.errorNetwork"));
      }
    } finally {
      setLoading(false);
    }
  }, [userId, chatType, organizationId]);

  useEffect(() => {
    isMounted.current = true;
    fetchChatAndMessages();
    return () => {
      isMounted.current = false;
      // Очищаем pendingMessages при размонтировании
      if (pendingMessages.size > 0) {
        console.log(
          `Component unmounting with ${pendingMessages.size} pending messages`,
        );
      }
      setPendingMessages(new Map());
    };
  }, [fetchChatAndMessages]);

  useEffect(() => {
    if (!chatId) return;
    api.post(`/messenger/chats/${chatId}/mark-as-read/`).catch(() => {});
  }, [chatId]);

  // Получение новых сообщений через сокет
  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (!chatSocket || !chatSocket.isConnected) return;

    const handleMessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        // Проверяем, есть ли ошибка в сообщении
        if (msg.error || msg.status === "error" || msg.type === "error") {
          // Если это ошибка для временного сообщения, удаляем его
          const tempId = msg.temp_id || msg.tempId;
          if (tempId && pendingMessages.has(String(tempId))) {
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setPendingMessages((prev) => {
              const newMap = new Map(prev);
              newMap.delete(String(tempId));
              return newMap;
            });

            // Показываем конкретную ошибку или общую
            const errorMessage =
              msg.error_message ||
              msg.message ||
              msg.detail ||
              translate(
                "Ошибка отправки сообщения",
                "messenger.errorSendMessage",
              );
            Notify.error({
              text: errorMessage,
              duration: 5000,
            });
          }
          return;
        }

        setMessages((prev) => {
          if (msg.type === "update") {
            // Обновить существующее сообщение по id
            return prev.map((m) => {
              if (m.id === msg.id) {
                return { ...m, ...msg };
              }
              // Также обновляем временные сообщения, если они соответствуют
              if (
                typeof m.id === "string" &&
                m.id.startsWith("temp_") &&
                m.text === msg.text
              ) {
                return { ...m, ...msg, id: msg.id }; // Заменяем временный ID на реальный
              }
              return m;
            });
          }

          // Проверяем, есть ли это сообщение от текущего пользователя
          const isFromCurrentUser = msg.sender?.id === user?.id;

          if (isFromCurrentUser) {
            // Ищем временное сообщение с таким же текстом и родителем
            const tempMessageIndex = prev.findIndex(
              (m) =>
                typeof m.id === "string" &&
                m.id.startsWith("temp_") &&
                m.text === msg.text &&
                ((!m.parent && !msg.parent) || m.parent?.id === msg.parent?.id),
            );

            if (tempMessageIndex !== -1) {
              // Заменяем временное сообщение на реальное
              const newMessages = [...prev];
              newMessages[tempMessageIndex] = {
                ...msg,
                status: msg.status || "sent", // Устанавливаем статус "sent" если его нет
              };

              // Удаляем из pendingMessages
              setPendingMessages((prevPending) => {
                const newPending = new Map(prevPending);
                newPending.delete(newMessages[tempMessageIndex].id);
                return newPending;
              });

              return newMessages;
            }
          }

          // Также проверяем подтверждения отправки от сервера
          if (msg.type === "message_sent" || msg.type === "confirmation") {
            const tempId = msg.temp_id || msg.tempId;
            if (tempId && pendingMessages.has(String(tempId))) {
              // Обновляем статус временного сообщения на "sent"
              const updatedMessages = prev.map((m) =>
                String(m.id) === String(tempId) ? { ...m, status: "sent" } : m,
              );

              // Удаляем из pendingMessages
              setPendingMessages((prevPending) => {
                const newPending = new Map(prevPending);
                newPending.delete(String(tempId));
                return newPending;
              });

              return updatedMessages;
            }
          }

          // Не добавлять дубликаты
          if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
          return [msg, ...prev];
        });

        // Скроллим вниз при получении нового сообщения
        setTimeout(() => {
          const scrollContainer = document.getElementById("page-wrap");
          if (scrollContainer) {
            scrollContainer.scrollTo({
              top: scrollContainer.scrollHeight,
            });
          }
        }, 0);
      } catch (err) {
        // обработка ошибки парсинга
        console.error("Error parsing WebSocket message:", err);
      }
    };

    const handleError = (error) => {
      console.error("WebSocket error:", error);
      // При ошибке WebSocket удаляем все временные сообщения
      if (pendingMessages.size > 0) {
        const tempIds = Array.from(pendingMessages.keys()).map(String);
        setMessages((prev) =>
          prev.filter((msg) => !tempIds.includes(String(msg.id))),
        );
        setPendingMessages(new Map());
      }
    };

    chatSocket.onMessage(handleMessage);
    chatSocket.onError && chatSocket.onError(handleError);

    return () => {
      if (chatSocket && chatSocket.socket) {
        chatSocket.socket.onclose = (e) => {
          console.warn("WebSocket closed:", e);
          // При закрытии соединения также удаляем временные сообщения
          if (pendingMessages.size > 0) {
            const tempIds = Array.from(pendingMessages.keys()).map(String);
            setMessages((prev) =>
              prev.filter((msg) => !tempIds.includes(String(msg.id))),
            );
            setPendingMessages(new Map());
          }
        };
      }
      document.body.style.overflow = null;
      isMounted.current = false;
    };
  }, [chatSocket, user?.id, pendingMessages]);

  // Обработка отключения WebSocket - удаляем временные сообщения
  useEffect(() => {
    if (!chatSocket?.isConnected && pendingMessages.size > 0) {
      // Если WebSocket отключился и есть неотправленные сообщения
      const tempIds = Array.from(pendingMessages.keys()).map(String);
      setMessages((prev) =>
        prev.filter((msg) => !tempIds.includes(String(msg.id))),
      );
      setPendingMessages(new Map());
    }
  }, [chatSocket?.isConnected, pendingMessages.size]);

  // Определяем собеседника (не текущий пользователь)
  const otherUser =
    chatMembers.find((m) => m.id !== user?.id) || chatMembers[0] || null;

  // Темы (wallpapers)
  const themeObject =
    COMMENT_THEMES.find((t) => t.id === wallpapers?.theme_id) ?? null;

  let wrapperStyle;
  if (isDesctopUserId) {
    wrapperStyle = {
      backgroundImage: wallpapers
        ? themeObject
          ? `url(${themeObject.url}), url(${themeObject.bgUrl})`
          : `url(${wallpapers.svg_pattern}), url(${wallpapers.svg_background})`
        : `url(${theme})`,
      backgroundSize: "375px 812px, cover",
      backgroundRepeat: "repeat, no-repeat",
      backgroundPosition: "center",
    };
    if (wallpapers?.theme_type === "custom" && wallpapers?.theme_id === null) {
      wrapperStyle["backgroundImage"] = `url(${wallpapers.image?.large})`;
      wrapperStyle["backgroundSize"] = "cover";
      wrapperStyle["backgroundRepeat"] = "no-repeat";
      wrapperStyle["backgroundPosition"] = "center";
    }
  } else {
    wrapperStyle = {
      "--background-image": wallpapers
        ? themeObject
          ? `url(${themeObject.url}), url(${themeObject.bgUrl})`
          : `url(${wallpapers.svg_pattern}), url(${wallpapers.svg_background})`
        : `url(${theme})`,
      "--background-size": "375px 812px, cover",
      "--background-repeat": "repeat, no-repeat",
      "--background-position": "center",
    };
    if (wallpapers?.theme_type === "custom" && wallpapers?.theme_id === null) {
      wrapperStyle["--background-image"] = `url(${wallpapers.image?.large})`;
      wrapperStyle["--background-size"] = "cover";
      wrapperStyle["--background-repeat"] = "no-repeat";
      wrapperStyle["--background-position"] = "center";
    }
  }

  // UI-обработчики
  const feedUpdater = () => {
    if (document.activeElement === commentInput.current) {
      commentInput.current.blur();
    }
  };
  const getNext = async () => {
    setIsScroll(false);
    setParams((prev) => ({ ...prev, hasMore: false }));
  };
  const cancelReplyComment = () => setReplyCurrentComment(null);

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setTimeout(() => {
      const commentFormInput = document.querySelector(
        ".comment-form__field-message",
      );
      if (commentFormInput) commentFormInput.focus();
    }, 0);
  };

  const handleFormChange = (e) => {
    const contentEl = document.querySelector(
      ".post-comments-page__content-wrap",
    );
    if (e.target.value.length > 25) {
      contentEl.style.paddingBottom =
        messagesPaddingBottom + parseInt(e.target.style.height) + "px";
    } else {
      contentEl.style.paddingBottom = `${messagesPaddingBottom}px`;
    }
    setInputValue(e.target.value);
  };

  const handleUpdateMessage = async (messageId, text) => {
    try {
      // Если это временное сообщение, просто обновляем его локально
      if (typeof messageId === "string" && messageId.startsWith("temp_")) {
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg.id) === String(messageId)
              ? {
                  ...msg,
                  text,
                  updated_at: new Date().toISOString(),
                  is_updated: true,
                }
              : msg,
          ),
        );
        setEditingComment(null);
        setInputValue("");
        Notify.success({
          text: translate("Сообщение обновлено", "messenger.messageUpdated"),
        });
        return;
      }

      const response = await api.put(`/messenger/messages/${messageId}/`, {
        text: text,
      });

      if (response.status === 200) {
        // Не обновляем локально, ждём обновление через сокет
        setEditingComment(null);
        setInputValue("");
        Notify.success({
          text: translate("Сообщение обновлено", "messenger.messageUpdated"),
        });
      } else {
        Notify.error({
          text: translate(
            "Ошибка при обновлении сообщения",
            "messenger.errorUpdateMessage",
          ),
        });
      }
    } catch (error) {
      // Handle error appropriately
      console.error("Error updating message:", error);
      Notify.error({
        text: translate(
          "Ошибка при обновлении сообщения",
          "messenger.errorUpdateMessage",
        ),
      });
    }
  };

  const onSendMessage = async (values) => {
    if (editingComment) {
      await handleUpdateMessage(editingComment.id, values.text);
      return;
    }

    if (!chatSocket || !chatSocket.isConnected) {
      Notify.error({
        text: translate(
          "Нет подключения к серверу. Проверьте интернет-соединение и попробуйте позже.",
          "messenger.noConnection",
        ),
        duration: 5000,
      });
      return;
    }

    // Создаем временное сообщение с уникальным ID
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempMessage = {
      id: tempId,
      text: values.text,
      sender: user,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "sending",
      can_delete: true,
      is_message_liked: false,
      message_like_count: 0,
      is_updated: false,
      parent: replyCurrentComment
        ? {
            id: replyCurrentComment.id,
            user: replyCurrentComment.sender,
            organization: replyCurrentComment.organization,
            assistant: replyCurrentComment.assistant,
          }
        : null,
    };

    // Добавляем временное сообщение в начало списка
    setMessages((prev) => [tempMessage, ...prev]);

    // Добавляем в pendingMessages для отслеживания
    setPendingMessages(
      (prev) =>
        new Map(
          prev.set(String(tempId), {
            text: values.text,
            parent: replyCurrentComment?.id,
            timestamp: Date.now(),
          }),
        ),
    );

    const payload = {
      text: values.text,
      temp_id: tempId, // Передаем временный ID серверу
    };
    if (replyCurrentComment) {
      payload.parent = replyCurrentComment.id;
    }

    const isSent = chatSocket.sendMessage(payload);
    if (isSent) {
      setInputValue("");
      setReplyCurrentComment(null);
    } else {
      // Если отправка не удалась, удаляем временное сообщение
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setPendingMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(String(tempId));
        return newMap;
      });
      Notify.error({
        text: translate(
          "Ошибка отправки сообщения. Проверьте подключение.",
          "messenger.errorSendConnection",
        ),
      });
    }
  };

  // --- Логика блокировки/разблокировки чата ---
  const handleBlockChat = async () => {
    if (!chatId) return;
    setIsTogglingBlock(true);
    try {
      const resp = await api.post(`/messenger/chats/${chatId}/block/`);
      if (resp.status === 200 || resp.status === 201 || resp.status === 204) {
        setChat((prev) => ({ ...prev, is_blocked: true, blocked_by_me: true }));
        setOpenedMenu(null);
        fetchChats && fetchChats();
        Notify.success({
          text: translate("Чат заблокирован", "messenger.chatBlocked"),
        });
      } else {
        Notify.error({
          text: translate("Ошибка блокировки чата", "messenger.errorBlockChat"),
        });
      }
    } catch (err) {
      if (err.response) {
        alert(
          err.response.data.detail ||
            translate("Ошибка блокировки чата", "messenger.errorBlockChat"),
        );
      } else {
        alert(translate("Ошибка сети", "messenger.errorNetwork"));
      }
      Notify.error({
        text: translate("Ошибка блокировки чата", "messenger.errorBlockChat"),
      });
    } finally {
      setIsTogglingBlock(false);
    }
  };

  const handleUnblockChat = async () => {
    if (!chatId) return;
    setIsTogglingBlock(true);
    try {
      const resp = await api.delete(`/messenger/chats/${chatId}/block/`);
      if (resp.status === 204 || resp.status === 200) {
        setChat((prev) => ({
          ...prev,
          is_blocked: false,
          blocked_by_me: false,
        }));
        setOpenedMenu(null);
        fetchChats && fetchChats();
        Notify.success({
          text: translate("Чат разблокирован", "messenger.chatUnblocked"),
        });
      } else {
        Notify.error({
          text: translate(
            "Ошибка разблокировки чата",
            "messenger.errorUnblockChat",
          ),
        });
      }
    } catch (err) {
      if (err.response) {
        alert(
          err.response.data.detail ||
            translate(
              "Ошибка разблокировки чата",
              "messenger.errorUnblockChat",
            ),
        );
      } else {
        alert(translate("Ошибка сети", "messenger.errorNetwork"));
      }
      Notify.error({
        text: translate(
          "Ошибка разблокировки чата",
          "messenger.errorUnblockChat",
        ),
      });
    } finally {
      setIsTogglingBlock(false);
    }
  };

  const handleLikeMessage = async (id, isLiked) => {
    try {
      setLikeLoading(true);
      setCurrentLikeMessageId(id);

      // Если это временное сообщение, просто обновляем локально
      if (typeof id === "string" && id.startsWith("temp_")) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            String(msg.id) === String(id)
              ? {
                  ...msg,
                  is_message_liked: isLiked,
                  message_like_count: isLiked
                    ? (msg.message_like_count || 0) + 1
                    : Math.max((msg.message_like_count || 1) - 1, 0),
                }
              : msg,
          ),
        );
        return;
      }

      await messengerLikeMessage(id, isLiked);
    } catch (err) {
      // Можно добавить Notify.error
    } finally {
      setLikeLoading(false);
      setCurrentLikeMessageId(null);
    }
  };

  const handleSeeMembers = () => {
    dispatch(
      setViews({
        type: VIEW_TYPES.group_members,
        members: chatMembers,
        title: chat?.title,
        image: chat?.image,
        chatId: chatId,
        onCloseGroupMembers: () => {
          fetchChatAndMessages();
        },
      }),
    );
    setOpenedMenu(null);
  };

  const handleAddMembers = () => {
    dispatch(
      setViews({
        type: VIEW_TYPES.addMembersGroup,
        members: chatMembers,
        title: chat?.title,
        image: chat?.image,
        chatId: chatId,
        onCloseView: () => {
          fetchChatAndMessages();
        },
      }),
    );
  };

  // --- Новый useEffect для выделения и скролла к новому сообщению ---
  useEffect(() => {
    if (messages.length === 0) return;
    const scrollContainer = document.getElementById("page-wrap");
    const messageList = document.querySelector(
      ".post-comments-page__infinite-scroll",
    );

    if (messageList && messageList.children.length > 0) {
      const newMessage = messageList.children[0];
      newMessage.classList.add("post-comments-page__create-comment-success");
      // Скроллим вниз (или вверх, если инвертирован)
      if (scrollContainer) {
        console.log(scrollContainer.scrollTo);

        scrollContainer.scrollTo({ bottom: 0, behavior: "smooth" });
      }
      setTimeout(() => {
        newMessage.classList.remove(
          "post-comments-page__create-comment-success",
        );
      }, 800);
    }
  }, [messages[0]?.id]);

  const handleDeleteMessage = async (messageId) => {
    try {
      await confirm({
        title: translate("Удалить", "app.delete"),
        description: translate(
          "Вы действительно хотите удалить?",
          "dialog.removeComment",
        ),
        confirmTitle: translate("Да", "app.yes"),
        cancelTitle: translate("Нет", "app.no"),
      });

      // Если это временное сообщение, просто удаляем его локально
      if (typeof messageId === "string" && messageId.startsWith("temp_")) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => String(msg.id) !== String(messageId)),
        );
        setPendingMessages((prev) => {
          const newMap = new Map(prev);
          newMap.delete(String(messageId));
          return newMap;
        });
        Notify.success({
          text: translate("Сообщение удалено", "messenger.messageDeleted"),
        });
        return;
      }

      const resp = await api.delete(`/messenger/messages/${messageId}/`);
      if (resp && (resp.status === 204 || resp.status === 200)) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => String(msg.id) !== String(messageId)),
        );
        Notify.success({
          text: translate("Сообщение удалено", "messenger.messageDeleted"),
        });
      } else {
        Notify.error({
          text: translate(
            "Ошибка при удалении сообщения",
            "messenger.errorDeleteMessage",
          ),
        });
      }
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 204 || error.response.status === 200)
      ) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => String(msg.id) !== String(messageId)),
        );
        Notify.success({
          text: translate("Сообщение удалено", "messenger.messageDeleted"),
        });
      } else {
        console.error("Ошибка при удалении сообщения:", error);
        Notify.error({
          text: translate(
            "Ошибка при удалении сообщения",
            "messenger.errorDeleteMessage",
          ),
        });
      }
    }
  };

  const handleDeleteChat = async () => {
    if (!chatId) return;
    await confirm({
      title: translate("Удалить чат", "app.deleteChat"),
      description: translate(
        "Вы действительно хотите удалить этот чат?",
        "dialog.removeChat",
      ),
      confirmTitle: translate("Да", "app.yes"),
      cancelTitle: translate("Нет", "app.no"),
    });
    try {
      setIsDeletingChat(true);
      setIsDeletingChatCheck && setIsDeletingChatCheck(true);
      const resp = await api.delete(`/messenger/chats/${chatId}/`);
      if (resp && (resp.status === 204 || resp.status === 200)) {
        fetchFolders && fetchFolders();
        fetchChats && fetchChats();
        setSelectedChatId && setSelectedChatId(null);
        Notify.success({
          text: translate("Чат удалён", "messenger.chatDeleted"),
        });
        history.push("/messenger");
      } else {
        Notify.error({
          text: translate(
            "Ошибка при удалении чата",
            "messenger.errorDeleteChat",
          ),
        });
      }
    } catch (e) {
      if (
        e.response &&
        (e.response.status === 204 || e.response.status === 200)
      ) {
        fetchFolders && fetchFolders();
        fetchChats && fetchChats();
        setSelectedChatId && setSelectedChatId(null);
        Notify.success({
          text: translate("Чат удалён", "messenger.chatDeleted"),
        });
        history.push("/messenger");
      } else {
        Notify.error({
          text: translate(
            "Ошибка при удалении чата",
            "messenger.errorDeleteChat",
          ),
        });
      }
    } finally {
      setIsDeletingChat(false);
      setIsDeletingChatCheck && setIsDeletingChatCheck(false);
    }
  };

  const handleForwardMessage = (messageId) => {
    // Не позволяем пересылать временные сообщения
    if (typeof messageId === "string" && messageId.startsWith("temp_")) {
      Notify.error({
        text: translate(
          "Нельзя переслать отправляющееся сообщение",
          "messenger.cannotForwardSending",
        ),
      });
      return;
    }

    history.push({
      pathname: "/messenger/forward",
      state: { original_message_id: messageId },
    });
  };

  // --- Выйти из группы ---
  const handleExitGroup = async () => {
    if (!chatId) return;
    try {
      await confirm({
        title: translate("Выйти из группы", "app.exitGroup"),
        description: "Вы действительно хотите выйти из группы?",
        confirmTitle: translate("Да", "app.yes"),
        cancelTitle: translate("Нет", "app.no"),
      });
      setIsExitingGroup(true);
      const resp = await api.post(`/messenger/group/${chatId}/exit/`);
      if (resp.status === 200 || resp.status === 201) {
        Notify.success({
          text: translate("Вы вышли из группы", "messenger.exitedGroup"),
        });
        fetchChats && fetchChats();
        setSelectedChatId && setSelectedChatId(null);
        history.push("/messenger");
      } else {
        Notify.error({
          text: translate(
            "Ошибка при выходе из группы",
            "messenger.errorExitGroup",
          ),
        });
      }
    } catch (e) {
      // Если отмена confirm — ничего не делаем
      if (e && e.isConfirmed === false) return;
      Notify.error({
        text: translate(
          "Ошибка при выходе из группы",
          "messenger.errorExitGroup",
        ),
      });
    } finally {
      setIsExitingGroup(false);
    }
  };

  useEffect(() => {
    const fetchMassages = async () => {
      try {
        // const response = axios.post(`/comments/change/upload_theme_image/`);
        // console.log("BACKGROUNDs", response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMassages();
  }, []);

  const handleDeleteGroup = async () => {
    if (!chatId) return;
    try {
      await confirm({
        title: translate("Удалить группу", "app.deleteGroup"),
        description: "Вы действительно хотите удалить эту группу?",
        confirmTitle: translate("Да", "app.yes"),
        cancelTitle: translate("Нет", "app.no"),
      });
      setIsDeletingGroup(true);
      const resp = await api.delete(`/messenger/group/${chatId}/`);
      if (resp && (resp.status === 204 || resp.status === 200)) {
        Notify.success({
          text: translate("Группа удалена", "messenger.groupDeleted"),
        });
        fetchChats && fetchChats();
        setSelectedChatId && setSelectedChatId(null);
        history.push("/messenger");
      } else {
        Notify.error({
          text: translate(
            "Ошибка при удалении группы",
            "messenger.errorDeleteGroup",
          ),
        });
      }
    } catch (e) {
      if (
        e &&
        e.response &&
        (e.response.status === 204 || e.response.status === 200)
      ) {
        Notify.success({
          text: translate("Группа удалена", "messenger.groupDeleted"),
        });
        fetchChats && fetchChats();
        setSelectedChatId && setSelectedChatId(null);
        history.push("/messenger");
      } else if (e && e.isConfirmed === false) {
        return;
      } else {
        Notify.error({
          text: translate(
            "Ошибка при удалении группы",
            "messenger.errorDeleteGroup",
          ),
        });
      }
    } finally {
      setIsDeletingGroup(false);
    }
  };
  return (
    <div
      className={`post-comments-page messenger-chat-page ${
        isDesctopUserId ? "post-comments-page__controls__desctop" : ""
      }`}
    >
      <MobileTopHeader
        onBack={
          !isDesctopUserId
            ? () => {
                if (setSelectedChatId) {
                  history.push("/messenger");
                  setSelectedChatId(null);
                  return;
                }
                if (history.location.isPrevPathNotify) {
                  history.push({
                    pathname: `/p/${match.params.id}`,
                    isPrevPathNotify: history.location.isPrevPathNotify,
                  });
                  return;
                }
                history.goBack();
              }
            : null
        }
        style={{ background: darkTheme ? "#00193f" : "", marginBottom: '0px' }}
        darkTheme={darkTheme}
        renderRight={() => (
          <Popup
            position="bottom right"
            closeOnDocumentClick
            arrow={false}
            trigger={
              <span style={{ cursor: "pointer" }}>
                <MenuDotsIcon />
              </span>
            }
            contentStyle={{
              padding: 0,
              border: "none",
              background: "transparent",
            }}
          >
            <div className="chat-menu">
              {/* Блокировка / Разблокировка */}
              {chat?.is_blocked ? (
                chat?.blocked_by_me ? (
                  <button
                    className="chat-menu__item chat-menu__item--success"
                    onClick={handleUnblockChat}
                  >
                    <div className="chat-menu__left">
                      <EnabledCommentsIcon fill="#34A853" />
                      <span>
                        {chat?.chat_type === "group" && !organizationId
                          ? translate(
                              "Разблокировать группу",
                              "messenger.unblockGroup",
                            )
                          : translate(
                              "Разблокировать чат",
                              "messenger.unblockChat",
                            )}
                      </span>
                    </div>
                    {isTogglingBlock && <Preloader />}
                  </button>
                ) : (
                  <div className="chat-menu__blocked">
                    {translate(
                      "Чат заблокирован собеседником",
                      "messenger.chatBlockedByOther",
                    )}
                  </div>
                )
              ) : (
                <button
                  className="chat-menu__item chat-menu__item--danger"
                  onClick={handleBlockChat}
                >
                  <div className="chat-menu__left">
                    <DisableCommentsIcon fill="#D72C20" />
                    <span>
                      {chat?.chat_type === "group" && !organizationId
                        ? translate(
                            "Заблокировать группу",
                            "messenger.blockGroup",
                          )
                        : translate("Заблокировать чат", "messenger.blockChat")}
                    </span>
                  </div>
                  {isTogglingBlock && <Preloader />}
                </button>
              )}

              {/* Добавить в папку */}
              <button
                className="chat-menu__item"
                onClick={() => setAddFolderOpen(true)}
              >
                <div className="chat-menu__left">
                  <AddFolderIcon />
                  <span>
                    {translate("Добавить в папку", "messenger.addToFolder")}
                  </span>
                </div>
              </button>

              {/* Выбрать тему */}
              <button
                className="chat-menu__item"
                onClick={() => setOpenedMenu(MENUS.themes)}
              >
                <div className="chat-menu__left">
                  <SelectThemeIcon />
                  <span>
                    {translate("Выбрать тему", "messenger.selectTheme")}
                  </span>
                </div>
              </button>

              {/* Удалить */}
              <button
                className="chat-menu__item chat-menu__item--danger"
                onClick={
                  chat?.chat_type === "group" && !organizationId
                    ? handleDeleteGroup
                    : handleDeleteChat
                }
                disabled={isDeletingChat || isDeletingGroup}
              >
                <div className="chat-menu__left">
                  <DeleteIcon />
                  <span>
                    {chat?.chat_type === "group" && !organizationId
                      ? translate("Удалить группу", "messenger.deleteGroup")
                      : translate("Удалить чат", "messenger.deleteChat")}
                  </span>
                </div>
                {(isDeletingChat || isDeletingGroup) && <Preloader />}
              </button>

              {/* Выйти из группы */}
              {chat?.chat_type === "group" && !organizationId && (
                <button
                  className="chat-menu__item chat-menu__item--danger"
                  onClick={handleExitGroup}
                  disabled={isExitingGroup}
                >
                  <div className="chat-menu__left">
                    <LeavegroupIcon />
                    <span>
                      {translate("Выйти из группы", "messenger.exitGroup")}
                    </span>
                  </div>
                  {isExitingGroup && <Preloader />}
                </button>
              )}
            </div>
          </Popup>
        )}
        title={
          organizationInfo && !isOrgMessenger
            ? organizationInfo.title
            : chat?.chat_type === "group" && !isOrgMessenger
              ? chat.title
              : (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpenedMenu(MENUS.main)}
                  >
                    {otherUser?.full_name}
                  </span>
                ) || translate("Чат", "messenger.chat")
        }
        // setOpenedMenu(MENUS.main)
        renderLeft={() =>
          organizationInfo && !isOrgMessenger ? (
            <Avatar
              src={
                organizationInfo?.image?.medium ||
                organizationInfo?.image?.file ||
                ""
              }
              size={organizationId ? 37 : 35}
              alt={organizationInfo?.title}
              className="avatar__bordered orgAvatarHead"
            />
          ) : otherUser || chat?.image ? (
            <Avatar
              src={
                chat?.chat_type === "group" && !isOrgMessenger
                  ? chat?.image
                  : otherUser?.avatar?.medium || otherUser?.avatar?.file || ""
              }
              size={organizationId ? 37 : 35}
              alt={
                chat?.chat_type === "group" && !isOrgMessenger
                  ? chat?.title
                  : otherUser?.full_name
              }
              className="avatar__bordered"
            />
          ) : null
        }
        className="post-comments-page__top-header"
      />
      {isDesctopUserId && (
        <div className={classNames("post-comments-page__controls")}>
          <div
            className={classNames(
              "messenger-chat-page__form-wrap",
              (!canComment || isCommentsDisabled) &&
                "post-comments-page__form-wrap--disabled",
            )}
          >
            {canComment && !isCommentsDisabled ? (
              <>
                {replyCurrentComment && (
                  <ReplyComment
                    icon={
                      <ReplyIcon fill="#007AFF" style={{ marginLeft: 3 }} />
                    }
                    comment={replyCurrentComment}
                    onCancel={() => cancelReplyComment()}
                    style={{ marginLeft: 8 }}
                  />
                )}
                {editingComment && (
                  <ReplyComment
                    icon={<EditIcon fill="#007AFF" style={{ marginLeft: 3 }} />}
                    comment={{
                      text: editingComment.user
                        ? editingComment.user.full_name
                        : "",
                    }}
                    title={translate("Редактирование", "messenger.editing")}
                    onCancel={() => setEditingComment(null)}
                    style={{ marginLeft: 8 }}
                  />
                )}
                <CommentForm
                  isMenu
                  onSubmit={onSendMessage}
                  loading={loading}
                  replyComment={replyCurrentComment}
                  commentInput={commentInput}
                  onChange={handleFormChange}
                  onMenu={() => {}}
                  chat={chat}
                  className="post-comments-page__form"
                />
              </>
            ) : (
              <div className="post-comments-page__access-restricted">
                {isCommentsDisabled ? (
                  <DisableCommentsIcon
                    fill="#007AFF"
                    className="post-comments-page__access-restricted-icon post-comments-page__access-restricted-icon--blue"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="post-comments-page__access-restricted-icon"
                  >
                    <path
                      fill="#D72C20"
                      d="M19 14a1 1 0 00-1.22.72A7 7 0 0111 20H5.41l.64-.63a1 1 0 000-1.41 7 7 0 013.2-11.74 1.002 1.002 0 00-.5-1.94A9 9 0 004 18.62l-1.71 1.67a1 1 0 00-.21 1.09A1 1 0 003 22h8a9 9 0 008.72-6.75A.999.999 0 0019 14zm1.54-10.54a5 5 0 10-7.08 7.06 5 5 0 007.08-7.06zM14 7a3 3 0 013-3 3 3 0 011.29.3l-4 4A3.002 3.002 0 0114 7zm5.12 2.12a3.08 3.08 0 01-3.4.57l4-4A3 3 0 0120 7a3 3 0 01-.88 2.12z"
                    ></path>
                  </svg>
                )}
                {isCommentsDisabled
                  ? translate(
                      "Комментарии к данному сообщению выключены",
                      "messenger.commentsDisabled",
                    )
                  : translate(
                      "Доступ ограничен, Вы не можете оставлять комментарии",
                      "messenger.accessRestricted",
                    )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div
          className="messenger-chat-page__error"
          style={{ color: "red", padding: 16 }}
        >
          {error}
        </div>
      )}
      {params.page === 1 && loading && !isScroll ? (
        <Preloader style={{ marginTop: 16 }} />
      ) : (
        messages && (
          <div
            className={classNames(
              "container post-comments-page__wrap",
              "post-comments-page__wrap--inverse",
              isDesctopUserId ? "isDesctop" : null,
            )}
            id="page-wrap"
            ref={setChatScrollTarget}
            style={wrapperStyle}
          >
            <div
              className="post-comments-page__content-wrap"
              style={{ paddingBottom: messagesPaddingBottom }}
            >
              <div
                className="post-comments-page__content"
                onTouchMove={feedUpdater}
              >
                <InfiniteScroll
                  dataLength={Number(messages.length) || 0}
                  next={getNext}
                  hasMore={params.hasMore}
                  className="post-comments-page__infinite-scroll post-comments-page__infinite-scroll--inverse"
                  loader={null}
                  inverse={true}
                  scrollableTarget={"page-wrap"}
                >
                  {(() => {
                    // Создаём Map для быстрого поиска сообщений по id
                    const msgMap = new Map();
                    messages.forEach((m) => msgMap.set(m.id, m));
                    return messages.map((msg) => {
                      let parent = msg.parent;
                      if (parent && parent.id) {
                        const parentMsg = msgMap.get(parent.id);
                        if (parentMsg) {
                          parent = {
                            ...parent,
                            user: parentMsg.sender,
                            organization: parentMsg.organization,
                            assistant: parentMsg.assistant,
                          };
                        }
                      }
                      // Преобразуем структуру сообщения под компонент Comment
                      const comment = {
                        id: msg.id,
                        user: msg.sender,
                        text: msg.text,
                        can_delete: msg.can_delete,
                        is_blocked: false,
                        status: msg.status,
                        updated_at: msg.updated_at,
                        created_at: msg.created_at,
                        sender: msg.sender,
                        currentUser: user,
                        is_message_liked: msg.is_message_liked,
                        ...(chat?.chat_type === "group" && {
                          message_like_count: msg.message_like_count,
                        }),
                        is_updated: msg.is_updated,
                        parent: parent,
                        forwarded: msg.forwarded,
                      };

                      const userID = comment.user?.id;
                      const isMyMessage = userID === user?.id;
                      return (
                        <Comment
                          key={comment.id}
                          comment={comment}
                          disabled={!canComment || isCommentsDisabled}
                          onEdit={
                            userID === user?.id &&
                            comment.can_delete &&
                            (() => {
                              // Не позволяем редактировать временные сообщения
                              if (
                                typeof comment.id === "string" &&
                                comment.id.startsWith("temp_")
                              ) {
                                Notify.error({
                                  text: translate(
                                    "Нельзя редактировать отправляющееся сообщение",
                                    "messenger.cannotEditSending",
                                  ),
                                });
                                return;
                              }
                              handleEditComment(comment);
                            })
                          }
                          onReply={() => {
                            // Не позволяем отвечать на временные сообщения
                            if (
                              typeof comment.id === "string" &&
                              comment.id.startsWith("temp_")
                            ) {
                              Notify.error({
                                text: translate(
                                  "Нельзя ответить на отправляющееся сообщение",
                                  "messenger.cannotReplySending",
                                ),
                              });
                              return;
                            }
                            setReplyCurrentComment(comment);
                          }}
                          onForward={() => handleForwardMessage(comment.id)}
                          onCopy={true}
                          onLiked={true}
                          onDelete={
                            userID === user?.id &&
                            comment.can_delete &&
                            (() => handleDeleteMessage(comment.id))
                          }
                          className={`post-comments-page__comment ${
                            isMyMessage ? "comment--right" : "comment--left"
                          }`}
                          handleLikeMessage={handleLikeMessage}
                          likeLoading={likeLoading}
                          currentLikeMessageId={currentLikeMessageId}
                          isDesctop={isDesctopUserId}
                        />
                      );
                    });
                  })()}
                  {isScroll && loading && <Preloader />}
                </InfiniteScroll>
              </div>
            </div>
            {!isDesctopUserId && (
              <div className={classNames("post-comments-page__controls")}>
                <div
                  className={classNames(
                    "post-comments-page__form-wrap container",
                    (!canComment || isCommentsDisabled) &&
                      "post-comments-page__form-wrap--disabled",
                  )}
                >
                  {canComment && !isCommentsDisabled ? (
                    <>
                      {replyCurrentComment && (
                        <ReplyComment
                          icon={
                            <ReplyIcon
                              fill="#007AFF"
                              style={{ marginLeft: 3 }}
                            />
                          }
                          comment={replyCurrentComment}
                          onCancel={() => cancelReplyComment()}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                      {editingComment && (
                        <ReplyComment
                          icon={
                            <EditIcon
                              fill="#007AFF"
                              style={{ marginLeft: 3 }}
                            />
                          }
                          comment={{
                            text: editingComment.user
                              ? editingComment.user.full_name
                              : "",
                          }}
                          title={translate(
                            "Редактирование",
                            "messenger.editing",
                          )}
                          onCancel={() => setEditingComment(null)}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                      <CommentForm
                        isMenu
                        onSubmit={onSendMessage}
                        loading={loading}
                        replyComment={replyCurrentComment}
                        commentInput={commentInput}
                        onChange={handleFormChange}
                        onMenu={() => {}}
                        chat={chat}
                        className="post-comments-page__form"
                      />
                    </>
                  ) : (
                    <div className="post-comments-page__access-restricted">
                      {isCommentsDisabled ? (
                        <DisableCommentsIcon
                          fill="#007AFF"
                          className="post-comments-page__access-restricted-icon post-comments-page__access-restricted-icon--blue"
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="post-comments-page__access-restricted-icon"
                        >
                          <path
                            fill="#D72C20"
                            d="M19 14a1 1 0 00-1.22.72A7 7 0 0111 20H5.41l.64-.63a1 1 0 000-1.41 7 7 0 013.2-11.74 1.002 1.002 0 00-.5-1.94A9 9 0 004 18.62l-1.71 1.67a1 1 0 00-.21 1.09A1 1 0 003 22h8a9 9 0 008.72-6.75A.999.999 0 0019 14zm1.54-10.54a5 5 0 10-7.08 7.06 5 5 0 007.08-7.06zM14 7a3 3 0 013-3 3 3 0 011.29.3l-4 4A3.002 3.002 0 0114 7zm5.12 2.12a3.08 3.08 0 01-3.4.57l4-4A3 3 0 0120 7a3 3 0 01-.88 2.12z"
                          ></path>
                        </svg>
                      )}
                      {isCommentsDisabled
                        ? translate(
                            "Комментарии к данному сообщению выключены",
                            "messenger.commentsDisabled",
                          )
                        : translate(
                            "Доступ ограничен, Вы не можете оставлять комментарии",
                            "messenger.accessRestricted",
                          )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {chat && chat.chat_type === "group" && !organizationId && (
              <div className="group__title">
                <p>
                  <ReadTickIcon />
                  {translate(
                    "Создана новая группа",
                    "messenger.newGroupCreated",
                  )}
                </p>
                {chatMembers?.find((m) => m.id === user?.id)?.role ===
                  "admin" && (
                  <button onClick={handleAddMembers}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 11C13.5933 11 14.1734 10.8241 14.6667 10.4944C15.1601 10.1648 15.5446 9.69623 15.7716 9.14805C15.9987 8.59987 16.0581 7.99667 15.9424 7.41473C15.8266 6.83279 15.5409 6.29824 15.1213 5.87868C14.7018 5.45912 14.1672 5.1734 13.5853 5.05765C13.0033 4.94189 12.4001 5.0013 11.8519 5.22836C11.3038 5.45543 10.8352 5.83994 10.5056 6.33329C10.1759 6.82664 10 7.40666 10 8C10 8.79565 10.3161 9.55871 10.8787 10.1213C11.4413 10.6839 12.2044 11 13 11ZM13 7C13.1978 7 13.3911 7.05865 13.5556 7.16853C13.72 7.27841 13.8482 7.43459 13.9239 7.61732C13.9996 7.80004 14.0194 8.00111 13.9808 8.19509C13.9422 8.38907 13.847 8.56726 13.7071 8.70711C13.5673 8.84696 13.3891 8.9422 13.1951 8.98079C13.0011 9.01937 12.8 8.99957 12.6173 8.92388C12.4346 8.84819 12.2784 8.72002 12.1685 8.55557C12.0586 8.39112 12 8.19778 12 8C12 7.73478 12.1054 7.48043 12.2929 7.29289C12.4804 7.10536 12.7348 7 13 7ZM17.11 10.86C17.6951 10.021 18.0087 9.02282 18.0087 8C18.0087 6.97718 17.6951 5.97897 17.11 5.14C17.3976 5.04726 17.6979 5.00002 18 5C18.7956 5 19.5587 5.31607 20.1213 5.87868C20.6839 6.44129 21 7.20435 21 8C21 8.79565 20.6839 9.55871 20.1213 10.1213C19.5587 10.6839 18.7956 11 18 11C17.6979 11 17.3976 10.9527 17.11 10.86ZM13 13C7 13 7 17 7 17V19H19V17C19 17 19 13 13 13ZM9 17C9 16.71 9.32 15 13 15C16.5 15 16.94 16.56 17 17M24 17V19H21V17C20.9766 16.2566 20.8054 15.5254 20.4964 14.8489C20.1873 14.1724 19.7466 13.5643 19.2 13.06C24 13.55 24 17 24 17ZM8 12H5V15H3V12H0V10H3V7H5V10H8V12Z"
                        fill="#1270EC"
                      />
                    </svg>
                    {translate("Добавить участников", "messenger.addMembers")}
                  </button>
                )}
              </div>
            )}

            {addFolderOpen && (
              <div className="bottom-sheet">
                <div
                  className="bottom-sheet__overlay"
                  onClick={() => setAddFolderOpen(false)}
                />

                {console.log(fetchChats, "fetchChats")}

                <div className="bottom-sheet__content">
                  <SelectFoldersView
                    chatId={chatId}
                    fetchChats={fetchChats}
                    setChats={setChats}
                    fetchFolders={fetchFolders}
                    setChatFolders={setChatFolders}
                    onClose={() => setAddFolderOpen(false)}
                  />
                </div>
              </div>
            )}

            <MobileMenu
              isOpen={openedMenu === MENUS.main}
              contentLabel={translate("Настройки", "app.settings")}
              onRequestClose={() => setOpenedMenu(null)}
              containerSelector={
                isDesctopUserId ? ".messenger-chat-page" : undefined
              }
              overlayClassName="my-custom-modal-overlay"
            >
              {(otherUser ||
                (chat && (chat.chat_type === "group" || chat?.types))) && (
                <div className="messenger-chat-menu__user">
                  <Avatar
                    src={
                      organizationInfo && !isOrgMessenger
                        ? organizationInfo.image.file
                        : chat?.types && !isOrgMessenger
                          ? chat.image?.medium || chat.image?.file || ""
                          : (chat.image && !isOrgMessenger) ||
                            otherUser?.avatar?.medium ||
                            otherUser?.avatar?.file ||
                            ""
                    }
                    size={60}
                    alt={
                      organizationInfo?.title ||
                      chat.title ||
                      otherUser?.full_name
                    }
                    style={
                      organizationInfo && !isOrgMessenger
                        ? { borderRadius: "12px" }
                        : null
                    }
                    className={`avatar__bordered ${
                      chat?.types ? "orgAvatarHead" : ""
                    }`}
                  />

                  <div className="messenger-chat-menu__content">
                    <div className="messenger-chat-menu__user-name">
                      {(organizationInfo?.title && !isOrgMessenger) ||
                        (chat.title && !isOrgMessenger) ||
                        otherUser?.full_name}
                    </div>

                    {organizationInfo && !isOrgMessenger && (
                      <div className="messenger-chat-menu__user-nick">
                        {organizationInfo.types[0]?.title}
                      </div>
                    )}

                    {otherUser?.username && (
                      <div className="messenger-chat-menu__user-nick">
                        @{otherUser.username}
                      </div>
                    )}

                    {!organizationInfo && otherUser?.id && (
                      <div className="messenger-chat-menu__user-uid">
                        UID {otherUser.id}
                      </div>
                    )}

                    {otherUser?.phone_number && (
                      <div className="messenger-chat-menu__contact">
                        <span>{otherUser.phone_number}</span>
                        <button
                          className="messenger-chat-menu__copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              otherUser.phone_number,
                            );
                          }}
                        >
                          📋
                        </button>
                      </div>
                    )}

                    {chat?.chat_type === "group" && !organizationId && (
                      <button
                        className="messenger-chat-menu__see-members"
                        onClick={handleSeeMembers}
                      >
                        {translate(
                          "Посмотреть участников",
                          "messenger.seeMembers",
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </MobileMenu>
          </div>
        )
      )}

      <ThemeMenu
        isOpen={openedMenu === MENUS.themes}
        onRequestClose={() => setOpenedMenu(null)}
        fetchChatAndMessages={fetchChatAndMessages}
        containerSelector={isDesctopUserId ? ".messenger-chat-page" : undefined}
      />
    </div>
  );
}

export const DisableCommentsIcon = ({ fill, ...rest }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...rest}
    >
      <path
        fill={fill ?? "#000"}
        d="M19 14a1 1 0 00-1.22.72A7 7 0 0111 20H5.41l.64-.63a1 1 0 000-1.41 7 7 0 013.2-11.74 1.002 1.002 0 00-.5-1.94A9 9 0 004 18.62l-1.71 1.67a1 1 0 00-.21 1.09A1 1 0 003 22h8a9 9 0 008.72-6.75A.999.999 0 0019 14zm1.54-10.54a5 5 0 10-7.08 7.06 5 5 0 007.08-7.06zM14 7a3 3 0 013-3 3 3 0 011.29.3l-4 4A3.002 3.002 0 0114 7zm5.12 2.12a3.08 3.08 0 01-3.4.57l4-4A3 3 0 0120 7a3 3 0 01-.88 2.12z"
      ></path>
    </svg>
  );
};

export const EnabledCommentsIcon = ({ fill, ...props }) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13.29 7.1305C13.1963 7.22347 13.1219 7.33407 13.0711 7.45593C13.0203 7.57779 12.9942 7.70849 12.9942 7.8405C12.9942 7.97252 13.0203 8.10322 13.0711 8.22508C13.1219 8.34694 13.1963 8.45754 13.29 8.5505L15.21 10.4705C15.303 10.5642 15.4136 10.6386 15.5354 10.6894C15.6573 10.7402 15.788 10.7663 15.92 10.7663C16.052 10.7663 16.1827 10.7402 16.3046 10.6894C16.4264 10.6386 16.537 10.5642 16.63 10.4705L20.71 6.3905C20.8194 6.30165 20.9087 6.19069 20.9722 6.0649C21.0356 5.93911 21.0718 5.80133 21.0783 5.66058C21.0848 5.51984 21.0615 5.3793 21.0099 5.24819C20.9583 5.11709 20.8796 4.99836 20.7789 4.8998C20.6782 4.80124 20.5578 4.72507 20.4256 4.67628C20.2935 4.6275 20.1525 4.60719 20.0119 4.6167C19.8713 4.6262 19.7343 4.66531 19.6099 4.73146C19.4855 4.7976 19.3765 4.88928 19.29 5.0005L15.92 8.3505L14.71 7.1305C14.617 7.03678 14.5064 6.96238 14.3846 6.91161C14.2627 6.86084 14.132 6.83471 14 6.83471C13.868 6.83471 13.7373 6.86084 13.6154 6.91161C13.4936 6.96238 13.383 7.03678 13.29 7.1305ZM19.91 10.6405C19.6463 10.6634 19.4023 10.7899 19.2318 10.9924C19.0612 11.1949 18.9778 11.4567 19 11.7205C19.005 11.8138 19.005 11.9072 19 12.0005C19 13.857 18.2625 15.6375 16.9498 16.9503C15.637 18.263 13.8565 19.0005 12 19.0005H6.41L7.05 18.3705C7.23626 18.1831 7.3408 17.9297 7.3408 17.6655C7.3408 17.4013 7.23626 17.1479 7.05 16.9605C6.15566 16.071 5.51828 14.9564 5.20526 13.7344C4.89224 12.5125 4.91521 11.2287 5.27174 10.0188C5.62827 8.80885 6.3051 7.71773 7.23069 6.86079C8.15628 6.00384 9.29623 5.41292 10.53 5.1505C11.4542 4.9657 12.4058 4.9657 13.33 5.1505C13.4613 5.17677 13.5965 5.17691 13.7279 5.15092C13.8593 5.12493 13.9843 5.07332 14.0957 4.99903C14.2071 4.92474 14.3028 4.82924 14.3773 4.71796C14.4519 4.60669 14.5037 4.48183 14.53 4.3505C14.5563 4.21918 14.5564 4.08397 14.5304 3.9526C14.5044 3.82122 14.4528 3.69625 14.3785 3.58482C14.3042 3.47339 14.2087 3.37768 14.0975 3.30316C13.9862 3.22864 13.8613 3.17677 13.73 3.1505C12.5386 2.91077 11.3114 2.91077 10.12 3.1505C8.10119 3.59117 6.29398 4.70942 4.99871 6.31941C3.70344 7.9294 2.99813 9.93416 3 12.0005C3.0084 14.0467 3.71384 16.029 5 17.6205L3.29 19.2905C3.15125 19.4311 3.05725 19.6097 3.01988 19.8037C2.9825 19.9977 3.00342 20.1984 3.08 20.3805C3.15502 20.5631 3.28242 20.7194 3.44614 20.8298C3.60986 20.9401 3.80258 20.9995 4 21.0005H12C14.387 21.0005 16.6761 20.0523 18.364 18.3645C20.0518 16.6766 21 14.3875 21 12.0005V11.5605C20.99 11.4281 20.9536 11.299 20.8932 11.1808C20.8327 11.0626 20.7493 10.9576 20.6479 10.872C20.5464 10.7864 20.4289 10.7218 20.3022 10.682C20.1755 10.6423 20.0422 10.6282 19.91 10.6405Z"
      fill={fill ?? "black"}
    />
  </svg>
);

export default MessengerChatPage;

const AddFolderIcon = ({ fill, ...props }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 14H12M12 14H14M12 14V16M12 14V12"
      stroke="#2C2D2E"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M2 6.95C2 6.067 2 5.626 2.07 5.258C2.21922 4.46784 2.60314 3.741 3.17165 3.17231C3.74017 2.60361 4.46689 2.21947 5.257 2.07C5.626 2 6.068 2 6.95 2C7.336 2 7.53 2 7.716 2.017C8.51705 2.09223 9.27679 2.40728 9.896 2.921C10.04 3.04 10.176 3.176 10.45 3.45L11 4C11.816 4.816 12.224 5.224 12.712 5.495C12.9802 5.64449 13.2648 5.7626 13.56 5.847C14.098 6 14.675 6 15.828 6H16.202C18.834 6 20.151 6 21.006 6.77C21.0853 6.84 21.16 6.91467 21.23 6.994C22 7.849 22 9.166 22 11.798V14C22 17.771 22 19.657 20.828 20.828C19.656 21.999 17.771 22 14 22H10C6.229 22 4.343 22 3.172 20.828C2.001 19.656 2 17.771 2 14V6.95Z"
      stroke="#2C2D2E"
      strokeWidth="1.5"
    />
  </svg>
);

export const DeleteIcon = ({ fill, ...props }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.8573 8.57129V17.5713C18.8573 19.7015 17.1304 21.4284 15.0001 21.4284H9.00014C6.8699 21.4284 5.143 19.7015 5.143 17.5713V8.57129H4.53459C3.92383 8.57129 3.42871 8.07617 3.42871 7.46541V6.21415C3.42871 4.91233 4.48404 3.857 5.78585 3.857H7.20113C7.65002 3.07993 8.4885 2.57129 9.42871 2.57129H14.5716C15.5118 2.57129 16.3503 3.07993 16.7991 3.857H18.2144C19.5162 3.857 20.5716 4.91233 20.5716 6.21415V7.46541C20.5716 8.07617 20.0764 8.57129 19.4657 8.57129H18.8573ZM18.0001 6.857H18.8573V6.21415C18.8573 5.85911 18.5695 5.57129 18.2144 5.57129H16.2318C15.8407 5.57129 15.4992 5.30655 15.4018 4.9278C15.3053 4.55309 14.9649 4.28557 14.5716 4.28557H9.42871C9.0354 4.28557 8.69496 4.55309 8.59852 4.9278C8.50104 5.30655 8.15953 5.57129 7.76843 5.57129H5.78585C5.43081 5.57129 5.143 5.85911 5.143 6.21415V6.857H6.00014H18.0001ZM6.85728 8.57129V17.5713C6.85728 18.7548 7.81667 19.7141 9.00014 19.7141H15.0001C16.1836 19.7141 17.143 18.7548 17.143 17.5713V8.57129H6.85728Z"
      fill="#D72C20"
    />
  </svg>
);
