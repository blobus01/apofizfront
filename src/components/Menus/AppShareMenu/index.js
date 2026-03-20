import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ContainedCloseIcon, LinkIcon, ShareIcon } from "../../UI/Icons";
import PostCardToScreen from "./PostCardToScreen";
import { translate } from "../../../locales/locales";
import { domToBlob } from "modern-screenshot";
import { getImageByURL } from "../../../store/services/commonServices";
import { getUrlExtension } from "../../../common/helpers";
import Preloader from "../../Preloader";
import { copyTextToClipboard, downloadFile } from "../../../common/utils";
import config from "../../../config";
import Notify from "../../Notification";
import vCardsJS from "vcards-js";
import "./index.scss";

const AppShareMenu = ({ post: app, onClose }) => {
  const cardRef = useRef(null);
  // const shareUrl = `${config.baseURL}/apps/${app.title.replace(/\s+/g, "_")}`;
  const shareUrl = `${config.baseURL}/apps/${app.slug}`;

  const [isImagesLoading, setIsImagesLoading] = useState(true);
  const [postBase64Image, setPostBase64Image] = useState(null);
  const [orgBase64Image, setOrgBase64Image] = useState(null);
  const [isLoadingVCardImage, setIsLoadingVCardImage] = useState(false);

  const images = useMemo(() => {
    return {
      postImage: app.selected_banner && app.selected_banner.image.file,
      orgImage: app.image && app.image.medium,
    };
  }, [app]);

  const getVCard = async () => {
    const vCard = vCardsJS();

    try {
      if (app.image && app.image.medium) {
        setIsLoadingVCardImage(true);
        const res = await getImageByURL(app.image.medium);
        const imageType = getUrlExtension(app.image.medium);
        vCard.photo.embedFromString(res.data.base64_image, imageType);
        vCard.logo.embedFromString(res.data.base64_image, imageType);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVCardImage(false);
    }

    vCard.organization = app.title;
    vCard.firstName = app.title;
    vCard.workPhone = app.phone_numbers
      ? app.phone_numbers.map((PH) => PH.phone_number)
      : null;
    vCard.workAddress.street = app.address;
    vCard.isOrganization = true;
    return vCard;
  };

  // const handleShare = async () => {
  //   if (isLoadingVCardImage) return;
  //   const vCard = await getVCard();
  //   const blob = new Blob([vCard.getFormattedString()], {
  //     type: "text/vcard",
  //   });
  //   downloadFile(blob, app.title);
  // };

  const handleShare = async () => {
    // предотвращаем двойной вызов, если картинки ещё не готовы
    if (isImagesLoading || !navigator.share || !cardRef.current) return;

    try {
      // небольшой "микро-таймаут", чтобы React успел дорендерить DOM
      await new Promise((r) => setTimeout(r, 150));

      const blob = await domToBlob(cardRef.current, {
        type: "",
        backgroundColor: "#000",
      });

      if (!blob) throw new Error("Не удалось создать изображение");

      const file = new File([blob], "image.png", { type: blob.type });

      const payload = {
        files: [file],
        title: app.title || "",
        text: app.description ? `${app.description}\n\n${shareUrl}` : shareUrl,
      };

      await navigator.share(payload);
    } catch (e) {
      console.error("Ошибка при шаринге:", e);
    }
  };

  const getImageInBase64 = useCallback(async (url) => {
    try {
      return await getImageByURL(url);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  useEffect(() => {
    const { postImage, orgImage } = images;

    Promise.all([
      postImage &&
        getImageInBase64(postImage).then(
          (res) => res && setPostBase64Image(res.data.base64_image)
        ),
      orgImage &&
        getImageInBase64(orgImage).then(
          (res) => res && setOrgBase64Image(res.data.base64_image)
        ),
    ]).then(() => setIsImagesLoading(false));
  }, [getImageInBase64, images]);

  const handleCopy = () => {
    copyTextToClipboard(shareUrl, () => {
      Notify.copyLinkSuccess({
        text: translate("Ссылка скопирована", "dialog.linkCopySuccess"),
      });
    });
    onClose();
  };

  return (
    <div className="post-share-view container">
      <div
        className="post-share-view__banner"
        style={{
          backgroundImage: `url(${app.selected_banner.image.file})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="post-share-view__close-btn"
        >
          <ContainedCloseIcon />
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="post-share-view__upload-btn"
        >
          <ShareIcon fill="#fff" />
        </button>
      </div>

      {isImagesLoading ? (
        <Preloader className="post-share-view__preloader" />
      ) : (
        <div className="post-share-view__content">
          <div className="post-share-view__top">
            <div className="post-share-view__card-wrap" ref={cardRef}>
              <PostCardToScreen
                app={app}
                postImage={
                  postBase64Image &&
                  `data:image/${getUrlExtension(
                    images.postImage
                  )};base64,${postBase64Image}`
                }
                orgImage={
                  orgBase64Image &&
                  `data:image/${getUrlExtension(
                    images.orgImage
                  )};base64,${orgBase64Image}`
                }
                className="post-share-view__card"
              />
            </div>
          </div>

          <div className="organization-qr__controls dfc">
            <button
              type="button"
              className="organization-qr__controls-btn organization-qr__controls-share"
              onClick={async () => {
                try {
                  const sharePayload = {
                    title: app.title,
                    text: app.description,
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
              onClick={handleCopy}
            >
              <span className="organization-qr__controls-btn-icon-wrap">
                <LinkIcon />
              </span>
              <p>{translate("Ссылка", "app.link")}</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppShareMenu;
