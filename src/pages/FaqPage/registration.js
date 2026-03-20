import React from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import TooltipPlayer from '../../components/TooltipPlayer';
import {renderFaqSubcomponent} from './index';
import {LOCALES, translate} from '../../locales/locales';

import Registration01 from '../../assets/images/faq/ru/registration_1.png';
import Registration02 from '../../assets/images/faq/ru/registration_2.png';
import Registration03 from '../../assets/images/faq/ru/registration_3.png';
import Registration04 from '../../assets/images/faq/ru/registration_4.png';

import Registration02_en from '../../assets/images/faq/en/registration_2.png';
import Registration03_en from '../../assets/images/faq/en/registration_3.png';

import ARegistration1 from '../../assets/audio/ru/registration_1.mp3';
import ARegistration2 from '../../assets/audio/ru/registration_2.mp3';
import ARegistration3 from '../../assets/audio/ru/registration_3.mp3';
import ARegistration4 from '../../assets/audio/ru/registration_4.mp3';

import ARegistration1_en from '../../assets/audio/en/registration_1.mp3';
import ARegistration2_en from '../../assets/audio/en/registration_2.mp3';
import ARegistration3_en from '../../assets/audio/en/registration_3.mp3';
import ARegistration4_en from '../../assets/audio/en/registration_4.mp3';


const FaqRegistration = ({language, goBack, isWebviewMode, onBack}) => {
  const DATA = getContent(language);

  return (
    <div className="faq-registration">
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate('Описание регистрации', 'faq.descRegistration')}
          onBack={() => onBack ? onBack() : goBack('/faq')}
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
  return [
    {
      title: translate('Почему важно добавить фото ?', 'faq.registration.title1'),
      description: translate('Ваша фотография необходима для идентификации вашей личности. Многие организации требуют ваше фото, поскольку если вы не взяли устройство для проведения скидки или пропуска на работу, вы сможете просто сказать номер вашего qr кода, и вас идентифицируют.', 'faq.registration.desc1'),
      image: {src: Registration01, alt: 'Registration 1'},
      disableTopMargin: true,
      renderIcon: () => <TooltipPlayer sources={[locale === LOCALES.ru ? ARegistration1 : ARegistration1_en]}/>
    },
    {
      title: translate('Важно ли ФИО?', 'faq.registration.title2'),
      description: translate('Все зависит от требований, которые могут устанавливать каждая организация на свое усмотрение. Для примера, вы покупаете дорогую вещь в фирменном магазине, у вас есть чек, и вы решили отказаться от покупки, в этом случаи вас могут попросить идентифицировать ваше ФИО, по вашему удостоверяющему документу, который должен совпадать с данными электронного чека. Также для пропуска на работу.', 'faq.registration.desc2'),
      image: {src: locale === LOCALES.ru ? Registration02 : Registration02_en, alt: 'Registration 2'},
      renderIcon: () => <TooltipPlayer sources={[locale === LOCALES.ru ? ARegistration2 : ARegistration2_en]}/>
    },
    {
      title: translate('Зачем нужен никнейм ?', 'faq.registration.title3'),
      description: translate('Для вашего удобства, предположим вы подписались на организацию или просто хотите скрыть данные в открытых источниках ресурса, мы предусмотрели возможность отображения вашего имени или никнейма.', 'faq.registration.desc3'),
      image: {src: locale === LOCALES.ru ? Registration03 : Registration03_en, alt: 'Registration 3'},
      renderIcon: () => <TooltipPlayer sources={[locale === LOCALES.ru ? ARegistration3 : ARegistration3_en]}/>
    },
    {
      title: translate('Зачем нужна электронная почта ?', 'faq.registration.title4'),
      description: translate('Почта нужна для вашей безопасности и восстановлению пароля, в случаи утери вашего номера авторизации или смене страны куда могут не прийти смс с кодом, для подтверждения вашей личности.', 'faq.registration.desc4'),
      image: {src: Registration04, alt: 'Registration 4'},
      renderIcon: () => <TooltipPlayer sources={[locale === LOCALES.ru ? ARegistration4 : ARegistration4_en]}/>
    }
  ]
}

export default FaqRegistration;