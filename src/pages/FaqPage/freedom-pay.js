import React from 'react';
import {translate} from "../../locales/locales";
import MobileTopHeader from "../../components/MobileTopHeader";
import {CategoryOption} from "../../components/CategoryOption";
import freedomPayIcon from "../../assets/images/freedom_pay.png";
import {renderFaqSubcomponent} from "./index";
import {PlayIcon} from "./components";


const FaqFreedomPay = ({goBack, isWebviewMode, isIosWebviewMode}) => {
  const WEBVIEW_MESSAGES = Object.freeze({
    visa_doc_link: 'visa_doc_link',
  })

  const DATA = getContent()

  return (
    <div className="faq-freedom-pay">
      {!isWebviewMode && !isIosWebviewMode && (
        <MobileTopHeader
          title={translate('Документация FREEDOM Pay KG', 'faq.freedomPay.documentation')}
          onBack={() => goBack('/faq/refund')}
          className="faq-freedom-pay__header"
        />
      )}
      <div className="faq__content">
        <div className="container">
          <CategoryOption
            label={translate('Договор оферты/публичный договор', 'faq.freedomPay.offerAgreement')}
            icon={{file: freedomPayIcon}}
            className="faq-freedom-pay__category-option"
            onClick={() => {
              // For iOS webview
              isIosWebviewMode && console.log(WEBVIEW_MESSAGES.visa_doc_link)
              // ===============
              !isIosWebviewMode && window.location.assign('https://docs.google.com/document/d/1zviJEffjKtkAlUMVaDWTBMkdZFkt1gQsvjGUPGjb9p4/edit?usp=sharing')
            }}
          />
          {DATA.map((item, index) => renderFaqSubcomponent(item, index))}
        </div>
      </div>
    </div>
  );
};


function getContent() {
  return [
    {
      title: translate('Договор оферты FREEDOM Pay KG ', 'faq.freedomPay.title1'),
      description: <>{translate('Данный договор оферты вступает в силу в случае оформления сделки через платежную систему от указанного ниже партнёра платежной системы и распространяется только на территории КР. Возврат средств, указанный в Приложение № 1 к Публичному договору возмездного оказания услуг «Правила оплаты и возврата денежных средств», вступает только после совместного соглашения между Исполнителем и Потребителем.', 'faq.freedomPay.desc1')}
        <br/>
        {translate('Приложение № 1 к Публичному договору возмездного оказания услуг', 'faq.freedomPay.p1')}</>,
      disableTopMargin: true,
      renderIcon: () => <PlayIcon/>
    },
    {
      title: translate('Правила партнеров Apofiz', 'faq.freedomPay.title2'),
      description: translate('Настоящие Правила оплаты и возврата денежных средств (далее - Правила) регулируют отношения между Исполнителем и Заказчиком, связанные с оплатой услуг по Договору и возвратом оплаченной стоимости услуг в случае досрочного расторжения Договора, Торгово - социальная сеть Apofiz, далее - Электронная платформа не несет ответственности за поставленный товар или услугу, и возврат средств производится на стороне Исполнителя.', 'faq.freedomPay.desc2'),
      renderIcon: () => <PlayIcon/>
    }
  ]
}

export default FaqFreedomPay;