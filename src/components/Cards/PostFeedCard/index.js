import React, { useEffect, useRef, useState } from "react";
import * as classnames from "classnames";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import urlParser from "js-video-url-parser";
import {
  setGlobalMenu,
  setPlayingVideoID,
  setViews,
} from "@store/actions/commonActions";
import OrgAvatar from "../../UI/OrgAvatar";
import {
  B2BIcon,
  CalendarIcon,
  CalendarIconV2,
  CalendarIconV3,
  CommentIcon,
  InstagramIcon,
  LocationIcon,
  MenuDots,
  MonthCalendar,
  PromotionIcon,
  QuestionIcon,
  SetIcon,
  SocialIcon,
  TicketIcon,
  TimeIconV2,
} from "@ui/Icons";
import PostZoomSlider from "../../PostZoomSlider";
import ButtonLike from "../../UI/ButtonLike";
import ButtonBookmark from "../../UI/ButtonBookmark";
import TruncatedText from "../../UI/TruncatedText";
import {
  calculateDiscount,
  getRemainingTime,
  prettyDate,
  prettyFloatMoney,
} from "@common/utils";
import {
  togglePostBookmark,
  togglePostLike,
} from "@store/services/postServices";
import { changeCartItemCount } from "@store/services/cartServices";
import {
  PURCHASE_TYPES,
  RENT_TIME_TYPES,
  SLIDE_TYPES,
} from "@common/constants";
import { translate } from "@locales/locales";
import { MENU_TYPES } from "../../GlobalMenu";
import { VIEW_TYPES } from "../../GlobalLayer";
import { setAllCartsTotalCount } from "@store/actions/shopActions";
import AdultContentMask from "../../AdultContentMask";
import useDialog from "../../UI/Dialog/useDialog";
import { setViewedPost, updatePostInCache } from "@store/actions/postActions";
import OrgVerification from "../../UI/OrgVerification";
import Preloader from "../../Preloader";
import TextLinkifier from "../../TextLinkifier";
import Truncate from "react-truncate";
import Notify from "../../Notification";
import InfoIcon from "../../UI/Icons/InfoIcon";
import ResumeDetail from "./ResumeDetail";
import "./index.scss";
import { AmountIcon, PinnedIcon, TitleIcon } from "./icons";
import { getCartsList } from "@store/actions/cartActions";

