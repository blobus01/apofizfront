import React, { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  BusinessCardIcon,
  ContainedCloseIcon,
  LinkIcon,
  ShareIcon,
  LocationIconShare,
} from "../UI/Icons";
import config from "../../config";
import { copyTextToClipboard, downloadFile } from "../../common/utils";
import Notify from "../Notification";
import { translate } from "../../locales/locales";
import Pathes from "../../common/pathes";
import classnames from "classnames";
import AnimatedQr from "../Animated/AnimatedQr";
import vCardsJS from "vcards-js";
import { getImageByURL } from "../../store/services/commonServices";
import { createLinkOnMap, getUrlExtension } from "../../common/helpers";
import "./index.scss";
import { setViews } from "@store/actions/commonActions";
import { useDispatch } from "react-redux";
import { VIEW_TYPES } from "@components/GlobalLayer";

const OrganizationQR = ({ org, onClose, full_location }) => {
  const {
    title,
    description,
    image,
    phone_numbers,
    address,
    social_contacts,
    id,
  } = org;
  const [showBusinessCard, setShowBusinessCard] = useState(false);
  const [isInitialAnimationCompleted, setIsInitialAnimationCompleted] =
    useState(false);
  const [isLoadingVCardImage, setIsLoadingVCardImage] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const locationModalRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const getQRBusinessCard = () =>
    [
      `MECARD:N:${title}`,
      `ORG:${title}`,
      phone_numbers[0] ? `TEL:${phone_numbers[0].phone_number}` : null,
      address ? `ADR:${address}` : null,
      `URL:${`${config.domain}/${Pathes.Organization.get(id)}`};`,
    ]
      .filter((row) => !!row)
      .join(";");

  const insertURLSToVCard = (vCardString) => {
    const endStringMatch = vCardString.match(/END:VCARD/);
    const endStringMatchIdx = endStringMatch?.index;
    if (endStringMatch && typeof endStringMatchIdx === "number") {
      const urlsString = social_contacts.reduce((resString, SC) => {
        return resString + `URL;CHARSET=UTF-8:${SC.url}\n`;
      }, "");
      return (
        vCardString?.slice(0, endStringMatchIdx) +
        urlsString +
        vCardString?.slice(endStringMatchIdx)
      );
    }
    return vCardString;
  };

  const getVCard = async () => {
    const vCard = vCardsJS();

    // receiving org image in base 64
    try {
      if (image && image.medium) {
        setIsLoadingVCardImage(true);
        const res = await getImageByURL(image.medium);

        const imageType = getUrlExtension(image.medium);

        vCard.photo.embedFromString(res.data.base64_image, imageType);
        vCard.logo.embedFromString(res.data.base64_image, imageType);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVCardImage(false);
    }
    vCard.organization = title;
    vCard.firstName = title;
    vCard.workPhone = phone_numbers
      ? phone_numbers.map((PH) => PH.phone_number)
      : null;
    vCard.workAddress.street = address;
    vCard.isOrganization = true;
    return vCard;
  };

  const handleShare = async () => {
    if (isLoadingVCardImage) return;
    const vCard = await getVCard();
    const blob = new Blob([insertURLSToVCard(vCard.getFormattedString())], {
      type: "text/vcard",
    });
    downloadFile(blob, title);
  };

  const toggleLocationModal = () => setShowLocationModal(!showLocationModal);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        locationModalRef.current &&
        !locationModalRef.current.contains(event.target)
      ) {
        setShowLocationModal(false);
      }
    };

    if (showLocationModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLocationModal]);

  const onAddressClick = (location) =>
    dispatch(setViews({ type: VIEW_TYPES.map, location }));

  return (
    <div className="organization-qr">
      <div className="organization-qr__container">
        <div
          className="organization-qr__org-image"
          style={{ backgroundImage: `url(${image && image.file})` }}
        ></div>

        <div className="organization-qr__wrap">
          <div className="organization-qr__header">
            <button
              type="button"
              onClick={onClose}
              className="organization-qr__header-btn-close"
            >
              <ContainedCloseIcon />
            </button>
            <h4 className="organization-qr__header-title f-18 f-700">
              {title}
            </h4>
            <button
              type="button"
              onClick={handleShare}
              className="organization-qr__header-btn-share"
            >
              <ShareIcon fill="#fff" />
            </button>
          </div>

          <div className="organization-qr__code">
            {!isInitialAnimationCompleted && (
              <AnimatedQr
                style={{
                  position: "absolute",
                  top: showBusinessCard ? 10 : 17,
                  left: showBusinessCard ? 10 : 17,
                }}
                width={showBusinessCard ? 160 : 145}
                height={showBusinessCard ? 160 : 145}
                eventListeners={[
                  {
                    eventName: "complete",
                    callback: () => setIsInitialAnimationCompleted(true),
                  },
                ]}
                options={{ loop: false }}
              />
            )}
            {showBusinessCard ? (
              <QRCodeSVG
                bgColor="#FFFFFF"
                fgColor="#000"
                width={160}
                height={160}
                level="H"
                value={getQRBusinessCard()}
              />
            ) : (
              <QRCodeSVG
                bgColor="#FFFFFF"
                fgColor="#000"
                level="H"
                height={145}
                width={145}
                value={`${config.domain}/${Pathes.Organization.get(id)}`}
              />
            )}
          </div>

          <div className="organization-qr__controls dfc">
            <button
              type="button"
              className="organization-qr__controls-btn organization-qr__controls-share"
              onClick={async () => {
                try {
                  const shareUrl = `${config.baseURL}/organizations/${id}`;
                  const sharePayload = {
                    title: title,
                    text: description,
                    url: shareUrl,
                  };
                  await navigator.share(sharePayload);
                } catch (e) {}
              }}
            >
              <span className="organization-qr__controls-btn-icon-wrap">
                <ShareIcon />
              </span>
              <p>{translate("Поделиться", "app.share")}</p>
            </button>
            <button
              type="button"
              className="organization-qr__controls-btn organization-qr__controls-copy-link"
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
                onClose();
              }}
            >
              <span className="organization-qr__controls-btn-icon-wrap">
                <LinkIcon />
              </span>
              <p>{translate("Ссылка", "app.link")}</p>
            </button>
            {full_location.longitude && full_location.latitude && (
              <button
                type="button"
                className={classnames(
                  "organization-qr__controls-btn organization-qr__controls-business-card",
                  showBusinessCard && "active"
                )}
                onClick={toggleLocationModal}
              >
                <span className="organization-qr__controls-btn-icon-wrap">
                  <LocationIconShare />
                </span>
                <p>{translate("Локация", "app.location")}</p>
              </button>
            )}
            <button
              type="button"
              className={classnames(
                "organization-qr__controls-btn organization-qr__controls-business-card",
                showBusinessCard && "active"
              )}
              onClick={() => setShowBusinessCard(!showBusinessCard)}
            >
              <span className="organization-qr__controls-btn-icon-wrap">
                <BusinessCardIcon />
              </span>
              <p>{translate("Визитка", "app.businessCard")}</p>
            </button>
          </div>
          <p className="organization-qr__desc" style={{ textAlign: "center !important" }}>
            {showBusinessCard
              ? translate(
                  "<b>QR визитка организации</b> - Сканируйте для добавления в Ваши контакты",
                  "org.businessCardQrDesc",
                  {
                    b: (text) => <span style={{ textAlign: "center" }} className="f-500">{text}</span>,
                  }
                )
              : translate(
                  "<b>QR организации</b> - Сканируйте для перехода на страницу данной организации.",
                  "org.qrDesc",
                  {
                    b: (text) => <span className="f-500">{text}</span>,
                  }
                )}
          </p>
          {showLocationModal && (
            <div className="location-modal">
              <div
                className="location-modal__overlay"
                onClick={toggleLocationModal}
              ></div>
              <div className="location-modal__content" ref={locationModalRef}>
                <button
                  className="location-modal__option"
                  onClick={() => onAddressClick(full_location)}
                >
                  Открыть в картах
                </button>
                <button
                  className="location-modal__option"
                  onClick={() =>
                    window.open(
                      createLinkOnMap(
                        full_location.latitude,
                        full_location.longitude
                      ),
                      "_blank"
                    )
                  }
                >
                  Открыть в Google Maps
                </button>
                <button
                  className="location-modal__option"
                  onClick={() =>
                    window.open(
                      `https://yandex.ru/maps/?pt=${full_location.longitude},${full_location.latitude}&z=16`,
                      "_blank"
                    )
                  }
                >
                  Открыть в Yandex Картах
                </button>
                <button
                  className="location-modal__option"
                  onClick={() =>
                    window.open(
                      `https://2gis.ru/geo/${full_location.longitude},${full_location.latitude}`,
                      "_blank"
                    )
                  }
                >
                  Открыть в 2GIS
                </button>
                <button
                  className="location-modal__cancel"
                  onClick={toggleLocationModal}
                >
                  Отменить
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationQR;
