import React from 'react';
import MobileTopHeader from "../../components/MobileTopHeader";
import {LOCALES, translate} from "../../locales/locales";
import {renderFaqSubcomponent} from "./index";
import TooltipPlayer from "../../components/TooltipPlayer";

import image0 from "../../assets/images/faq/ru/offline_purchases_and_online_payment_0.png"
import image1 from "../../assets/images/faq/ru/offline_purchases_and_online_payment_1.png"
import image2 from "../../assets/images/faq/ru/offline_purchases_and_online_payment_2.png"
import image3 from "../../assets/images/faq/ru/offline_purchases_and_online_payment_3.png"
import image4 from "../../assets/images/faq/ru/offline_purchases_4.png"
import image5 from "../../assets/images/faq/ru/offline_purchases_5.png"
import image6 from "../../assets/images/faq/ru/offline_purchases_6.png"
import image7 from "../../assets/images/faq/ru/offline_purchases_7.png"

import audioRu0 from "../../assets/audio/ru/offline_purchases_0.mp3"
import audioRu1 from "../../assets/audio/ru/offline_purchases_1.mp3"
import audioRu2 from "../../assets/audio/ru/offline_purchases_2.mp3"
import audioRu3 from "../../assets/audio/ru/offline_purchases_3.mp3"

import audioEn0 from "../../assets/audio/en/offline_purchases_0.mp3"
import audioEn1 from "../../assets/audio/en/offline_purchases_1.mp3"
import audioEn2 from "../../assets/audio/en/offline_purchases_2.mp3"
import audioEn3 from "../../assets/audio/en/offline_purchases_3.mp3"

const FaqOfflinePurchases = ({language, goBack, isWebviewMode}) => {
  const DATA = getContent(language)

  return (
    <div className="faq-offline-purchases">
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate('Описание оффлайн покупки', 'faq.descOfflinePurchases')}
          onBack={() => goBack('/faq')}
        />
      )}
      <div className="faq__content">
        <div className="container">
          {DATA.map((item, index) => renderFaqSubcomponent(item, index))}
          <div className="faq__image-wrap">
            <div className="faq__image-container">
              <img
                src={image7}
                alt="Instruction"
                className="faq__image"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


function getContent(locale) {
  const isRU = locale === LOCALES.ru
  return [
    {
      title: translate('Как купить товар оффлайн', 'faq.offlinePurchase.title1'),
      description: <>
        <p>
          {translate('Если покупаете товар или услугу оффлайн, на главной странице или странице организации:', 'faq.offlinePurchase.p1')}
        </p>
        <ol className="faq-offline-purchases__list">
          <li>{translate('Выберите товар.', 'faq.offlinePurchase.p2')}</li>
          <li>{translate('Нажмите "Купить.', 'faq.offlinePurchase.p3')}</li>
          <li>{translate('Если указан размер, выберите его и добавьте в корзину.', 'faq.offlinePurchase.p4')}</li>
        </ol>
      </>,
      disableTopMargin: true,
      image: {src: image0, alt: 'Instruction'},
      renderIcon: () => <TooltipPlayer sources={[isRU ? audioRu0 : audioEn0]}/>
    },
    {
      title: translate('Далее действия в корзине ?', 'faq.offlinePurchase.title2'),
      description: <>
        <p style={{marginBottom: 24}}>
          {translate('Перейдите в корзину, организацию в которой вы добавили товар или услугу. Проверите список товаров и услуг которые вы хотели приобрести, при необходимости отредактируйте его или дополните вернувшись в выбранную организацию.', 'faq.offlinePurchase.p5')}
        </p>
        <p className="faq-offline-purchases__instruction-text">
          {translate('1. Нажмите на корзины в навигации приложения', 'faq.offlinePurchase.p6')}
        </p>
      </>,
      image: {src: image1, alt: 'Instruction'},
      renderIcon: () => <TooltipPlayer sources={[isRU ? audioRu1 : audioEn1]}/>
    },
    {
      description: <p className="faq-offline-purchases__instruction-text">
        {translate('2. Выберете организацию в списке корзин', 'faq.offlinePurchase.p7')}
      </p>,
      image: {src: image2, alt: 'Instruction'}
    },
    {
      description: <>
        <p className="faq-offline-purchases__instruction-text">
          {translate('3. Проверите список добавленных товаров и услуг', 'faq.offlinePurchase.p8')}
        </p>
        <p className="faq-offline-purchases__instruction-text">
          {translate('4. Далее, нажмите на кнопку купить.', 'faq.offlinePurchase.p9')}
        </p>
      </>,
      image: {src: image3, alt: 'Instruction'}
    },
    {
      title: translate('Выбор способа оплаты и доставки ?', 'faq.offlinePurchase.title3'),
      description: <>
        <ol className="faq-offline-purchases__list" style={{marginBottom: 24}}>
          <li>{translate('Выберите удобный способ оплаты и доставки.', 'faq.offlinePurchase.p10')}</li>
          <li>{translate('Если выбрали доставку с курьером, оплата будет производиться курьеру при доставке на указанный адрес при оформлении заказа.', 'faq.offlinePurchase.p11')}
          </li>
          <li>
            {translate('Если выбрали самовывоз, оплата будет осуществляться на указанном адресе организации при получении товара.', 'faq.offlinePurchase.p12')}
          </li>
        </ol>
        <p className="faq-offline-purchases__instruction-text">
          {translate('4.1 Выбрав способ оплаты “Наличными с курьером” укажите обязательно адрес и нажмите оформить заказ', 'faq.offlinePurchase.p13')}
        </p>
      </>,
      image: {src: image4, alt: 'Instruction'},
      renderIcon: () => <TooltipPlayer sources={[isRU ? audioRu2 : audioEn2]}/>
    },
    {
      description: <p className="faq-offline-purchases__instruction-text">
        {translate('4.2 Выбрав способ оплаты “Самовывоз” нажав на кнопку оформить заказ, вы сможете забрать Ваш заказ адреса указанного в выбранной организации.', 'faq.offlinePurchase.p14')}
      </p>,
      image: {src: image5, alt: 'Instruction'}
    },
    {
      title: translate('Поздравляем ваш заказ оформлен !', 'faq.offlinePurchase.title4'),
      description: <ol className="faq-offline-purchases__list">
        <li>
          {translate('В зависимости какой вид и способ оплаты был выбран Вам будет отправлено уведомлении о у спешном оформление заказа.', 'faq.offlinePurchase.p15')}
        </li>
        <li>
          {translate('С Вами свяжутся сотрудники организации или курьерской службы, чтобы уточнить детали если это будет необходимо.', 'faq.offlinePurchase.p16')}
        </li>
      </ol>,
      image: {src: image6, alt: 'Instruction'},
      renderIcon: () => <TooltipPlayer sources={[isRU ? audioRu3 : audioEn3]}/>
    },
  ]
}

export default FaqOfflinePurchases;