import React from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import TooltipPlayer from '../../components/TooltipPlayer';
import {LOCALES, translate} from '../../locales/locales';
import {renderFaqSubcomponent} from './index';

import Organization1 from '../../assets/images/faq/ru/organizations_0_1.png';
import Organization1_en from '../../assets/images/faq/en/organizations_0_1.png';
import AOrganization1 from '../../assets/audio/ru/organization1.mp3';
import AOrganization1_en from '../../assets/audio/en/organization1.mp3';

const FaqOrganization = ({language, goBack, isWebviewMode}) => {
  const DATA = getContent(language);

  return (
    (
      <div className="faq-registration">
        {!isWebviewMode && (
          <MobileTopHeader
            title={translate('Описание организации', 'faq.descOrganization')}
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
  )
}

function getContent(locale) {
  return [
    {
      title: translate('Зачем открывать организацию?', 'faq.organization.title'),
      description: translate('Вы будите удивлены, но нет других платформ в мире, где каждый может стать собственником своей организации, начав предоставлять скидки, бонусы, вести электронный учет и контроль деятельности персонала, отправлять информационные сообщения своим подписчикам и клиентам и даже больше. А если вспомнить как дорого открыть свой, не то, что сделать его доступным на IOS и Android.  Apofiz открывает Вам все эти возможности,  для увеличения продаж и узнаваемости вашей организации.', 'faq.organization.desc'),
      image: {src: locale === LOCALES.ru ? Organization1 : Organization1_en, alt: 'Organization 1'},
      disableTopMargin: true,
      renderIcon: () => <TooltipPlayer sources={[locale === LOCALES.ru ? AOrganization1 : AOrganization1_en]}/>
    }
  ]
}

export default FaqOrganization;