import React from 'react';
import MobileTopHeader from "../../components/MobileTopHeader";
import {translate} from "../../locales/locales";
import {CategoryOption} from "../../components/CategoryOption";
import freedomPayIcon from "../../assets/images/freedom_pay.png"
import {renderFaqSubcomponent} from "./index";
import {PlayIcon} from "./components";
import koverSamoletIcon from "../../assets/images/kover_samolet_icon.png";


const FaqRefund = ({history, goBack, isWebviewMode, isIosWebviewMode}) => {
  const WEBVIEW_MESSAGES = Object.freeze({
    visa_doc: 'visa_doc',
    kover_doc: 'kover_doc'
  })

  const DATA = getContent();

  return (
    <div className="faq-refund">
      {!isWebviewMode && !isIosWebviewMode && (
        <MobileTopHeader
          title={translate('Возврат товара или услуги', 'faq.descRefund')}
          onBack={() => goBack('/faq')}
          className="faq-refund__header"
        />
      )}
      <div className="faq__content">
        <div className="container">
          <CategoryOption
            label={translate('Документация и Договор оферта FREEDOM Pay KG', 'faq.refund.freedomPay')}
            icon={{file: freedomPayIcon}}
            className="faq-refund__category-option"
            onClick={() => {
              // For iOS webview
              isIosWebviewMode && console.log(WEBVIEW_MESSAGES.visa_doc)
              // ===============
              !isIosWebviewMode && history.push(isWebviewMode ? '/faq/freedom-pay?mode=webview' : '/faq/freedom-pay')
            }}
          />
          <CategoryOption
            icon={{file: koverSamoletIcon}}
            label={translate('Ковер самолет - служба доставки', 'faq.refund.koverSamolet')}
            className="faq-refund__category-option"
            onClick={() => {
              // For iOS webview
              isIosWebviewMode && console.log(WEBVIEW_MESSAGES.kover_doc)
              // ===============
              !isIosWebviewMode && history.push(isWebviewMode ? '/faq/kover-samolet?mode=webview' : '/faq/kover-samolet')
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
      title: translate('Возврат товара или услуги Apofiz.com', 'faq.refund.title1'),
      description: translate('Торгово - социальная сеть Apofiz, далее - Электронная платформа выступает исключительно в роли платформы-посредника и не является стороной какой-либо сделки между пользователями. Электронная платформа не является продавцом, производителем или поставщиком товаров и/или услуг, представленных на странице организаций на платформе. В связи с этим электронная платформа не несет юридической ответственности за качество и гарантию, предложенных товаров или услуг, а также за возможные нарушения прав и обязанностей сторон в процессе осуществления сделки. Все вопросы, споры и претензии, связанные с выполнением, расторжением или невыполнением условий договора купли-продажи, следует адресовать прямо участникам сделки. Электронная платформа отказывается от всех прямых или косвенных обязательств и гарантий в отношении любых товаров или услуг, предлагаемых на платформе, и не принимает на себя обязательства по разрешению конфликтов между пользователями.', 'faq.refund.desc1'),
      disableTopMargin: true,
      renderIcon: () => <PlayIcon/>
    },
    {
      title: translate('Возвращение товаров с покупкой онлайн', 'faq.refund.title2'),
      description: <>
        {translate('Регулируется законами конкретной страны и политикой возврата конкретного магазина или продавца. Однако существует общий список товаров, которые обычно исключают из возможности возврата после покупки онлайн:', 'faq.refund.desc2')}
        <ol className="faq__mb-24">
          <li>
            {translate('1. ** Личные гигиенические товары**: Зубные щетки, расчески, ушные палочки и т. д.', 'faq.refund.p1')}
          </li>
          <li>
            {translate('2. ** Косметика и парфюмерия**: Открытые и использованные товары.', 'faq.refund.p2')}
          </li>
          <li>
            {translate('3. ** Подгузники и другие средства гигиенического назначения**.', 'faq.refund.p3')}
          </li>
          <li>
            {translate('4. ** Нижнее белье и купальники**: В особенности если на товаре нарушена фабричная упаковка или этикетки.', 'faq.refund.p4')}
          </li>
          <li>
            {translate('5. ** Продукты питания и напитки**: В том числе добавки и витамины.', 'faq.refund.p5')}
          </li>
          <li>
            {translate('6. ** Лекарства и медицинские препараты**.', 'faq.refund.p6')}
          </li>
          <li>
            {translate('7. ** Аудио - и видеозаписи, программное обеспечение**: Если упаковка была открыта.', 'faq.refund.p7')}
          </li>
          <li>
            {translate('8. ** Товары, изготовленные по индивидуальному заказу** или настроенные под конкретного покупателя.', 'faq.refund.p8')}
          </li>
          <li>
            {translate('9. ** Живые растения и животные**.', 'faq.refund.p9')}
          </li>
          <li>
            {translate('10. ** Товары, которые быстро портятся или имеют короткий срок годности**.', 'faq.refund.p10')}
          </li>
          <li>
            {translate('11. ** Билеты на мероприятия, авиабилеты и бронирования**.', 'faq.refund.p11')}
          </li>
          <li>
            {translate('12. ** Цифровые товары и услуги**: Электронные книги, онлайн-курсы, лицензионные ключи и т. д.', 'faq.refund.p12')}
          </li>
          <li>
            {translate('13. ** Ювелирные изделия, часы и драгоценные камни высокой стоимости**: В некоторых магазинах.', 'faq.refund.p13')}
          </li>
          <li>
            {translate('14. ** Товары со скидкой или распроданные товары**, которые обозначены как "финальная продажа" или "без возможности возврата".', 'faq.refund.p14')}
          </li>
        </ol>
        {translate('Помимо вышеуказанных позиций, многие магазины могут иметь свои особенности в политике возврата. Всегда рекомендуется ознакомиться с политикой возврата перед покупкой, особенно когда делаете покупки онлайн.', 'faq.refund.p15')}
      </>,
      renderIcon: () => <PlayIcon/>
    },
  ]
}

export default FaqRefund;