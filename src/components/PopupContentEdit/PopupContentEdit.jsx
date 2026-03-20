import { translate } from "@locales/locales";
import { EditIcon } from "@pages/MessengerGroupPage";
import { AddFolderIcon, DeleteIcon } from "./icons";
import Preloader from "@components/Preloader";
import {
  DisableCommentsIcon,
  EnabledCommentsIcon,
} from "@pages/MessengerChatPage";
import Notify from "@components/Notification";
import api from "axios-api";
import { useState } from "react";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import useDialog from "@components/UI/Dialog/useDialog";
import SelectFoldersView from "@components/SelectFoldersView/SelectFoldersView";

const PopupContentEdit = ({
  onSelect,
  onDelete,
  onBlock,
  onViewAll,
  onDeleteAll,
  setIsFolders,
  addFolderOpen,
  chat,
  setChats,
  setAddFolderOpen,
  onOpenFolders,
  fetchChats,
  organizationId: organization_Id,
  setIsDeletingChatCheck,
  fetchFolders,
  selectedChat,
  setChatFolders,
  setSelectedChat,
  ...rest
}) => {
  const [isTogglingBlock, setIsTogglingBlock] = useState(false);
  const location = useLocation();
  const paramsLocation = new URLSearchParams(location.search);
  const organizationId =
    paramsLocation.get("organization_id") || organization_Id;
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const { confirm } = useDialog();

  const handleUnblockChat = async () => {
    try {
      setIsTogglingBlock(true);

      await api.delete(`/messenger/chats/${chat.id}/block/`);

      fetchChats && fetchChats();

      Notify.success({
        text: translate("Чат разблокирован", "messenger.chatUnblocked"),
      });
    } catch (err) {
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

  const handleBlockChat = async () => {
    try {
      setIsTogglingBlock(true);

      await api.post(`/messenger/chats/${chat.id}/block/`);

      fetchChats && fetchChats();

      Notify.success({
        text: translate("Чат заблокирован", "messenger.chatBlocked"),
      });
    } catch (err) {
      Notify.error({
        text: translate("Ошибка блокировки чата", "messenger.errorBlockChat"),
      });
    } finally {
      setIsTogglingBlock(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!chat?.id) return;

    try {
      await confirm({
        title: translate("Удалить чат", "app.deleteChat"),
        description: translate(
          "Вы действительно хотите удалить этот чат?",
          "dialog.removeChat",
        ),
        confirmTitle: translate("Да", "app.yes"),
        cancelTitle: translate("Нет", "app.no"),
      });
    } catch {
      // пользователь нажал "Нет"
      return;
    }

    try {
      setIsDeletingChat(true);
      setIsDeletingChatCheck?.(true);

      await api.delete(`/messenger/chats/${chat.id}/`);

      fetchChats?.();

      Notify.success({
        text: translate("Чат удалён", "messenger.chatDeleted"),
      });
    } catch (e) {
      Notify.error({
        text: translate(
          "Ошибка при удалении чата",
          "messenger.errorDeleteChat",
        ),
      });
    } finally {
      setIsDeletingChat(false);
      setIsDeletingChatCheck?.(false);
    }
  };

  return (
    <div className="comment__popup" {...rest}>
      <button className="comment__popup-btn" onClick={() => {
        onOpenFolders()
        setSelectedChat(chat.id)
      }}>
        <AddFolderIcon />
        {translate("Добавить в папку", "messenger.addFolder")}
      </button>
      {chat?.is_blocked ? (
        chat?.blocked_by_me ? (
          <button
            className="comment__popup-btn comment__popup-btn--success"
            onClick={handleUnblockChat}
            disabled={isTogglingBlock}
          >
            <EnabledCommentsIcon fill="#34A853" />
            <span>
              {chat?.chat_type === "group" && !organizationId
                ? translate("Разблокировать группу", "messenger.unblockGroup")
                : translate("Разблокировать чат", "messenger.unblockChat")}
            </span>
            {isTogglingBlock && <Preloader />}
          </button>
        ) : (
          <div className="comment__popup-info">
            {translate(
              "Чат заблокирован собеседником",
              "messenger.chatBlockedByOther",
            )}
          </div>
        )
      ) : (
        <button
          className="comment__popup-btn comment__popup-btn--danger"
          onClick={handleBlockChat}
          disabled={isTogglingBlock}
        >
          <DisableCommentsIcon fill="#FF3B30" />
          <span>
            {chat?.chat_type === "group" && !organizationId
              ? translate("Заблокировать группу", "messenger.blockGroup")
              : translate("Заблокировать чат", "messenger.blockChat")}
          </span>
          {isTogglingBlock && <Preloader />}
        </button>
      )}

      <button
        className="comment__popup-btn"
        style={{ color: "#FF3B30" }}
        onClick={handleDeleteChat}
      >
        <DeleteIcon fill={"#FF3B30"} />
        {translate("Удалить чат", "messenger.deleteChat")}
      </button>

     
    </div>
  );
};

export default PopupContentEdit;
