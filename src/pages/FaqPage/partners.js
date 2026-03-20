import React from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import {FAQ_PARTNERS_EN, FAQ_PARTNERS_RU} from './images';
import {renderFaqSubcomponentSlider} from './index';
import {LOCALES, translate} from '../../locales/locales';
import TooltipPlayer from '../../components/TooltipPlayer';

import APartners1 from '../../assets/audio/ru/partners_1.mp3';
import APartners2 from '../../assets/audio/ru/partners_2.mp3';
import APartners3 from '../../assets/audio/ru/partners_3.mp3';
import APartners4 from '../../assets/audio/ru/partners_4.mp3';

import APartners1_en from '../../assets/audio/en/partners_1.mp3';
import APartners2_en from '../../assets/audio/en/partners_2.mp3';
import APartners3_en from '../../assets/audio/en/partners_3.mp3';
import APartners4_en from '../../assets/audio/en/partners_4.mp3';

const FaqPartners = ({ language, goBack, isWebviewMode }) => {
  const DATA = getContent(language);

  return (
    <div className="faq-partners">
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate('Описание партнеров', 'faq.descPartners')}
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
  return [
    {
      title: translate('Кто такие партнеры ?', 'faq.partners.title1'),
      description: translate('Вы можете пригласить или стать партнером, любой организации. У каждого партнёра есть возможность настроить права для управления, редактирования, проведения пропусков сотрудников или получения статистики вашей организации.', 'faq.partners.desc1'),
      slides: locale === LOCALES.ru ? FAQ_PARTNERS_RU.one : FAQ_PARTNERS_EN.one,
      disableTopMargin: true,
      renderIcon: () => <TooltipPlayer sources={[ locale === LOCALES.ru ? APartners1 : APartners1_en ]} />
    },
    {
      title: translate('Зачем нужны партнеры ?', 'faq.partners.title2'),
      description: translate('Отличный вопрос, давайте разберем на примере. У Вас сеть ресторанов, вы собственник данной сети, вам не удобно проверять все филиалы, переходя в каждый из них, так можно и запутаться. На странице, ваших организаций вы можете войти в партнеры и посмотреть их статистику, посмотреть статистику сотрудников, и конечно посмотреть статистику продаж ваших филиалов.', 'faq.partners.desc2'),
      slides: locale === LOCALES.ru ? FAQ_PARTNERS_RU.two : FAQ_PARTNERS_EN.two,
      renderIcon: () => <TooltipPlayer sources={[ locale === LOCALES.ru ? APartners2 : APartners2_en ]} />
    },
    {
      title: translate('В чем выгода быть партнерами ?', 'faq.partners.title3'),
      description: translate('У партнерских сетей есть возможность увеличить прибыль, подняв посещаемость новых клиентов, при этом экономия на продвижение своих новых или мало узнаваемых филиалов. Давайте разберем на примере. У вас сеть фирменных магазинов в разных торговых центрах и просто отдельных помещениях. Создав сеть партнёров можно отправлять всем подписчикам, всех партнеров рекламные push-уведомления, о новых филиалах об отдельных предложениях. Да чуть не забыли у вас есть возможность создавать рекламные байнера, которые будут продвигать вашу сеть, и каждый пользователь будет видеть вашу рекламу и становиться вашим подписчиком, без дополнительных расходов на рекламу.', 'faq.partners.desc3'),
      slides: locale === LOCALES.ru ? FAQ_PARTNERS_RU.three : FAQ_PARTNERS_EN.three,
      renderIcon: () => <TooltipPlayer sources={[ locale === LOCALES.ru ? APartners3 : APartners3_en ]} />
    },
    {
      title: translate('Могут чужие организации быть партнёрами вашей организации ?', 'faq.partners.title4'),
      description: translate('Конечно, и это очень удобно. Давайте разберем на примере. У вас бизнес центр, и вы давно задумываетесь сделать электронно-пропускную систему для всех, кто работает в вашем Бизнес Центе. Без проблем, вам не надо за это платить и устанавливать сложные системы пропусков. Вы можете, сделать партнерскую сеть со всеми сотрудниками и арендаторами в вашем Бизнес Центре. Каждый арендатор в настройках даст право проводить сотрудников через вас, вам останется дать права вашим сотрудникам безопасности или другим сотрудникам проводить пропуска сотрудников ваших партнеров. И все теперь вы получаете статистику посещения всех сотрудников в вашем Бизнес Центре. Ваши партнёры, также могут посмотреть посещаемость своих сотрудников, при этом, не затратив лишних расходов на установку дополнительного оборудования или персонала кто отвечает за посещаемость.', 'faq.partners.desc4'),
      slides: locale === LOCALES.ru ? FAQ_PARTNERS_RU.four : FAQ_PARTNERS_EN.four,
      renderIcon: () => <TooltipPlayer sources={[ locale === LOCALES.ru ? APartners4 : APartners4_en ]} />
    }
  ];
}

export default FaqPartners;