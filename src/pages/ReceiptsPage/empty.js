import React from 'react';
import EmptyImage from '../../assets/images/empty_receipts.png';
import {Link} from 'react-router-dom';
import EmptyBox from '../../components/EmptyBox';
import './index.scss';

const ReceiptsEmpty = ({ organization, searched }) => searched ? (
  <EmptyBox title="Нет чеков" description='Поиск не дал результатов' />
) : (
  <React.Fragment>
    <img
      src={EmptyImage}
      alt="Receipts empty"
      className="receipts-page__empty-image"
    />
    <p className="receipts-page__empty-title f-16 f-500">Ваша экономия отображает проведенные скидки и чеки в данной организации. Теперь вы всегда в курсе своих покупок и полученных скидок. Обязательно подпишитесь на организацию и всегда будете в курсе новых акций и бонусов.</p>
    {organization && <Link to={`/organizations/${organization}`} className="receipts-page__empty-link f-16 f-500">Подписаться на организацию</Link>}
  </React.Fragment>
)

export default ReceiptsEmpty;