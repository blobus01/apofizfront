import React from "react";
import Truncate from "react-truncate";
import TokenParser from "../UI/TokenParser/TokenParser";
import { CancelIcon } from "@ui/Icons";
import { translate } from "@locales/locales";
import classNames from "classnames";
import "./index.scss";

const ReplyComment = ({
  comment,
  title,
  onCancel,
  icon,
  className,
  ...rest
}) => {
  return (
    <div className={classNames("reply-comment dfc", className)}>
      {icon && <div className="reply-comment__icon-container">{icon}</div>}
      <div className="reply-comment__right dfc" {...rest}>
        <div className="reply-comment__content">
          <div className="reply-comment__author dfc">
            <p className="reply-comment__author-name f-13 f-500">
              {title ??
                translate("в ответ {user}", "comment.inResponse", {
                  user: comment?.user
                    ? comment?.user?.full_name
                    : comment?.organization
                    ? comment?.organization?.title
                    : comment?.assistant?.name ||
                      translate("пользователь", "comment.user"),
                })}
            </p>
          </div>
          <Truncate lines={1} className="reply-comment__text f-11">
            <TokenParser text={comment?.text} />
          </Truncate>
        </div>

        {onCancel && (
          <button
            type="button"
            className="post-comments-page__form-cancel-reply"
            onClick={onCancel}
          >
            <CancelIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReplyComment;
