import React from 'react';
import MobileTopHeader from '../../components/MobileTopHeader';
import TooltipPlayer from '../../components/TooltipPlayer';
import {renderFaqSubcomponentSlider} from './index';
import {LOCALES, translate} from '../../locales/locales';
import {FAQ_ROLES_EN, FAQ_ROLES_RU} from './images';

import ARole1 from '../../assets/audio/ru/role_1.mp3';
import ARole1_en from '../../assets/audio/en/role_1.mp3';

const FaqRoles = ({language, goBack, isWebviewMode}) => {
  const DATA = getContent(language);

  return (
    <div className="faq-employees">
      {!isWebviewMode && (
        <MobileTopHeader
          title={translate('Описание должностей', 'faq.descRoles')}
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
      title: translate('Создать должность ?', 'faq.roles.title'),
      description: translate('У каждого сотрудника, может быть индивидуальная должность с назначением индивидуальных прав. При создании новой должности, необходимо назначить права для группы должностей или индивидуальных сотрудников. Давайте рассмотрим пример, вы желаете назначить на должность администратора для сотрудника, но при этом не желаете передавать полные права на управление организации, для этого вы можете назначить только те права, которые будут доступны должности администратор, также индивидуально вы можете настроить права для любой должности. Управление сотрудниками в ваших руках, мотивируйте повышайте должности, нанимайте новых сотрудников развивайте Ваш бизнес.', 'faq.roles.desc'),
      slides: isRU ? FAQ_ROLES_RU : FAQ_ROLES_EN,
      disableTopMargin: true,
      renderIcon: () => <TooltipPlayer sources={[isRU ? ARole1 : ARole1_en]}/>,
    }
  ]
}

export default FaqRoles;