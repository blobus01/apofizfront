import React from 'react';
import EmptyImage from '../../assets/images/empty_statistics.png';
import {Link} from 'react-router-dom';
import {translate} from '../../locales/locales';

const StatisticsEmpty = () => (
  <>
    <img
      src={EmptyImage}
      alt="Statistic empty"
      className="statistics-orders-page__empty-image"
    />
    <p className="statistics-orders-page__empty-title f-16 f-500">
      {translate("Ваша статистика на вашей ладони. Теперь вы всегда в курсе своих покупок и полученных скидок, да и вы не когда не забудете, не потеряете контакты и адреса организаций в которых вы купили товар или услугу.", "statistics.emptyMessage")}
    </p>
    <Link to={`/home/search`} className="statistics-orders-page__empty-link f-16 f-500">
      {translate("Перейти в поиск организаций.", "statistics.goToSearchOfOrganization")}
    </Link>
  </>
)

export default StatisticsEmpty;