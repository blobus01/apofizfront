import React from 'react';
import {Link} from 'react-router-dom';
import EmptyImage from '../../assets/images/empty_followers.png';
import {translate} from '../../locales/locales';
import './index.scss';

const OrgFollowersEmpty = ({ organization }) => (
  <React.Fragment>
    <img
      src={EmptyImage}
      alt="Followers empty"
      className="org-followers-page__empty-image"
    />
    <p className="org-followers-page__empty-title f-16 f-500">
      {translate("Мотивируйте своих близких и друзей подписаться на вашу организацию, чем больше у вас подписчиков, тем больше ваша прибыль. Ваши подписчики получают сообщения о ваших уникальных предложениях.", "org.emptyFollowers")}
    </p>
    <Link to={`/organizations/${organization}/messages`} className="org-followers-page__empty-link f-16 f-500">
      {translate("Перейти в сообщения", "org.goToMessages")}</Link>
  </React.Fragment>
)

export default OrgFollowersEmpty;