import React from 'react';
import * as classnames from 'classnames';
import OrgAvatar from '../../UI/OrgAvatar';
import OrgVerification from "../../UI/OrgVerification";
import {Link} from 'react-router-dom';
import './index.scss';

const OrganizationMainCard = ({title, type, image, description, verificationStatus, to, count, children, className}) => (
  <Link to={to || "#"} className={classnames("organization-main-card__wrap", className)}>
    <div className="organization-main-card">
      <div className="organization-main-card__left">
        <OrgAvatar
          src={image}
          alt={title}
          className="organization-main-card__logo"
        />
        {!!count && <div className="organization-main-card__count f-11">{count < 1000 ? count : '999+'}</div>}
      </div>
      <div className="organization-main-card__right">
        {type && <p className="organization-main-card__type f-12 f-500 tl">{type}</p>}
        <div className="organization-main-card__title-wrap dfc">
          <OrgVerification
            status={verificationStatus}
            className="organization-main-card__verified"
          />
          {title && <h4 className="organization-main-card__title f-16 f-700 tl">{title}</h4>}
        </div>
        {description && <p className="organization-main-card__desc f-12 tl">{description}</p>}
        {children}
      </div>
    </div>
  </Link>
);

export default OrganizationMainCard;