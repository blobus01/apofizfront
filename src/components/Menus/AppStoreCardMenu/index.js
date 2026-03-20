import React from "react";
import { useDispatch } from "react-redux";
import RowButton, { ROW_BUTTON_TYPES } from "../../UI/RowButton";
import { translate } from "../../../locales/locales";
import Notify from "../../Notification";
import { RemoveAppIcon, ShareIcon, AddAppIcon } from "../../UI/Icons";

import { setGlobalMenu, setViews } from "../../../store/actions/commonActions";

import { toggleApplication } from "@store/services/applicationServices";
import { MENU_TYPES } from "@components/GlobalMenu";

const PostCardMenu = ({ post, canEdit, setPost, onClose, onCloseMenu }) => {
  const dispatch = useDispatch();

  const handleToggleApp = async () => {
    try {
      await toggleApplication(post.id);
      dispatch(setViews([]));
      onCloseMenu();
      onClose();
    } catch (error) {
      console.error("Error toggling application:", error);
    }
  };

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

  return (
    <div className="post-feed-card__menu">
      <div className="container">
        {!post.is_my_app &&
          (!post.is_added ? (
            <RowButton
              type={ROW_BUTTON_TYPES.button}
              label={translate("Добавить в ваши приложения", "app.addApp")}
              showArrow={false}
              onClick={() => {
                handleToggleApp();
                dispatch(setViews([]));
                onClose();
              }}
            >
              <AddAppIcon />
            </RowButton>
          ) : (
            <RowButton
              type={ROW_BUTTON_TYPES.button}
              label={translate("Удалить из ваших приложений", "app.removeApp")}
              showArrow={false}
              onClick={() => {
                handleToggleApp();
                dispatch(setViews([]));
                onClose();
              }}
            >
              <RemoveAppIcon />
            </RowButton>
          ))}
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={translate("Поделиться", "app.share")}
          showArrow={false}
          onClick={onShare}
        >
          <ShareIcon />
        </RowButton>
      </div>
    </div>
  );
};

export default PostCardMenu;
