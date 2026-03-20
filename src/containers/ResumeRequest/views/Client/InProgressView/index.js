import React from 'react';
import InfoBox from "../../../component/InfoBox";
import {translate} from "../../../../../locales/locales";

const InProgressView = () => {
  return (
    <InfoBox
      title={translate('Ваш запрос отправлен', 'org.yourRequestSent')}
      description={translate('Благодарим за запрос, как только будет информация, вы обязательно получите уведомление.', 'resumes.requestSentDesc')}
      acceptText={translate('Благодарим за ожидание', 'shop.thanksForWaiting')}
    />
  );
};

export default InProgressView;