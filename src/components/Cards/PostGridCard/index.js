import React, { useRef, useState } from "react";
import * as classnames from "classnames";
import { Link } from "react-router-dom";
import { useHistory, useLocation, withRouter } from "react-router";
import urlParser from "js-video-url-parser";
import { InstagramIcon, MultiPostIcon, PlayIcon, SetIcon } from "@ui/Icons";
import { calculateDiscount, prettyFloatMoney } from "@common/utils";
import { translate } from "@locales/locales";
import { setGlobalMenu, setViews } from "@store/actions/commonActions";
import { setAllCartsTotalCount } from "@store/actions/shopActions";
import { MENU_TYPES } from "../../GlobalMenu";
import { useDispatch } from "react-redux";
import { changeCartItemCount } from "@store/services/cartServices";
import { VIEW_TYPES } from "../../GlobalLayer";
import { PURCHASE_TYPES, SLIDE_TYPES } from "@common/constants";
import { ImageWithPlaceholder } from "../../ImageWithPlaceholder";
import useDialog from "@ui/Dialog/useDialog";
import Truncate from "react-truncate";
import "./index.scss";
import ButtonLike from "@components/UI/ButtonLike";
import ButtonBookmark from "@components/UI/ButtonBookmark";
import {
  togglePostBookmark,
  togglePostLike,
} from "@store/services/postServices";
import { updatePostInCache } from "@store/actions/postActions";
import Notify from "@components/Notification";
import OrgAvatar from "@components/UI/OrgAvatar";
import PostDetail from "@containers/PostDetail";
import PostDetailModal from "@components/PostDetailModal/PostDetailModal";

