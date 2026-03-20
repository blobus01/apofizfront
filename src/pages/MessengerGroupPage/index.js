import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import api from "@/axios-api";
import { ReadTickIcon, SearchIcon, SentTickIcon } from "../MessengerPage/icons";
import Preloader from "../../components/Preloader";
import "../MessengerSearchPage/index.scss";
import "../MessengerPage/index.scss";
import "./index.scss";
import { setGlobalMenu } from "@store/actions/commonActions";
import { MENU_TYPES } from "@components/GlobalMenu";
import { useDispatch } from "react-redux";
import { setViews } from "@store/actions/commonActions";
import { VIEW_TYPES } from "@components/GlobalLayer";
import Notify from "../../components/Notification";

// CameraCaptureModal — модалка для селфи на десктопе
export const CameraCaptureModal = ({ open, onClose, onCapture }) => {
  const videoRef = React.useRef();
  const [stream, setStream] = useState(null);

  React.useEffect(() => {
    let active = true;
    if (open) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((s) => {
          if (!active) return;
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          if (active) {
            Notify.error({
              text: translate(
                "Доступ к камере не предоставлен. Проверьте настройки браузера.",
                "messenger.cameraAccessDenied"
              ),
            });
            onClose();
          }
        });
    }
    return () => {
      active = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open]);

  const handleCapture = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `selfie_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
      }
    }, "image/jpeg");
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: 320,
            height: 240,
            borderRadius: 8,
            background: "#000",
          }}
        />
        <button onClick={handleCapture} style={{ marginTop: 16 }}>
          {translate("Сделать фото", "messenger.takePhoto")}
        </button>
        <button onClick={handleCancel} style={{ marginTop: 8 }}>
          {translate("Отмена", "app.cancel")}
        </button>
      </div>
    </div>
  );
};

function MessengerGroupPage() {
  const history = useHistory();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [groupPhotoPreview, setGroupPhotoPreview] = useState(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  // Проверка на мобильное устройство
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : ""
    );

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/messenger/chats/");
        if (res.status === 200 && res.data && Array.isArray(res.data.list)) {
          setChats(res.data.list || []);
        }
      } catch (e) {}
    };
    fetchChats();
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

  // Проверка, выбран ли пользователь по id
  const isSelected = (userId) => selectedUsers.some((u) => u.id === userId);

  // Универсальный обработчик выбора пользователя (из поиска или чата)
  const handleSelectUser = (user) => {
    if (isSelected(user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([
        ...selectedUsers,
        {
          id: user.id,
          avatar: user.avatar,
          name: user.name,
          nick: user.nick,
        },
      ]);
    }
  };

  // Получить собеседника из чата
  const getChatUser = (chat) => {
    // chat.sender — это собеседник
    return {
      id: chat.sender?.id,
      avatar: chat.sender?.avatar?.medium || chat.sender?.avatar?.file || "",
      name: chat.sender?.full_name,
      nick: chat.sender?.username,
    };
  };

  // Шаг 2: форма создания группы
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setGroupPhoto(e.target.files[0]);
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

  const onAddPhoto = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.addChatGroupPhoto_card_menu,
        menuLabel: translate("Добавить", "dialog.add"),
        onCloseAddMenu: () => {},
        isMobile,
        onSelectFile: handleSelectFile,
        onSelectCamera: handleSelectCamera,
      })
    );
  };

  // Открыть ImageCropView с aspect: 1
  const openCropper = (file) => {
    dispatch(
      setViews({
        type: "image_crop",
        onSave: (images) => {
          if (images && images.length > 0) {
            setGroupPhoto(images[0].original);
            setGroupPhotoPreview(images[0].file);
          }
          dispatch(setViews([]));
        },
        cropConfig: { aspect: 1 },
        uploads: [file],
        selectableAspectRatio: true,
      })
    );
  };

  // Обработчик для AddChatGroupPhotoCardMenu
  const handleSelectFile = (file) => {
    openCropper(file);
  };
  const handleSelectCamera = (file) => {
    if (isMobile) {
      openCropper(file);
    } else {
      setCameraModalOpen(true);
    }
  };

  // Обработчик для снимка с камеры на десктопе
  const handleCameraCapture = (file) => {
    openCropper(file);
  };

  // Создание группы
  const handleCreateGroup = async () => {
    const formData = new FormData();
    formData.append("title", groupName);
    if (groupPhoto) {
      formData.append("image", groupPhoto); // groupPhoto должен быть File или Blob
    }
    selectedUsers.forEach((u) => {
      formData.append("users_ids", String(u.id));
    });
    setIsSubmitting(true);
    setError("");
    try {
      const resp = await api.post("/messenger/group/", formData);
      if (resp.status === 200 || resp.status === 201) {
        Notify.success({
          text: translate("Группа создана", "messenger.groupCreated"),
        });
        history.push("/messenger");
      } else {
        setError(
          translate("Ошибка при создании группы", "messenger.errorCreateGroup")
        );
        Notify.error &&
          Notify.error({
            text: translate(
              "Ошибка при создании группы",
              "messenger.errorCreateGroup"
            ),
          });
      }
    } catch (e) {
      setError(
        translate("Ошибка при создании группы", "messenger.errorCreateGroup")
      );
      Notify.error &&
        Notify.error({
          text: translate(
            "Ошибка при создании группы",
            "messenger.errorCreateGroup"
          ),
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="messenger-group-page">
      <MobileTopHeader
        onBack={() => (step === 1 ? history.push("/messenger") : setStep(1))}
        title={translate(
          step === 1 ? "Новая группа" : "Оформление группы",
          step === 1 ? "messenger.newGroup" : "messenger.groupSetup"
        )}
        nextLabel={
          step === 1 ? (
            translate("Далее", "app.next")
          ) : step === 2 ? (
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
              translate("Создать", "app.create")
            )
          ) : undefined
        }
        onNext={
          step === 1
            ? () => setStep(2)
            : step === 2
            ? () => handleCreateGroup()
            : undefined
        }
        disabledGroup={step === 2 && (!groupName || isSubmitting)}
        isSubmitting={isSubmitting}
      />
      {step === 1 && (
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
          {/* Результат поиска — сверху */}
          {result && (
            <div
              className="messenger-search-page__result"
              style={{ marginBottom: 12 }}
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
                        {MessageStatus(chat?.last_message?.status)}
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
      )}
      {step === 2 && (
        <div className="messenger-search-page__content container">
          <div className="messenger-group-page__input-row">
            <label
              className="messenger-group-page__photo-btn"
              onClick={() => {
                dispatch(
                  setGlobalMenu({
                    type: MENU_TYPES.addChatGroupPhoto_card_menu,
                    menuLabel: translate("Добавить", "dialog.add"),
                    onCloseAddMenu: () => {},
                    isMobile,
                    onSelectFile: handleSelectFile,
                    onSelectCamera: handleSelectCamera,
                  })
                );
              }}
            >
              {groupPhotoPreview ? (
                <img
                  src={groupPhotoPreview}
                  alt="group"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <CameraIcon />
              )}
            </label>
            <div className="messenger-group-page__input-title">
              <EditIcon />
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={translate(
                  "Название группы",
                  "messenger.groupName"
                )}
                className="messenger-group-page__input"
              />
            </div>
          </div>
          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="messenger-search-page__result"
                  style={{ marginBottom: 0 }}
                >
                  <button
                    className={`chat-select-check checked`}
                    onClick={() => handleSelectUser(user)}
                    style={{
                      border: "none",
                      background: "transparent",
                      marginRight: 8,
                      cursor: "pointer",
                      outline: "none",
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={translate(
                      "Удалить участника",
                      "messenger.removeMember"
                    )}
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
                      <polyline
                        points="7,13 11,17 17,9"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="messenger-search-page__result-avatar"
                  />
                  <div className="messenger-search-page__result-info">
                    <div className="messenger-search-page__result-name">
                      {user.name}
                    </div>
                    <div className="messenger-search-page__result-nick">
                      {user.nick}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <CameraCaptureModal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
const CameraIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.925 2.50393C14.317 2.5039 14.7023 2.6063 15.0426 2.801C15.3829 2.9957 15.6664 3.27593 15.865 3.61393L16.679 5.00093H18.75C19.6118 5.00093 20.4383 5.3432 21.0477 5.95248C21.6572 6.56176 21.9997 7.38815 22 8.24993V17.7499C22 18.1767 21.9159 18.5993 21.7526 18.9937C21.5893 19.388 21.3499 19.7462 21.0481 20.048C20.7463 20.3498 20.388 20.5892 19.9937 20.7525C19.5994 20.9159 19.1768 20.9999 18.75 20.9999H5.25C4.38805 20.9999 3.5614 20.6575 2.9519 20.048C2.34241 19.4385 2 18.6119 2 17.7499V8.24993C2 7.38798 2.34241 6.56133 2.9519 5.95183C3.5614 5.34234 4.38805 4.99993 5.25 4.99993H7.33L8.205 3.57593C8.40619 3.24815 8.68804 2.97741 9.02364 2.78956C9.35925 2.60172 9.7374 2.50303 10.122 2.50293L13.925 2.50393ZM13.925 4.00393H10.122C10.0126 4.00402 9.90448 4.02806 9.80532 4.07435C9.70616 4.12065 9.61833 4.18809 9.548 4.27193L9.483 4.36193L8.39 6.14193C8.32298 6.25125 8.22904 6.34156 8.11717 6.40424C8.0053 6.46692 7.87923 6.49986 7.751 6.49993H5.251C5.0211 6.4998 4.79343 6.54497 4.581 6.63285C4.36856 6.72074 4.17552 6.84962 4.01292 7.01214C3.85031 7.17465 3.72131 7.36762 3.63331 7.58C3.5453 7.79239 3.5 8.02003 3.5 8.24993V17.7499C3.5 18.7159 4.284 19.4999 5.25 19.4999H18.75C19.2141 19.4999 19.6592 19.3156 19.9874 18.9874C20.3156 18.6592 20.5 18.2141 20.5 17.7499V8.24993C20.5 7.7858 20.3156 7.34068 19.9874 7.01249C19.6592 6.6843 19.2141 6.49993 18.75 6.49993H16.25C16.1193 6.5 15.9908 6.46589 15.8773 6.40099C15.7638 6.33609 15.6692 6.24264 15.603 6.12993L14.571 4.37293C14.5048 4.26036 14.4104 4.16701 14.2971 4.10212C14.1838 4.03723 14.0556 4.00304 13.925 4.00293M12 7.99993C13.1935 7.99993 14.3381 8.47404 15.182 9.31795C16.0259 10.1619 16.5 11.3065 16.5 12.4999C16.5 13.6934 16.0259 14.838 15.182 15.6819C14.3381 16.5258 13.1935 16.9999 12 16.9999C10.8065 16.9999 9.66193 16.5258 8.81802 15.6819C7.97411 14.838 7.5 13.6934 7.5 12.4999C7.5 11.3065 7.97411 10.1619 8.81802 9.31795C9.66193 8.47404 10.8065 7.99993 12 7.99993ZM12 9.49993C11.606 9.49993 11.2159 9.57753 10.8519 9.72829C10.488 9.87905 10.1573 10.1 9.87868 10.3786C9.6001 10.6572 9.37913 10.9879 9.22836 11.3519C9.0776 11.7159 9 12.106 9 12.4999C9 12.8939 9.0776 13.284 9.22836 13.648C9.37913 14.012 9.6001 14.3427 9.87868 14.6213C10.1573 14.8998 10.488 15.1208 10.8519 15.2716C11.2159 15.4223 11.606 15.4999 12 15.4999C12.7956 15.4999 13.5587 15.1839 14.1213 14.6213C14.6839 14.0586 15 13.2956 15 12.4999C15 11.7043 14.6839 10.9412 14.1213 10.3786C13.5587 9.816 12.7956 9.49993 12 9.49993Z"
      fill="#1270EC"
    />
  </svg>
);
export const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.99933 13.3334H13.9993M10.9167 2.41473C11.1821 2.14934 11.542 2.00024 11.9173 2.00024C12.2927 2.00024 12.6526 2.14934 12.918 2.41473C13.1834 2.68013 13.3325 3.04008 13.3325 3.4154C13.3325 3.79072 13.1834 4.15067 12.918 4.41607L4.91133 12.4234C4.75273 12.582 4.55668 12.698 4.34133 12.7607L2.42667 13.3194C2.3693 13.3361 2.30849 13.3371 2.25061 13.3223C2.19272 13.3075 2.13988 13.2774 2.09763 13.2351C2.05538 13.1929 2.02526 13.14 2.01043 13.0821C1.9956 13.0242 1.9966 12.9634 2.01333 12.9061L2.572 10.9914C2.63481 10.7763 2.75083 10.5805 2.90933 10.4221L10.9167 2.41473Z"
      stroke="#007AFF"
      stroke-width="1.33333"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
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
export default MessengerGroupPage;
