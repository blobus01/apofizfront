import React from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import {renderFaqSubcomponent} from './index';
import {LOCALES, translate} from '../../locales/locales';
import TooltipPlayer from '../../components/TooltipPlayer';

import Savings1 from '../../assets/images/faq/ru/savings_1.png';
import Savings2 from '../../assets/images/faq/ru/partners_3_2.png';
import Savings3 from '../../assets/images/faq/ru/savings_3.png';
import Savings4 from '../../assets/images/faq/ru/savings_4.png';

import Savings1_en from '../../assets/images/faq/en/savings_1.png';
import Savings2_en from '../../assets/images/faq/en/partners_3_2.png';
import Savings3_en from '../../assets/images/faq/en/savings_3.png';
import Savings4_en from '../../assets/images/faq/en/savings_4.png';

import ASavings1 from '../../assets/audio/ru/savings_1.mp3';
import ASavings2 from '../../assets/audio/ru/savings_2.mp3';
import ASavings3 from '../../assets/audio/ru/savings_3.mp3';
import ASavings4 from '../../assets/audio/ru/savings_4.mp3';

import ASavings1_en from '../../assets/audio/en/savings_1.mp3';
import ASavings2_en from '../../assets/audio/en/savings_2.mp3';
import ASavings3_en from '../../assets/audio/en/savings_3.mp3';
import ASavings4_en from '../../assets/audio/en/savings_4.mp3';

const FaqSavings = ({ language, goBack, isWebviewMode }) => {
  const DATA = getContent(language)

  return (
    <div className="faq-savings">
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate('Описание профиля', 'faq.descProfile')}
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
  return [
    {
      title: translate('Что такое Ваша экономия ?', 'faq.savings.title1'),
      description: translate('Покупая или пользуясь услугами организаций, вы постоянно экономите или правильно зарабатываете настоящие деньги. В зависимости от условий организаций вы можете тратить сэкономлены средства. Для вашего удобства при смене региона, будет меняться и валюта в зависимости от вашей локации, также вы можете сами сменить на другую валюту сэкономленные средства.', 'faq.savings.desc1'),
      image: {src: locale === LOCALES.ru ? Savings1 : Savings1_en, alt: 'Savings 1'},
      disableTopMargin: true,
      renderIcon: () => <TooltipPlayer sources={[ locale === LOCALES.ru ? ASavings1 : ASavings1_en ]} />
    },
    {
      title: translate('Что такое Ваша статистика?', 'faq.savings.title2'),
      description: translate('Мы часто совершаем покупки, теряем чеки забываем, где какой товар мы купили, а бывает вспомнишь что купил классную вещь и думаешь, как хорошо сделать доставку этого товара еще раз, а контактов нет, да и место уже забыл, а имя кто продал даже и не знали. Теперь это все в прошлом, в вашей статистике вы найдете всю информацию, которая вам интересна, имя продавца, локацию, адрес, контакты да и конечно сам чек...', 'faq.savings.desc2'),
      image: {src: locale === LOCALES.ru ? Savings4 : Savings4_en, alt: 'Savings 4'},
      renderIcon: () => <TooltipPlayer sources={[ locale === LOCALES.ru ? ASavings2 : ASavings2_en ]} />
    },
    {
      title: translate('Для чего нужен QR сканер ?', 'faq.savings.title3'),
      description: translate('Если вам будет необходимо отсканировать пропуска сотрудников, вы можете сделать это двумя способами. Первый войти организацию, где у вас есть права на сканирование пропусков или более простой вариант, сканирование через QR сканер на странице профиля.', 'faq.savings.desc3'),
      image: {src: locale === LOCALES.ru ? Savings2 : Savings2_en, alt: 'Savings 2'},
      renderIcon: () => <TooltipPlayer sources={[ locale === LOCALES.ru ? ASavings3 : ASavings3_en ]} />
    },
    {
      title: translate('Ваши организации ?', 'faq.savings.title4'),
      description: translate('Список ваших организаций создан для вашего удобства, при навигации и проведения быстрых операций в них. Также вы можете сразу идентифицировать организации, в которых вы собственник или наемный сотрудник.', 'faq.savings.desc4'),
      image: {src: locale === LOCALES.ru ? Savings3 : Savings3_en, alt: 'Savings 3'},
      renderIcon: () => <TooltipPlayer sources={[ locale === LOCALES.ru ? ASavings4 : ASavings4_en ]} />
    }
  ]
}

export default FaqSavings;