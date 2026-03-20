import React from 'react';
import EmptyBox from '../../components/EmptyBox';
import {Link} from 'react-router-dom';
import EmptyImage from '../../assets/images/empty_partners.png';
import {translate} from '../../locales/locales';
import './index.scss';

const OrgPartnersEmpty = ({ searched }) => searched ? (
  <EmptyBox
    title={translate("Нет партнеров", "partners.noPartners")}
    description={translate("Поиск не дал результатов", "hint.noSearchResult")}
  />
) : (
  <React.Fragment>
    <img
      src={EmptyImage}
      alt="Receipts no sale"
      className="org-partners-page__empty-image"
    />
    <p className="org-partners-page__empty-title f-16 f-500">
      {translate("Добавляйте партнеров, зарабатывайте больше совместно, создавайте сеть организаций, контролируйте статистику или просто помогайте друг другу подписчиками", "partners.emptyPartnersMessage")}
    </p>
    <Link to='/faq/partners' className="org-partners-page__empty-link f-16 f-500">
      {translate("Подробнее о партнерах", "partners.about")}
    </Link>
  </React.Fragment>
);

export default OrgPartnersEmpty;