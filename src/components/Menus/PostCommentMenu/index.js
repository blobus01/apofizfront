import React from 'react';
import RowButton, {ROW_BUTTON_TYPES} from "../../UI/RowButton";
import {translate} from "../../../locales/locales";
import {BlockedCommentIcon, ComplainIcon, UnblockedCommentIcon} from "../../UI/Icons";

import './index.scss'

const PostCommentMenu = ({onComplain, onBlock, onUnblock}) => {
  return (
    <div className="post-comment-menu container">
      {onBlock && (
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={translate("Ограничить доступ", "app.restrictAccess")}
          showArrow={false}
          className="post-comment-menu__red-btn"
          onClick={onBlock}
        >
          <BlockedCommentIcon />
        </RowButton>
      )}
      {onUnblock && (
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={translate("Разблокировать доступ", "app.unblockAccess")}
          showArrow={false}
          className="post-comment-menu__green-btn"
          onClick={onUnblock}
        >
          <UnblockedCommentIcon />
        </RowButton>
      )}
      <RowButton
        type={ROW_BUTTON_TYPES.button}
        label={translate("Пожаловаться", "shop.complain")}
        showArrow={false}
        className="post-comment-menu__red-btn"
        onClick={onComplain}
      >
        <ComplainIcon />
      </RowButton>
    </div>
  );
};

export default PostCommentMenu;