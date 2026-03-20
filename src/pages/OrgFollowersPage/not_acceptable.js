import React from 'react';
import unacceptableFollowersImage from "../../assets/images/unacceptabel_followers.png";
import {translate} from "../../locales/locales";

const OrgFollowersPageNotAcceptable = () => {
  return (
    <>
      <img
        src={unacceptableFollowersImage}
        alt="Followers empty"
        className="org-followers-page__not-acceptable-image"
      />
      <p className="org-followers-page__not-acceptable-text f-16 f-500">
        {translate('В данной организации просмотр подписчиков ограничен.', 'org.notAcceptableFollowers')}
      </p>
    </>
  );
};

export default OrgFollowersPageNotAcceptable;