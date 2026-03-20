import React from 'react';
import {LOCALES, translate} from "../../locales/locales";
import MobileTopHeader from "../../components/MobileTopHeader";
import {renderFaqSubcomponent} from "./index";
import TooltipPlayer from "../../components/TooltipPlayer";

import image0 from "../../assets/images/faq/ru/offline_purchases_and_online_payment_0.png";
import image1 from "../../assets/images/faq/ru/offline_purchases_and_online_payment_1.png";
import image2 from "../../assets/images/faq/ru/offline_purchases_and_online_payment_2.png";
import image3 from "../../assets/images/faq/ru/offline_purchases_and_online_payment_3.png";
import image4 from "../../assets/images/faq/ru/online_payment_4.png";
import image5 from "../../assets/images/faq/ru/offline_purchases_6.png";
import image6 from "../../assets/images/faq/ru/online_payment_7.png";
import image7 from "../../assets/images/faq/ru/online_payment_8.png"
import image8 from "../../assets/images/faq/ru/online_payment_9.png"
import image9 from "../../assets/images/faq/ru/online_payment_10.png"
import image10 from "../../assets/images/faq/ru/online_payment_11.png"
import image11 from "../../assets/images/faq/ru/online_payment_12.png"

import audioRu0 from "../../assets/audio/ru/online_payment_0.mp3"
import audioRu1 from "../../assets/audio/ru/online_payment_1.mp3"
import audioRu2 from "../../assets/audio/ru/online_payment_2.mp3"
import audioRu3 from "../../assets/audio/ru/online_payment_3.mp3"
import audioRu4 from "../../assets/audio/ru/online_payment_4.mp3"

import audioEn0 from "../../assets/audio/en/online_payment_0.mp3"
import audioEn1 from "../../assets/audio/en/online_payment_1.mp3"
import audioEn2 from "../../assets/audio/en/online_payment_2.mp3"
import audioEn3 from "../../assets/audio/en/online_payment_3.mp3"
import audioEn4 from "../../assets/audio/en/online_payment_4.mp3"

const FaqOnlinePayment = ({language, goBack, isWebviewMode}) => {
  const DATA = getContent(language);

  return (
    <div className="faq-online-payment">
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate('Описание онлайн оплаты', 'faq.descOnlinePayment')}
          onBack={() => goBack('/faq')}
        />
      )}
      <div className="faq__content">
        <div className="container">
          {DATA.map((item, index) => renderFaqSubcomponent(item, index))}
        </div>
      </div>
    </div>
  );
};


