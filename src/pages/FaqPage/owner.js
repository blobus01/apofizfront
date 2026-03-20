import React from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import TooltipPlayer from '../../components/TooltipPlayer';
import {renderFaqSubcomponentSlider} from './index';
import {LOCALES, translate} from '../../locales/locales';

import {FAQ_OWNER_EN, FAQ_OWNER_RU} from './images';

import AOwner1 from '../../assets/audio/ru/owner_1.mp3';
import AOwner1_en from '../../assets/audio/en/owner_1.mp3';

const FaqOwner = ({ language, onBack, goBack, isWebviewMode }) => {
  const DATA = getContent(language);

  return (
    <div className="faq-employees">
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate('Описание собственника', 'faq.descOwners')}
          onBack={() => onBack ? onBack() : goBack('/faq')}
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
      title: translate('Назначить собственника ?', 'faq.owner.title'),
      description: translate('Теперь вам не надо менять номер телефона или придумывать сложные схемы передачи прав Вашей организации, для этого достаточно ввести id номер qr кода или отсканировать пользователя, и назначить нового собственника организации, потвердев в уведомлении. После назначения нового собственника вся информация о деятельности организации статистика и полное администрирование переходят новому собственнику. Старый собственник потеряет возможность управлять или видеть статистику переданной организацией. Данная функция предусмотрена для передачи полных прав на организацию новому собственнику.', 'faq.owner.desc'),
      slides: isRU ? FAQ_OWNER_RU : FAQ_OWNER_EN,
      disableTopMargin: true,
      renderIcon: () => <TooltipPlayer sources={[ isRU ? AOwner1 : AOwner1_en ]} />,
    }
  ]
}

export default FaqOwner;