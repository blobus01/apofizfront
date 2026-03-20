import React from "react";
import Modal from "react-modal";
import { mobileMenuStyles } from "../../assets/styles/modal";
import { CloseButton } from "../UI/Icons";
import { translate } from "../../locales/locales";
import classnames from "classnames";
import "./index.scss";

const MobileMenu = ({
  isOpen,
  onRequestClose,
  onClose,
  style = mobileMenuStyles,
  contentLabel,
  children,
  titleClassName,
  onCloseCoupon,
  containerSelector,
  overlayClassName,
  ...other
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else if (onCloseCoupon && !isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  const [customStyle, setCustomStyle] = React.useState({});
  React.useEffect(() => {
    if (containerSelector && isOpen) {
      const container = document.querySelector(containerSelector);
      if (container) {
        const rect = container.getBoundingClientRect();
        setCustomStyle({
          position: "fixed",
          left: rect.left + "px",
          width: rect.width + "px",
          maxWidth: rect.width + "px",
          bottom: "68px",
          maxHeight: rect.height + "px",
          margin: 0,
          borderRadius: "16px 16px 0 0",
        });
      }
    } else {
      setCustomStyle({});
    }
  }, [containerSelector, isOpen]);

  // Стили для overlay
  const [customOverlayStyle, setCustomOverlayStyle] = React.useState({});
  React.useEffect(() => {
    if (containerSelector && isOpen) {
      const container = document.querySelector(containerSelector);
      if (container) {
        const rect = container.getBoundingClientRect();
        setCustomOverlayStyle({
          position: "fixed",
          left: rect.left + "px",
          bottom: "68px",
          width: rect.width + "px",
          maxWidth: rect.width + "px",
          maxHeight: rect.height + "px",
          margin: 0,
          background: "rgba(0,0,0,0.18)",
          pointerEvents: "auto",
          zIndex: 1000,
        });
      }
    } else {
      setCustomOverlayStyle({});
    }
  }, [containerSelector, isOpen]);

  // new chanegs for modal

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel={"Example Modal"}
        overlayClassName={overlayClassName ?? ""}
        style={
          containerSelector && isOpen
            ? {
                ...style,
                content: { ...style.content, ...customStyle },
                overlay: { ...style.overlay, ...customOverlayStyle },
              }
            : style
        }
        appElement={document.getElementById("root")}
        {...other}
      >
        <div className="mobile-menu__top">
          <h5
            className={classnames(
              "mobile-menu__title f-20 f-800 tl",
              titleClassName
            )}
          >
            {contentLabel || translate("Настройки", "app.settings")}
          </h5>
          <CloseButton
            className="mobile-menu__close-btn"
            onClick={onClose ? onClose : onRequestClose}
          />
        </div>
        <div className="container">
          <div className="mobile-menu__content" id="mobile-menu-content">
            {children}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MobileMenu;
