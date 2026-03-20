import React from "react";

import RowButton, { ROW_BUTTON_TYPES } from "../../UI/RowButton";
import { translate } from "../../../locales/locales";

import { MessengerIcon } from "@containers/ProfileModule/icons";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { GroupIcon } from "@pages/MessengerPage/icons";

const AddChatCardMenu = ({
  post,
  canEdit,
  canHidden,
  setPost,
  onClose,
  onCloseApp,
  containerSelector,
}) => {
  const history = useHistory();
  return (
    <div className="post-feed-card__menu">
      <div className="container">
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={translate("Новый чат", "messenger.newChat")}
          showArrow={false}
          onClick={() => {
            history.push("/messenger/search");
            onClose();
          }}
        >
          <MessengerIcon />
        </RowButton>

        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={translate("Новая группа", "messenger.newGroup")}
          showArrow={false}
          onClick={() => {
            history.push("/messenger/group/create");
            onClose();
          }}
        >
          <GroupIcon />
        </RowButton>
      </div>
    </div>
  );
};

export default AddChatCardMenu;
