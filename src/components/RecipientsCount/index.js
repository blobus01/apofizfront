import React from 'react';
import {Link} from "react-router-dom";
import * as classnames from 'classnames';
import Avatar from '../UI/Avatar';
import {abbreviateNumber} from "../../common/utils";
import './index.scss';

const RecipientsCount = ({ followers, count, organizationID, className }) => {
  if (!followers || !count) { return null; }
  return (
    <div className={classnames("recipients-count", className)}>
      <Link to={`/organizations/${organizationID}/followers`} className="recipients-count__group">
        {followers.map(follower => (
          <Avatar
            key={follower.id}
            size={20}
            src={follower.avatar && follower.avatar.medium}
            alt={follower.full_name}
            className="recipients-count__group-avatar"
            withBorder
          />
        ))}
      </Link>
      <Link to={`/organizations/${organizationID}/followers`} className="recipients-count__text f-12">
        {abbreviateNumber(count, 1)}
      </Link>
    </div>
  );
};

export default RecipientsCount;