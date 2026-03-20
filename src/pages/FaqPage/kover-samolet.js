import React from 'react';
import {translate} from "../../locales/locales";
import MobileTopHeader from "../../components/MobileTopHeader";
import {CategoryOption} from "../../components/CategoryOption";
import {renderFaqSubcomponent} from "./index";
import koverSamoletIcon from "../../assets/images/kover_samolet_icon.png";
import {PlayIcon} from "./components";


const FaqKoverSamolet = ({goBack, isWebviewMode, isIosWebviewMode}) => {
  const WEBVIEW_MESSAGES = Object.freeze({
    kover_doc_link: 'kover_doc_link',
  })

  const DATA = getContent();

  return (
    <div className="faq-kover-samolet">
      {!isWebviewMode && !isIosWebviewMode && (
        <MobileTopHeader
          title={translate('Ковер самолет тарифы и условия', 'faq.koverSamolet.tariffsAndConditions')}
          onBack={() => goBack('/faq/refund')}
          className="faq-kover-samolet__header"
        />
      )}
      <div className="faq__content">
        <div className="container">
          <CategoryOption
            label={translate('Ковер самолет тарифы и условия', 'faq.koverSamolet.ratesAndTemrs')}
            icon={{file: koverSamoletIcon}}
            className="faq-kover-samolet__category-option"
            onClick={() => {
              // For iOS webview
              isIosWebviewMode && console.log(WEBVIEW_MESSAGES.kover_doc_link)
              // ===============
              !isIosWebviewMode && window.location.assign('https://dostavka312.kg/stat/tarify/')
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
      title: translate('Термины от Apofiz для Ковра Самолета', 'faq.koverSamolet.title'),
      description: <>
        {translate('Правила возврата еды могут различаться в зависимости от конкретного магазина, ресторана. Служба доставки Ковер Самолет является курьером и не несет ответственности за качество продукции организации кто предоставил товар. Правила организаций по возврату еды и других товаров могут включать в себя следующее:', 'faq.koverSamolet.desc')}
        <ol className="faq-kover-samolet__number-list">
          <li>
            {translate('1. ** Открытие упаковки**: После открытия упаковки или употребления продукта возврат может быть ограничен или невозможен из-за санитарных и гигиенических соображений.', 'faq.koverSamolet.p1')}
          </li>
          <li>
            {translate('2. ** Сроки возврата**: В большинстве случаев, если у вас есть проблема с продуктом, вы должны связаться с магазином или рестораном в течение определенного времени после получения заказа.', 'faq.koverSamolet.p2')}
          </li>
          <li>
            {translate('3. ** Качество продукта**: Если продукт не соответствует заявленным стандартам качества или оказался поврежденным, вам может быть предоставлен возврат или замена.', 'faq.koverSamolet.p3')}
          </li>
          <li>
            {translate('4. ** Обращение в службу поддержки**: В случае проблем с заказанным продуктом обычно рекомендуется обратиться в службу поддержки магазина или ресторана, чтобы уточнить возможности возврата.', 'faq.koverSamolet.p4')}
          </li>
          <li>
            {translate('5. ** Условия возврата**: Магазины и рестораны часто указывают конкретные условия, при которых возможен возврат, такие как сохранение оригинальной упаковки или предоставление доказательств проблемы с продуктом.', 'faq.koverSamolet.p5')}
          </li>
          <li>
            {translate('6. ** Запрет на возврат определенных товаров**: Некоторые продукты, особенно те, которые легко портятся, могут быть исключены из возможности возврата.', 'faq.koverSamolet.p6')}
          </li>
        </ol>
        {translate('Важно прочитать правила и условия магазина или ресторана перед тем, как сделать заказ, чтобы быть в курсе их политики возврата.', 'faq.koverSamolet.p7')}
      </>,
      disableTopMargin: true,
      renderIcon: () => <PlayIcon/>
    }
  ]
}

export default FaqKoverSamolet;