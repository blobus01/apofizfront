import React from 'react';
import EmployerInfo from "../../../component/EmployerInfo";
import InfoBox from "../../../component/InfoBox";
import {translate} from "../../../../../locales/locales";
import UserField from "../../../component/UserField";
import "./index.scss"

const AcceptedView = ({data}) => {
  const {processed_by} = data
  return (
    <div className="user-resume-request-client-accepted-view">
      {processed_by && (
        <UserField
          label={translate('Рассмотрел запрос', 'shop.reviewedRequest')}
          user={processed_by}
          description={translate('Данный пользователь рассмотрел Вашу заявку', 'shop.userReviewedYourApplication')}
        />
      )}

      <InfoBox
        title={translate('Ваш запрос принят', 'shop.yourRequestAccepted')}
        description={translate('Благодарим за запрос, принят и с Вами обязательно свяжутся по указанным Вами контактам.', 'shop.yourRequestAcceptedDesc')}
        acceptText={translate('Ваш запрос принят', 'shop.yourRequestAccepted')}
        className="user-resume-request-client-accepted-view__info-box"
      />

      <EmployerInfo
        data={{
          description: data.text,
          phoneNumbers: data.phone_numbers,
          links: data.links,
        }}
      />
    </div>
  );
};

export default AcceptedView;