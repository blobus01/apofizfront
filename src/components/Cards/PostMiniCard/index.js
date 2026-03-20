import React from "react";
import * as classnames from "classnames";
import { prettyFloatMoney } from "../../../common/utils";
import { ImageWithPlaceholder } from "../../ImageWithPlaceholder";
import { Link } from "react-router-dom";
import { translate } from "../../../locales/locales";
import "./index.scss";

const PostMiniCard = ({
  post,
  currency,
  renderRight,
  className,
  to,
  ...rest
}) => {
  let imgSrc = post.images[0]?.small;

  const content = (
    <>
      <div className="post-mini-card__image">
        <ImageWithPlaceholder
          alt="selection post"
          src={imgSrc}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            borderRadius: "12px",
          }}
        />
      </div>
      <div className="post-mini-card__content">
        <h6 className="post-mini-card__name tl">{post.name}</h6>
        {post.price && (
          <>
            <p className="post-mini-card__discounted-price f-700 tl">
              {prettyFloatMoney(
                post.price - (post.price * post.discount) / 100,
                false,
                currency
              )}
            </p>
            {post.price && post.discount > 0 ? (
              <p className="post-mini-card__original-price f-14 f-500 tl">
                {prettyFloatMoney(post.price, false, currency)}
              </p>
            ) : (
              <p className="post-mini-card__no-discount 1-14 tl">
                {translate("Нет скидки", "shop.noDiscount")}
              </p>
            )}
          </>
        )}
      </div>
      {renderRight}
    </>
  );

  if (to) {
    return (
      <Link
        className={classnames("post-mini-card f-14", className)}
        to={to}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={classnames("post-mini-card f-14", className)} {...rest}>
      {content}
    </div>
  );
};

export default PostMiniCard;
