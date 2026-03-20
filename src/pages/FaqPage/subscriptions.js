import React from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import TooltipPlayer from '../../components/TooltipPlayer';
import {LOCALES, translate} from '../../locales/locales';
import {renderFaqSubcomponent} from './index';

import Subscriptions1 from '../../assets/images/faq/ru/subscriptions_1.png';
import Subscriptions1_en from '../../assets/images/faq/en/subscriptions_1.png';

import ASubscriptions1 from '../../assets/audio/ru/subscriptions_1.mp3';
import ASubscriptions1_en from '../../assets/audio/en/subscriptions_1.mp3';

const FaqSubscriptions = ({language, goBack, isWebviewMode}) => {
  const DATA = getContent(language);

  return (
    <div className="faq-subscriptions">
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate('Описание подписки', 'faq.descSubscriptions')}
          onBack={() => goBack('/faq')}
        />
      )}
      <div className="faq__content">
        <div className="container">
          {DATA.map((item, index) => renderFaqSubcomponent(item, index))}
        </div>
      </div>
    </div>
  )
}

function getContent(locale) {
  const isRU = locale === LOCALES.ru
  return [
    {
      title: translate('Ваши подписки ?', 'faq.subscription.title'),
      description: translate('Для простой навигации и поиска ваших подписок, вы всегда сможете воспользоваться вкладкой подписки. Подписавшись на организацию Вам станут доступны все самые горячие предложения о скидках, этой организации и вы сможете получать уведомления о новых предложениях и различных акциях. Быть в центре всех самых интересных событий ваших подписок.', 'faq.subscription.desc'),
      image: {src: isRU ? Subscriptions1 : Subscriptions1_en, alt: 'Subscription '},
      disableTopMargin: true,
      renderIcon: () => <TooltipPlayer sources={[isRU ? ASubscriptions1 : ASubscriptions1_en]}/>
    }
  ]
}

export default FaqSubscriptions;