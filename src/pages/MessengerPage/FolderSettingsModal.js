import React, { useState, useEffect } from "react";
import Avatar from "@ui/Avatar";
import PropTypes from "prop-types";
import "./FolderSettingsModal.scss";
import Lottie from "lottie-react";
import addFolderAnimation from "./Add_folder.json";
import { DeleteIcon } from "@components/UI/Icons";
import { translate } from "@locales/locales";
import Preloader from "@components/Preloader";

const FolderSettingsModal = ({
  open,
  onClose,
  onSave,
  avatar,
  defaultValue,
  showAddFolderAnimation,
  onDelete,
  loadingFolder,
  isChatDesctop,
}) => {
  const [value, setValue] = useState(defaultValue || "");

  useEffect(() => {
    if (open) setValue(defaultValue || "");
  }, [open, defaultValue]);

  if (!open) return null;

  return (
    <div
      className="folder-modal__backdrop"
      style={isChatDesctop ? { position: "absolute" } : null}
      onClick={onClose}
    >
      <div
        className="folder-modal__window"
        onClick={(e) => e.stopPropagation()}
      >
        {onDelete && (
          <button className="folder-modal__delete" onClick={onDelete}>
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
          </button>
        )}
        <button className="folder-modal__close" onClick={onClose}>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.73641 0.263604C10.0879 0.615076 10.0879 1.18492 9.73641 1.5364L6.273 5L9.73641 8.46362C10.0586 8.7858 10.0854 9.29148 9.81695 9.64424L9.73641 9.73641C9.38494 10.0879 8.81509 10.0879 8.46362 9.73641L5 6.273L1.5364 9.73641C1.18492 10.0879 0.615076 10.0879 0.263604 9.73641C-0.0878679 9.38494 -0.0878679 8.81509 0.263604 8.46362L3.727 5L0.263604 1.5364C-0.0585786 1.21421 -0.0854272 0.708534 0.183058 0.355769L0.263604 0.263604C0.615076 -0.087868 1.18492 -0.087868 1.5364 0.263604L5 3.727L8.46362 0.263604C8.81509 -0.087868 9.38494 -0.087868 9.73641 0.263604Z"
              fill="#007AFF"
            />
          </svg>
        </button>
        <div className="folder-modal__header">
          <span>
            {translate("Настройки папки", "messenger.settingsFolder")}
          </span>
        </div>
        <div className="folder-modal__icon-wrap">
          <Lottie
            animationData={addFolderAnimation}
            loop={false}
            style={{ width: 70, height: 70 }}
          />
        </div>
        <input
          className="folder-modal__input"
          name="folder"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={translate("Название папки", "messenger.nameFolder")}
        />
        <button
          className="folder-modal__save"
          onClick={() => {
            onSave(value);
            setValue("");
          }}
          disabled={!value.trim() || loadingFolder}
        >
          {loadingFolder ? <Preloader /> : translate("Сохранить", "app.save")}
        </button>
      </div>
    </div>
  );
};

FolderSettingsModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  avatar: PropTypes.string,
  defaultValue: PropTypes.string,
  showAddFolderAnimation: PropTypes.bool,
  onDelete: PropTypes.func,
};

export default FolderSettingsModal;
