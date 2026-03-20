import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ContainedCloseIcon, ShareIcon } from "../../UI/Icons";
import PostCardToScreen from "./PostCardToScreen";
import WideButton, { WIDE_BUTTON_VARIANTS } from "../../UI/WideButton";
import { translate } from "../../../locales/locales";
import { domToBlob } from "modern-screenshot";
import { getImageByURL } from "../../../store/services/commonServices";
import { getPostImage, getUrlExtension } from "../../../common/helpers";
import Preloader from "../../Preloader";
import { copyTextToClipboard } from "../../../common/utils";
import config from "../../../config";
import Notify from "../../Notification";
import "./index.scss";

const PostShareMenu = ({ post, onClose }) => {
  const cardRef = useRef(null);
  const shareUrl = `${window.location.origin}/p/${post.id}`;

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  const [isImagesLoading, setIsImagesLoading] = useState(true);
  const [postBase64Image, setPostBase64Image] = useState(null);
  const [orgBase64Image, setOrgBase64Image] = useState(null);

  const images = useMemo(() => {
    return {
      postImage: getPostImage(post, "medium"),
      orgImage: post.organization.image && post.organization.image.small,
    };
  }, [post]);

  const handleShare = async () => {
    // DESKTOP
    if (!isIOS && !isAndroid) {
      copyTextToClipboard(
        `${post.description ? post.description + "\n\n" : ""}${shareUrl}`,
        () => {
          Notify.copyLinkSuccess({
            text: translate("Ссылка скопирована", "dialog.linkCopySuccess"),
          });
        }
      );
      return;
    }

    // iOS → ТОЛЬКО TEXT+URL
    if (isIOS) {
      try {
        await navigator.share({
          title: post.name,
          text: `${
            post.description ? post.description + "\n\n" : ""
          }${shareUrl}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("iOS share error", err);
        copyTextToClipboard(shareUrl);
      }
      return;
    }

    // ANDROID → FILE SHARE + FALLBACK
    if (isAndroid) {
      if (!cardRef.current) return;

      try {
        await new Promise((r) => setTimeout(r, 100));

        let blob = null;
        try {
          blob = await domToBlob(cardRef.current, {
            backgroundColor: "#000",
            type: "image/png",
            quality: 1,
          });
        } catch (e) {
          console.warn("domToBlob failed, fallback to text share");
        }

        const text = `${
          post.description ? post.description + "\n\n" : ""
        }${shareUrl}`;

        // File share
        if (blob) {
          const file = new File([blob], "post-card.png", { type: "image/png" });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: post.name,
              text,
            });
            return;
          }
        }

        // Text share fallback
        if (navigator.share) {
          await navigator.share({
            title: post.name,
            text,
            url: shareUrl,
          });
          return;
        }

        // Ultimate fallback
        copyTextToClipboard(text);
      } catch (err) {
        console.error("Android share error", err);
        copyTextToClipboard(shareUrl);
      }
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

  const handleCopy = async () => {
    const sharePayload = {
      title: post.name,
      text: post.description || "",
      url: shareUrl,
    };
    copyTextToClipboard(
      `${post.description ? post.description + "\n\n" : ""}${shareUrl}`,
      () => {
        Notify.copyLinkSuccess({
          text: translate("Ссылка скопирована", "dialog.linkCopySuccess"),
        });
      },
      async () => {
        try {
          await navigator.share(sharePayload);
        } catch (e) {
          console.error(e);
        }
      }
    );
    onClose();
  };

  return (
    <div className="post-share-view container">
      <button
        type="button"
        onClick={onClose}
        className="post-share-view__close-btn"
      >
        <ContainedCloseIcon />
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="post-share-view__copy-btn"
      >
        <LinkIcon />
      </button>
      {isImagesLoading ? (
        <Preloader className="post-share-view__preloader" />
      ) : (
        <div className="post-share-view__content">
          <div className="post-share-view__top">
            <div className="post-share-view__card-wrap" ref={cardRef}>
              <PostCardToScreen
                post={post}
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

          <div className="post-share-view__bottom">
            <WideButton
              className="post-share-view__share-btn"
              variant={WIDE_BUTTON_VARIANTS.ACCEPT}
              onClick={handleShare}
            >
              {translate("Поделиться", "app.share")}
              <ShareIcon
                fill="#fff"
                className="post-share-view__share-btn-icon"
              />
            </WideButton>
            <p className="post-share-view__desc">
              {translate(
                "<b>Полная информация</b> - делитесь подробно карточками, теперь с изображением ",
                "post.shareImageDesc",
                {
                  b: (text) => <span className="f-500">{text}</span>,
                }
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const LinkIcon = (props) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.0002 17.0002L10.5002 18.5002C9.83708 19.1631 8.93783 19.5355 8.00018 19.5355C7.06254 19.5355 6.16329 19.1631 5.50018 18.5002C4.83726 17.8371 4.46484 16.9378 4.46484 16.0002C4.46484 15.0625 4.83726 14.1633 5.50018 13.5002L8.50018 10.5002C9.16329 9.83726 10.0625 9.46484 11.0002 9.46484C11.9378 9.46484 12.8371 9.83726 13.5002 10.5002"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <path
      d="M12 7.00018L13.5 5.50018C14.1631 4.83726 15.0624 4.46484 16 4.46484C16.9376 4.46484 17.8369 4.83726 18.5 5.50018C19.1629 6.16329 19.5353 7.06254 19.5353 8.00018C19.5353 8.93783 19.1629 9.83708 18.5 10.5002L15.5 13.5002C14.8369 14.1631 13.9376 14.5355 13 14.5355C12.0624 14.5355 11.1631 14.1631 10.5 13.5002"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
);

export default PostShareMenu;
