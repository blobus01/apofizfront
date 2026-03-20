import React from 'react';
import {calculateDiscount, prettyFloatMoney} from "../../../common/utils";
import {Link} from "react-router-dom";
import classNames from "classnames";
import placeholder from '../../../assets/images/no_image.jpg';

import "./index.scss"

const PostRowCard = ({className, post, to, description, ...rest}) => {
  const discountedPrice = calculateDiscount(post.discount, post.price)
  const currency = post.organization?.currency ?? post.currency
  const image = post.images[0] && post.images[0].medium

  return (
    <Link to={to} className={classNames("post-row-card", className)} {...rest}>
      <div className="post-row-card__image" style={{backgroundImage: `url(${image ?? placeholder})`}}/>
      <div className="post-row-card__content">
        <h3 className="post-row-card__name f-16 f-500 tl">
          {post.name}
        </h3>
        <p className="post-row-card__org f-13 tl">{post.subcategory?.name}</p>
        <p className="post-row-card__price tl">
          <b>
            {post.discount > 0 && (
              <span className="post-row-card__price-without-discount f-14 f-500">
                {prettyFloatMoney(post.price, false, currency)}
              </span>
            )}
            <span className="post-row-card__discounted-price f-16 f-500">
              {prettyFloatMoney(post.discount > 0 ? discountedPrice : post.price, false, currency)}
            </span>
          </b>
        </p>
        {description}
      </div>
    </Link>
  );
};

export default PostRowCard;