import React, { useState, useEffect } from "react";
import { useRouteMatch } from "react-router-dom";
import api from "@/axios-api";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import Notify from "../../components/Notification";
import Preloader from "../../components/Preloader";

import "./index.scss";
import { CheckedIcon, CheckIcon } from "@components/UI/Icons";

function SelectFoldersView({
  onClose,
  chatId,
  setChatFolders,
  fetchFolders,
  SYSTEM_FOLDERS,
}) {
  const [folders, setFolders] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [newFolder, setNewFolder] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFolder = async () => {
    const trimmed = newFolder.trim();
    if (!trimmed || isCreating) return;

    // 🔥 Проверка на дубликат
    const alreadyExists = folders.some(
      (folder) => folder.title.trim().toLowerCase() === trimmed.toLowerCase(),
    );

    if (alreadyExists) {
      Notify.error({
        text: translate(
          "Такая папка уже существует",
          "messenger.folderAlreadyExists",
        ),
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await api.post("/messenger/folders/", {
        title: trimmed,
      });

      const createdFolder = response.data;

      setFolders((prev) => [createdFolder, ...prev]);

      setChatFolders?.((prev) => [createdFolder, ...prev]);

      setSelected((prev) => [...prev, createdFolder.id]);

      setNewFolder("");

      Notify.success({
        text: translate("Папка создана", "messenger.createdFolder"),
      });
    } catch (error) {
      console.log("CREATE FOLDER ERROR", error);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (!chatId) return;

    const fetchFolders = async () => {
      try {
        setIsLoadingFolders(true);
        const res = await api.get("/messenger/folders/");
        const list = res.data.list || [];

        setFolders(list);

        setSelected(
          list
            .filter((folder) =>
              (folder.chats || []).some((chat) => chat.id === chatId),
            )
            .map((folder) => folder.id),
        );
      } catch {
        Notify.error({ text: "Ошибка загрузки папок" });
      } finally {
        setIsLoadingFolders(false);
      }
    };

    fetchFolders();
  }, [chatId]);

  const toggleSelect = (folderId) => {
    setSelected((prev) =>
      prev.includes(folderId)
        ? prev.filter((v) => v !== folderId)
        : [...prev, folderId],
    );
  };

  const handleSave = async () => {
    if (!chatId) return;

    setLoading(true);

    try {
      await Promise.all(
        folders.map(async (folder) => {
          const currentChatIds = (folder.chats || []).map((c) =>
            typeof c === "object" ? c.id : c,
          );

          const shouldBeSelected = selected.includes(folder.id);
          const alreadyInFolder = currentChatIds.includes(chatId);

          if (shouldBeSelected === alreadyInFolder) return;

          const updatedChats = shouldBeSelected
            ? [...currentChatIds, chatId]
            : currentChatIds.filter((id) => id !== chatId);

          await api.put(`/messenger/folders/${folder.id}/`, {
            title: folder.title,
            chats: updatedChats,
          });
        }),
      );

      // 🔥 ОБНОВЛЯЕМ ПАПКИ
      const updatedFolders = await api.get("/messenger/folders/");
      setFolders(updatedFolders.data.list || []);

      Notify.success({
        text: translate("Папки обновлены", "messenger.foldersUpdated"),
      });

      await fetchFolders();
      onClose?.();
    } catch (error) {
      console.log(error);
      Notify.error({ text: "Ошибка при сохранении" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="select-folders-view">
      <MobileTopHeader
        onBack={onClose}
        title={translate("Выбор папки", "messenger.addFolder")}
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

      <div className="select-folders">
        <div className="select-folders__create">
          <input
            type="text"
            placeholder={translate("Название папки", "messenger.nameFolder")}
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            className="select-folders__input"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
            }}
          />

          <button
            className="select-folders__create-btn"
            onClick={handleCreateFolder}
            disabled={isCreating}
          >
            {isCreating ? (
              <Preloader style={{ height: 16, width: 16 }} />
            ) : (
              translate("Создать", "app.create")
            )}
          </button>
        </div>

        {isLoadingFolders ? (
          <div className="select-folders__loader">
            <Preloader />
          </div>
        ) : folders.length === 0 ? (
          <div className="select-folders__empty">
            {translate("Нет папок", "messenger.noFolders")}
          </div>
        ) : (
          <ul className="select-folders__list">
            {folders.map((folder) => {
              const isActive = selected.includes(folder.id);

              return (
                <li
                  key={folder.id}
                  className={`select-folders__item ${
                    isActive ? "select-folders__item--active" : ""
                  }`}
                  onClick={() => toggleSelect(folder.id)}
                >
                  <div className="select-folders__content">
                    <div className="select-folders__title">{folder.title}</div>

                    <div className="select-folders__icon">
                      {isActive ? <CheckedIcon /> : <CheckIcon />}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SelectFoldersView;
