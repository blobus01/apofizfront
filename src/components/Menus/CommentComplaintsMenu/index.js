import React from 'react';
import RowButton, {ROW_BUTTON_TYPES} from "../../UI/RowButton";
import {translate} from "../../../locales/locales";
import {ComplainIcon} from "../../UI/Icons";

const CommentComplaintsMenu = ({onComplain, onClose}) => {
  const reasons = [
    translate('Сообщить об этом пользователе на предмет потенциальных нарушений', 'comment.causeOfComplaint1'),
    translate('Сообщить о потенциально нарушающем содержании', 'comment.causeOfComplaint2'),
    translate('Сообщить о нарушающих правила пользователе', 'comment.causeOfComplaint3'),
    translate('Нежелательный контент', 'comment.causeOfComplaint4'),
  ]

  const onOptionClick = e => {
    onComplain(reasons[e.currentTarget.dataset.index])
    onClose()
  }

  return (
    <div className="container">
      <RowButton
        type={ROW_BUTTON_TYPES.button}
        label={reasons[0]}
        showArrow={false}
        onClick={onOptionClick}
        data-index={0}
      >
        <ComplainIcon color="rgba(0, 122, 255, 1)" />
      </RowButton>
      <RowButton
        type={ROW_BUTTON_TYPES.button}
        label={reasons[1]}
        showArrow={false}
        onClick={onOptionClick}
        data-index={1}
      >
        <ComplainIcon color="rgba(0, 122, 255, 1)" />
      </RowButton>
      <RowButton
        type={ROW_BUTTON_TYPES.button}
        label={reasons[2]}
        showArrow={false}
        onClick={onOptionClick}
        data-index={2}
      >
        <ComplainIcon color="rgba(0, 122, 255, 1)" />
      </RowButton>
      <RowButton
        type={ROW_BUTTON_TYPES.button}
        label={reasons[3]}
        showArrow={false}
        onClick={onOptionClick}
        data-index={3}
      >
        <ComplainIcon color="rgba(0, 122, 255, 1)" />
      </RowButton>
    </div>
  );
};

export default CommentComplaintsMenu;