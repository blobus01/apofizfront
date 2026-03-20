import React, { useState } from "react";
import { useDispatch } from "react-redux";
import RowButton, { ROW_BUTTON_TYPES } from "../../UI/RowButton";
import { translate } from "../../../locales/locales";
import Notify from "../../Notification";
import {
  CalendarIcon,
  ComplainIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  MarketIcon,
  PinForPost,
  ShareIcon,
  UnPinForPost,
} from "../../UI/Icons";
import { togglePostPublishStatus } from "../../../store/services/postServices";
import { setGlobalMenu, setViews } from "../../../store/actions/commonActions";
import { VIEW_TYPES } from "../../GlobalLayer";
import { addToBlacklist } from "../../../store/services/organizationServices";
import { hideFromFeed } from "../../../store/actions/postActions";
import { PURCHASE_TYPES } from "../../../common/constants";
import { useHistory } from "react-router-dom";
import { MENU_TYPES } from "../../GlobalMenu";
import { setPrevPath } from "../../../store/actions/userActions";
import {
  useLocation,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";

import axios from "axios-api";
import {
  clearOrganizationCategoryCache,
  getOrganizationPosts,
} from "@store/actions/organizationActions";

import { UPDATE_POST_IN_CACHE } from "@store/actionTypes/postTypes";

const PostCardMenu = ({
  post,
  isOwner,
  isFromHomeFeed,
  canBuy,
  onBuy,
  canEdit,
  organization,
  setPost,
  isGuest,
  onClose,
  onPostUpdate,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const [isPinned, setIsPinned] = useState(post.is_pinned);

  const handlePin = () => {
    const nextPinned = !isPinned;
    const prevPinned = isPinned;

    // Генерируем дату "прямо сейчас"
    const now = new Date().toISOString();

    // 1. UI меняем сразу
    setIsPinned(nextPinned);
    dispatch(setGlobalMenu(null));

    // 2. REDUX обновляем сразу (Optimistic Update)
    dispatch({
      type: UPDATE_POST_IN_CACHE,
      payload: {
        postId: post.id,
        updates: {
          is_pinned: nextPinned,
          // !!! ВОТ ОНО !!!
          // Если мы закрепляем (true), ставим дату "сейчас", чтобы он прыгнул вверх.
          // Если открепляем, можно оставить старую или тоже обновить (обычно не важно).
        },
      },
    });

    Notify.success({
      text: nextPinned
        ? translate("Пост успешно закреплен!", "post.successPinned")
        : translate("Пост успешно откреплен!", "post.successUnpinned"),
    });

    // 3. Шлем запрос на бэк
    axios
      .post(`/shop-items/${post.id}/pin-organization/`)
      .then(() => {
        // Все ок, бэк сам обновит дату у себя в базе
      })
      .catch((error) => {
        console.error(error);

        // 4. ОТКАТ (Если ошибка)
        setIsPinned(prevPinned);

        dispatch({
          type: UPDATE_POST_IN_CACHE,
          payload: {
            postId: post.id,
            updates: {
              is_pinned: prevPinned,
            },
          },
        });

        Notify.error({ text: translate("Ошибка", "error.general") });
      });
  };

  const onComplain = () => {
    dispatch(setViews({ type: VIEW_TYPES.product_complain, post }));
    onClose();
  };

  const onHideFromFeed = async () => {
    if (post.organization?.id) {
      const res = await addToBlacklist(post.organization.id);
      if (res && res.success) {
        onClose();
        dispatch(hideFromFeed(post.id));
      } else {
        onClose();
        Notify.error({
          text: translate("Не удалось скрыть продукт", "shop.failedToHide"),
        });
      }
    }
  };

  const onRent = () => {
    onClose();
    if (isGuest) {
      dispatch(
        setPrevPath(history.location.pathname + history.location.search),
      );
      return history.push("/auth");
    }

    history.push(`/r/${post.id}/rent`);
  };

  const onShare = () => {
    onClose();
    setTimeout(() => {
      dispatch(
        setGlobalMenu({
          type: MENU_TYPES.post_share_menu,
          post,
          hideHeader: true,
          contentStyle: {
            paddingBottom: 0,
            maxHeight: "unset",
          },
        }),
      );
    }, 200);
  };

  const { purchase_type } = post;

  let editPagePath = `/organizations/${organization.id}/posts/${post.id}/edit`;
  if (purchase_type === PURCHASE_TYPES.rent) {
    editPagePath = `/organizations/${organization.id}/rent/${post.id}/edit`;
  } else if (purchase_type === PURCHASE_TYPES.ticket) {
    editPagePath = `/organizations/${organization.id}/events/${post.id}/edit`;
  } else if (purchase_type === PURCHASE_TYPES.resume) {
    editPagePath = `/organizations/${organization.id}/resumes/${post.id}/edit`;
  }

  return (
    <div className="post-feed-card__menu">
      <div className="container">
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={translate("Поделиться", "app.share")}
          showArrow={false}
          onClick={onShare}
        >
          <ShareIcon />
        </RowButton>
        {!isOwner && (
          <RowButton
            type={ROW_BUTTON_TYPES.link}
            label={translate("Контакты продавца", "shop.sellerContacts")}
            showArrow={false}
            to={`/p/${post.id}?to=contacts`}
            onClick={onClose}
          >
            <EditIcon />
          </RowButton>
        )}
        {purchase_type === PURCHASE_TYPES.rent && canBuy && (
          <RowButton
            type={ROW_BUTTON_TYPES.button}
            to={isGuest}
            label={translate("Аренда", "rent.rent")}
            showArrow={false}
            onClick={onRent}
          >
            <CalendarIcon
              fill="#4285F4"
              style={{
                position: "relative",
                left: 2,
              }}
            />
          </RowButton>
        )}
        {[PURCHASE_TYPES.product, PURCHASE_TYPES.ticket].includes(
          purchase_type,
        ) &&
          canBuy && (
            <RowButton
              type={ROW_BUTTON_TYPES.button}
              label={translate("Купить", "shop.buy")}
              showArrow={false}
              onClick={() => {
                onClose();
                onBuy();
              }}
            >
              <MarketIcon />
            </RowButton>
          )}
        {canEdit && (
          <RowButton
            type={ROW_BUTTON_TYPES.link}
            label={translate("Редактирование", "app.edit")}
            showArrow={false}
            to={editPagePath}
            onClick={() => {
              dispatch(setViews([]));
              onClose();
            }}
          >
            <EditIcon />
          </RowButton>
        )}
        {location.pathname !== "/home/posts" &&
        canEdit &&
        location.pathname !== "/subscriptions/posts" ? (
          <RowButton
            type={ROW_BUTTON_TYPES.button}
            label={
              isPinned
                ? translate("Открепить", "app.unpin")
                : translate("Закрепить", "app.pin")
            }
            showArrow={false}
            onClick={() => handlePin()}
          >
            {isPinned ? <UnPinForPost /> : <PinForPost />}
          </RowButton>
        ) : (
          ""
        )}
        {canEdit &&
          (post.is_published ? (
            <RowButton
              type={ROW_BUTTON_TYPES.button}
              label={translate("Скрыть товар", "shop.hideProduct")}
              showArrow={false}
              className="post-feed-card__menu-hide-button"
              onClick={() => {
                // 1️⃣ МГНОВЕННО обновляем UI
                if (onPostUpdate) {
                  onPostUpdate({ is_published: false });
                } else if (setPost) {
                  setPost({ ...post, is_published: false });
                }

                onClose(false);

                // 2️⃣ Фоновый запрос
                togglePostPublishStatus({
                  item: post.id,
                  is_published: false,
                }).then((res) => {
                  if (!res?.success) {
                    // 🔁 откат
                    if (onPostUpdate) {
                      onPostUpdate({ is_published: true });
                    } else if (setPost) {
                      setPost({ ...post, is_published: true });
                    }
                  }
                });
              }}
            >
              <EyeOffIcon />
            </RowButton>
          ) : (
            <RowButton
              type={ROW_BUTTON_TYPES.button}
              label={translate("Показать товар", "shop.showProduct")}
              showArrow={false}
              className="post-feed-card__menu-show-button"
              onClick={() => {
                // 1️⃣ Мгновенно обновляем UI
                if (onPostUpdate) {
                  onPostUpdate({ is_published: true });
                } else if (setPost) {
                  setPost({ ...post, is_published: true });
                }

                // 2️⃣ Сразу закрываем меню
                onClose();

                // 3️⃣ Запрос в фоне
                togglePostPublishStatus({
                  item: post.id,
                  is_published: true,
                }).then((res) => {
                  if (!res?.success) {
                    // 🔁 Откат при ошибке
                    if (onPostUpdate) {
                      onPostUpdate({ is_published: false });
                    } else if (setPost) {
                      setPost({ ...post, is_published: false });
                    }
                  }
                });
              }}
            >
              <EyeIcon />
            </RowButton>
          ))}

        {!isOwner && !isGuest && (
          <RowButton
            type={ROW_BUTTON_TYPES.button}
            onClick={onComplain}
            label={translate("Пожаловаться", "shop.complain")}
            showArrow={false}
            className="post-feed-card__menu-complain-button"
          >
            <ComplainIcon />
          </RowButton>
        )}
        {isFromHomeFeed ? (
          <RowButton
            type={ROW_BUTTON_TYPES.button}
            label={translate("Скрыть с ленты", "shop.hideFromHomeFeed")}
            onClick={onHideFromFeed}
            showArrow={false}
            className="post-feed-card__menu-hide-from-home-feed-button"
          >
            <EyeOffIcon />
          </RowButton>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PostCardMenu;
