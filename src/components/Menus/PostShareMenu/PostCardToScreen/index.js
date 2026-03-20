import React from 'react';
import OrgAvatar from "../../../UI/OrgAvatar";
import OrgVerification from "../../../UI/OrgVerification";
import {getPostImage} from "../../../../common/helpers";
import {ImageWithPlaceholder} from "../../../ImageWithPlaceholder";
import {calculateDiscount, prettyFloatMoney} from "../../../../common/utils";
import Truncate from "react-truncate";
import {translate} from "../../../../locales/locales";
import classNames from "classnames";
import "./index.scss"

const PostCardToScreen = React.forwardRef(({post, postImage, orgImage, className}, ref) => {
  const {organization, currency} = post
  const {title: orgTitle} = organization
  const image = getPostImage(post, 'medium')
  const discount = calculateDiscount(post.discount, post.price);

  return (
    <div className={classNames('post-card-to-screen', className)} ref={ref}>
      <div className="post-card-to-screen__header row">
        <div>
          <OrgAvatar
            src={orgImage ?? (organization.image && organization.image.small)}
            size={44}
            alt={orgTitle}
            className="post-card-to-screen__header-left"
          />
        </div>
        <div className="post-card-to-screen__header-right">
          <div className="post-card-to-screen__header-top row">
            <h6 className="post-card-to-screen__header-top-title f-16 f-500 tl">
              <OrgVerification
                status={organization.verification_status}
              />
              {orgTitle}
            </h6>
          </div>
          <div className="post-card-to-screen__header-bottom row">
            <span className="f-12 tl">{organization.types[0] && organization.types[0].title}</span>
            <p className="f-12">{post.article ? post.article : `ID${post.id}`}</p>
          </div>
        </div>
      </div>
      <div className="post-card-to-screen__image-wrap">
        <ImageWithPlaceholder
          src={postImage ?? image}
          alt={post.name}
          className="post-card-to-screen__image"
        />
      </div>

      <div className="post-card-to-screen__content">
        <div className="post-card-to-screen__cost">
          {!!post.discount &&
            <p className="post-card-to-screen__discount f-14 f-500">
              {prettyFloatMoney(post.price, false, currency || organization.currency || '')}
            </p>
          }
          <div className="post-card-to-screen__amount f-16 f-500">
            {prettyFloatMoney(!discount ? post.price : discount, false, currency || organization.currency || '')}
          </div>
          {post.subcategory && <p className="post-card-to-screen__category f-14 f-500">{post.subcategory.name}</p>}
        </div>
        <h5 className="post-card-to-screen__title f-14 f-500">
          {post.name}
        </h5>
        <Truncate
          lines={2}
          ellipsis={<span className="post-card-to-screen__more-text">...{translate('ещё', 'app.more')}</span>}
          className="f-15"
        >
          {post.description}
        </Truncate>
      </div>
    </div>
  );
});

export default PostCardToScreen;