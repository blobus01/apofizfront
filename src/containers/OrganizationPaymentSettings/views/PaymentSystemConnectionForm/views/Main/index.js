import React from 'react';
import {translate} from "../../../../../../locales/locales";
import {InputTextField} from "../../../../../../components/UI/InputTextField";
import {INTERNATIONAL_PHONE_NUMBER} from "../../../../../../common/helpers";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../../../../../components/UI/WideButton";
import MobileTopHeader from "../../../../../../components/MobileTopHeader";

const Main = ({values, errors, onChange, touched, title, isSubmitting, onBack}) => {
  return (
    <div className="organization-payment-settings__payment-connection">
      <MobileTopHeader
        title={title}
        onBack={onBack}
        className="organization-payment-settings__payment-connection-header"
      />
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h4 className="organization-payment-settings__payment-connection-title f-700">
          {translate('Идентификация бизнеса', 'payment.connection.title1')}
        </h4>
        <p className="organization-payment-settings__payment-connection-paragraph">
          {translate('В первую очередь, необходимо пройти идентификацию бизнеса и подтвердить владение банковским счетом. Помните, что если вы используете учетную запись Apofiz для своего бизнеса, то вам вероятно потребуется подтвердить личность владельца. Также потребуется подтверждение права собственности на банковский счет, физическое местонахождение бизнеса и владение вашей страницы организации в Apofiz. В том случае если ваше организация является верифицированной и имеет скинию галочку идентификация будет пройдена в ускоренном порядке. Также дополнительная информация может быть запрошена у Вас по электронной почте.', 'payment.connection.p1')}
        </p>
        <h4
          className="organization-payment-settings__payment-connection-title f-700">
          {translate('Дополнительно', 'payment.connection.title2')}
        </h4>

        <p className="organization-payment-settings__payment-connection-paragraph">
          {translate('Проверка затронет точность описания ваших продуктов и услуг — это сводит к минимуму возможную путаницу и предотвращает ошибочные возвратные платежи.', 'payment.connection.p2')}
        </p>

        <p className="organization-payment-settings__payment-connection-paragraph">
          {translate('Также Apofiz не несет ответственности за не верно предоставленные товары и услуги. В случае жалоб или многочисленных ошибок, платежный сервис может быть временно или постоянно заблокирован.', 'payment.connection.p3')}
        </p>

        <InputTextField
          label={translate("ФИО", "org.fullname")}
          name="username"
          className="organization-payment-settings__payment-connection-field"
          value={values.username}
          onChange={onChange}
          requiredError={!values.username && errors.username && touched.username && errors.username}
          error={values.username && errors.username && touched.username && errors.username}
        />

        <InputTextField
          label={translate("Контактный номер", "app.contactNumber")}
          className="organization-payment-settings__payment-connection-field"
          name="phoneNumber"
          value={values.phoneNumber}
          onChange={(e) => {
            if (e.target.value.match(INTERNATIONAL_PHONE_NUMBER)) {
              onChange(e)
            }
          }}
          requiredError={!values.phoneNumber && errors.phoneNumber && touched.phoneNumber && errors.phoneNumber}
          error={values.phoneNumber && errors.phoneNumber && touched.phoneNumber && errors.phoneNumber}
        />

        <InputTextField
          label={translate("Email", "profile.email")}
          name="email"
          className="organization-payment-settings__payment-connection-field"
          value={values.email}
          onChange={onChange}
          requiredError={!values.email && errors.email && touched.email && errors.email}
          error={values.email && errors.email && touched.email && errors.email}
        />

        <WideButton type="submit" variant={WIDE_BUTTON_VARIANTS.ACCEPT} disabled={isSubmitting} loading={isSubmitting}>
          {translate("Отправить запрос", "org.sendRequest")}
        </WideButton>
      </div>
    </div>
  );
};

export default Main;