function getContent(locale) {
  const isRU = locale === LOCALES.ru

  return [
      {
        title: translate('Как купить товар онлайн', 'faq.onlinePayment.title1'),
        description: <>
          <p>
            {translate('Если покупаете товар или услугу онлайн, на главной странице или странице организации:', 'faq.onlinePayment.p1')}
          </p>
          <ol className="faq-online-payment__list">
            <li>{translate('Выберите товар.', 'faq.onlinePayment.p2')}</li>
            <li>{translate('Нажмите "Купить".', 'faq.onlinePayment.p3')}</li>
            <li>{translate('Если указан размер, выберите его и добавьте в корзину.', 'faq.onlinePayment.p4')}</li>
          </ol>
        </>,
        disableTopMargin: true,
        image: {src: image0, alt: 'Instruction'},
        renderIcon: () => <TooltipPlayer sources={[ isRU ? audioRu0 : audioEn0 ]} />
      },
      {
        title: translate('Далее действия в корзине ?', 'faq.onlinePayment.title2'),
        description: <>
          <p style={{marginBottom: 24}}>
            {translate('Перейдите в корзину, организацию в которой вы добавили товар или услугу. Проверите список товаров и услуг которые вы хотели приобрести, при необходимости отредактируйте его или дополните вернувшись в выбранную организацию.', 'faq.onlinePayment.p5')}
          </p>
          <p className="faq-online-payment__instruction-text">
            {translate('1. Нажмите на корзины в навигации приложения', 'faq.onlinePayment.p6')}
          </p>
        </>,
        image: {src: image1, alt: 'Instruction'},
        renderIcon: () => <TooltipPlayer sources={[ isRU ? audioRu1 : audioEn1 ]} />
      },
      {
        description: <p className="faq-online-payment__instruction-text">
          {translate('2. Выберете организацию в списке корзин', 'faq.onlinePayment.p7')}
        </p>,
        image: {src: image2, alt: 'Instruction'}
      },
      {
        description: <p className="faq-online-payment__instruction-text">
          {translate('3. Проверите список добавленных товаров и услуг далее нажмите на кнопку купить.', 'faq.onlinePayment.p8')}
        </p>,
        image: {src: image3, alt: 'Instruction'}
      },
      {
        title: translate('Выбор способа оплаты и доставки ?', 'faq.onlinePayment.title3'),
        description: <>
          <ol className="faq-online-payment__list faq__mb-24">
            <li>{translate('Выберите удобный способ оплаты и доставки.', 'faq.onlinePayment.p9')}</li>
            <li>{translate('Если вы выбрали онлайн оплату с доставкой с курьером, оплата будет произведена за товар или услугу по средством выбранной платежной системе.', 'faq.onlinePayment.p10')}</li>
            <li>{translate('После доставки товара с курьером, возможна оплата за услугу доставки.', 'faq.onlinePayment.p11')}</li>
          </ol>
          <p className="faq-online-payment__instruction-text">
            {translate('4. Выбрав способ оплаты “Онлайн оплаты” укажите обязательно адрес и нажмите оформить заказ', 'faq.onlinePayment.p12')}
          </p>
        </>,
        image: {src: image4, alt: 'Instruction'},
        renderIcon: () => <TooltipPlayer sources={[ isRU ? audioRu2 : audioEn2 ]} />
      },
      {
        title: translate('Поздравляем ваш заказ оформлен !', 'faq.onlinePayment.title4'),
        description: <ol className="faq-online-payment__list">
          <li>
            {translate('Вам будет отправлено уведомлении о у спешном оформление заказа.', 'faq.onlinePayment.p13')}
          </li>
          <li>
            {translate('Организация проверив наличие доступности товаров и/или услуг подтвердит оплаты и Вам будет отправлено уведомлении об оплате. В том случаи если товара и/или услуги нет в доступности Вам могут отменить ваш заказ.', 'faq.onlinePayment.p14')}
          </li>
        </ol>,
        images: [{src: image5, alt: 'Instruction'}, {src: image6, alt: 'Instruction'}],
        renderIcon: () => <TooltipPlayer sources={[ isRU ? audioRu3 : audioEn3 ]} />
      },
      {
        title: translate('Оплата через платежные системы', 'faq.onlinePayment.title5'),
        description: <>
          <ol className="faq-online-payment__list faq__mb-24">
            <li>
              {translate('Вам будет отправлено уведомлении от организации после подтверждения в наличии товара и/или услуги о том что ваш заказ готов к оплате.', 'faq.onlinePayment.p15')}
            </li>
            <li>
              {translate('Далее выбрав платежную систему доступную в данной организации вы сможете провести оплату.', 'faq.onlinePayment.p16')}
            </li>
            <li>
              {translate('После успешной оплаты организация обязуется доставить вам товар и/или услугу по указному адресу.', 'faq.onlinePayment.p17')}
            </li>
          </ol>
          <p className="faq-online-payment__instruction-text">
            {translate('1. Подтвердите оплату нажав оплатить.', 'faq.onlinePayment.p18')}
          </p>
        </>,
        image: {src: image7, alt: 'Instruction'},
        renderIcon: () => <TooltipPlayer sources={[ isRU ? audioRu4 : audioEn4 ]} />
      },
      {
        description: <p className="faq-online-payment__instruction-text">
          {translate('2. Выберете платежную систему оплаты', 'faq.onlinePayment.p19')}
        </p>,
        image: {src: image8, alt: 'Instruction'}
      },
      {
        description: <p className="faq-online-payment__instruction-text">
          {translate('3. Завершите оплату заполнив форму платежной системы', 'faq.onlinePayment.p20')}
        </p>,
        image: {src: image9, alt: 'Instruction'}
      },
      {
        description: <p className="faq-online-payment__instruction-text">
          {translate('4. Поздравляем Ваша оплата прошла, теперь организация сможет доставить или оказать ваш заказ', 'faq.onlinePayment.p21')}
        </p>,
        images: [{src: image10, alt: 'Instruction'}, {src: image11, alt: 'Instruction'}]
      },
    ];
}

export default FaqOnlinePayment;