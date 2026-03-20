import React from 'react';
import MockImage from '../../assets/images/empty_subscription.png';
import {Link} from 'react-router-dom';
import RoundLink from '../../components/UI/RoundLink';
import EmptyBox from '../../components/EmptyBox';
import {translate} from '../../locales/locales';
import './index.scss';

const SubscriptionsEmpty = ({ searched }) => searched ? (
  <EmptyBox
    title={translate("Нет подписок", "subscriptions.empty")}
    description={translate('Поиск не дал результатов', 'hint.noSearchResult')}
  />
) : (
  <React.Fragment>
    <img
      src={MockImage}
      alt="Subscriptions"
      className="subscription-page__empty-image"
    />
    <p className="subscription-page__empty-title f-500">
        {translate('Для Вашего удобства здесь будут отображены Ваши подписки', "subscriptions.emptyHint")}
    </p>
    <RoundLink
      to='/home/search'
      label={translate("Найти организации", "org.findOrganization")}
      className="subscription-page__empty-find"
    />
    <Link to='/faq/subscriptions' className="subscription-page__empty-about f-15 f-500">
        {translate('Подробнее о подписках', 'subscriptions.moreAbout')}
    </Link>
  </React.Fragment>
)

export default SubscriptionsEmpty;