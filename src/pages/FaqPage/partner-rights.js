import React from 'react';
import {FAQ_PARTNER_RIGHTS_EN, FAQ_PARTNER_RIGHTS_RU} from './images';
import MobileTopHeader from '../../components/MobileTopHeader';
import {renderFaqSubcomponentSlider} from './index';
import TooltipPlayer from '../../components/TooltipPlayer';
import {LOCALES, translate} from '../../locales/locales';

import APartnerRights1 from '../../assets/audio/ru/partner_rights_1.mp3';
import APartnerRights2 from '../../assets/audio/ru/partner_rights_2.mp3';
import APartnerRights3 from '../../assets/audio/ru/partner_rights_3.mp3';
import APartnerRights4 from '../../assets/audio/ru/partner_rights_4.mp3';
import APartnerRights5 from '../../assets/audio/ru/partner_rights_5.mp3';

import APartnerRights1_en from '../../assets/audio/en/partner_rights_1.mp3';
import APartnerRights2_en from '../../assets/audio/en/partner_rights_2.mp3';
import APartnerRights3_en from '../../assets/audio/en/partner_rights_3.mp3';
import APartnerRights4_en from '../../assets/audio/en/partner_rights_4.mp3';
import APartnerRights5_en from '../../assets/audio/en/partner_rights_5.mp3';

const FaqPartnerRights = ({ language, goBack, isWebviewMode }) => {
  const DATA = getContent(language);

  return (
    <div className="faq-partners">
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate('Права для партнера', 'faq.partnerRights')}
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
      title: translate('Сканировать пропуска ?', 'faq.partnerRights.title1'),
      description: translate('Вашему партнёру станет возможно, сканировать пропуска ваших сотрудников. Рассмотрим пример, ваша организация находится в бизнес центре, который является вашим партнёром, охрана БЦ на входе, сможет сканировать пропуска ваших сотрудников, а вам будет доступна, вся история посещений вашего персонала. Пользуйтесь данной системой....', 'faq.partnerRights.desc1'),
      slides: isRU ? FAQ_PARTNER_RIGHTS_RU.one : FAQ_PARTNER_RIGHTS_EN.one,
      disableTopMargin: true,
      renderIcon: () => <TooltipPlayer sources={[ isRU ? APartnerRights1 : APartnerRights1_en ]} />
    },
    {
      title: translate('Статистика продаж/скидок ?', 'faq.partnerRights.title2'),
      description: translate('Вашему партнёру станет возможно просматривать статистику продаж и скидок, также удалять чеки произведенных сделок. Данная функция позволяет, вести управление своим сетевым бизнесом и контролировать сразу все ваши организации. Пример, Вы собственник ресторанной сети, зайдя в любую организацию вашей сети вы сможете просматривать доступную статистику, и производить контроль рентабельности вашего бизнеса. Пользуйтесь удобной функцией вашей сети...', 'faq.partnerRights.desc2'),
      slides: isRU ? FAQ_PARTNER_RIGHTS_RU.two : FAQ_PARTNER_RIGHTS_EN.two,
      renderIcon: () => <TooltipPlayer sources={[ isRU ? APartnerRights2 : APartnerRights2_en ]} />
    },
    {
      title: translate('Редактировать организацию ?', 'faq.partnerRights.title3'),
      description: translate('Вашему партнеру станет возможно редактировать вашу организацию. После включения данной функции ваш партнёр получит все права на изменения вашей организации и сможет полностью администрировать ее. Станет возможно редактировать организацию, изменять и добавлять скидки, управлять партнерами, отправлять сообщения от вашей организации. Рассмотрим пример, Вы собственник сети отелей, вам необходимо проводить постоянные изменения ваших дисконтных карт или изменять данные в описание вашего бизнеса, используя данную функцию вы сможете, дав права администратору проводить изменения во всех ваших организациях, а вам будет удобно наблюдать за всеми изменениями и продолжать контролировать ваши организации не передовая полный доступ к ним...', 'faq.partnerRights.desc3'),
      slides: isRU ? FAQ_PARTNER_RIGHTS_RU.three : FAQ_PARTNER_RIGHTS_EN.three,
      renderIcon: () => <TooltipPlayer sources={[ isRU ? APartnerRights3 : APartnerRights3_en ]} />
    },
    {
      title: translate('Объединить фиксированные скидки ?', 'faq.partnerRights.title4'),
      description: translate('Данная функция объединяет фиксированные скидки организаций и суммирует их накопления совместно с вашим партнёром. Рассмотрим пример, у Вас сеть фирменных магазинов, и вам необходимо объединить ваши фиксированные скидки, во всей вашей сети. После включения данной функции вашим клиентам станет возможно покупать товары и накапливать средства на фиксированную скидку вашей партнёрской сети. Данная функция станет доступной только, при включении с обеих сторон партнёров.', 'faq.partnerRights.desc4'),
      slides: isRU ? FAQ_PARTNER_RIGHTS_RU.four : FAQ_PARTNER_RIGHTS_EN.four,
      renderIcon: () => <TooltipPlayer sources={[ isRU ? APartnerRights4 : APartnerRights4_en ]} />
    },
    {
      title: translate('Объединить кэшбэк скидки ?', 'faq.partnerRights.title5'),
      description: translate('Данная функция объединяет кэшбэк скидки организаций и суммирует их накопления совместно с вашим партнёром. Рассмотрим пример, у Вас сеть АЗС, и вам необходимо объединить кэшбэк скидки, во всей вашей сети. После включения данной функции вашим клиентам станет возможно покупать товары и накапливать кэшбэк средства и рассчитываться ими в вашей партнёрской сети. Данная функция станет доступной только, при включении с обеих сторон партнёров.', 'faq.partnerRights.desc5'),
      slides: isRU ? FAQ_PARTNER_RIGHTS_RU.five : FAQ_PARTNER_RIGHTS_EN.five,
      renderIcon: () => <TooltipPlayer sources={[ isRU ? APartnerRights5 : APartnerRights5_en ]} />
    }
  ]
}

export default FaqPartnerRights;