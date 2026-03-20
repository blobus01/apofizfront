import React from "react";
import OrgVerification from "../../../UI/OrgVerification";
import { ImageWithPlaceholder } from "../../../ImageWithPlaceholder";
import classNames from "classnames";
import "./index.scss";
import { translate } from "@locales/locales";

const truncateText = (text, maxLength = 160) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text?.slice(0, maxLength) + "...";
};

const PostCardToScreen = React.forwardRef(
  ({ app, postImage, orgImage, className }, ref) => {
    return (
      <div className={classNames("post-card-to-screen", className)} ref={ref}>
        <div className="post-card-to-screen__logo-wrap">
          <img
            src={orgImage ?? (app.image && app.image.medium)}
            alt={app.title}
            className="post-card-to-screen__header-logo"
          />
        </div>
        <div className="post-card-to-screen__header-right">
          <div className="post-card-to-screen__header-top row">
            <h6 className="post-card-to-screen__header-top-title f-16 f-500 tl">
              {app.title}
            </h6>
            <span className="f-12 tl">
              {app.types[0] && app.types[0].title}
            </span>
          </div>
        </div>

        <div className="post-card-to-screen__content tl">
          {truncateText(app.description)}
        </div>
      </div>
    );
  }
);

export default PostCardToScreen;
