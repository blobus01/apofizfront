import React from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import TooltipPlayer from '../../components/TooltipPlayer';
import {renderFaqSubcomponentSlider} from './index';
import {FAQ_EMPLOYEES_EN, FAQ_EMPLOYEES_RU} from './images';
import {LOCALES, translate} from '../../locales/locales';

import AEmployee1 from '../../assets/audio/ru/employee_1.mp3';
import AEmployee1_en from '../../assets/audio/en/employee_1.mp3';

const FaqEmployees = ({language, goBack, isWebviewMode}) => {
  const DATA = getContent(language);

  return (
    <div className="faq-employees">
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate('Наём сотрудника', 'faq.hiringEmployees')}
          onBack={() => goBack('/faq')}
        />
      )}
      <div className="faq__content">
        <div className="container">
          {DATA.map((item, index) => renderFaqSubcomponentSlider(item, index))}
        </div>
      </div>
    </div>
  )
}

function getContent(locale) {
  const isRU = locale === LOCALES.ru
  return [
    {
      title: translate('Пригласить сотрудника ?', 'faq.employees.title'),
      description: translate('Пригласив сотрудника, вы трудоустраиваете его на работу. Для этого Вам надо ввести id номер qr кода сотрудника или отсканировать его. После вам станет доступна возможность назначить должность сотруднику и выдать ему права, на администрирование вашей организации. Также вы сможете просматривать статистику продаж, график посещаемости, изменять должность и права в любой момент. Также вы можете передать права собственника организации другому пользователю. Вся статистика доступна 24 часа 7 дней в неделю, управляйте своим бизнесом онлайн.', 'faq.employees.desc'),
      slides: isRU ? FAQ_EMPLOYEES_RU : FAQ_EMPLOYEES_EN,
      disableTopMargin: true,
      renderIcon: () => <TooltipPlayer sources={[isRU ? AEmployee1 : AEmployee1_en]}/>,
    }
  ];
}

export default FaqEmployees;