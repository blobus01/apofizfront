import React from 'react';
import InfoBox from "../../../component/InfoBox";
import {translate} from "../../../../../locales/locales";
import UserField from "../../../component/UserField";

const DeclinedView = ({processedBy}) => {
  return (
    <>
      {processedBy && (
        <UserField
          label={translate('Рассмотрел запрос', 'shop.reviewedRequest')}
          user={processedBy}
          description={translate('Данный пользователь рассмотрел Вашу заявку', 'shop.userReviewedYourApplication')}
        />
      )}

      <InfoBox
        title={translate('Ваш запрос отклонен', 'shop.yourRequestDeclined')}
        description={translate('Благодарим за запрос, по какой то причине Ваш запрос отклонили.', 'shop.yourRequestDeclinedDesc')}
        declinedText={translate('Вам отклонили запрос', 'shop.yourRequestHasBeenDeclined')}
      />
    </>
  );
};

export default DeclinedView;