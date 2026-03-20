import React from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import TooltipPlayer from '../../components/TooltipPlayer';
import {LOCALES, translate} from '../../locales/locales';
import {renderFaqSubcomponent} from './index';

import RoleRights1 from '../../assets/images/faq/ru/role_rights_1.png';
import RoleRights2 from '../../assets/images/faq/ru/role_rights_2.png';
import RoleRights3 from '../../assets/images/faq/ru/role_rights_3.png';
import RoleRights4 from '../../assets/images/faq/ru/role_rights_4.png';
import RoleRights5 from '../../assets/images/faq/ru/role_rights_5.png';
import RoleRights6 from '../../assets/images/faq/ru/role_rights_6.png';

import RoleRights1_en from '../../assets/images/faq/en/role_rights_1.png';
import RoleRights2_en from '../../assets/images/faq/en/role_rights_2.png';
import RoleRights3_en from '../../assets/images/faq/en/role_rights_3.png';
import RoleRights4_en from '../../assets/images/faq/en/role_rights_4.png';
import RoleRights5_en from '../../assets/images/faq/en/role_rights_5.png';
import RoleRights6_en from '../../assets/images/faq/en/role_rights_6.png';

import ARoleRights1 from '../../assets/audio/ru/role_rights_1.mp3';
import ARoleRights2 from '../../assets/audio/ru/role_rights_2.mp3';
import ARoleRights3 from '../../assets/audio/ru/role_rights_3.mp3';
import ARoleRights4 from '../../assets/audio/ru/role_rights_4.mp3';
import ARoleRights5 from '../../assets/audio/ru/role_rights_5.mp3';
import ARoleRights6 from '../../assets/audio/ru/role_rights_6.mp3';

import ARoleRights1_en from '../../assets/audio/en/role_rights_1.mp3';
import ARoleRights2_en from '../../assets/audio/en/role_rights_2.mp3';
import ARoleRights3_en from '../../assets/audio/en/role_rights_3.mp3';
import ARoleRights4_en from '../../assets/audio/en/role_rights_4.mp3';
import ARoleRights5_en from '../../assets/audio/en/role_rights_5.mp3';
import ARoleRights6_en from '../../assets/audio/en/role_rights_6.mp3';

const FaqRoleRights = ({language, goBack, isWebviewMode}) => {
  const DATA = getContent(language);

  return (
    <div className="faq-registration">
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate('Права должностей', 'faq.descRoleRights')}
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
      title: translate('Сканировать пропуска ?', 'faq.roleRights.title1'),
      description: translate('Данная функция позволяет, назначить права данной должности, для сканирования пропусков сотрудников в данной организации. Сотруднику с данной должностью в меню организации станет доступна кнопка сканер пропусков.', 'faq.roleRights.desc1'),
      image: {src: isRU ? RoleRights1 : RoleRights1_en, alt: 'Role rights 1'},
      disableTopMargin: true,
      renderIcon: () => <TooltipPlayer sources={[isRU ? ARoleRights1 : ARoleRights1_en]}/>
    },
    {
      title: translate('Статистика продаж/скидок ?', 'faq.roleRights.title2'),
      description: translate('Данная функция позволяет, назначить права данной должности, для просмотра статистики продаж и скидок, также для удаления чеков произведенных сделок. Сотруднику с данной должностью в меню организации станет доступна кнопка продажи и скидки.', 'faq.roleRights.desc2'),
      image: {src: isRU ? RoleRights2 : RoleRights2_en, alt: 'Role rights 2'},
      renderIcon: () => <TooltipPlayer sources={[isRU ? ARoleRights2 : ARoleRights2_en]}/>
    },
    {
      title: translate('Редактировать организацию ?', 'faq.roleRights.title3'),
      description: translate('Данная функция позволяет, назначить права данной должности, для полного редактирования организации. Сотруднику с данной должностью в меню организации станут доступны кнопки: Редактирование, Управление скидками и изменения фона дисконтных карт.', 'faq.roleRights.desc3'),
      image: {src: isRU ? RoleRights3 : RoleRights3_en, alt: 'Role rights 3'},
      renderIcon: () => <TooltipPlayer sources={[isRU ? ARoleRights3 : ARoleRights3_en]}/>
    },
    {
      title: translate('Проводить скидки?', 'faq.roleRights.title4'),
      description: translate('Данная функция позволяет, назначить права данной должности, для проведения скидок в организации. Сотруднику с данной должностью в меню организации станет доступна кнопка Провести скидки.', 'faq.roleRights.desc4'),
      image: {src: isRU ? RoleRights4 : RoleRights4_en, alt: 'Role rights 4'},
      renderIcon: () => <TooltipPlayer sources={[isRU ? ARoleRights4 : ARoleRights4_en]}/>
    },
    {
      title: translate('Отправлять сообщения?', 'faq.roleRights.title5'),
      description: translate('Данная функция позволяет, назначить права данной должности, для отправки сообщений всем подписчикам организации. Сотруднику с данной должностью в меню организации станет доступна кнопка Отправить сообщение подписчикам.', 'faq.roleRights.desc5'),
      image: {src: isRU ? RoleRights5 : RoleRights5_en, alt: 'Role rights 5'},
      renderIcon: () => <TooltipPlayer sources={[isRU ? ARoleRights5 : ARoleRights5_en]}/>
    },
    {
      title: translate('Функции партнеров?', 'faq.roleRights.title6'),
      description: translate('Данная функция позволяет, назначить права данной должности, для управление партнёрами организации. Сотруднику с данной должностью в меню организации станет доступна кнопка Управление партнёрами.', 'faq.roleRights.desc6'),
      image: {src: isRU ? RoleRights6 : RoleRights6_en, alt: 'Role rights 6'},
      renderIcon: () => <TooltipPlayer sources={[isRU ? ARoleRights6 : ARoleRights6_en]}/>
    },
  ];
}

export default FaqRoleRights;