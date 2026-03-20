import React, { useState, Suspense } from "react";
import * as classnames from "classnames";
import { Link } from "react-router-dom";
import OrgAvatar from "../../UI/OrgAvatar";
import { LockIcon } from "../../UI/Icons";
import OrgVerification from "../../UI/OrgVerification";
import DivButton from "../../DivButton";
import "./index.scss";
import { DotsIcon, PinIcon, PinIconBold, ShareIcon } from "./icons";
import MobileMenu from "@components/MobileMenu";
import { translate } from "@locales/locales";
import Preloader from "@components/Preloader";
import OrganizationQR from "@components/OrganizationQR";
import { toast } from "react-toastify";
import { UnPin } from "@components/OrganizationActionMenu/icons";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Notify from "@components/Notification";
import { setSearchState } from "@store/actions/userActions";
import { useDispatch } from "react-redux";
import { copyTextToClipboard } from "@common/utils";
import config from "../../../config";

const OrganizationCard = ({
  id,
  image,
  title,
  type,
  description,
  redirect,
  verificationStatus,
  children,
  isPrivate,
  isBanned,
  pinned,
  onPinToggle,
  size = 40,
  onClick,
  noDots,
  withDots,
  className,
}) => {
  const [showOrganizationQR, setShowOrganizationQR] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const handleOpenMenu = (e) => {
    setIsMenuOpen(true);

    e.preventDefault();
  };

  const leftContent = (
    <div className="organization-card__left">
      <div
        className="organization-card__image-wrapper"
        style={{ position: "relative" }}
      >
        <OrgAvatar
          src={image}
          alt={title}
          size={size}
          borderRadius="11px"
          className="organization-card__image"
        />
        <div style={{ position: "absolute", top: "-8px", right: 2 }}>
          {pinned ? (
            <PinIconBold style={{ position: "absolute", top: 0, right: 0 }} />
          ) : (
            ""
          )}
        </div>
      </div>

      <div className="organization-card__right">
        {type && <p className="organization-card__type f-12">{type}</p>}
        <p
          className={classnames(
            "organization-card__title f-15 f-500 tl",
            isBanned && "organization-card__title--banned"
          )}
          style={{
            display: "flex",
            alignItems: "center",
            maxWidth: "97%",
            minWidth: 0, // важно для ellipsis во флекс-контейнере
            gap: "4px",
          }}
        >
          {verificationStatus && (
            <OrgVerification
              status={verificationStatus}
              className="organization-card__verification-status"
            />
          )}

          <span className="organization-card__title-text">{title}</span>
        </p>
        {description && (
          <p className="organization-card__desc f-12 f-400 tl">{description}</p>
        )}
        {children}
      </div>
    </div>
  );

  return (
    <div className={classnames("organization-card__wrap", className)}>
      {onClick ? (
        <DivButton onClick={onClick} className="organization-card__link">
          {leftContent}
        </DivButton>
      ) : (
        <Link
          to={redirect ? redirect() : `/organizations/${id}`}
          className="organization-card__link"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onClick={() => dispatch(setSearchState(false))}
        >
          {leftContent}
          {withDots ? (
            <>
              {isPrivate && (
                <div className="organization-card__type-icon">
                  <LockIcon />
                </div>
              )}
              <div
                onClick={(e) => handleOpenMenu(e)}
                className="organization-card__dots-icon"
              >
                <DotsIcon />
              </div>
            </>
          ) : (
            ""
          )}
        </Link>
      )}

      {showOrganizationQR && (
        <Suspense fallback={<Preloader />}>
          <OrganizationQR onClose={() => setShowOrganizationQR(false)} />
        </Suspense>
      )}

      <MobileMenu
        isOpen={isMenuOpen}
        onRequestClose={() => setIsMenuOpen(false)}
        onClose={() => setIsMenuOpen(false)}
        contentLabel={translate("Инструменты", "app.tools")}
      >
        <div className="tools-menu">
          <button
            className="tools-menu__btn"
            onClick={() => {
              onPinToggle(id, pinned); // 👈 ВАЖНО: вызываем функцию из родителя
              setIsMenuOpen(false); // закрываем меню
            }}
          >
            {pinned ? <UnPin /> : <PinIcon />}
            <span>
              {pinned
                ? translate("Открепить", "app.unpin")
                : translate("Закрепить", "app.pin")}
            </span>
          </button>

          <button
            className="tools-menu__btn"
            onClick={() => {
              const shareUrl = `${config.baseURL}/organizations/${id}`;
              copyTextToClipboard(shareUrl, () => {
                Notify.copyLinkSuccess({
                  text: translate(
                    "Ссылка скопирована",
                    "dialog.linkCopySuccess"
                  ),
                });
              });
            }}
          >
            <ShareIcon />
            <span> {translate("Поделиться", "app.share")}</span>
          </button>
        </div>
      </MobileMenu>
    </div>
  );
};

export default OrganizationCard;
