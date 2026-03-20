import { useState, useRef, useEffect, useMemo } from "react";
import {
  AddNewChatIcon,
  BellIcon,
  BlockChoice,
  DeleteChoice,
  FolderEditIcon,
  FolderIcon,
  GroupIcon,
  LookChoice,
  MenuDotsIcon,
  MessengerIcon,
  ReadTickIcon,
  SearchIcon,
  SelectedFilter,
  SentTickIcon,
  UnBlock,
} from "./icons";
import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import { setGlobalMenu } from "@store/actions/commonActions";
import { MENU_TYPES } from "@components/GlobalMenu";
import { translate } from "@locales/locales";
import {
  Link,
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import FolderSettingsModal from "./FolderSettingsModal";
import Lottie from "lottie-react";
import addFolderAnimation from "./Add_folder.json";
import api from "@/axios-api";
import Preloader from "../../components/Preloader";
import Notify from "../../components/Notification";
import useDialog from "@components/UI/Dialog/useDialog";
import useChatSocket from "@pages/CommentsPage/useChatSocket";
import Popup from "reactjs-popup";
import { ReplyIcon, SoundEnd } from "@components/Comment/icons";
import MessengerChatPage, { DeleteIcon } from "@pages/MessengerChatPage";
import { useMediaQuery } from "react-responsive";
import { AddIcon, BackArrow, DoneIcon } from "@components/UI/Icons";
import defaultGroupAvatar from "./defaultGroupAvatar.png";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import { setDarkThemeRT } from "@store/actions/themeDark";
import SortChatMenu from "@components/Menus/SortChatMenu";
import MobileMenu from "@components/MobileMenu";
import axios from "axios-api";
import { EditIcon } from "@pages/MessengerGroupPage";
import PopupContentEdit from "@components/PopupContentEdit/PopupContentEdit";
import SelectFoldersView from "@components/SelectFoldersView/SelectFoldersView";
import { setSearchState } from "@store/actions/userActions";

const SYSTEM_FOLDERS = [
  {
    id: "groups",
    title: translate("Группы", "app.groups"),
    isSystem: true,
    chats: [],
  },
  {
    id: "orgs",
    title: translate("Организации", "app.organizations"),
    isSystem: true,
    chats: [],
  },
];

const MessengerPage = () => {
  const [activeTab, setActiveTab] = useState("chats");
  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [chatFolders, setChatFolders] = useState([]);
  const [editingFolder, setEditingFolder] = useState(null);
  const [showAddFolderAnimation, setShowAddFolderAnimation] = useState(false);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const tabsRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const { confirm } = useDialog();
  const [isSelect, setIsSelect] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  const [loadingFolder, setLoadingFolder] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  const id = params.get("ID");
  const forward_id = params.get("forward_id");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const [sortBy, setSortBy] = useState("");
  const [selectedChatType, setSelectedChatType] = useState(null);
  const [isChatListEmpty, setIsChatListEmpty] = useState(false);
  const [isDeletingChatCheck, setIsDeletingChatCheck] = useState(false);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const [isFolders, setIsFolders] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingIdMini, setEditingIdMini] = useState(null);
  const [editingTitleMini, setEditingTitleMini] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addFolderOpen, setAddFolderOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const [isCreating, setIsCreating] = useState(false);

  const isOrgMessenger = location.pathname.includes("organization");
  const wasLongPress = useRef(false);

  const [contextMenu, setContextMenu] = useState({
    open: false,
    chat: null,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (id) {
      setSelectedChatId(id);
    }
  }, [id]);

  const chatSocket = useChatSocket(true, {
    connect: true,
    isChatList: true,
  });

  useEffect(() => {
    dispatch(setSearchState(true));

    document.body.style.overflow = "hidden";
    document.querySelector("#global-menu").style.zIndex = "3";
    return () => {
      document.body.style.overflow = null;
      document.querySelector("#global-menu").style.zIndex = null;
    };
  }, []);

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : "",
    );

  const fetchChats = async (sortParam = sortBy, searchParam = searchQuery) => {
    setLoadingChats(true);

    try {
      // 🔹 1. Основной запрос (поиск + сортировка делает бэк)
      const res = await api.get("/messenger/chats/", {
        params: {
          sort_by: sortParam || undefined,
          search: searchParam?.trim() || undefined,
        },
      });

      if (res.status !== 200 || !res.data || !Array.isArray(res.data.list)) {
        setChats([]);
        return;
      }

      let chatsList = res.data.list || [];

      // 🔹 2. Организации загружаем ТОЛЬКО если нет поиска
      if (!searchParam?.trim()) {
        try {
          const orgRes = await api.get("/messenger/chats/organization/");

          if (orgRes.status === 200 && Array.isArray(orgRes.data)) {
            const orgChats = orgRes.data.map((org) => ({
              id: org.chat_id,
              chat_type: "organization",
              title: org.title,
              image: org.image,
              unread_messages_count: org.unread_messages_count,
              types: org.types,
              is_members: org.is_members,
              last_message: null,
              sender: null,
              organization_id: org.id,
              updated_at: org.updated_at,
              is_blocked: org.is_blocked,
            }));

            // 🔹 защита от дублей
            const existingIds = new Set(chatsList.map((c) => c.id));

            const uniqueOrgs = orgChats.filter(
              (org) => !existingIds.has(org.id),
            );

            // Добавляем организации только если фильтр общий или organization
            if (
              !sortParam ||
              sortParam === "new" ||
              sortParam === "organization"
            ) {
              chatsList = [...chatsList, ...uniqueOrgs];
            }
          }
        } catch (orgErr) {
          console.warn("Error loading organizations:", orgErr);
        }
      }

      setChats(chatsList);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setChats([]);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchChats(sortBy, searchQuery);
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery, sortBy]);

  const fetchFolders = async () => {
    try {
      const res = await api.get("/messenger/folders/");
      if (res.status === 200 && res.data && Array.isArray(res.data.list)) {
        setChatFolders([...SYSTEM_FOLDERS, ...(res.data.list || [])]);
      } else {
        setError(
          translate("Ошибка загрузки папок", "messenger.errorFolderList"),
        );
        Notify.error &&
          Notify.error({
            text: translate(
              "Ошибка загрузки папок",
              "messenger.errorFolderList",
            ),
          });
      }
    } catch (err) {
      setError(translate("Ошибка загрузки папок", "messenger.errorFolderList"));
      Notify.error &&
        Notify.error({
          text: translate("Ошибка загрузки папок", "messenger.errorFolderList"),
        });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchChats();
    }, 800);
  }, [selectedChatId, isDesktop, forward_id]);

  useEffect(() => {
    const chatListRaw =
      activeTab !== "chats"
        ? chatFolders.find((f) => f.id === activeTab)?.chats || []
        : chats;
    let chatList;
    if (!sortBy) {
      chatList = [...chatListRaw].sort((a, b) => {
        const aDate = a.last_message?.created_at
          ? new Date(a.last_message.created_at).getTime()
          : 0;
        const bDate = b.last_message?.created_at
          ? new Date(b.last_message.created_at).getTime()
          : 0;
        return bDate - aDate;
      });
    } else {
      chatList = chatListRaw;
    }
    if (
      isDesktop &&
      chatList.length > 0 &&
      !selectedChatId &&
      !isDeletingChatCheck
    ) {
      if (chatList[0].chat_type === "private") {
        setSelectedChatId(chatList[0].sender?.id);
        setSelectedChatType("private");
        setSelectedOrganizationId(null);
      } else if (chatList[0].chat_type === "group") {
        setSelectedChatId(chatList[0].id);
        setSelectedChatType("group");
        setSelectedOrganizationId(null);
      } else if (chatList[0].chat_type === "organization") {
        setSelectedChatId(chatList[0].id);
        setSelectedChatType("organization");
        setSelectedOrganizationId(chatList[0].organization_id);
      }
    }
  }, [
    chats,
    chatFolders,
    sortBy,
    activeTab,
    selectedChatId,
    isDesktop,
    isDeletingChatCheck,
  ]);

  const handleSortChange = (value) => {
    setSortBy(value);
    fetchChats(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // 1️⃣ Загружаем папки
        const responseFolders = await api.get("/messenger/folders/");

        let userFolders = [];

        if (
          responseFolders.status === 200 &&
          Array.isArray(responseFolders.data.list)
        ) {
          userFolders = responseFolders.data.list;
        }

        // 2️⃣ Загружаем чаты
        const responseChats = await api.get(
          `/messenger/chats/?sort_by=${sortBy}`,
        );

        let chatsList = [];

        if (
          responseChats.status === 200 &&
          Array.isArray(responseChats.data.list)
        ) {
          chatsList = responseChats.data.list;
          setChats(chatsList);
        }

        // 3️⃣ Формируем системные папки динамически
        const systemFolders = SYSTEM_FOLDERS.map((folder) => {
          if (folder.id === "groups") {
            return {
              ...folder,
              chats: chatsList.filter((chat) => chat.chat_type === "group"),
            };
          }

          if (folder.id === "orgs") {
            return {
              ...folder,
              chats: chatsList.filter(
                (chat) => chat.chat_type === "organization",
              ),
            };
          }

          return folder;
        });

        // 4️⃣ Обновляем state
        setChatFolders([...systemFolders, ...userFolders]);
      } catch (err) {
        Notify.error?.({
          text: translate("Ошибка загрузки данных", "messenger.errorMessenger"),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      setChatFolders([]);
      setChats([]);
    };
  }, []);

  // Drag-to-scroll handlers
  const onTabsMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - tabsRef.current.offsetLeft;
    scrollLeft.current = tabsRef.current.scrollLeft;
  };

  const onTabsMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = x - startX.current;
    tabsRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onTabsMouseUp = () => {
    isDragging.current = false;
  };

  const onTabsMouseLeave = () => {
    isDragging.current = false;
  };

  const onAdd = () => {
    setIsAddPopupOpen(true);
  };

  const handleOpenSortMenu = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.sort_chat_menu,
        menuLabel: translate("Сортировать", "dialog.sort"),
        onCloseAddMenu: () => {},
        handleSortChange,
        activeSort: sortBy,
        loadingChats: loadingChats,
        containerSelector: ".messenger-page__content",
      }),
    );
  };

  const handleSaveFolder = async (name) => {
    setLoadingFolder(true);
    try {
      if (editingFolder) {
        // Получаем текущие чаты папки
        const folder = chatFolders.find((f) => f.id === editingFolder.id);
        const chatIds = folder?.chats?.map((c) => c.id) || [];
        // Редактирование названия папки на сервере
        const resp = await api.put(`/messenger/folders/${editingFolder.id}/`, {
          title: name,
          chats: chatIds,
        });
        if (resp.status === 200 || resp.status === 204) {
          // После обновления — получить новые папки
          await fetchFolders();
          await fetchChats();
          window.scrollTo({ top: 0, behavior: "smooth" });
          Notify.success &&
            Notify.success({
              text: translate("Папка обновлена", "messenger.folderUpdate"),
            });
        } else {
          Notify.error &&
            Notify.error({
              text: translate(
                "Ошибка при обновлении папки",
                "messenger.errorFolderUpdate",
              ),
            });
        }
        setEditingFolder(null);
        setFolderModalOpen(false);
      } else {
        // Создание новой папки (пока без чатов)
        const res = await api.post("/messenger/folders/", {
          title: name,
          chats: [],
        });
        if (res.status === 201 || res.status === 200) {
          // После создания — обновить список папок
          await fetchFolders();
          await fetchChats();
          window.scrollTo({ top: 0, behavior: "smooth" });
          setShowAddFolderAnimation(true);
          setFolderModalOpen(false);
          setEditingFolder(null);
          Notify.success &&
            Notify.success({
              text: translate("Папка создана", "messenger.createdFolder"),
            });
        } else {
          Notify.error &&
            Notify.error({
              text: translate(
                "Ошибка при создании папки",
                "messenger.errorCreateFolder",
              ),
            });
        }
      }
    } catch (e) {
      Notify & Notify.error &&
        Notify.error({
          text: translate(
            "Ошибка при сохранении папки",
            "messenger.errorSaveFolder",
          ),
        });
    } finally {
      setLoadingFolder(false);
    }
  };

  const handleCloseModal = () => {
    setFolderModalOpen(false);
    setEditingFolder(null);
  };

  const handleDeleteFolder = async (id) => {
    if (!id) return;

    try {
      await confirm({
        title: translate("Удалить папку", "messenger.deleteFolder"),
        description: translate(
          "После удаления папки все чаты которые в ней, будут доступны в чатах",
          "messenger.deleteFolderDescription",
        ),
        confirmTitle: translate("Удалить", "app.delete"),
        cancelTitle: translate("Отмена", "apps.cancel"),
      });
    } catch {
      return; // пользователь нажал отмену
    }

    setLoadingFolder(true);

    try {
      const resp = await api.delete(`/messenger/folders/${id}/`);

      if (resp.status === 204 || resp.status === 200) {
        await fetchFolders();
        await fetchChats();
        setActiveTab("chats");

        window.scrollTo({ top: 0, behavior: "smooth" });

        Notify.success?.({
          text: translate("Папка удалена", "messenger.deletedFolder"),
        });
      } else {
        Notify.error?.({
          text: translate(
            "Ошибка при удалении папки",
            "messenger.errorDeleteFolder",
          ),
        });
      }

      setFolderModalOpen(false);
      setEditingFolder(null);
    } catch (e) {
      Notify.error?.({
        text: translate(
          "Ошибка при удалении папки",
          "messenger.errorDeleteFolder",
        ),
      });
    } finally {
      setLoadingFolder(false);
    }
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

  const onSelect = () => {
    setIsSelect(true);
    setSelectedChats([]);
  };

  // --- Добавляем обработку событий chat_updated от сокета ---
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
                    // unread_messages_count: {
                    //   ...data.last_message.unread_messages_count,
                    // },
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
          setSelectedOrganizationId(null);
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
              "messenger.notificationBlockChats",
            )}: ${resp.data.unblocked.length}`,
          });
      } else {
        Notify.error &&
          Notify.error({
            text: translate(
              "Ошибка при разблокировке чатов",
              "messenger.errorUnblockChats",
            ),
          });
      }
    } catch (e) {
      Notify.error &&
        Notify.error({
          text: translate(
            "Ошибка при разблокировке чатов",
            "messenger.errorUnblockChats",
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
              "messenger.notificationViewChats",
            )}: ${resp.data.deleted}`,
          });
        // После удаления всех чатов — редирект на /messenger
        history.push("/messenger");
        setSelectedChatId(null);
        setSelectedChatType(null);
        setSelectedOrganizationId(null);
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
      setSelectedOrganizationId(null);
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
      setSelectedOrganizationId(null);
    }
  }, [chats, selectedChatId]);

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  const handleCreateFolder = async () => {
    const trimmed = newFolder.trim();
    if (!trimmed || isCreating) return;

    setIsCreating(true);

    try {
      const response = await axios.post("/messenger/folders/", {
        title: trimmed,
      });

      const createdFolder = response.data;

      setChatFolders((prev) => [createdFolder, ...prev]);

      setNewFolder("");
    } catch (error) {
      console.log("CREATE FOLDER ERROR", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveEdit = async (folder) => {
    const trimmed = editingTitle.trim();

    setEditingId(null);
    setEditingTitle("");

    // если пусто или не изменилось — просто выходим
    if (!trimmed || trimmed === folder.title) return;

    const chatIds = (folder.chats || [])
      .map((chat) => (typeof chat === "object" ? chat.id : chat))
      .filter(Boolean);

    try {
      await axios.put(`/messenger/folders/${folder.id}/`, {
        title: trimmed,
        chats: chatIds,
      });

      // 💎 обновляем только title
      setChatFolders((prev) =>
        prev.map((f) => (f.id === folder.id ? { ...f, title: trimmed } : f)),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const longPressRef = useRef(null);

  const getChatUrl = (chat) => {
    if (chat.chat_type === "organization" && chat.is_members) {
      return `/messenger/organization/${chat.organization_id}`;
    }

    if (chat.chat_type === "group" && chat.organization?.is_members) {
      return `/messenger/organization/${chat.organization.id}`;
    }

    return `/messenger/chat/${
      chat.chat_type === "group"
        ? chat.id
        : chat.chat_type === "organization"
          ? chat.id
          : chat.sender?.id
    }/?type=${chat.chat_type}${
      chat.chat_type === "organization"
        ? "&organization_id=" + chat.organization_id
        : chat.organization
          ? "&organization_id=" + chat.organization.id
          : ""
    }`;
  };

  const handleSaveEditMini = async (folder, value) => {
    const trimmed = value.trim();

    setEditingIdMini(null);

    if (!trimmed || trimmed === folder.title) return;

    const chatIds = (folder.chats || [])
      .map((chat) => (typeof chat === "object" ? chat.id : chat))
      .filter(Boolean);

    try {
      await axios.put(`/messenger/folders/${folder.id}/`, {
        title: trimmed,
        chats: chatIds,
      });

      setChatFolders((prev) =>
        prev.map((f) => (f.id === folder.id ? { ...f, title: trimmed } : f)),
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.open) {
        setContextMenu({ open: false });
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenu.open]);

  const blockClickRef = useRef(false);
  const startCoords = useRef({ x: 0, y: 0 });

  // ВЕРСТКА

  // Вычисляем финальный список чатов ОДИН раз перед рендером
  const processedChats = useMemo(() => {
    // 1. Определяем источник (вкладка или общий список)
    let list =
      activeTab !== "chats"
        ? chatFolders.find((f) => f.id === activeTab)?.chats || []
        : chats;

    // Если fetchChats всё-таки намешал лишнего, фильтруем здесь жестко
    if (sortBy === "blocked") {
      list = list.filter((chat) => chat.is_blocked);
    } else if (sortBy === "unread") {
      list = list.filter((chat) => (chat.unread_messages_count || 0) > 0);
    } else if (sortBy === "organization") {
      list = list.filter(
        (chat) => chat.chat_type === "organization" || !!chat.organization,
      );
    }

    return [...list].sort((a, b) => {
      // Специфичная сортировка для вкладки организаций
      if (sortBy === "organization") {
        const aIsOrg = a.chat_type === "organization";
        const bIsOrg = b.chat_type === "organization";
        if (aIsOrg && !bIsOrg) return -1;
        if (!aIsOrg && bIsOrg) return 1;
      }

      // Дефолтная сортировка по дате (учитываем и last_message, и updated_at)
      const getDate = (c) =>
        c.last_message?.created_at
          ? new Date(c.last_message.created_at).getTime()
          : c.updated_at
            ? new Date(c.updated_at).getTime()
            : 0;

      return getDate(b) - getDate(a);
    });
  }, [chats, chatFolders, activeTab, sortBy, searchQuery]);

  const tabRefs = useRef({});

  const scrollToTab = (id) => {
    const container = tabsRef.current;
    const el = tabRefs.current[id];

    if (!container || !el) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const currentScroll = container.scrollLeft;

    const elCenter =
      elRect.left - containerRect.left + currentScroll + elRect.width / 2;
    const containerCenter = container.clientWidth / 2;

    const nextScrollLeft = elCenter - containerCenter;

    container.scrollTo({
      left: nextScrollLeft,
      behavior: "smooth",
    });
  };

  return (
    <div style={{ background: darkTheme ? "#00193F " : "" }}>
      <div
        className={`messenger-page${
          isDesktop && selectedChatId ? " messenger-page--split container" : ""
        }${darkTheme ? " dark" : ""}`}
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
            <button
              onClick={() => {
                history.goBack();
                dispatch(setSearchState(false));
              }}
            >
              <BackArrow />
            </button>
            <span className="messenger-title">
              {translate("Мессенджер", "profile.messenger")} <MessengerIcon />
            </span>

            <div className="messenger-header-actions">
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
                    setIsFolders={setIsFolders}
                    onClick={close}
                  />
                )}
              </Popup>
            </div>
          </div>
          {loading ? (
            <Preloader style={{ marginTop: 16 }} />
          ) : error ? (
            <div style={{ color: "red", padding: 16 }}>{error}</div>
          ) : (
            <>
              <div
                className="messenger-tabs-wrap"
                style={
                  isDesktop
                    ? { borderRadius: "0" }
                    : {
                        boxShadow: "0 4px 2px -2px rgba(0, 0, 0, 0.15)",
                        borderRadius: "0",
                      }
                }
              >
                <div className="messenger-search">
                  <Popup
                    position="bottom left"
                    closeOnDocumentClick
                    arrow={false}
                    contentStyle={{
                      padding: 0,
                      border: "none",
                      background: "transparent",
                    }}
                    trigger={
                      <button className="messenger-header-btn">
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
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    }
                  >
                    {(close) => (
                      <SortChatMenu
                        handleSortChange={handleSortChange}
                        activeSort={sortBy}
                        loadingChats={loadingChats}
                        isOrgMessenger={isOrgMessenger}
                        onClose={close}
                      />
                    )}
                  </Popup>

                  <div className="messenger-search__input">
                    <SearchIcon />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={translate(
                        "Поиск чатов...",
                        "messenger.searchInChats",
                      )}
                    />
                  </div>
                </div>

                <div
                  className="messenger-tabs"
                  ref={tabsRef}
                  onMouseDown={onTabsMouseDown}
                  onMouseMove={onTabsMouseMove}
                  onMouseUp={onTabsMouseUp}
                  onMouseLeave={onTabsMouseLeave}
                >
                  <Popup
                    open={isAddPopupOpen}
                    onClose={() => setIsAddPopupOpen(false)}
                    position="bottom left"
                    trigger={
                      <button className="messenger-header-btn" onClick={onAdd}>
                        <AddNewChatIcon />
                      </button>
                    }
                    closeOnDocumentClick
                  >
                    {(close) => (
                      <div className="comment__popup">
                        <button
                          className="comment__popup-btn"
                          onClick={() => {
                            history.push("/messenger/search");
                            close();
                          }}
                        >
                          <span>
                            {translate("Новый чат", "messenger.newChat")}
                          </span>
                          <MessengerIcon />
                        </button>

                        <button
                          className="comment__popup-btn"
                          onClick={() => {
                            history.push("/messenger/group/create");
                            close();
                          }}
                        >
                          <span>
                            {translate("Новая группа", "messenger.newGroup")}
                          </span>
                          <GroupIcon />
                        </button>

                        <button
                          className="comment__popup-btn"
                          onClick={() => {
                            setIsFolders(true);
                            close();
                          }}
                        >
                          <span>
                            {translate(
                              "Создать папку",
                              "messenger.createFolder",
                            )}
                          </span>
                          <AddIcon />
                        </button>
                      </div>
                    )}
                  </Popup>

                  <div
                    className={`messenger-tab${
                      activeTab === "chats" ? " active" : ""
                    }`}
                    onClick={() => setActiveTab("chats")}
                  >
                    {translate("Чаты", "messenger.Chats")}
                  </div>

                  {chatFolders.map((folder) => {
                    const isEditing = editingIdMini === folder.id;

                    return (
                      <div
                        key={folder.id}
                        ref={(el) => {
                          tabRefs.current[folder.id] = el;
                        }}
                        className={`messenger-tab ${
                          activeTab === folder.id ? " active" : ""
                        }`}
                        onClick={() => {
                          if (wasLongPress.current) {
                            wasLongPress.current = false;
                            return;
                          }

                          if (!isEditing) {
                            setActiveTab(folder.id);
                            scrollToTab(folder.id);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (folder.isSystem) return;

                          setEditingIdMini(folder.id);
                          setEditingTitleMini(folder.title);
                        }}
                        onTouchStart={() => {
                          wasLongPress.current = false;

                          longPressRef.current = setTimeout(() => {
                            if (folder.isSystem) return;

                            wasLongPress.current = true;
                            setEditingIdMini(folder.id);
                            setEditingTitleMini(folder.title);

                            navigator.vibrate?.(50);
                          }, 600);
                        }}
                        onTouchEnd={() => {
                          clearTimeout(longPressRef.current);
                        }}
                        onTouchMove={() => {
                          clearTimeout(longPressRef.current);
                        }}
                      >
                        {isEditing ? (
                          <input
                            className="messenger-tab__input"
                            value={editingTitleMini}
                            autoFocus
                            onChange={(e) =>
                              setEditingTitleMini(e.target.value)
                            }
                            onBlur={(e) =>
                              handleSaveEditMini(folder, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleSaveEditMini(folder, e.target.value);
                              if (e.key === "Escape") setEditingIdMini(null);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                          />
                        ) : (
                          <span className="tl">{folder.title}</span>
                        )}
                      </div>
                    );
                  })}
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
                        <SelectedFilter selectedChats={selectedChats} />
                      </button>
                    </div>
                    <div className="selected__wrap__actions">
                      <button
                        disabled={selectedChats.length === 0}
                        style={{
                          color:
                            selectedChats.length === 0 ? "#868D98" : "#D72C20",
                          cursor:
                            selectedChats.length === 0
                              ? "not-allowed"
                              : "pointer",
                          background: "none",
                          border: "none",
                        }}
                        onClick={handleDeleteSelected}
                      >
                        {translate("Удалить", "app.delete")}
                        <DeleteChoice />
                      </button>
                      <button
                        disabled={selectedChats.length === 0}
                        style={{
                          color:
                            selectedChats.length === 0 ? "#868D98" : "#34A853",
                          cursor:
                            selectedChats.length === 0
                              ? "not-allowed"
                              : "pointer",
                          background: "none",
                          border: "none",
                        }}
                        onClick={handleViewSelected}
                      >
                        {translate("Посмотреть", "app.see")}
                        <LookChoice selectedChats={selectedChats} />
                      </button>
                      {onlyBlockedSelected ? (
                        <button
                          disabled={selectedChats.length === 0}
                          style={{
                            color:
                              selectedChats.length === 0
                                ? "#868D98"
                                : "#34A853",
                            cursor:
                              selectedChats.length === 0
                                ? "not-allowed"
                                : "pointer",
                            background: "none",
                            border: "none",
                          }}
                          onClick={handleUnblockSelected}
                        >
                          {translate("Разблокировать", "messenger.unblock")}
                          <UnBlock selectedChats={selectedChats} />
                        </button>
                      ) : (
                        <button
                          disabled={selectedChats.length === 0}
                          style={{
                            color:
                              selectedChats.length === 0
                                ? "#868D98"
                                : "#D72C20",
                            cursor:
                              selectedChats.length === 0
                                ? "not-allowed"
                                : "pointer",
                            background: "none",
                            border: "none",
                          }}
                          onClick={handleBlockSelected}
                        >
                          {translate("Заблокировать", "messenger.block")}
                          <BlockChoice selectedChats={selectedChats} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`messenger-chat-list${
                  !(() => {
                    const chatListRaw =
                      activeTab !== "chats"
                        ? chatFolders.find((f) => f.id === activeTab)?.chats ||
                          []
                        : chats;
                    let chatList;
                    if (!sortBy) {
                      chatList = [...chatListRaw].sort((a, b) => {
                        const aDate = a.last_message?.created_at
                          ? new Date(a.last_message.created_at).getTime()
                          : 0;
                        const bDate = b.last_message?.created_at
                          ? new Date(b.last_message.created_at).getTime()
                          : 0;
                        return bDate - aDate;
                      });
                    } else {
                      chatList = chatListRaw;
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
                {(() => {
                  const chatListRaw =
                    activeTab !== "chats"
                      ? chatFolders.find((f) => f.id === activeTab)?.chats || []
                      : chats;
                  let chatList;
                  if (!sortBy) {
                    chatList = [...chatListRaw].sort((a, b) => {
                      const aDate = a.last_message?.created_at
                        ? new Date(a.last_message.created_at).getTime()
                        : 0;
                      const bDate = b.last_message?.created_at
                        ? new Date(b.last_message.created_at).getTime()
                        : 0;
                      return bDate - aDate;
                    });
                  } else if (sortBy === "organization") {
                    // Сортируем организации наверх, затем по дате
                    chatList = [...chatListRaw].sort((a, b) => {
                      const aIsOrg = a.chat_type === "organization";
                      const bIsOrg = b.chat_type === "organization";

                      if (aIsOrg && !bIsOrg) return -1;
                      if (!aIsOrg && bIsOrg) return 1;

                      // Если оба чата одного типа, сортируем по дате
                      const aDate = a.last_message?.created_at
                        ? new Date(a.last_message.created_at).getTime()
                        : a.updated_at
                          ? new Date(a.updated_at).getTime()
                          : 0;
                      const bDate = b.last_message?.created_at
                        ? new Date(b.last_message.created_at).getTime()
                        : b.updated_at
                          ? new Date(b.updated_at).getTime()
                          : 0;
                      return bDate - aDate;
                    });
                  } else {
                    chatList = chatListRaw;
                  }

                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase().trim();

                    chatList = chatList.filter((chat) => {
                      const title =
                        chat.organization?.title ||
                        chat.title ||
                        chat.sender?.full_name ||
                        "";

                      return title.toLowerCase().includes(query);
                    });
                  }

                  if (!processedChats.length) {
                    return (
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
                            "Вы можете добавить пользователей через кнопку добавить",
                            "messenger.notFoundDescription",
                          )}
                        </p>
                      </div>
                    );
                  }

                  return processedChats?.map((chat) => (
                    <div
                      key={chat.id}
                      className="messenger-chat-item"
                      draggable={false}
                      onContextMenu={(e) => {
                        e.preventDefault();

                        setContextMenu({
                          open: true,
                          chat,
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }}
                      onTouchStart={(e) => {
                        blockClickRef.current = false;

                        startCoords.current = {
                          x: e.touches[0].clientX,
                          y: e.touches[0].clientY,
                        };

                        longPressRef.current = setTimeout(() => {
                          blockClickRef.current = true;

                          const rect = e.currentTarget.getBoundingClientRect();

                          setContextMenu({
                            open: true,
                            chat,
                            y: rect.top + rect.height / 2,
                          });

                          navigator.vibrate?.(50);
                        }, 700);
                      }}
                      onTouchEnd={() => {
                        clearTimeout(longPressRef.current);
                      }}
                      onTouchMove={(e) => {
                        const x = e.touches[0].clientX;
                        const y = e.touches[0].clientY;

                        if (
                          Math.abs(x - startCoords.current.x) > 12 ||
                          Math.abs(y - startCoords.current.y) > 12
                        ) {
                          clearTimeout(longPressRef.current);
                        }
                      }}
                      onClick={(e) => {
                        if (blockClickRef.current) {
                          e.preventDefault();
                          e.stopPropagation();

                          blockClickRef.current = false;
                          return;
                        }

                        const url = getChatUrl(chat);

                        if (isDesktop) {
                          history.push(
                            `/messenger/?type=${chat.chat_type}${
                              chat.organization
                                ? `&organization_id=${chat.organization.id}`
                                : ""
                            }`,
                          );

                          setSelectedChatId(
                            chat.chat_type === "group" ||
                              chat.chat_type === "organization"
                              ? chat.id
                              : chat.sender?.id,
                          );

                          setSelectedChatType(chat.chat_type);

                          setSelectedOrganizationId(
                            chat.chat_type === "organization"
                              ? chat.organization_id
                              : chat.organization
                                ? chat.organization.id
                                : null,
                          );
                        } else {
                          history.push(url);
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
                            chat.organization
                              ? chat.organization.image?.medium ||
                                chat.organization.image?.file ||
                                ""
                              : chat.chat_type === "group"
                                ? chat.image || defaultGroupAvatar
                                : chat.chat_type === "organization"
                                  ? chat.image?.medium ||
                                    chat.image?.file ||
                                    defaultGroupAvatar
                                  : chat.sender?.avatar?.medium ||
                                    chat.sender?.avatar?.file ||
                                    ""
                          }
                          alt={
                            chat.organization
                              ? chat.organization.title
                              : chat.chat_type === "group"
                                ? chat.title
                                : chat.chat_type === "organization"
                                  ? chat.title
                                  : chat.sender?.full_name
                          }
                          style={
                            chat.chat_type === "organization" ||
                            chat.organization
                              ? { borderRadius: "12px" }
                              : null
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
                            style={
                              chat.is_blocked ? { color: "#D72C20" } : null
                            }
                          >
                            {chat.organization
                              ? chat.organization.title
                              : chat.chat_type === "group"
                                ? chat.title
                                : chat.chat_type === "organization"
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
                              : chat.updated_at
                                ? new Date(chat.updated_at).toLocaleDateString()
                                : ""}{" "}
                            <span>
                              {chat.last_message?.created_at
                                ? new Date(
                                    chat.last_message.created_at,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : chat.updated_at
                                  ? new Date(
                                      chat.updated_at,
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
                              (chat.chat_type === "organization" &&
                              chat.chat_type === "organization" &&
                              !chat.last_message?.text
                                ? chat.types?.[0]?.title ||
                                  translate(
                                    "Организация",
                                    "messenger.organization",
                                  )
                                : "")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
                {contextMenu.open && (
                  <div
                    className="context-menu-wrapper"
                    style={{
                      position: "absolute",
                      top: contextMenu.y - 160,

                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 9999,
                    }}
                  >
                    <PopupContentEdit
                      setChats={setChats}
                      fetchChats={fetchChats}
                      addFolderOpen={addFolderOpen}
                      onOpenFolders={() => setAddFolderOpen(true)}
                      setAddFolderOpen={setAddFolderOpen}
                      organizationId={selectedOrganizationId}
                      setIsDeletingChatCheck={setIsDeletingChatCheck}
                      chat={contextMenu.chat}
                      onClose={() => setContextMenu({ open: false })}
                      setChatFolders={setChatFolders}
                      fetchFolders={fetchFolders}
                      setSelectedChat={setSelectedChat}
                    />
                  </div>
                )}
                {addFolderOpen && (
                  <div className="bottom-sheet">
                    <div
                      className="bottom-sheet__overlay"
                      onClick={() => setAddFolderOpen(false)}
                    />
                    <div className="bottom-sheet__content">
                      <SelectFoldersView
                        chatId={selectedChat}
                        fetchChats={fetchChats}
                        setChats={setChats}
                        fetchFolders={fetchFolders}
                        SYSTEM_FOLDERS={SYSTEM_FOLDERS}
                        setChatFolders={setChatFolders}
                        onClose={() => setAddFolderOpen(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          <FolderSettingsModal
            open={isFolderModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveFolder}
            avatar={
              chats[0]?.sender?.avatar?.medium || chats[0]?.sender?.avatar?.file
            }
            defaultValue={editingFolder?.title}
            showAddFolderAnimation={showAddFolderAnimation}
            onDelete={editingFolder ? handleDeleteFolder : undefined}
            loadingFolder={loadingFolder}
            isChatDesctop={isDesktop && selectedChatId}
          />
        </div>
        {isDesktop && (forward_id || selectedChatId) && (
          <div className="messenger-page__chat-panel">
            <MessengerChatPage
              setChats={setChats}
              darkTheme={darkTheme}
              fetchChats={fetchChats}
              setChatFolders={setChatFolders}
              userId={forward_id || selectedChatId}
              setSelectedChatId={setSelectedChatId}
              selectedChatType={selectedChatType}
              organizationId={selectedOrganizationId}
              fetchFolders={fetchFolders}
              setIsDeletingChatCheck={setIsDeletingChatCheck}
            />
          </div>
        )}

        <MobileMenu
          isOpen={isFolders}
          onRequestClose={() => setIsFolders(false)}
          onClose={() => setIsFolders(false)}
          contentLabel={translate("Добавить папку", "messenger.addFolder")}
        >
          <div className="folders-modal">
            <div className="folders-modal__create">
              <input
                type="text"
                placeholder={translate(
                  "Название папки",
                  "messenger.nameFolder",
                )}
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                }}
              />
              <button
                onClick={handleCreateFolder}
                disabled={!newFolder.trim() || isCreating}
              >
                {isCreating ? "..." : translate("Создать", "app.create")}
              </button>
            </div>

            <div className="folders-modal__list">
              {chatFolders
                .filter((folder) => !folder.isSystem)
                .map((folder) => {
                  const isEditing = editingId === folder.id;

                  return (
                    <div
                      key={folder.id}
                      className="folders-modal__item"
                      onClick={() => !isEditing && setActiveTab(folder.id)}
                    >
                      <div className="folders-modal__left">
                        {isEditing ? (
                          <input
                            className="folders-modal__edit-input"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(folder);
                            }}
                            autoFocus
                          />
                        ) : (
                          <span>{folder.title}</span>
                        )}
                      </div>

                      {isEditing ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {folder.isSystem ? (
                            <button
                              className="folders-modal__save"
                              onClick={() => handleSaveEdit(folder)}
                            >
                              <DoneIcon />
                            </button>
                          ) : (
                            <>
                              <button
                                className="folders-modal__save"
                                onClick={() => handleSaveEdit(folder)}
                              >
                                <DoneIcon />
                              </button>
                              <button
                                className="folders-modal__save"
                                onClick={() => {
                                  handleDeleteFolder(folder.id);
                                }}
                              >
                                <DeleteIcon />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          className="folders-modal__edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(folder.id);
                            setEditingTitle(folder.title);
                          }}
                        >
                          <EditIcon />
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </MobileMenu>
      </div>
    </div>
  );
};

const PopupContent = ({
  onSelect,
  onDelete,
  onBlock,
  onViewAll,
  onDeleteAll,
  setIsFolders,
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
          <g clipPath="url(#clip0_35109_14814)">
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
      <button className="comment__popup-btn" onClick={() => setIsFolders(true)}>
        {translate("Редактировать папки", "messenger.editFolders")}
        <EditIcon />
      </button>
    </div>
  );
};

export default MessengerPage;

// слудующему разработчику: я когда это увидел, тоже в ступе был, так что не отчаивайся, код не мой если что (Акрам)
