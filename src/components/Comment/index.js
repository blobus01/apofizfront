import React, { useCallback, useEffect, useRef, useState } from "react";
import Popup from "reactjs-popup";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import TokenParser from "../UI/TokenParser/TokenParser";
import Avatar from "../UI/Avatar";
import OrgAvatar from "../UI/OrgAvatar";
import useDialog from "../UI/Dialog/useDialog";
import { BubbleComment, LikedIcon, LikeIcon, PlayIcon } from "../UI/Icons";
import { parseDateTime, prettyFloatMoney } from "../../common/utils";
import { translate } from "../../locales/locales";
import * as classnames from "classnames";
import {
  commentLike,
  deleteComment,
  setReplyCurrentComment,
} from "../../store/actions/postActions";
import Preloader from "../Preloader";
import ReplyComment from "../ReplyComment";
import MessageMenuIcon from "@ui/Icons/MessageMenuIcon";
import {
  CopyIcon,
  EditIcon,
  ForwardIcon,
  GiveAccessIcon,
  LikeBlackIcon,
  LikeRedIcon,
  ReplyIcon,
  RestrictedAccessIcon,
  SoundEnd,
  SoundPlay,
  TrashIcon,
  WarningIcon,
} from "@components/Comment/icons";
import useLongPress from "@hooks/useLongPress";
import "./index.scss";
import {
  ReadTickIcon,
  SentTickIcon,
  ClockIcon,
} from "@pages/MessengerPage/icons";
import Notify from "../../components/Notification";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import PostDetailModal from "@components/PostDetailModal/PostDetailModal";
import { WhatsAppProfile } from "@pages/OrganizationChatsPage/Icons";
import LottiePreview from "./LottiePreview";
import { changeCartItemCount } from "@store/services/cartServices";
import { setAllCartsTotalCount } from "@store/actions/shopActions";

let activeAudio = null;

