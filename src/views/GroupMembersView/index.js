import React, { useState } from "react";
import PropTypes from "prop-types";
import "@pages/MessengerGroupPage/index.scss";
import MobileTopHeader from "@components/MobileTopHeader";
import { CameraCaptureModal, EditIcon } from "@pages/MessengerGroupPage";
import "./index.scss";
import { useSelector, useDispatch } from "react-redux";
import MobileMenu from "@components/MobileMenu";
import { translate } from "@locales/locales";
import Avatar from "@components/UI/Avatar";
import Notify from "@components/Notification";
import RowButton, { ROW_BUTTON_TYPES } from "@components/UI/RowButton";
import Preloader from "@components/Preloader";
import { DeleteIcon } from "@pages/MessengerChatPage";
import { setGlobalMenu } from "@store/actions/commonActions";
import { setViews } from "@store/actions/commonActions";
import api from "@/axios-api";
import { MENU_TYPES } from "@components/GlobalMenu";

const GroupMembersView = ({
  members = [],
  title = "",
  image = "",
  onBack,
  chatId,
  onCloseGroupMembers,
}) => {
  const currentUser = useSelector((state) => state.userStore.user);
  const [openMenu, setOpenMenu] = useState(false);
  const [currentUserMenu, setCurrentUserMenu] = useState(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  // --- Новое для редактирования ---
  const dispatch = useDispatch();
  const [groupName, setGroupName] = useState(title);
  const [groupPhoto, setGroupPhoto] = useState(null); // File
  const [groupPhotoPreview, setGroupPhotoPreview] = useState(image); // string (url)
  const [isSaving, setIsSaving] = useState(false);
  const views = useSelector((state) => state.commonStore.views);
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : ""
    );
  const [membersState, setMembersState] = useState(members); // локальный стейт для обновления участников
  // Определяем роль текущего пользователя по members
  const currentMember = members.find((m) => m.id === currentUser.id);
  const isCurrentUserAdmin = currentMember?.role === "admin";

  // Открыть меню выбора фото
  const onAddPhoto = () => {
    if (!isCurrentUserAdmin) return;
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.addChatGroupPhoto_card_menu,
        menuLabel: translate("Добавить", "dialog.add"),
        onCloseAddMenu: () => {},
        isMobile,
        onSelectFile: handleSelectFile,
        onSelectCamera: handleSelectCamera,
        isEditGroup: true,
      })
    );
  };

  // Обрезка и предпросмотр
  const openCropper = (file) => {
    dispatch(
      setViews({
        type: "image_crop",
        onSave: (images) => {
          if (images && images.length > 0) {
            setGroupPhoto(images[0].original);
            setGroupPhotoPreview(images[0].file);
          }
          dispatch(setViews(views.filter((v) => v.type !== "image_crop")));
        },
        cropConfig: { aspect: 1 },
        uploads: [file],
      })
    );
  };

  const handleSelectFile = (file) => openCropper(file);
  const handleSelectCamera = (file) => {
    if (isMobile) {
      openCropper(file);
    } else {
      setCameraModalOpen(true);
    }
  };
  const handleCameraCapture = (file) => {
    openCropper(file);
  };

  // Сохранить изменения
  const handleSave = async () => {
    if (!isCurrentUserAdmin) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", groupName);
      if (groupPhoto) {
        formData.append("image", groupPhoto);
      }
      const resp = await api.put(`/messenger/group/${chatId}/`, formData);
      if (resp.status === 200 || resp.status === 201) {
        Notify.success({ text: "Группа обновлена" });
        onCloseGroupMembers();
        onBack();
      } else {
        Notify.error({ text: "Ошибка при обновлении группы" });
      }
    } catch (e) {
      Notify.error({ text: "Ошибка при обновлении группы" });
    } finally {
      setIsSaving(false);
    }
  };

  // --- API: удалить участника ---
  const [isRemoving, setIsRemoving] = useState(false);
  const handleRemoveUser = async (userId) => {
    setIsRemoving(true);
    try {
      const resp = await api.post(`/messenger/group/${chatId}/delete-users/`, {
        users_ids: [userId],
      });
      if (resp.status === 200 || resp.status === 201) {
        Notify.success({ text: "Участник удалён" });
        setMembersState(resp.data.members);
        setOpenMenu(false);
      } else {
        Notify.error({ text: "Ошибка при удалении участника" });
      }
    } catch (e) {
      Notify.error({ text: "Ошибка при удалении участника" });
    } finally {
      setIsRemoving(false);
    }
  };
  // --- API: назначить админом ---
  const [isPromoting, setIsPromoting] = useState(false);
  const handlePromoteUser = async (userId) => {
    setIsPromoting(true);
    try {
      const resp = await api.post(`/messenger/group/${chatId}/change-role/`, {
        user_id: userId,
        role: "admin",
      });
      if (resp.status === 200 || resp.status === 201) {
        Notify.success({ text: "Права администратора выданы" });
        setMembersState(resp.data.members);
        setOpenMenu(false);
      } else {
        Notify.error({ text: "Ошибка при изменении роли" });
      }
    } catch (e) {
      Notify.error({ text: "Ошибка при изменении роли" });
    } finally {
      setIsPromoting(false);
    }
  };
  // --- API: снять роль админа ---
  const [isDemoting, setIsDemoting] = useState(false);
  const handleDemoteUser = async (userId) => {
    setIsDemoting(true);
    try {
      const resp = await api.post(`/messenger/group/${chatId}/change-role/`, {
        user_id: userId,
        role: "member",
      });
      if (resp.status === 200 || resp.status === 201) {
        Notify.success({ text: "Права администратора сняты" });
        setMembersState(resp.data.members);
        setOpenMenu(false);
      } else {
        Notify.error({ text: "Ошибка при изменении роли" });
      }
    } catch (e) {
      Notify.error({ text: "Ошибка при изменении роли" });
    } finally {
      setIsDemoting(false);
    }
  };

  return (
    <div className="messenger-group-page group-members-view">
      <MobileTopHeader
        onBack={onBack}
        title="Участники группы"
        nextLabel={
          isSaving ? (
            <Preloader style={{ width: 20, height: 20 }} />
          ) : isCurrentUserAdmin ? (
            "Сохранить"
          ) : undefined
        }
        onNext={isCurrentUserAdmin ? handleSave : undefined}
        disabledGroup={isSaving || !groupName}
      />
      <div className="messenger-group-page__content container">
        <div
          className="messenger-group-page__input-row"
          style={{ marginBottom: 24 }}
        >
          <label
            className="messenger-group-page__photo-btn"
            onClick={onAddPhoto}
            style={{ cursor: isCurrentUserAdmin ? "pointer" : "default" }}
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
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#eee",
                }}
              />
            )}
          </label>
          <div className="messenger-group-page__input-title">
            <EditIcon />
            <input
              type="text"
              value={groupName}
              onChange={
                isCurrentUserAdmin
                  ? (e) => setGroupName(e.target.value)
                  : undefined
              }
              placeholder={translate("Название группы", "messenger.groupName")}
              className="messenger-group-page__input"
              readOnly={!isCurrentUserAdmin}
            />
          </div>
        </div>
        <div style={{ marginTop: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {membersState.map((user) => (
              <div
                key={user.id}
                className="messenger-search-page__result"
                style={{ margin: 0, padding: "8px 0 8px 12px" }}
              >
                <div>
                  <img
                    src={
                      user.avatar?.medium ||
                      user.avatar?.file ||
                      user.avatar ||
                      ""
                    }
                    alt={user.full_name || user.name}
                    className="messenger-search-page__result-avatar"
                  />
                  <div className="messenger-search-page__result-info">
                    <div className="messenger-search-page__result-name">
                      {user.id === currentUser.id
                        ? "Вы"
                        : user.full_name || user.name}
                      {user.is_admin && (
                        <span
                          style={{
                            color: "#868D98",
                            fontSize: 13,
                            marginLeft: 8,
                          }}
                        >
                          Администратор
                        </span>
                      )}
                    </div>
                    {user.role === "admin" && (
                      <div className="messenger-search-page__result-nick">
                        Администратор
                      </div>
                    )}
                  </div>
                </div>
                {/* Кнопка меню только для админа группы */}
                {isCurrentUserAdmin && user.id !== currentUser.id && (
                  <button
                    onClick={() => {
                      setCurrentUserMenu(user);
                      setOpenMenu(true);
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
                        d="M10.2852 6.85718C10.2852 5.91432 11.0566 5.14289 11.9994 5.14289C12.9423 5.14289 13.7137 5.91432 13.7137 6.85718C13.7137 7.80003 12.9423 8.57146 11.9994 8.57146C11.0566 8.57146 10.2852 7.80003 10.2852 6.85718ZM13.7137 12C13.7137 12.9429 12.9423 13.7143 11.9994 13.7143C11.0566 13.7143 10.2852 12.9429 10.2852 12C10.2852 11.0572 11.0566 10.2857 11.9994 10.2857C12.9423 10.2857 13.7137 11.0572 13.7137 12ZM13.7137 17.1429C13.7137 18.0857 12.9423 18.8572 11.9994 18.8572C11.0566 18.8572 10.2852 18.0857 10.2852 17.1429C10.2852 16.2 11.0566 15.4286 11.9994 15.4286C12.9423 15.4286 13.7137 16.2 13.7137 17.1429Z"
                        fill="#4285F4"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <MobileMenu
        isOpen={openMenu}
        contentLabel={translate("Настройки", "app.settings")}
        onRequestClose={() => setOpenMenu(false)}
        overlayClassName="my-custom-modal-overlay-group"
      >
        {currentUserMenu && (
          <div className="messenger-chat-menu__user">
            <Avatar
              src={
                currentUserMenu?.avatar?.medium ||
                currentUserMenu?.avatar?.file ||
                ""
              }
              size={60}
              alt={currentUserMenu?.full_name}
              className="avatar__bordered"
            />
            <div className="messenger-chat-menu__user-info">
              <div className="messenger-chat-menu__user-name">
                {currentUserMenu?.full_name}
              </div>
              {(currentUserMenu?.username || currentUserMenu?.nickname) && (
                <div className="messenger-chat-menu__user-nick">
                  {currentUserMenu.username || currentUserMenu.nickname}
                </div>
              )}
              {currentUserMenu?.id && (
                <div className="messenger-chat-menu__user-uid">
                  UID {currentUserMenu.id}
                </div>
              )}
              {currentUserMenu?.phone_number && (
                <div className="messenger-chat-menu__user-phone">
                  <span className="messenger-chat-menu__user-phone-link">
                    {currentUserMenu.phone_number}
                  </span>
                  <button
                    className="messenger-chat-menu__copy-btn"
                    onClick={() =>
                      navigator.clipboard
                        .writeText(currentUserMenu.phone_number)
                        .then(() => {
                          Notify.success({ text: "Скопировано!" });
                        })
                    }
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.5715 1.71436C15.6912 1.71436 16.6437 2.42994 16.9967 3.42872L8.68105 3.42864C7.15273 3.42864 6.59853 3.58777 6.0398 3.88658C5.48107 4.1854 5.04257 4.62389 4.74376 5.18262C4.44495 5.74135 4.28582 6.29556 4.28582 7.82387L4.28589 16.9966C3.28712 16.6437 2.57153 15.6911 2.57153 14.5715V6.85721C2.57153 4.01689 4.87407 1.71436 7.71439 1.71436H14.5715ZM18.0001 5.14293C19.4203 5.14293 20.5715 6.2942 20.5715 7.71436V18.8572C20.5715 20.2774 19.4203 21.4286 18.0001 21.4286H8.57153C7.15137 21.4286 6.0001 20.2774 6.0001 18.8572V7.71436C6.0001 6.2942 7.15137 5.14293 8.57153 5.14293H18.0001ZM18.0001 6.85721H8.57153C8.09815 6.85721 7.71439 7.24097 7.71439 7.71436V18.8572C7.71439 19.3306 8.09815 19.7144 8.57153 19.7144H18.0001C18.4735 19.7144 18.8572 19.3306 18.8572 18.8572V7.71436C18.8572 7.24097 18.4735 6.85721 18.0001 6.85721Z"
                        fill="#4285F4"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="menu-actions">
          {currentUserMenu?.role === "admin" ? (
            <RowButton
              label={"Отменить админа"}
              type={ROW_BUTTON_TYPES.button}
              onClick={() => handleDemoteUser(currentUserMenu.id)}
              className="post-comments-page__menu-btn"
              showArrow={false}
              style={{ color: "#D72C20" }}
              endIcon={isDemoting && <Preloader />}
              disabled={isDemoting}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 23C6.443 21.765 2 16.522 2 11V5L12 1L22 5V11C22 16.524 17.557 21.765 12 23ZM4 6V11C4.05715 13.3121 4.87036 15.5418 6.31518 17.3479C7.75999 19.1539 9.75681 20.4367 12 21C14.2432 20.4367 16.24 19.1539 17.6848 17.3479C19.1296 15.5418 19.9429 13.3121 20 11V6L12 3L4 6Z"
                  fill="#D72C20"
                />
                <path
                  d="M12 11C13.3807 11 14.5 9.88071 14.5 8.5C14.5 7.11929 13.3807 6 12 6C10.6193 6 9.5 7.11929 9.5 8.5C9.5 9.88071 10.6193 11 12 11Z"
                  fill="#D72C20"
                />
                <path
                  d="M7 15C7.49273 15.8983 8.21539 16.6496 9.09398 17.1767C9.97256 17.7039 10.9755 17.988 12 18C13.0245 17.988 14.0274 17.7039 14.906 17.1767C15.7846 16.6496 16.5073 15.8983 17 15C16.975 13.104 13.658 12 12 12C10.333 12 7.025 13.104 7 15Z"
                  fill="#D72C20"
                />
              </svg>
            </RowButton>
          ) : (
            <RowButton
              label={"Назначить админом"}
              type={ROW_BUTTON_TYPES.button}
              onClick={() => handlePromoteUser(currentUserMenu.id)}
              className="post-comments-page__menu-btn"
              showArrow={false}
              endIcon={isPromoting && <Preloader />}
              disabled={isPromoting}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 23C6.443 21.765 2 16.522 2 11V5L12 1L22 5V11C22 16.524 17.557 21.765 12 23ZM4 6V11C4.05715 13.3121 4.87036 15.5418 6.31518 17.3479C7.75999 19.1539 9.75681 20.4367 12 21C14.2432 20.4367 16.24 19.1539 17.6848 17.3479C19.1296 15.5418 19.9429 13.3121 20 11V6L12 3L4 6Z"
                  fill="black"
                />
                <path
                  d="M12 11C13.3807 11 14.5 9.88071 14.5 8.5C14.5 7.11929 13.3807 6 12 6C10.6193 6 9.5 7.11929 9.5 8.5C9.5 9.88071 10.6193 11 12 11Z"
                  fill="black"
                />
                <path
                  d="M7 15C7.49273 15.8983 8.21539 16.6496 9.09398 17.1767C9.97256 17.7039 10.9755 17.988 12 18C13.0245 17.988 14.0274 17.7039 14.906 17.1767C15.7846 16.6496 16.5073 15.8983 17 15C16.975 13.104 13.658 12 12 12C10.333 12 7.025 13.104 7 15Z"
                  fill="black"
                />
              </svg>
            </RowButton>
          )}
          <RowButton
            label={"Удалить из группы"}
            type={ROW_BUTTON_TYPES.button}
            onClick={() => handleRemoveUser(currentUserMenu.id)}
            className="post-comments-page__menu-btn"
            showArrow={false}
            style={{ color: "#D72C20" }}
            endIcon={isRemoving && <Preloader />}
            disabled={isRemoving}
          >
            <DeleteIcon />
          </RowButton>
        </div>
      </MobileMenu>
      <CameraCaptureModal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

GroupMembersView.propTypes = {
  members: PropTypes.array,
  title: PropTypes.string,
  image: PropTypes.string,
  onBack: PropTypes.func,
  chatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default GroupMembersView;
