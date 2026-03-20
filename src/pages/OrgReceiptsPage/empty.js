import React from 'react';
import EmptyImage from '../../assets/images/empty_stats.png';
import {Link} from 'react-router-dom';
import EmptyBox from '../../components/EmptyBox';
import {translate} from '../../locales/locales';
import './index.scss';

const OrgReceiptsEmpty = ({ organization, searched }) => searched ? (
  <EmptyBox
    title={translate("Проведенных скидок нет", "org.noDiscountProvided")}
    description={translate("Поиск не дал результатов", "hint.noSearchResult")} />
) : (
  <React.Fragment>
    <img
      src={EmptyImage}
      alt="Receipts no sale"
      className="org-receipts-page__empty-image"
    />
    <p className="org-receipts-page__empty-title f-16 f-500">
      {translate("Здесь будут отображена статистика Ваших продаж и скидок, вы сможете отменить сделку или посмотреть через фильтр кто и когда произвел покупку в вашей организации. Статистика продаж, также доступна и о ваших сотрудниках.", "orgreceiptspage.emptyMessage")}
    </p>
    <Link to={`/organizations/${organization}/employees`} className="org-receipts-page__empty-link f-16 f-500">
      {translate("Перейти на страницу сотрудников.", "orgreceiptspage.goToEmployees")}
    </Link>
  </React.Fragment>
)

export default OrgReceiptsEmpty;