import React from "react";
import { useDispatch } from "react-redux";
import RowButton, { ROW_BUTTON_TYPES } from "../../UI/RowButton";
import { translate } from "../../../locales/locales";

import { EditIcon, EyeIcon, EyeOffIcon, ShareIcon } from "../../UI/Icons";
import { toggleApplicationVisibility } from "../../../store/services/applicationServices";
import { setGlobalMenu, setViews } from "../../../store/actions/commonActions";

import { MENU_TYPES } from "../../GlobalMenu";

const PostCardMenu = ({
  post,
  canEdit,
  canHidden,
  setPost,
  onClose,
  onCloseApp,
}) => {
  const dispatch = useDispatch();

  const onShare = () => {
    onClose();
    setTimeout(() => {
      dispatch(
        setGlobalMenu({
          type: MENU_TYPES.app_share_menu,
          post,
          hideHeader: true,
          contentStyle: {
            paddingBottom: 0,
            maxHeight: "unset",
          },
        })
      );
    }, 200);
  };

  const toggleVisibility = (isHidden) => {
    toggleApplicationVisibility(post.id, isHidden).then((res) => {
      if (res.success) {
        setPost && setPost({ ...post, is_hidden: isHidden });
        onCloseApp();
        onClose();
      }
    });
  };

  return (
    <div className="post-feed-card__menu">
      <div className="container">
        {canEdit && (
          <RowButton
            type={ROW_BUTTON_TYPES.link}
            label={translate("Редактирование", "app.edit")}
            showArrow={false}
            to={`/apps/edit/${post.slug}`}
            onClick={() => {
              dispatch(setViews([]));
              onClose();
            }}
          >
            <EditIcon />
          </RowButton>
        )}
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={translate("Поделиться", "app.share")}
          showArrow={false}
          onClick={onShare}
        >
          <ShareIcon />
        </RowButton>
        {(post.is_owner || canHidden) &&
          (!post.is_hidden ? (
            <RowButton
              type={ROW_BUTTON_TYPES.button}
              label={translate("Скрыть приложение", "shop.hideApplication")}
              showArrow={false}
              className="post-feed-card__menu-hide-button"
              onClick={() => toggleVisibility(true)}
            >
              <EyeOffIcon />
            </RowButton>
          ) : (
            <RowButton
              type={ROW_BUTTON_TYPES.button}
              label={translate("Показать приложение", "shop.showApplication")}
              showArrow={false}
              className="post-feed-card__menu-show-button"
              onClick={() => toggleVisibility(false)}
            >
              <EyeIcon />
            </RowButton>
          ))}
      </div>
    </div>
  );
};

export default PostCardMenu;