const PostGridCard = ({
  post,
  organization,
  refOrganization,
  permissions,
  currency,
  isGuest,
  history,
  className,
  darkTheme,
}) => {
  const dispatch = useDispatch();
  const imageRef = useRef();

  console.log("ORG", organization);

  const historyPush = useHistory();

  const { alert } = useDialog();

  const organizationID = refOrganization ? refOrganization.id : organization.id;
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
  post.images.map((image) =>
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
  post.instagram_data.images.map((image) =>
    slides.push({ type: SLIDE_TYPES.instagram_image, ...image }),
  );
  if (post.videos.length > 0) {
    post.videos.map((video, index) =>
      slides.push({
        type: SLIDE_TYPES.instagram_video,
        ...video,
        videoID: `${post.id}-${index}`,
      }),
    );
  } else {
    post.instagram_data.videos.map((video, index) =>
      slides.push({
        type: SLIDE_TYPES.instagram_video,
        ...video,
        videoID: `${post.id}-${index}`,
      }),
    );
  }

  const getCostInfo = () => {
    const discount = calculateDiscount(post.discount, post.price);
    return (
      <div className="post-grid-card__cost">
        <p className="post-grid-card__amount f-15 f-600">
          {prettyFloatMoney(
            discount ? discount : post.price,
            false,
            currency || organization.currency,
          )}
        </p>
      </div>
    );
  };

  const makePurchase = (payload = {}) => {
    return changeCartItemCount({
      item: post.id,
      change: minimumPurchase,
      organization: organizationID,
      ...payload,
    }).then((res) => {
      if (res.success) {
        startPurchaseAnimation().then(() =>
          dispatch(
            setAllCartsTotalCount((prevCount) => prevCount + minimumPurchase),
          ),
        );
      } else {
        alert({
          title: res.error,
        });
      }
    });
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
        // isFromHomeFeed,

        // ✅ ВМЕСТО setPost
        onPostUpdate: (updates) => {
          dispatch(updatePostInCache(post.id, updates));
        },
      }),
    );
  };

  const startPurchaseAnimation = async () => {
    const timeout = 1000;

    const parentEl = imageRef.current;

    const cartEl = document.getElementById("navbar-link-cart");
    const animationEl = document.createElement("div");
    const imageEl = parentEl.querySelector("img");
    let imageURL = "";
    if (imageEl) {
      imageURL = imageEl.getAttribute("src");
    }

    imageEl.classList.add("fade-in");
    animationEl.style["background-image"] = `url("${imageURL}")`;
    animationEl.classList.add("post-grid-card__animation");
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
        imageEl.classList.remove("fade-in");
        parentEl.removeChild(animationEl);
        resolve();
      }, timeout),
    );
  };

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

  const toggleLike = async () => {
    const newValue = !post.is_liked;

    // сразу меняем в кэше, чтобы UI был отзывчивым
    dispatch(
      updatePostInCache(post.id, {
        is_liked: newValue,
        like_count: newValue ? post.like_count + 1 : post.like_count - 1,
      }),
    );

    try {
      // 2. отправляем запрос
      await togglePostLike(post.id, newValue);
    } catch (e) {
      // 3. если ошибка → возвращаем обратно
      dispatch(
        updatePostInCache(post.id, {
          is_liked: post.is_liked,
          like_count: post.like_count,
        }),
      );
    }
  };

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

  const isMultiSlides = slides.length > 1;
  const isVideoSlide =
    slides.length > 0 &&
    !isMultiSlides &&
    (slides[0].type === SLIDE_TYPES.video ||
      slides[0].type === SLIDE_TYPES.instagram_video ||
      slides[0].type === SLIDE_TYPES.youtube_video);

  console.log(post.images);

  const getLargeSrc = (post) => {
    const get = (x) => x?.large?.file || x?.large || x?.file || x?.thumbnail;

    if (post.images?.length > 0) return get(post.images[0]);
    if (post.videos?.length > 0) return get(post.videos[0]);
    if (post.instagram_data?.images?.length > 0)
      return get(post.instagram_data.images[0]);
    if (post.instagram_data?.videos?.length > 0)
      return get(post.instagram_data.videos[0]);

    return null;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation();

  console.log("PATCHNAME", location.pathname);

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        className={classnames(
          "post-grid-card",
          className,
          darkTheme && "post-grid-card--dark",
        )}
        id={"post_" + post.id}
        onClick={openModal}
      >
        {/* for commit */}
        <div className="post-grid-card__top">
          <div
            className="post-grid-card__image"
            onClick={(e) => (
              dispatch(setViews({ type: VIEW_TYPES.slideshow, slides })),
              e.stopPropagation()
            )}
            ref={imageRef}
          >
            <ImageWithPlaceholder src={getLargeSrc(post)} alt={post.name} />
            {isMultiSlides && <MultiPostIcon />}
            {isVideoSlide && <PlayIcon />}
          </div>

          <div className="post-grid-card__image-mobile" ref={imageRef}>
            <ImageWithPlaceholder src={getLargeSrc(post)} alt={post.name} />
            {isMultiSlides && <MultiPostIcon />}
            {isVideoSlide && <PlayIcon />}
          </div>

          <div className="post-grid-card__content">
            <div
              className="post-grid-card__content-header"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="f-11 tl post-grid-card__article">
                {post.article ? post.article : `ID${post.id}`}
              </p>

              <div className="post-grid-card__content-likes">
                <OrgAvatar
                  src={organization.image.file}
                  size={25}
                  shadow={true}
                  alt={organization.title}
                  gridAvatar={true}
                  borderRadius={8}
                  onClick={() =>
                    location.pathname === `/organizations/${organization.id}`
                      ? setIsModalOpen(true)
                      : historyPush.push(`/organizations/${organization.id}`)
                  }
                  className="gridAvatar"
                />

                <ButtonLike
                  isLiked={post.is_liked}
                  onClick={toggleLike}
                  margin={0}
                  className="post-feed-card__controls-like"
                />

                <ButtonBookmark
                  isBookmarked={post.is_bookmarked}
                  onClick={onBookmarkClick}
                  margin={0}
                  className="post-feed-card__controls-bookmark"
                />
              </div>

              <button
                type="button"
                onClick={onOpenMenu}
                className="post-grid-card__menu"
              >
                <SetIcon />
              </button>
            </div>

            <button className="post-grid-card__button">
              <span className="post-grid-card__title f-15 f-600">
                {post.name}
              </span>
            </button>
            <p className="post-grid-card__desc f-13">
              <Truncate lines={2} ellipsis="..." trimWhitespace>
                {post.description}
              </Truncate>
            </p>
          </div>
        </div>

        <div className="post-grid-card__controls">
          {post.subcategory && (
            <p
              className="post-grid-card__category f-13"
              style={{ marginBottom: hasPrice ? "" : "50px" }}
            >
              {post.subcategory.name}
            </p>
          )}
          {hasPrice && getCostInfo()}
          {canEdit && !post.is_published && (
            <div
              className="post-grid-card__controls-hidden f-14 f-500 tl"
              onClick={(e) => e.stopPropagation()}
            >
              Скрытый
            </div>
          )}
          {(canBuyProduct || canBuyTicket) && (
            <button
              type="button"
              style={{ position: "relative" }}
              onClick={(e) => onBuy() && e.stopPropagation()}
              className="post-grid-card__controls-right f-14 tl"
            >
              {translate("Купить", "shop.buy")}
              {post.discount !== 0 && (
                <span
                  style={{
                    position: "absolute",
                    background: "#D72C20",
                    borderRadius: "8px ",
                    right: "0",
                    boxShadow: "0 0 0 1px #FFF",
                    fontSize: "14px",
                  }}
                  className="buy-withDiscount"
                >
                  -{post?.discount}%
                </span>
              )}
            </button>
          )}
          {canBuyRent && (
            <Link
              to={`/r/${post.id}/rent`}
              className="post-grid-card__controls-right f-14 tl"
            >
              {translate("Аренда", "rent.rent")}
            </Link>
          )}
          {canRequestResume && (
            <button
              type="button"
              onClick={onRequest}
              className="post-grid-card__controls-right f-14 tl"
            >
              {translate("Запросить", "app.request")}
            </button>
          )}
        </div>
      </div>

      {isModalOpen ? (
        <PostDetailModal setIsModalOpen={setIsModalOpen} id={post.id} />
      ) : (
        ""
      )}
    </>
  );
};

export default withRouter(PostGridCard);
