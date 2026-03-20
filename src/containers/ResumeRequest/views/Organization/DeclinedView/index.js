import React from 'react';
import InfoBox from "../../../component/InfoBox";
import {translate} from "../../../../../locales/locales";

const DeclinedView = () => {
  return (
    <InfoBox
      title={translate('Контакты работодателя', 'resumes.employerContacts')}
      description={translate('Контакты работодателя стали не доступны после того отклонили запрос', 'resumes.declinedRequestDesc')}
      declinedText={translate('Вы отклонили запрос', 'shop.youDeclinedRequest')}
    />
  );
};

export default DeclinedView;