import React from 'react';
import MobileTopHeader from "../../../../components/MobileTopHeader";
import {translate} from "../../../../locales/locales";
import RowButton from "../../../../components/UI/RowButton";
import {ReceiptMoneyIcon} from "../../icons";
import {PaymentSettingsIcon} from "../../../../components/UI/Icons";
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';

const Main = ({onBack, onConnect, onSettings}) => {

  const { id } = useParams()

  console.log("ID FOR GOBACK", id);
  
  const history = useHistory()

  return (
    <div className="organization-payment-settings__main-view">
      <MobileTopHeader
        title={translate('Настройки платежей', 'payment.settings')}
        onBack={() => history.push(`/organizations/${id}/edit-main`)}
        className="organization-payment-settings__main-view-header"
      />
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <RowButton
          onClick={onConnect}
          label={translate('Подключить платежную  систему', 'payment.connect')}
          className="organization-payment-settings__main-view-option"
        >
          <ReceiptMoneyIcon />
        </RowButton>
        {onSettings && (
          <RowButton
            onClick={onSettings}
            label={translate('Настройки платежей', 'payment.settings')}
            className="organization-payment-settings__main-view-option"
          >
            <PaymentSettingsIcon />
          </RowButton>
        )}

        <h3 className="organization-payment-settings__main-view-title f-500 f-14">
          {translate('Что такое платежные системы', 'payment.paymentSystemInfo.title1')}
        </h3>
        <p className="organization-payment-settings__main-view-paragraph f-14">
          {translate('Платежные системы, интегрированные с Visa, MasterCard и криптовалютами, играют ключевую роль в обеспечении безопасных и удобных платежных операций.', 'payment.paymentSystemInfo.p1')}
        </p>

        <h3 className="organization-payment-settings__main-view-title f-500 f-14">
          {translate('Преимущества использования', 'payment.paymentSystemInfo.title2')}
        </h3>
        <ul className="organization-payment-settings__main-view-ul f-14">
          <li className="organization-payment-settings__main-view-li">{translate('Платьежные системы, интегрированные с Visa, MasterCard и криптовалютами, позволяют покупателям быстро и удобно совершать платежи за Ваши товары и услуги.', 'payment.paymentSystemInfo.ul1.li1')}</li>
          <li className="organization-payment-settings__main-view-li">{translate('Клиенты могут использовать свои кредитные/дебетовые карты или криптовалютные кошельки для быстрого и безопасного завершения покупки, без необходимости вводить дополнительные данные или информацию о платежной карте на месте.', 'payment.paymentSystemInfo.ul1.li2')}</li>
          <li className="organization-payment-settings__main-view-li">{translate('Вам больше не нужно беспокоиться о ежедневном ведении кассовой книги, поскольку все данные будут автоматически сохраняться в вашей статистике;', 'payment.paymentSystemInfo.ul1.li3')}</li>
          <li className="organization-payment-settings__main-view-li">{translate('Все кассовые операции можно отследить в личном кабинете', 'payment.paymentSystemInfo.ul1.li4')}</li>
        </ul>
      </div>
    </div>
  );
};

export default Main;