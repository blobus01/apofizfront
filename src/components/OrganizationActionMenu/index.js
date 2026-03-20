import React, { useState } from "react";
import MobileMenu from "@components/MobileMenu";
import RowButton, { ROW_BUTTON_TYPES } from "@components/UI/RowButton";
import { translate } from "@locales/locales";
import { PinIcon, ShareIcon, UnPin } from "./icons";
import "./index.scss";

const OrganizationActionsMenu = ({
  isOpen,
  onClose,
  isPinned,
  loading,
  onTogglePin,
  onShare,
}) => {
  const [animating, setAnimating] = useState(false);

  const handleTogglePin = async () => {
    // Сразу запускаем анимацию
    setAnimating(true);

    // Через 300ms снимаем анимацию
    setTimeout(() => setAnimating(false), 300);

    // Вызываем функцию для смены состояния
    await onTogglePin();
  };

  return (
    <MobileMenu
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={translate("Инструменты", "app.tools")}
    >
      <div className="organization-card__buttons">
        <button
          onClick={handleTogglePin}
          style={{ width: "100%" }}
          disabled={loading}
        >
          <RowButton
            type={ROW_BUTTON_TYPES.button}
            label={
              isPinned
                ? translate("Открепить", "app.unpin")
                : translate("Закрепить", "app.pin")
            }
            showArrow={false}
          >
            <span
              className={`icon-wrapper ${animating ? "icon-animate" : ""}`}
            >
              {/* Иконка меняется сразу */}
              {isPinned ? <UnPin /> : <PinIcon />}
        
            </span>
          </RowButton>
        </button>

        <button onClick={onShare} style={{ width: "100%" }}>
          <RowButton
            type={ROW_BUTTON_TYPES.button}
            label={translate("Поделиться", "app.share")}
            showArrow={false}
          >
            <ShareIcon />
          </RowButton>
        </button>
      </div>
    </MobileMenu>
  );
};

export default OrganizationActionsMenu;