const Comment = ({
  comment,
  onEdit,
  onBlock,
  onUnblock,
  onComplain,
  disabled,
  className,

  handleLikeMessage,
  likeLoading,
  currentLikeMessageId,
  onForward,
  onLiked,

  onReply,
  onDelete,
  isDesctop,
  source,
  userData,
  noDots = null,
  whatsApp,

  setShowCartNotification,
}) => {
  const { confirm } = useDialog();
  const history = useHistory();
  const { loading, currentCommentID } = useSelector(
    (state) => state.postStore.commentLike,
  );

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const params = useParams();

  const { loading: deleteLoading, currentCommentID: deleteCurrentCommentID } =
    useSelector((state) => state.postStore.deleteComment);
  const { replyCurrentComment } = useSelector((state) => state.postStore);
  const dispatch = useDispatch();

  const POPUP_WIDTH = 200;
  const popupRef = useRef(null);

  const [popupPosition, setPopupPosition] = useState({
    offsetX: null,
    offsetY: null,
  });
  const popupPositionRef = useRef({ offsetX: null, offsetY: null });

  const handleLongPress = useCallback(() => {
    if (!disabled) {
      setPopupPosition(popupPositionRef.current);
      popupRef.current?.open();
    }
  }, [disabled]);

  const longPressHandlers = useLongPress(
    handleLongPress,
    () => popupRef.current?.close(),
    {
      delay: 400,
      shouldPreventDefault: false,
    },
  );

  const {
    text,
    user,
    assistant,
    organization,
    parent,
    user_role: userRole,
    created_at: createdAt,
    updated_at: updatedAt,
    can_delete: canDelete,
    comment_like_count: commentLikeCount,
    is_comment_liked: isCommentLiked,
    is_blocked: isBlocked,
    is_updated: isUpdated,
    status,
    is_message_liked,
    message_like_count,
    sender,
    currentUser,
    forwarded,
    product_data,
    phone,
    products,
    audio,
    user_audio,
  } = comment;

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceCurrentTime, setVoiceCurrentTime] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceProgress, setVoiceProgress] = useState(0);

  const handleVoiceToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (voicePlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setVoicePlaying((prev) => !prev);
  };

  const handleVoiceTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    setVoiceCurrentTime(audio.currentTime);
    setVoiceProgress((audio.currentTime / audio.duration) * 100);
  };

  const handleVoiceLoaded = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setVoiceDuration(audio.duration);
  };

  const handleVoiceEnded = () => {
    setVoicePlaying(false);
    setVoiceCurrentTime(0);
    setVoiceProgress(0);
  };

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (activeAudio && activeAudio !== audioRef.current) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      activeAudio = null;
    } else {
      // ▶ play
      audioRef.current.play();
      setIsPlaying(true);
      activeAudio = audioRef.current;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (activeAudio === audioRef.current) {
      activeAudio = null;
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if (activeAudio === audioRef.current) {
          activeAudio = null;
        }
      }
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fullName = userData?.user?.full_name; // "rinat (@blobus)"

  const tgUsername = fullName?.match(/\(([^)]+)\)/)?.[1] ?? null;

  const getSenderAvatar = () => {
    // 1️⃣ Assistant — самый приоритетный
    if (assistant) {
      return (
        <div className="comment__avatar-wrap">
          <span
            className={classnames(
              "comment__bubble-icon",
              isDeleteLoading() && "comment__bubble-icon--deleted",
            )}
          >
            <BubbleComment />
          </span>
          <Avatar
            src={assistant.image?.medium}
            alt={assistant.full_name}
            className="comment__avatar"
            size={40}
          />
        </div>
      );
    }

    // 2️⃣ Telegram
    if (source === "telegram") {
      const letter =
        userData?.user?.full_name
          ?.trim()
          ?.slice(0, 2)
          ?.split("")
          ?.map((char, index) =>
            index === 0 ? char.toUpperCase() : char.toLowerCase(),
          )
          ?.join("") ?? "??";

      return (
        <div className="comment__avatar-wrap">
          <span
            className={classnames(
              "comment__bubble-icon",
              isDeleteLoading() && "comment__bubble-icon--deleted",
            )}
          >
            <BubbleComment />
          </span>
          <div
            style={{
              width: "38px",
              height: "38px",
              display: "flex",
              borderRadius: "50%",
              alignItems: "center",
              background: "#007aff",
              justifyContent: "center",
            }}
          >
            <p style={{ color: "#FFF" }}>{letter}</p>
          </div>
        </div>
      );
    }

    if (whatsApp) {
      return (
        <div className="comment__avatar-wrap">
          <span
            className={classnames(
              "comment__bubble-icon",
              isDeleteLoading() && "comment__bubble-icon--deleted",
            )}
          >
            <BubbleComment />
          </span>
          <div
            style={{
              width: "38px",
              height: "38px",
              display: "flex",
              borderRadius: "50%",
              alignItems: "center",
              background: "#27AE60",
              justifyContent: "center",
            }}
          >
            <WhatsAppProfile />
          </div>
        </div>
      );
    }

    // 3️⃣ Web user
    if (user && source === "web") {
      return (
        <div className="comment__avatar-wrap">
          <span
            className={classnames(
              "comment__bubble-icon",
              isDeleteLoading() && "comment__bubble-icon--deleted",
            )}
          >
            <BubbleComment />
          </span>
          <Avatar
            src={user.avatar?.medium}
            alt={user.full_name}
            className="comment__avatar"
            size={40}
          />
        </div>
      );
    }

    // 4️⃣ Organization
    if (organization) {
      return (
        <Link
          to={`/organizations/${organization.id}`}
          className="comment__avatar-wrap"
        >
          <span
            className={classnames(
              "comment__bubble-icon",
              isDeleteLoading() && "comment__bubble-icon--deleted",
            )}
          >
            <BubbleComment />
          </span>
          <OrgAvatar
            src={organization.image?.medium}
            alt={`${organization.title} logo`}
            className="comment__avatar"
            size={40}
          />
        </Link>
      );
    }

    return null;
  };

  const getSenderRole = (senderRole) => {
    let role = "";

    if (userRole === "is_owner") {
      role = translate("Собственник", "app.owner");
    } else if (!userRole) {
      role = translate("Пользователь", "app.user");
    } else {
      role = senderRole;
    }

    return role;
  };

  const toggleLike = (commentId, isCommentLiked, commentLikeCount) => {
    dispatch(commentLike(commentId, isCommentLiked, commentLikeCount));
  };

  const onRemove = async (commentID) => {
    try {
      await confirm({
        title: translate("Удалить", "app.delete"),
        description: translate(
          "Вы действительно хотите удалить?",
          "dialog.removeComment",
        ),
        confirmTitle: translate("Да", "app.yes"),
        cancelTitle: translate("Нет", "app.no"),
      });

      dispatch(deleteComment(commentID, replyCurrentComment));
    } catch (e) {
      // do nothing
    }
  };

  const isLoadingLike = () => {
    if (
      typeof likeLoading !== "undefined" &&
      typeof currentLikeMessageId !== "undefined"
    ) {
      return likeLoading && currentLikeMessageId === comment.id;
    }
    return loading && currentCommentID === comment.id;
  };

  const isDeleteLoading = () => {
    return deleteLoading && deleteCurrentCommentID === comment.id;
  };

  const replyComment = () => {
    const commentFormInput = document.querySelector(
      ".comment-form__field-message",
    );
    if (commentFormInput) {
      commentFormInput?.focus();
      dispatch(setReplyCurrentComment(comment));
    }
  };

  const stoppedPropagation = {
    onTouchStart: (e) => e.stopPropagation(),
    onTouchEnd: (e) => e.stopPropagation(),
    onMouseDown: (e) => e.stopPropagation(),
    onMouseUp: (e) => e.stopPropagation(),
    onMouseLeave: (e) => e.stopPropagation(),
  };

  function formatMessageDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, "0");
    return (
      pad(date.getDate()) +
      "." +
      pad(date.getMonth() + 1) +
      "." +
      date.getFullYear() +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  }

  const MessageStatus = (status) => {
    if (status === "read") {
      return <ReadTickIcon />;
    }
    if (status === "delivered") {
      return <SentTickIcon />;
    }
    if (status === "sent") {
      return <SingleCheckIcon />;
    }
    if (status === "sending") {
      return <ClockIcon data-status="sending" />;
    }
    return null;
  };

  const SingleCheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
      <path
        d="M4 9l3 3 7-7"
        stroke="#868D98"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  const handleCopy = (comment) => {
    let username =
      comment.user?.full_name ||
      comment.assistant?.name ||
      comment.organization?.title ||
      "";
    let text = comment.text || "";
    let date = formatMessageDate(comment.updated_at || comment.created_at);
    const copyText = `${username}:\n${text}\n${date}`;
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(copyText).then(() => {
        Notify.success({ text: translate("Скопировано!", "messenger.copied") });
      });
    } else {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = copyText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      Notify.success({ text: translate("Скопировано!", "messenger.copied") });
    }
  };

  const formatTime = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const rawText = text || forwarded?.text || "";

  // Для перехода на товар при помощи history push
  const linkMatch = rawText.match(/https?:\/\/[^\s]+/);
  const productPath = linkMatch ? new URL(linkMatch[0]).pathname : null;
  const cleanText = rawText.replace(/https?:\/\/[^\s]+/, "").trim();

  // Для добавление товар в корзину в чате

  const [added, setAdded] = useState(false);
  const cardRef = useRef(null);

  const startSimplePurchaseAnimation = () => {
    const el = cardRef.current;
    if (!el) return;

    const img = el.querySelector("img");
    if (!img) return;

    const rect = img.getBoundingClientRect();

    const animationEl = document.createElement("div");

    animationEl.style.backgroundImage = `url("${img.src}")`;
    animationEl.className = "simple-fly-animation";

    animationEl.style.position = "fixed";
    animationEl.style.top = `${rect.top}px`;
    animationEl.style.left = `${rect.left}px`;
    animationEl.style.width = `${rect.width}px`;
    animationEl.style.height = `${rect.height}px`;
    animationEl.style.zIndex = 9999;
    animationEl.style.backgroundSize = "cover";
    animationEl.style.backgroundPosition = "center";
    animationEl.style.borderRadius = "12px";
    animationEl.style.transition = "all 0.6s ease";

    document.body.appendChild(animationEl);

    // координаты правого верхнего угла
    const targetX = window.innerWidth - rect.left - rect.width - 20;
    const targetY = -rect.top + 20;

    requestAnimationFrame(() => {
      animationEl.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.3)`;
      animationEl.style.opacity = "0";
    });

    setTimeout(() => {
      animationEl.remove();
    }, 600);
  };

  const triggerAddAnimation = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  const handleQuickBuy = async () => {
    try {
      const res = await changeCartItemCount({
        item: product_data.id,
        change: 1,
        organization: params.orgID,
      });

      if (res.success) {
        dispatch(setAllCartsTotalCount((prev) => prev + 1));

        setShowCartNotification(true); // 👈 показываем

        setTimeout(() => {
          setShowCartNotification(false); // 👈 скрываем через 3 секунды
        }, 2000);

        setAdded(true);
        startSimplePurchaseAnimation();
        triggerAddAnimation();
      } else {
        alert({ title: res.error });
      }
    } catch (e) {}
  };

  return (
    <>
      <div
        className={classnames("comment comment__wrap", className)}
        {...longPressHandlers}
        onMouseDown={(e) => {
          const rect = e.target.getBoundingClientRect();

          let offsetX = e.clientX - rect.left || null;
          const offsetY = e.clientY - rect.top || null;

          if (offsetX && rect.width - offsetX < POPUP_WIDTH) {
            offsetX -= POPUP_WIDTH;
          }

          popupPositionRef.current = {
            offsetX,
            offsetY,
          };

          longPressHandlers.onMouseDown(e);
        }}
        onTouchStart={(e) => {
          popupRef.current?.close();
          const touch = e.touches[0];

          const rect = e.target.getBoundingClientRect();

          let offsetX = (touch.clientX - rect.left) | null;
          const offsetY = touch.clientY - rect.top || null;

          if (offsetX && rect.width - offsetX < POPUP_WIDTH) {
            offsetX -= POPUP_WIDTH;
          }

          popupPositionRef.current = {
            offsetX,
            offsetY,
          };

          longPressHandlers.onTouchStart(e);
        }}
      >
        {getSenderAvatar()}

        <div className="comment__body">
          {forwarded && (
            <div
              className="comment__body__forwarded"
              style={
                forwarded?.original_sender.id &&
                forwarded?.original_sender.id !== currentUser?.id
                  ? { cursor: "pointer" }
                  : null
              }
              onClick={
                forwarded?.original_sender.id &&
                forwarded?.original_sender.id !== currentUser?.id
                  ? () =>
                      history.push(
                        isDesctop
                          ? `/messenger/?forward_id=${forwarded?.original_sender.id}`
                          : `/messenger/chat/${forwarded?.original_sender.id}`,
                      )
                  : null
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.21724 17C2.31777 13.7681 4.11584 6.22568 10.4078 6.22568V4.07142C10.4001 3.87672 10.4412 3.68357 10.5261 3.51458C10.611 3.3456 10.7363 3.20779 10.8872 3.11729C11.0382 3.02678 11.2085 2.98733 11.3784 3.00356C11.5482 3.01979 11.7105 3.09102 11.8462 3.20891L16.6402 7.51844C16.7525 7.62237 16.8432 7.75371 16.9054 7.90286C16.9677 8.052 17 8.21518 17 8.38045C17 8.54571 16.9677 8.70889 16.9054 8.85804C16.8432 9.00718 16.7525 9.13852 16.6402 9.24245L11.8453 13.552C11.7096 13.6691 11.5475 13.7397 11.3781 13.7556C11.2086 13.7715 11.0387 13.732 10.888 13.6417C10.7374 13.5514 10.6123 13.4141 10.5273 13.2457C10.4423 13.0773 10.4008 12.8848 10.4078 12.6905V10.5352C4.11584 11.6128 3.21724 17 3.21724 17Z"
                  stroke="#27AE60"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {forwarded?.original_sender &&
              (forwarded.original_sender.full_name ||
                forwarded.original_sender.username) ? (
                <>
                  {translate("Переслано от", "comment.forwardedFrom")}{" "}
                  <strong>
                    {forwarded.original_sender.full_name ||
                      forwarded.original_sender.username}
                  </strong>
                  {forwarded.original_sender.id === currentUser?.id && (
                    <span> ({translate("Вы", "comment.you")})</span>
                  )}
                </>
              ) : (
                translate("Пересланное сообщение", "comment.forwardedMessage")
              )}
            </div>
          )}

          <div
            className={classnames(
              isDeleteLoading() && "comment__body--deleted",
            )}
          />
          {isDeleteLoading() && (
            <Preloader className="comment__body-preloader" />
          )}

          {organization && !noDots && (
            <div className="f-500 comment__info">
              <div className="comment__info-top">
                <Link
                  to={`/organizations/${organization.id}`}
                  className="f-15 tl comment__info-title"
                >
                  {organization.title}
                </Link>
                <p className="f-12 comment__info-subtitle f-400">
                  {organization.types[0].title}
                </p>
              </div>

              {parent && (
                <ReplyComment
                  comment={parent}
                  className="comment__reply-comment"
                />
              )}
            </div>
          )}

          {user && (
            <div className="f-500 comment__info">
              <div className="comment__info-top">
                {source === "telegram" ? (
                  <a
                    href={
                      tgUsername
                        ? `https://t.me/${tgUsername.replace("@", "")}`
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007AFF" }}
                  >
                    {fullName}
                  </a>
                ) : (
                  <p className="f-15 tl comment__info-title">
                    {user.full_name}
                  </p>
                )}

                <div className="dfc row">
                  <p className="f-12 comment__info-subtitle">
                    {getSenderRole(userRole)}
                  </p>
                  {isBlocked && (
                    <div className="comment__info-status f-10 f-500">
                      {translate("Ограничен", "comment.restricted")}
                    </div>
                  )}
                </div>
              </div>
              {parent && (
                <ReplyComment
                  comment={parent}
                  className="comment__reply-comment"
                />
              )}
            </div>
          )}

          {assistant && (
            <div className="f-500 comment__info">
              <div className="comment__info-top">
                <p className="f-15 tl comment__info-title">{assistant.name}</p>
                <div className="dfc row">
                  <p className="f-12 comment__info-subtitle">
                    {assistant.position}
                  </p>
                  {isBlocked && (
                    <div className="comment__info-status f-10 f-500">
                      {translate("Ограничен", "comment.restricted")}
                    </div>
                  )}
                </div>
              </div>
              {parent && (
                <ReplyComment
                  comment={parent}
                  className="comment__reply-comment"
                />
              )}
            </div>
          )}

          {product_data && products?.length > 0 !== null && (
            <div className="comment__image-wrapper" ref={cardRef}>
              <img
                style={{ cursor: "pointer" }}
                className="comments__image"
                src={`${product_data?.images[0]}`}
                alt=""
                onClick={() => {
                  if (!isMountedRef.current) return;
                  setIsModalOpen(true);
                }}
              />
              <div className="comment__image-info">
                <div>
                  <p className="comment__image-title">{product_data?.name}</p>
                  <p className="comment__image-category">
                    {product_data?.category}
                  </p>
                  <p className="comment__image-price">
                    {prettyFloatMoney(
                      product_data?.discount_price || product_data?.price,
                    )}{" "}
                    <span>{product_data?.currency}</span>
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "end",
                    justifyContent: "end",
                  }}
                >
                  <button
                    className={`comment__buy-btn ${added ? "added" : ""}`}
                    onClick={handleQuickBuy}
                  >
                    {translate("Купить", "apps.payment")}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="comment__text f-15" style={{ position: "relative" }}>
            {cleanText && <TokenParser text={cleanText} />}

            {productPath && (
              <div
                className="comment__product-link"
                onClick={() => history.push(productPath)}
                style={{
                  marginTop: 8,
                  color: "#3b82f6",
                  cursor: "pointer",
                  fontWeight: 400,
                }}
              >
                {linkMatch}
              </div>
            )}
          </div>
          {user_audio && (
            <div className="voice">
              <button
                onClick={handleVoiceToggle}
                className={`voice__play ${
                  voicePlaying ? "voice__play--active" : ""
                }`}
              >
                <span
                  className={`voice__icon ${
                    voicePlaying ? "voice__icon--pause" : "voice__icon--play"
                  }`}
                />
              </button>

              <div className="voice__track">
                {Array.from({ length: 28 }).map((_, i) => (
                  <span
                    key={i}
                    className={`voice__bar ${
                      (i / 28) * 100 < voiceProgress ? "voice__bar--active" : ""
                    }`}
                  />
                ))}
              </div>

              <span className="voice__time">
                {formatTime(voiceCurrentTime)}
              </span>

              {/* 🔥 ВАЖНО */}
              <audio
                ref={audioRef}
                src={user_audio}
                preload="metadata"
                onTimeUpdate={handleVoiceTimeUpdate}
                onLoadedMetadata={handleVoiceLoaded}
                onEnded={handleVoiceEnded}
              />
            </div>
          )}

          <div className="comment__footer dfc">
            <div className="comment__footer-option dfc f-10">
              {!noDots && (
                <div className="comment__footer-option-item">
                  <Popup
                    trigger={
                      <button type="button" {...stoppedPropagation}>
                        <MessageMenuIcon className="comment__footer-option-icon" />
                      </button>
                    }
                    position={["bottom left", "top left"]}
                    closeOnDocumentClick
                    disabled={disabled}
                  >
                    {(close) => (
                      <PopupContent
                        onClick={close}
                        onComplain={onComplain}
                        onEdit={onEdit}
                        onBlock={onBlock}
                        onUnblock={onUnblock}
                        replyComment={replyComment}
                        onForward={onForward}
                        onCopy={() => handleCopy(comment)}
                        onLiked={onLiked}
                        onDelete={
                          canDelete &&
                          (onDelete
                            ? () => onDelete()
                            : () => onRemove(comment.id))
                        }
                        onReply={onReply}
                        userID={user?.id || assistant?.id || organization?.id}
                        currentUserId={currentUser?.id}
                        handleLikeMessage={() =>
                          handleLikeMessage(comment.id, !is_message_liked)
                        }
                        is_message_liked={is_message_liked}
                        {...stoppedPropagation}
                      />
                    )}
                  </Popup>
                </div>
              )}

              {source === "telegram" || whatsApp ? (
                ""
              ) : (
                <div className="comment__footer-option-item">
                  {onForward ? (
                    sender?.id !== currentUser?.id ? (
                      <button
                        type="button"
                        className={classnames(
                          "dfc",
                          (isCommentLiked || is_message_liked) &&
                            "comment__footer-option-like--liked",
                        )}
                        {...stoppedPropagation}
                        onClick={() =>
                          handleLikeMessage
                            ? handleLikeMessage(comment.id, !is_message_liked)
                            : toggleLike(
                                comment.id,
                                isCommentLiked,
                                commentLikeCount,
                              )
                        }
                      >
                        <span
                          className={classnames(
                            "dfc",
                            "comment__footer-option-icon",
                            "comment__footer-option-icon--like",
                            isLoadingLike() &&
                              "comment__footer-option-icon--like-loading",
                          )}
                        >
                          {isCommentLiked ||
                          isLoadingLike() ||
                          is_message_liked ? (
                            <LikedIcon className="comment__footer-option-icon" />
                          ) : (
                            <LikeIcon
                              className="comment__footer-option-icon"
                              fill="#FF0000"
                            />
                          )}
                        </span>
                        {commentLikeCount > 0
                          ? commentLikeCount
                          : message_like_count > 0
                            ? message_like_count
                            : null}
                      </button>
                    ) : (
                      message_like_count > 0 && (
                        <button
                          type="button"
                          className={classnames(
                            "dfc",
                            (isCommentLiked || is_message_liked) &&
                              "comment__footer-option-like--liked",
                          )}
                          {...stoppedPropagation}
                          disabled
                          style={{ cursor: "default" }}
                        >
                          <span
                            className={classnames(
                              "dfc",
                              "comment__footer-option-icon",
                              "comment__footer-option-icon--like",
                              isLoadingLike() &&
                                "comment__footer-option-icon--like-loading",
                            )}
                          >
                            <LikedIcon className="comment__footer-option-icon" />
                          </span>
                          {message_like_count ? message_like_count : null}
                        </button>
                      )
                    )
                  ) : (
                    <button
                      type="button"
                      className={classnames(
                        "dfc",
                        (isCommentLiked || is_message_liked) &&
                          "comment__footer-option-like--liked",
                      )}
                      {...stoppedPropagation}
                      onClick={() =>
                        handleLikeMessage
                          ? handleLikeMessage(comment.id, !is_message_liked)
                          : toggleLike(
                              comment.id,
                              isCommentLiked,
                              commentLikeCount,
                            )
                      }
                    >
                      <span
                        className={classnames(
                          "dfc",
                          "comment__footer-option-icon",
                          "comment__footer-option-icon--like",
                          isLoadingLike() &&
                            "comment__footer-option-icon--like-loading",
                        )}
                      >
                        {isCommentLiked ||
                        isLoadingLike() ||
                        is_message_liked ? (
                          <LikedIcon className="comment__footer-option-icon" />
                        ) : (
                          <LikeIcon
                            className="comment__footer-option-icon"
                            fill="#FF0000"
                          />
                        )}
                      </span>
                      {commentLikeCount > 0
                        ? commentLikeCount
                        : message_like_count > 0
                          ? message_like_count
                          : null}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="comment__footer-time">
              <div>
                <span
                  style={
                    status === "read" && sender?.id === currentUser?.id
                      ? { color: "#34A853" }
                      : null
                  }
                >
                  {isUpdated && translate("изменено", "comment.changed")}{" "}
                  {updatedAt
                    ? formatMessageDate(updatedAt)
                    : createdAt
                      ? formatMessageDate(createdAt)
                      : null}
                </span>
                {sender?.id === currentUser?.id && MessageStatus(status)}
              </div>
              {audio && (
                <>
                  <button
                    onClick={toggleSound}
                    className={`whatsApp__soundPlay ${
                      isPlaying ? "whatsApp__soundPlay--active" : ""
                    }`}
                  >
                    <span className="whatsApp__icon whatsApp__icon--play">
                      <SoundPlay />
                    </span>

                    <span className="whatsApp__icon whatsApp__icon--wave">
                      <LottiePreview /> {/* Lottie */}
                    </span>

                    <span className="whatsApp__icon whatsApp__icon--end">
                      <SoundEnd />
                    </span>
                  </button>

                  <audio
                    ref={audioRef}
                    src={audio}
                    preload="auto"
                    onEnded={handleEnded}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <PostDetailModal
          setIsModalOpen={setIsModalOpen}
          id={product_data?.id}
        />
      ) : (
        ""
      )}
    </>
  );
};

const PopupContent = ({
  replyComment,
  onComplain,
  onEdit,
  onBlock,
  onUnblock,
  onDelete,
  onForward,
  onCopy,
  onLiked,
  userID,
  currentUserId,
  handleLikeMessage,
  is_message_liked,
  onReply,
  ...rest
}) => {
  return (
    <div className="comment__popup" {...rest}>
      <button className="comment__popup-btn" onClick={onReply || replyComment}>
        {translate("Ответить", "app.reply")}
        <ReplyIcon />
      </button>
      {onForward && (
        <button className="comment__popup-btn" onClick={onForward}>
          {translate("Переслать", "shop.forward")}
          <ForwardIcon />
        </button>
      )}
      {onComplain && (
        <button className="comment__popup-btn" onClick={onComplain}>
          {translate("Пожаловаться", "shop.complain")}
          <WarningIcon />
        </button>
      )}
      {onForward
        ? onEdit &&
          userID === currentUserId && (
            <button onClick={onEdit} className="comment__popup-btn">
              {translate("Изменить", "app.change")}
              <EditIcon />
            </button>
          )
        : onEdit && (
            <button onClick={onEdit} className="comment__popup-btn">
              {translate("Изменить", "app.change")}
              <EditIcon />
            </button>
          )}
      {onCopy && (
        <button onClick={onCopy} className="comment__popup-btn">
          {translate("Скопировать", "app.copy")}
          <CopyIcon />
        </button>
      )}
      {onBlock && (
        <button
          onClick={onBlock}
          className="comment__popup-btn comment__popup-btn--danger"
        >
          {translate("Ограничить доступ", "app.restrictAccess")}
          <RestrictedAccessIcon />
        </button>
      )}
      {onUnblock && (
        <button
          onClick={onUnblock}
          className="comment__popup-btn comment__popup-btn--success"
        >
          {translate("Разблокировать доступ", "app.unblockAccess")}
          <GiveAccessIcon />
        </button>
      )}
      {onLiked && userID !== currentUserId && (
        <button onClick={handleLikeMessage} className="comment__popup-btn">
          {translate("Нравится", "app.like")}
          {is_message_liked ? (
            <LikedIcon style={{ width: "20px", height: "20px" }} />
          ) : (
            <LikeIcon
              fill="#FF0000"
              style={{ width: "20px", height: "20px" }}
            />
          )}
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="comment__popup-btn comment__popup-btn--danger"
        >
          {translate("Удалить", "app.delete")}
          <TrashIcon />
        </button>
      )}
    </div>
  );
};

export default Comment;