const PostFeedCard = ({
  post: data,
  organization,
  refOrganization,
  permissions,
  currency,
  isGuest,
  showDescription,
  history,
  isOrganizationDetailPage,
  isFromHomeFeed,
  showResumeDetail = false,
  className,
  margin,
  noPin,
  noShadow,
  darkTheme,
}) => {
  const post = data;

  const [isOriginalTranslation, setIsOriginalTranslation] = useState(true);

  const {
    loading: loadingTranslateItem,
    data: translation,
    currentTranslatePost,
  } = useSelector((state) => state.postStore.translatePosts);
  const {
    loading: loadingConvertingPost,
    data: converted,
    currentConvertedItem,
  } = useSelector((state) => state.commonStore.convertedItems);
  const globalMenu = useSelector((state) => state.commonStore.globalMenu);

  const dispatch = useDispatch();
  const { confirm, alert } = useDialog();
  const sliderRef = useRef();

  const onBookmarkClick = async () => {
    if (!post.is_bookmarked) {
      const res = await togglePostBookmark(post.id, true);

      if (!res.success) {
        Notify.error({
          text: translate("Что-то пошло не так", "app.fail"),
        });
        return;
      }

      dispatch(updatePostInCache(post.id, { is_bookmarked: true }));
    }

    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.post_compilations_menu,
        postID: post.id,
        menuLabel: translate("Сохранить в", "app.saveAt"),
        playAnimation: !post.is_bookmarked,

        // 🔥 ВОТ ЭТО ГЛАВНОЕ
        setPostBookmarkedState: (is_bookmarked) => {
          dispatch(updatePostInCache(post.id, { is_bookmarked }));
        },

        hideHeader: true,
      }),
    );
  };

  const organizationID = refOrganization ? refOrganization.id : organization.id;
  const organizationTitle = refOrganization
    ? refOrganization.title
    : organization.title;
  const organizationAvatar = refOrganization
    ? refOrganization.image && refOrganization.image.small
    : organization.image && organization.image.small;
  const organizationType = refOrganization
    ? refOrganization.types[0] && refOrganization.types[0].title
    : organization.types[0] && organization.types[0].title;
  const organizationVerification = refOrganization
    ? refOrganization.verification_status
    : organization.verification_status;
  const organizationIsWholeSale = refOrganization
    ? refOrganization.is_wholesale
    : organization.is_wholesale;

  const isOwner = !!(permissions && permissions.is_owner);

  const canEdit =
    isOwner ||
    !!(
      permissions &&
      (permissions.can_edit_organization ||
        (permissions.can_edit_own_resume && post.own_resume))
    );

  const purchaseType = post.purchase_type;
  const availableSizes = post.available_sizes ?? [];
  const minimumPurchase =
    organizationIsWholeSale && typeof post.minimum_purchase === "number"
      ? post.minimum_purchase
      : 1;
  const hasStock = availableSizes.length > 0;
  const isInStock = hasStock
    ? !!availableSizes.find((size) => {
        return size.count === null || size.count >= minimumPurchase;
      })
    : true;

  const hasPrice = typeof post.price === "number";
  const hasSalary = !!post.salary_from;
  const isPublished = post.is_published && !post.is_hidden;

  const canBuyProduct =
    purchaseType === PURCHASE_TYPES.product &&
    isPublished &&
    hasPrice &&
    isInStock;
  const canBuyRent =
    purchaseType === PURCHASE_TYPES.rent &&
    isPublished &&
    hasPrice &&
    post.rental_period;
  const canBuyTicket =
    purchaseType === PURCHASE_TYPES.ticket &&
    isPublished &&
    hasPrice &&
    post.ticket_period &&
    isInStock;
  const canRequestResume =
    purchaseType === PURCHASE_TYPES.resume && isPublished;

  const hasAvailableSizes = availableSizes.some(
    (s) => s.size !== null && (s.count === null || s.count > 0),
  );

  const slides = [];
  post.images?.map((image) =>
    slides.push({ type: SLIDE_TYPES.image, ...image }),
  );
  post.youtube_links &&
    post.youtube_links.forEach((url, index) => {
      const info = urlParser.parse(url);
      info &&
        info.id &&
        info.provider === "youtube" &&
        slides.push({
          type: SLIDE_TYPES.youtube_video,
          videoID: `${post.id}-${index}-${info.id}`,
          link: `https://www.youtube.com/embed/${info.id}?autoplay=1`,
          preview: `https://i.ytimg.com/vi/${info.id}/maxresdefault.jpg`,
          preview2: `https://img.youtube.com/vi/${info.id}/0.jpg`,
        });
    });
  post.instagram_data.images?.map((image) =>
    slides.push({ type: SLIDE_TYPES.instagram_image, ...image }),
  );
  if (post.videos.length > 0) {
    post.videos?.map((video, index) =>
      slides.push({
        type: SLIDE_TYPES.instagram_video,
        ...video,
        videoID: `${post.id}-${index}`,
      }),
    );
  } else {
    if (post.instagram_data.videos.length !== 0) {
      post.instagram_data.videos?.map((video, index) =>
        slides.push({
          type: SLIDE_TYPES.instagram_video,
          ...video,
          withShlyuzer: true,
          videoID: `${post.id}-${index}`,
        }),
      );
    } else {
      post.videos.length &&
        post.videos?.map((video, index) =>
          slides.push({
            type: SLIDE_TYPES.instagram_video,
            ...video,
            withShlyuzer: false,
            videoID: `${post.id}-${index}`,
          }),
        );
    }
  }

  const toggleLike = async () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    const newValue = !post.is_liked;

    dispatch(
      updatePostInCache(post.id, {
        is_liked: newValue,
        like_count: newValue ? post.like_count + 1 : post.like_count - 1,
      }),
    );

    try {
      const res = await togglePostLike(post.id, newValue);
      if (res.value !== newValue) {
        dispatch(
          updatePostInCache(post.id, {
            is_liked: res.value,
            like_count: res.value ? post.like_count + 1 : post.like_count - 1,
          }),
        );
      }
    } catch (e) {
      dispatch(
        updatePostInCache(post.id, {
          is_liked: !newValue,
          like_count: !newValue ? post.like_count + 1 : post.like_count - 1,
        }),
      );
    }
  };

  const getCostInfo = () => {
    let discount;

    if (converted.posts && converted.posts[post.id]) {
      discount = calculateDiscount(
        post.discount,
        converted.posts[post.id].price,
      );
    } else {
      discount = calculateDiscount(post.discount, post.price);
    }
    return (
      <>
        {converted.posts && converted.posts[post.id] ? (
          <>
            {!!post.discount && (
              <p className="post-feed-card__discount f-14 f-500">
                {prettyFloatMoney(
                  converted.posts[post.id].price,
                  false,
                  converted.posts[post.id].currency || currency || "",
                )}
              </p>
            )}
            <button type="button" className="post-feed-card__amount f-16 f-500">
              {prettyFloatMoney(
                !discount ? converted.posts[post.id].price : discount,
                false,
                converted.posts[post.id].currency || currency || "",
              )}
            </button>
          </>
        ) : (
          <>
            {!!post.discount && (
              <p className="post-feed-card__discount f-14 f-500">
                {prettyFloatMoney(
                  post.price,
                  false,
                  currency || organization.currency || "",
                )}
              </p>
            )}
            <button
              type="button"
              onClick={onOpenCurrencyMenu}
              className="post-feed-card__amount f-16 f-600"
            >
              {prettyFloatMoney(
                !discount ? post.price : discount,
                false,
                currency || organization.currency || "",
              )}
            </button>
          </>
        )}
        {loadingConvertingPost && currentConvertedItem === post.id && (
          <Preloader className="post-feed-card__translation-loading" />
        )}
      </>
    );
  };

  const getSalaryInfo = () => {
    const salaryFrom = post.salary_from;
    const salaryTo = post.salary_to;

    if (!salaryFrom) return null;

    return (
      <>
        {!!salaryTo && (
          <p className="post-feed-card__salary-from f-14 f-500">
            {prettyFloatMoney(
              salaryFrom,
              false,
              post.currency || organization.currency || "",
            )}
          </p>
        )}
        <p className="post-feed-card__amount f-16 f-500">
          {prettyFloatMoney(
            salaryTo ? salaryTo : salaryFrom,
            false,
            post.currency || organization.currency || "",
          )}
        </p>
      </>
    );
  };

  function makePurchase(payload = {}) {
    return changeCartItemCount({
      item: post.id,
      change: minimumPurchase,
      organization: organizationID,
      ...payload,
    }).then((res) => {
      if (res.success) {
        startPurchaseAnimation().then(() => {
          // 1. Бейдж
          dispatch(
            setAllCartsTotalCount((prevCount) => prevCount + minimumPurchase),
          );

          // 2. Запрашиваем обновление первой страницы списка корзин в фоне
          // Предполагается, что getCartsList умеет обновлять Redux
          dispatch(getCartsList({ page: 1, limit: 10 }));
        });
      } else {
        alert({ title: res.error });
      }
    });
  }

  async function startPurchaseAnimation() {
    const timeout = 1000;
    const parentEl = sliderRef.current;

    if (!parentEl) {
      return;
    }
    const cartEl = document.getElementById("navbar-link-cart");
    const animationEl = document.createElement("div");
    const slideEl = parentEl.querySelector(".post-zoom-slider__slide");
    const imageEl = slideEl.querySelector("img");
    const videoEl = slideEl.querySelector("video");
    let imageURL = "";
    if (imageEl) {
      imageURL = imageEl.getAttribute("src");
    }
    if (videoEl) {
      imageURL = videoEl.getAttribute("poster");
    }

    slideEl.classList.add("fade-in");
    animationEl.style["background-image"] = `url("${imageURL}")`;
    animationEl.classList.add("post-feed-card__animation");
    animationEl.classList.add("resize");
    parentEl.appendChild(animationEl);

    setTimeout(() => {
      animationEl.classList.remove("resize");
      animationEl.classList.add("fixed");

      const { x, y } = animationEl.getBoundingClientRect();
      const { x: cardX, y: cardY } = cartEl.getBoundingClientRect();

      animationEl.style.position = "fixed";
      animationEl.style.top = `${y}px`;
      animationEl.style.left = `${x}px`;
      animationEl.style.transform = "unset";

      const animationTumbling = [
        { top: `${y}px`, left: `${x}px` },
        { top: `${y - 20}px`, left: `${x + 20}px` },
        { top: `${y - 40}px`, left: `${x + 40}px` },
        { top: `${y - 40}px`, left: `${x + 60}px` },
        { top: `${y - 40}px`, left: `${x + 80}px` },
        { top: `${y - 20}px`, left: `${x + 100}px`, offset: 0.3 },
        { top: `${cardY}px`, left: `${cardX}px` },
      ];

      const animationTiming = {
        duration: timeout / 2,
        easing: "linear",
      };

      animationEl.animate(animationTumbling, animationTiming);
    }, timeout / 2);

    return new Promise((resolve) =>
      setTimeout(() => {
        slideEl.classList.remove("fade-in");
        parentEl.removeChild(animationEl);
        resolve();
      }, timeout),
    );
  }

  const onBuy = async () => {
    try {
      if (isGuest) {
        return history.push("/auth");
      }

      if (hasAvailableSizes) {
        return onOpenSizeMenu();
      }

      await makePurchase();
    } catch (e) {
      // Do nothing
    }
  };

  const onRequest = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.resume_request_menu,
        menuLabel: translate("Отправить запрос", "org.sendRequest"),
        resumeID: post.id,
        orgID: organizationID,
      }),
    );
  };

  const onLearnMore = () => {
    history.push(`/resumes/${post.id}`);
  };

  const onOpenMenu = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.post_card_menu,
        menuLabel: translate("Еще", "app.more"),
        post,
        isOwner,
        canBuy:
          (purchaseType === PURCHASE_TYPES.product && canBuyProduct) ||
          (purchaseType === PURCHASE_TYPES.rent && canBuyRent) ||
          (purchaseType === PURCHASE_TYPES.ticket && canBuyTicket),
        onBuy,
        canEdit,
        organization,
        isGuest,
        isFromHomeFeed,

        // ✅ ВМЕСТО setPost
        onPostUpdate: (updates) => {
          dispatch(updatePostInCache(post.id, updates));
        },
      }),
    );
  };

  const onOpenLangMenu = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.post_lang_menu,
        menuLabel: translate("Язык перевода", "app.translationLanguage"),
        onSelectLang: () => setIsOriginalTranslation(false),
        currentCode: translation && translation[post.id]?.currentCode,
        item: "post",
        post,
      }),
    );
  };

  const onOpenSizeMenu = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.post_size_menu,
        menuLabel: translate(
          "Выбор размера товара",
          "app.productSizeSelection",
        ),
        sizes: availableSizes,
        minimumPurchase,
        onSelect: makePurchase,
      }),
    );
  };

  const onOpenCurrencyMenu = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.post_currency_menu,
        menuLabel: translate("Выбрать валюту", "app.chooseCurrency"),
        orgCurrency: organization.currency,
        currentCode: converted.posts && converted.posts[post.id]?.currency,
        item: { id: post.id, price: post.price, name: "posts" },
      }),
    );
  };

  const showTranslation = () => {
    setIsOriginalTranslation(!isOriginalTranslation);
  };

  const onInstagramLimitClick = async () => {
    try {
      await confirm({
        title: translate("Лимиты Instagram", "dialog.instaLimitTitle"),
        description: translate(
          "Для переноса товара или поста вам необходимо отредактировать: название, добавить цену или категорию товара.",
          "dialog.instaLimitDesc",
        ),
        confirmTitle: translate("Редактировать", "app.edit"),
        cancelTitle: translate("Отмена", "app.cancellation"),
      });
      history.push(`/organizations/${organizationID}/posts/${post.id}/edit`);
    } catch (e) {
      // do nothing
    }
  };

  const getRentTimeRange = (rentalPeriod) => {
    if (!rentalPeriod) return null;
    const { rent_time_type, start_time, end_time, start_date, end_date } =
      rentalPeriod;

    switch (rent_time_type) {
      case RENT_TIME_TYPES.minute:
        return (
          <>
            <TimeIconV2 />
            {translate(
              "Аренда в минутах: от {from} мин до {to} мин",
              "rent.minutesFromTo",
              {
                from: Number(start_time.split(":")[1]),
                to: Number(end_time.split(":")[1]),
              },
            )}
          </>
        );
      case RENT_TIME_TYPES.hour:
        return (
          <>
            <CalendarIcon />
            {translate("Аренда в часах: {from} - {to}", "rent.hoursFromTo", {
              from: start_time?.slice(0, 5),
              to: end_time?.slice(0, 5),
            })}
          </>
        );
      case RENT_TIME_TYPES.day:
        return (
          <>
            <CalendarIconV2 />
            {translate("Аренда в сутки: {time}", "rent.inDays", {
              time: "24/7",
            })}
          </>
        );
      case RENT_TIME_TYPES.month:
        return (
          <>
            <MonthCalendar />
            {translate("Аренда в месяц: {from}-{to}", "rent.monthsFromTo", {
              from: start_date,
              to: end_date,
            })}
          </>
        );
      case RENT_TIME_TYPES.year:
        return (
          <>
            <CalendarIconV3 />
            {translate("Аренда в год: {from}-{to}", "rent.yearsFromTo", {
              from: start_date.split(".")[2],
              to: end_date.split(".")[2],
            })}
          </>
        );
      default:
        return null;
    }
  };

  const getEventTimeRange = (ticketPeriod) => {
    if (!ticketPeriod) return null;
    const { start_time, end_time, start_date, end_date } = ticketPeriod;
    return (
      <div className="post-feed-card__event-period f-12 f-500">
        <CalendarIconV3 />
        <div className="post-feed-card__event-period-content">
          {translate("Дата и время: ", "time.dateAndTime")}
          <span className="post-feed-card__event-date-range">
            {`${start_date} - ${end_date}  `}
          </span>
          <span className="post-feed-card__event-time-range">
            {`${start_time} - ${end_time}`}
          </span>
        </div>
      </div>
    );
  };

  const hasFullLocation =
    post.full_location?.latitude && post.full_location?.longitude;

  const onAddressClick = (location) => {
    dispatch(setViews({ type: VIEW_TYPES.map, location }));
  };

  const goToComments = () => {
    dispatch(setViewedPost(post.id));
    history.push(`/comments/post/${post.id}`);
  };

  const truncate = (value, max = 20) => {
    if (!value) return "";
    return value.length > max ? value.slice(0, max) + "..." : value;
  };

  return (
    <>
      <div
        className={classnames(
          "post-feed-card",
          className,
          darkTheme && "post-feed-card--dark",
        )}
        id={"post_" + post.id}
        style={{
          margin: "0 0 20px",
          boxShadow: noShadow ? "none" : "0 0 4px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div className="post-feed-card__header row">
          <Link
            to={`/organizations/${organizationID}`}
            onClick={() => window.scroll({ top: 0, behavior: "smooth" })}
          >
            <OrgAvatar
              src={organizationAvatar}
              size={44}
              alt={organizationTitle}
              className="post-feed-card__header-left"
            />
          </Link>
          <div className="post-feed-card__header-right">
            <div className="post-feed-card__header-top row">
              <Link
                to={`/organizations/${organizationID}`}
                className="post-feed-card__header-top-title f-17 tl"
                onClick={() => window.scroll({ top: 0, behavior: "smooth" })}
              >
                <OrgVerification status={organizationVerification} />
                {organizationTitle}
              </Link>
              <div className="row">
                {organization && organization.promo_cashback && (
                  <PromotionIcon className="post-feed-card__header-top-promo" />
                )}

                <button
                  type="button"
                  onClick={onOpenMenu}
                  style={{ position: "relative" }}
                  className="post-feed-card__header-top-menu"
                >
                  {post.is_pinned && noPin !== true ? (
                    <span className="organization-pinned-post pinned-animate">
                      <PinnedIcon />
                    </span>
                  ) : (
                    ""
                  )}
                  <SetIcon />
                </button>
              </div>
            </div>
            <Link
              to={`/organizations/${organizationID}`}
              className="post-feed-card__header-bottom dfc f-12"
              onClick={() => window.scroll({ top: 0, behavior: "smooth" })}
            >
              {organizationIsWholeSale && (
                <B2BIcon className="post-feed-card__b2b-icon" />
              )}
              <span className="post-feed-card__org-subcategory tl">
                {organizationType}
              </span>
              <p className="f-12">
                {truncate(post.article ? post.article : `ID${post.id}`)}
              </p>
            </Link>
          </div>
        </div>

        <div className="post-feed-card__slider" ref={sliderRef}>
          {post.is_hidden ? (
            <AdultContentMask
              onShow={() =>
                dispatch(updatePostInCache(post.id, { is_hidden: false }))
              }
            />
          ) : (
            <PostZoomSlider
              slides={slides}
              onFullScreenClick={(e) => {
                // ОБЯЗАТЕЛЬНО преобразуем в число!
                const activeSlideIndex = Number(
                  e.currentTarget.getAttribute("data-slide"),
                ); // <--- БЫЛО ПРОСТО getAttribute
                const currentSlide = slides[activeSlideIndex];

                if (
                  currentSlide &&
                  currentSlide.type === SLIDE_TYPES.youtube_video
                ) {
                  dispatch(
                    setPlayingVideoID(`fullscreen_${currentSlide.videoID}`),
                  );
                }

                dispatch(
                  setViews({
                    type: VIEW_TYPES.slideshow,
                    slides,
                    activeSlide: activeSlideIndex, // Теперь сюда улетит число
                  }),
                );
              }}
            />
          )}
        </div>

        <div
          className="post-feed-card__controls"
          style={{
            marginTop: slides.length > 1 ? "-40px" : "0",
            position: "relative",
          }}
        >
          {isOrganizationDetailPage && canEdit && post.removed_at && (
            <div className="post-feed-card__autokill">
              <span className="f-14 f-400">
                {translate("Будет удален через {time}", "app.willBeRemovedAt", {
                  time: getRemainingTime(post.removed_at),
                })}
              </span>
              <button type="button" onClick={onInstagramLimitClick}>
                <QuestionIcon />
              </button>
            </div>
          )}
          <div className="post-feed-card__controls-left">
            <ButtonLike
              isLiked={post.is_liked}
              onClick={toggleLike}
              className="post-feed-card__controls-like"
            />
            <ButtonBookmark
              isBookmarked={post.is_bookmarked}
              onClick={onBookmarkClick}
              className="post-feed-card__controls-bookmark"
            />
            {post && post.instagram_link && (
              <a
                href={post.instagram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="post-feed-card__controls-instagram"
              >
                <InstagramIcon />
              </a>
            )}
          </div>
          <div className="post-feed-card__controls-middle" />
          {canEdit && !post.is_published && (
            <div className="post-feed-card__controls-hidden f-14 f-500 tl">
              {translate("Скрытый", "app.hidden")}
            </div>
          )}
          {canBuyProduct && (
            <button
              type="button"
              onClick={onBuy}
              style={{
                justifyContent: post.discount !== 0 ? "start" : "center",
                paddingLeft: post.discount !== 0 ? "13px" : "0",
                marginRight: post.discount !== 0 ? "15px" : "0",
              }}
              className="post-feed-card__controls-right f-14 tl"
            >
              {translate("Купить", "shop.buy")}

              {post.discount !== 0 && (
                <span
                  style={{
                    position: "absolute",
                    background: "#D72C20",
                    borderRadius: "12px",
                    padding: "4px 8px",
                    right: "11px",
                    boxShadow: "0 0 0 1px #FFF",
                    fontSize: "14px",
                  }}
                >
                  -{post?.discount}%
                </span>
              )}
            </button>
          )}
          {canBuyRent && (
            <Link
              to={isGuest ? "/auth" : `/r/${post.id}/rent`}
              className="post-feed-card__controls-right f-14 tl"
            >
              {translate("Аренда", "rent.rent")}
            </Link>
          )}
          {canBuyTicket && (
            <button
              type="button"
              onClick={onBuy}
              className="post-feed-card__controls-right post-feed-card__controls-right--event-btn f-14 tl"
            >
              {translate("Купить", "shop.buy")}
              <TicketIcon />
            </button>
          )}
          {canRequestResume && (
            <button
              type="button"
              onClick={onRequest}
              className="post-feed-card__controls-right post-feed-card__controls-right--event-btn f-14 tl"
            >
              {translate("Запросить", "app.request")}
            </button>
          )}
        </div>

        <div className="post-feed-card__content">
          <div
            className="post-feed-card__total-stock"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            {!!post.like_count && (
              <p className="post-feed-card__liked f-14">
                {translate("Нравится", "app.like")}:{" "}
                <span>{post.like_count}</span>
              </p>
            )}
            {post?.total_stock_count > 0 && (
              <p className="post-feed-card__liked f-14">
                {translate("На складе", "app.stockCount")}:{" "}
                <span>{post.total_stock_count}</span>
              </p>
            )}
          </div>
          {(hasPrice || hasSalary || post.subcategory) && (
            <div
              onClick={onOpenCurrencyMenu}
              style={{ cursor: "pointer" }}
              className="post-feed-card__info-chain"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.0115 10.149C18.949 10.2132 18.9032 10.2916 18.8779 10.3776C18.8526 10.4635 18.8487 10.5543 18.8665 10.642C18.9545 11.082 18.9985 11.5344 18.9985 11.999C18.9984 13.4102 18.5718 14.7885 17.7745 15.9529C16.9773 17.1174 15.8468 18.0137 14.5312 18.5243C13.2155 19.0349 11.7763 19.1359 10.4023 18.8141C9.02826 18.4923 7.78358 17.7627 6.83151 16.721C6.78429 16.6681 6.72693 16.6252 6.66282 16.5948C6.59871 16.5645 6.52915 16.5473 6.45828 16.5443C6.3874 16.5413 6.31665 16.5526 6.25022 16.5774C6.18378 16.6023 6.12301 16.6403 6.07151 16.689C5.984 16.7738 5.93241 16.8889 5.92738 17.0106C5.92236 17.1324 5.96429 17.2514 6.04451 17.343C7.21925 18.6529 8.79306 19.539 10.5223 19.8641C12.2515 20.1891 14.0396 19.9351 15.6098 19.1412C17.1801 18.3473 18.4448 17.0579 19.2081 15.4726C19.9715 13.8874 20.191 12.0946 19.8325 10.372C19.7535 9.98904 19.2875 9.87404 19.0115 10.15M17.7875 7.16004C17.8767 7.07366 17.9285 6.95581 17.9319 6.83171C17.9352 6.7076 17.8899 6.58711 17.8055 6.49604C16.6011 5.22392 15.0125 4.38229 13.2835 4.10038C11.5546 3.81846 9.78086 4.11185 8.23476 4.93549C6.68866 5.75913 5.45565 7.06748 4.72505 8.65966C3.99445 10.2518 3.80666 12.0398 4.19051 13.749C4.27451 14.127 4.73651 14.238 5.01051 13.964C5.14051 13.834 5.19051 13.644 5.15251 13.464C4.83376 11.9763 5.00841 10.4252 5.65002 9.04565C6.29163 7.66606 7.36527 6.53308 8.70837 5.81824C10.0515 5.1034 11.5909 4.84563 13.0936 5.08395C14.5963 5.32227 15.9805 6.04371 17.0365 7.13904C17.0843 7.18972 17.1417 7.23048 17.2053 7.25897C17.2689 7.28747 17.3375 7.30314 17.4072 7.30509C17.4768 7.30704 17.5462 7.29523 17.6113 7.27034C17.6764 7.24545 17.7369 7.20797 17.7875 7.16004Z"
                  fill="#1270EC"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M18.125 5C18.2576 5 18.3848 5.05268 18.4786 5.14645C18.5723 5.24021 18.625 5.36739 18.625 5.5V7.5C18.625 7.63261 18.5723 7.75979 18.4786 7.85355C18.3848 7.94732 18.2576 8 18.125 8H16.125C15.9924 8 15.8652 7.94732 15.7714 7.85355C15.6777 7.75979 15.625 7.63261 15.625 7.5C15.625 7.36739 15.6777 7.24021 15.7714 7.14645C15.8652 7.05268 15.9924 7 16.125 7H17.625V5.5C17.625 5.36739 17.6777 5.24021 17.7714 5.14645C17.8652 5.05268 17.9924 5 18.125 5ZM5.521 16.147C5.56744 16.1004 5.62261 16.0635 5.68335 16.0382C5.7441 16.013 5.80923 16 5.875 16H7.875C8.00761 16 8.13479 16.0527 8.22855 16.1464C8.32232 16.2402 8.375 16.3674 8.375 16.5C8.375 16.6326 8.32232 16.7598 8.22855 16.8536C8.13479 16.9473 8.00761 17 7.875 17H6.375V18.5C6.375 18.6326 6.32232 18.7598 6.22855 18.8536C6.13479 18.9473 6.00761 19 5.875 19C5.74239 19 5.61522 18.9473 5.52145 18.8536C5.42768 18.7598 5.375 18.6326 5.375 18.5V16.5C5.37488 16.4343 5.38772 16.3692 5.41277 16.3085C5.43782 16.2477 5.4746 16.1935 5.521 16.147Z"
                  fill="#1270EC"
                />
                <path
                  d="M12.2221 12.3332V14.2742C12.8841 14.2002 13.3601 13.8172 13.3601 13.2682C13.3601 12.7102 12.8351 12.5022 12.2441 12.3382L12.2221 12.3332ZM10.7891 10.6542C10.7891 11.2092 11.3591 11.4392 11.7741 11.5562V9.74023C11.1721 9.82023 10.7891 10.1802 10.7891 10.6542Z"
                  fill="#1270EC"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17ZM12.224 15.5H11.776V14.89C10.701 14.82 10.045 14.218 9.982 13.356H10.682C10.732 13.919 11.202 14.215 11.776 14.275V12.205L11.557 12.142C10.682 11.891 10.135 11.442 10.135 10.688C10.135 9.828 10.838 9.233 11.775 9.138V8.5H12.225V9.129C13.215 9.195 13.915 9.802 13.941 10.6H13.285C13.225 10.102 12.804 9.79 12.225 9.733V11.677L12.443 11.737C13.023 11.891 14.018 12.23 14.018 13.28C14.018 14.133 13.373 14.811 12.224 14.89V15.5Z"
                  fill="#1270EC"
                />
              </svg>

              {hasPrice && getCostInfo()}
              {getSalaryInfo()}
              {post.subcategory && (
                <p
                  className={classNames(
                    "post-feed-card__category f-14 f-500",
                    !hasPrice &&
                      !hasSalary &&
                      "post-feed-card__category--without-dote",
                  )}
                >
                  {post.subcategory.name}
                </p>
              )}
            </div>
          )}

          {canRequestResume && !showResumeDetail && (
            <button
              type="button"
              onClick={onLearnMore}
              className="post-feed-card__learn-more-btn"
            >
              <InfoIcon className="post-feed-card__learn-more-btn-icon" />
              <span className="f-14 f-500">
                {translate("Изучить подробнее", "shop.learnMore")}
              </span>
            </button>
          )}

          <Link
            to={`/p/${post.id}${
              refOrganization ? `?ref=${refOrganization.id}` : ""
            }`}
            style={{ display: "flex", alignItems: "center" }}
            className="post-feed-card__title-wrapper"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 17C7.71667 17 7.47934 16.904 7.288 16.712C7.09667 16.52 7.00067 16.2827 7 16C6.99934 15.7173 7.09534 15.48 7.288 15.288C7.48067 15.096 7.718 15 8 15H15C15.2833 15 15.521 15.096 15.713 15.288C15.905 15.48 16.0007 15.7173 16 16C15.9993 16.2827 15.9033 16.5203 15.712 16.713C15.5207 16.9057 15.2833 17.0013 15 17H8ZM8 9C7.71667 9 7.47934 8.904 7.288 8.712C7.09667 8.52 7.00067 8.28267 7 8C6.99934 7.71733 7.09534 7.48 7.288 7.288C7.48067 7.096 7.718 7 8 7H15C15.2833 7 15.521 7.096 15.713 7.288C15.905 7.48 16.0007 7.71733 16 8C15.9993 8.28267 15.9033 8.52033 15.712 8.713C15.5207 8.90567 15.2833 9.00133 15 9H8ZM11 13C10.7167 13 10.4793 12.904 10.288 12.712C10.0967 12.52 10.0007 12.2827 10 12C9.99934 11.7173 10.0953 11.48 10.288 11.288C10.4807 11.096 10.718 11 11 11H15C15.2833 11 15.521 11.096 15.713 11.288C15.905 11.48 16.0007 11.7173 16 12C15.9993 12.2827 15.9033 12.5203 15.712 12.713C15.5207 12.9057 15.2833 13.0013 15 13H11Z"
                fill="#1270EC"
              />
            </svg>
            <h5 className="post-feed-card__title f-14 f-500">
              {!isOriginalTranslation && translation && translation[post.id]
                ? translation[post.id].translate.title
                : post.name}
            </h5>
          </Link>

          {post.rental_period && (
            <div className="post-feed-card__rental-period f-12 f-500">
              {getRentTimeRange(post.rental_period)}
            </div>
          )}
          {post.ticket_period && getEventTimeRange(post.ticket_period)}
          {post.address && (
            <button
              type="button"
              className="post-feed-card__address f-13 f-500"
              onClick={
                hasFullLocation
                  ? () => onAddressClick(post.full_location)
                  : undefined
              }
              disabled={!hasFullLocation}
            >
              <LocationIcon />
              <Truncate
                lines={3}
                ellipsis="..."
                style={{
                  display: "unset",
                  alignSelf: "center",
                }}
              >
                {post.address}
              </Truncate>
            </button>
          )}

          {isInStock && hasAvailableSizes && (
            <div className="post-feed-card__sizes f-13 f-500">
              {translate("Доступно: {available}", "app.available", {
                available: availableSizes?.map((size) => size.size).join(", "),
              })}
            </div>
          )}
          {!isInStock && (
            <div
              className="post-feed-card__set-item-status-label f-13 f-500"
              style={{
                marginBottom: 4,
              }}
            >
              {translate("Нет в наличии", "app.notAvailable")}
            </div>
          )}

          <TruncatedText
            expanded={!!showDescription}
            lines={2}
            less="app.less"
            className={classnames(
              "post-feed-card__description",
              "f-14",
              darkTheme && "post-feed-card__description--dark",
            )}
          >
            <TextLinkifier
              text={
                post.description &&
                !isOriginalTranslation &&
                translation &&
                translation[post.id]
                  ? translation[post.id].translate.description
                  : post.description
              }
            />
          </TruncatedText>

          <div className="post-feed-card__bottom">
            <p className="post-feed-card__date">
              {post.is_updated && translate("Исправлено", "shop.edited")}
              {post.is_updated
                ? `: ${prettyDate(post.updated_at, true)}`
                : prettyDate(post.updated_at, true)}
            </p>

            <div className="post-feed-card__translation">
              {isOriginalTranslation ? (
                <button
                  className="post-feed-card__translation-text f-13 f-500"
                  type="button"
                  onClick={
                    translation && translation[post.id]
                      ? showTranslation
                      : onOpenLangMenu
                  }
                >
                  {translate("Показать перевод", "app.showTranslation")}
                </button>
              ) : (
                <button
                  className="post-feed-card__translation-text f-13 f-500"
                  type="button"
                  onClick={
                    translation && translation[post.id]
                      ? showTranslation
                      : onOpenLangMenu
                  }
                >
                  {loadingTranslateItem && currentTranslatePost === post.id
                    ? ""
                    : translate(
                        "Показать оригинал",
                        "app.showOriginalTranslation",
                      )}
                </button>
              )}

              <button
                type="button"
                className="post-feed-card__translation-icon"
                style={{ position: "relative" }}
                onClick={onOpenLangMenu}
              >
                {globalMenu &&
                globalMenu.type === "post_lang_menu" &&
                globalMenu.post.id === post.id ? (
                  <>
                    <MenuDots />
                  </>
                ) : (
                  <SocialIcon />
                )}
              </button>
              {loadingTranslateItem && currentTranslatePost === post.id && (
                <Preloader className="post-feed-card__translation-loading" />
              )}
            </div>
          </div>
          <div className="post-feed-card__comment f-14">
            {post.comment_count ? (
              <button
                onClick={goToComments}
                className="post-feed-card__comment-link dfc"
              >
                <CommentIcon />
                {translate("Комментарии", "app.comments")}: {post.comment_count}
              </button>
            ) : (
              <button
                onClick={goToComments}
                className="post-feed-card__comment-link dfc"
              >
                <CommentIcon />
                {translate("Прокомментировать", "app.comment")}
              </button>
            )}
          </div>

          {"set_items" in post && post.set_items.length !== 0 && (
            <Link to={`/p/${post.id}/selection`}>
              <div
                className={classnames(
                  darkTheme
                    ? "post-feed-card__collections-products--dark"
                    : "post-feed-card__collections-products",
                )}
              >
                <p className="post-feed-card__set-items-title f-500 f-14">
                  {translate("Подборка", "app.collection")}
                </p>
                <div className="post-feed-card__set-items dfc">
                  {console.log(post, "setItems")}
                  {post.set_items?.slice(0, 2)?.map((item) => (
                    <div className="post-feed-card__set-item" key={item.id}>
                      <img
                        src={item.image.thumbnail || item.image.small}
                        alt="selection post"
                        className={classnames("post-feed-card__set-item-image")}
                        loading="lazy"
                      />
                      <div className="post-feed-card__set-item-content">
                        <div className="post-feed-card__set-item-content-top">
                          {item.price && item.has_in_stock ? (
                            <>
                              <p className="post-feed-card__set-item-discounted-price f-14 f-500 tl">
                                {prettyFloatMoney(
                                  item.price -
                                    (item.price * item.discount) / 100,
                                  false,
                                  item.currency,
                                )}
                              </p>
                              {item.price && item.discount > 0 && (
                                <p className="post-feed-card__set-item-original-price f-12 f-500 tl">
                                  {prettyFloatMoney(
                                    item.price,
                                    false,
                                    item.currency,
                                  )}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="post-feed-card__set-item-status-label f-12 f-500">
                              {translate("Нет в наличии", "app.notAvailable")}
                            </p>
                          )}
                        </div>
                        <p className="post-feed-card__set-item-link f-13">
                          {translate("Посмотреть", "app.see")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          )}

          {showResumeDetail && <ResumeDetail resume={post} />}
        </div>
      </div>
    </>
  );
};

export default withRouter(PostFeedCard);
