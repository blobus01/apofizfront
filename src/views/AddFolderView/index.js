import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import React, { useState, useEffect } from "react";
import api from "@/axios-api";
import FolderSettingsModal from "@pages/MessengerPage/FolderSettingsModal";
import Notify from "../../components/Notification";
import Preloader from "../../components/Preloader";

import "./index.scss";

function AddFolderVaiew({ onBack, id, onCloseChat }) {
  const [selected, setSelected] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFoldersLoading, setIsFoldersLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsFoldersLoading(true);
    api.get("/messenger/folders/").then((res) => {
      if (!isMounted) return;
      setFolders(res.data.list || []);
      setSelected(
        (res.data.list || [])
          .filter((folder) => folder.chats.some((chat) => chat.id === id))
          .map((folder) => folder.id)
      );
      setIsFoldersLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const toggleSelect = (folderId) => {
    setSelected((prev) =>
      prev.includes(folderId)
        ? prev.filter((v) => v !== folderId)
        : [...prev, folderId]
    );
  };

  const handleSave = async () => {
    if (selected.length === 0 && folders.length === 0) return;
    setLoading(true);
    let isMounted = true;
    try {
      let lastAction = null;
      let hadError = false;
      await Promise.all(
        folders.map(async (folder) => {
          let chatIds = folder.chats.map((c) => c.id);
          const shouldBe = selected.includes(folder.id);
          const hasChat = chatIds.includes(id);
          if (shouldBe && !hasChat) {
            chatIds = [...chatIds, id];
            const resp = await api.put(`/messenger/folders/${folder.id}/`, {
              title: folder.title,
              chats: chatIds,
            });
            if (resp.status === 200 || resp.status === 204) {
              lastAction = `Чат добавлен в папку: ${folder.title}`;
            } else {
              hadError = true;
              Notify.error({
                text: `Ошибка при добавлении в папку: ${folder.title}`,
              });
            }
          } else if (!shouldBe && hasChat) {
            chatIds = chatIds.filter((cId) => cId !== id);
            const resp = await api.put(`/messenger/folders/${folder.id}/`, {
              title: folder.title,
              chats: chatIds,
            });
            if (resp.status === 200 || resp.status === 204) {
              lastAction = `Чат удалён из папки: ${folder.title}`;
            } else {
              hadError = true;
              Notify.error({
                text: `Ошибка при удалении из папки: ${folder.title}`,
              });
            }
          }
        })
      );
      setIsFoldersLoading(true);
      const res = await api.get("/messenger/folders/");
      if (!isMounted) return;
      if (res.status === 200 && res.data && Array.isArray(res.data.list)) {
        setFolders(res.data.list || []);
        setIsFoldersLoading(false);
        setSelected([]);
        onBack();
        onCloseChat();
        if (lastAction && !hadError) Notify.success({ text: lastAction });
      } else {
        Notify.error({ text: "Ошибка при получении списка папок" });
      }
    } catch (e) {
      Notify.error({ text: "Ошибка при добавлении чата в папки" });
    } finally {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  };

  const handleSaveFolder = async (title) => {
    setModalLoading(true);
    let isMounted = true;
    try {
      const resp = await api.post("/messenger/folders/", {
        title,
        chats: [id],
      });
      if (resp.status === 201 || resp.status === 200) {
        setIsFoldersLoading(true);
        const res = await api.get("/messenger/folders/");
        if (!isMounted) return;
        if (res.status === 200 && res.data && Array.isArray(res.data.list)) {
          setFolders(res.data.list || []);
          setIsFoldersLoading(false);
          setModalOpen(false);
          onBack();
          onCloseChat();
          Notify.success({ text: "Папка создана и чат добавлен" });
        } else {
          Notify.error({ text: "Ошибка при получении списка папок" });
        }
      } else {
        Notify.error({ text: "Ошибка при создании папки" });
      }
    } catch (e) {
      Notify.error({ text: "Ошибка при создании папки" });
    } finally {
      setModalLoading(false);
    }
    return () => {
      isMounted = false;
    };
  };

  return (
    <div className="add-folder-view">
      <MobileTopHeader
        onBack={onBack}
        title={translate("Добавить в папку", "org.bannerSelection")}
        onSubmit={handleSave}
        onClick={handleSave}
        submitLabel={
          loading ? (
            <Preloader style={{ height: 20, width: 20 }} />
          ) : (
            translate("Сохранить", "app.save")
          )
        }
      />
      <div className="container">
        <ul>
          <li className="create__folder" onClick={() => setModalOpen(true)}>
            <p>Создать папку</p>
            <div>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 14H12M12 14H14M12 14V16M12 14V12"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M2 6.95C2 6.067 2 5.626 2.07 5.258C2.21922 4.46784 2.60314 3.741 3.17165 3.17231C3.74017 2.60361 4.46689 2.21947 5.257 2.07C5.626 2 6.068 2 6.95 2C7.336 2 7.53 2 7.716 2.017C8.51705 2.09223 9.27679 2.40728 9.896 2.921C10.04 3.04 10.176 3.176 10.45 3.45L11 4C11.816 4.816 12.224 5.224 12.712 5.495C12.9802 5.64449 13.2648 5.7626 13.56 5.847C14.098 6 14.675 6 15.828 6H16.202C18.834 6 20.151 6 21.006 6.77C21.0853 6.84 21.16 6.91467 21.23 6.994C22 7.849 22 9.166 22 11.798V14C22 17.771 22 19.657 20.828 20.828C19.656 21.999 17.771 22 14 22H10C6.229 22 4.343 22 3.172 20.828C2.001 19.656 2 17.771 2 14V6.95Z"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </li>
          {isFoldersLoading ? (
            <div style={{ padding: 32, textAlign: "center" }}>
              <Preloader />
            </div>
          ) : (
            folders.map((folder) => (
              <li
                key={folder.id}
                className={selected.includes(folder.id) ? "active" : ""}
                onClick={() => toggleSelect(folder.id)}
              >
                <p className="tl">{folder.title}</p>
                {selected.includes(folder.id) ? <CheckedIcon /> : <CheckIcon />}
              </li>
            ))
          )}
        </ul>
      </div>
      <FolderSettingsModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveFolder}
        showAddFolderAnimation={false}
      />
    </div>
  );
}

export default AddFolderVaiew;

const CheckedIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ minWidth: 20, minHeight: 20 }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM8.823 12.14L6.058 9.373L5 10.431L8.119 13.552C8.30653 13.7395 8.56084 13.8448 8.826 13.8448C9.09116 13.8448 9.34547 13.7395 9.533 13.552L15.485 7.602L14.423 6.54L8.823 12.14Z"
      fill="#1270EC"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ minWidth: 20, minHeight: 20 }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM10 18.8C12.3339 18.8 14.5722 17.8729 16.2225 16.2225C17.8729 14.5722 18.8 12.3339 18.8 10C18.8 7.66609 17.8729 5.42778 16.2225 3.77746C14.5722 2.12714 12.3339 1.2 10 1.2C7.66609 1.2 5.42778 2.12714 3.77746 3.77746C2.12714 5.42778 1.2 7.66609 1.2 10C1.2 12.3339 2.12714 14.5722 3.77746 16.2225C5.42778 17.8729 7.66609 18.8 10 18.8Z"
      fill="#1270EC"
    />
  </svg>
);
