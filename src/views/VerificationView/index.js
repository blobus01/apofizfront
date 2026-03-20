import React, { useEffect } from "react";
import MobileTopHeader from "../../components/MobileTopHeader";
import { translate } from "../../locales/locales";
import { Formik } from "formik";
import { InputTextField } from "../../components/UI/InputTextField";
import { ONLY_DIGITS, PHONE_NUMBER } from "../../common/helpers";
import Button from "../../components/UI/Button";
import { SharpeVerifiedIcon } from "../../components/UI/Icons";
import * as Yup from "yup";
import { ERROR_MESSAGES } from "../../common/messages";
import { useDispatch, useSelector } from "react-redux";
import { sendRequestVerificationOrganization } from "../../store/actions/organizationActions";
import "./index.scss";

const VALIDATION_SCHEMA = Yup.object().shape({
  username: Yup.string().required(ERROR_MESSAGES.fullname_empty),
  email: Yup.string()
    .email(ERROR_MESSAGES.email_field_format)
    .required(ERROR_MESSAGES.email_field_empty),
  phone_number: Yup.string().required(ERROR_MESSAGES.phone_number_empty),
});

const VerificationView = ({ onBack, orgID }) => {
  const dispatch = useDispatch();
  const { verification_status } = useSelector(
    (state) => state.organizationStore.orgDetail.data
  );
  const { loading } = useSelector(
    (state) => state.organizationStore.orgVerification
  );

  useEffect(() => {
    if (verification_status === "under_review") onBack();
  }, [verification_status, onBack]);

  const onSubmit = (data) => {
    dispatch(sendRequestVerificationOrganization(orgID, data));
  };

  return (
    <div className="verified-organization-form">
      <MobileTopHeader
        title={translate("Верификация", "org.verification")}
        onBack={onBack}
        className="verified-organization-form__title"
        icon={<SharpeVerifiedIcon />}
      />
      <div className="container">
        <ul className="verified-organization-form__list-info f-13 f-500">
          <li className="verified-organization-form__list-item">
            <span className="verified-organization-form__list-title">
              {translate("Подлинным.", "org.verifiedInfo.li1.title")}{" "}
            </span>
            {translate(
              "Профиль должна представлять реальная персона или компания, информация о которой и представлена на странице.",
              "org.verifiedInfo.li1.desc"
            )}
          </li>
          <li className="verified-organization-form__list-item">
            <span className="verified-organization-form__list-title">
              {translate("Уникальным.", "org.verifiedInfo.li2.title")}{" "}
            </span>
            {translate(
              "Аккаунт регистрируется только одним лицом, либо организацией. Профили, обобщающие множество интересов, проверку не проходят.",
              "org.verifiedInfo.li2.desc"
            )}
          </li>
          <li className="verified-organization-form__list-item">
            <span className="verified-organization-form__list-title">
              {translate("Полным.", "org.verifiedInfo.li3.title")}{" "}
            </span>
            {translate(
              "Страница должна быть заполненной, иметь фото и посты. Нельзя оставлять посторонние ссылки.",
              "org.verifiedInfo.li3.desc"
            )}
          </li>
          <li className="verified-organization-form__list-item">
            <span className="verified-organization-form__list-title">
              {translate("Известным.", "org.verifiedInfo.li4.title")}{" "}
            </span>
            {translate(
              "Учетная запись, для которой предусмотрен синий значок, должна быть популярной, представлять важность, ее должны часто набирать в поиске. Проверку также проходят аккаунты, отмеченные на каналах новостей.",
              "org.verifiedInfo.li4.desc"
            )}
          </li>
          <li className="verified-organization-form__list-item">
            <span className="verified-organization-form__list-title">
              {translate("Известным.", "org.verifiedInfo.li5.title")}{" "}
            </span>
            {translate(
              "Вознаграждения. В некоторых регионах верификация может быть платной.",
              "org.verifiedInfo.li5.desc"
            )}
          </li>
        </ul>
        <Formik
          validationSchema={VALIDATION_SCHEMA}
          initialValues={{
            username: "",
            email: "",
            phone_number: "",
          }}
          onSubmit={(values, formikBag) => onSubmit(values, formikBag)}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            setFieldValue,
            handleSubmit,
          }) => (
            <form onSubmit={handleSubmit}>
              <div className="verified-organization-form__fields">
                <InputTextField
                  label={translate("ФИО", "org.fullname")}
                  name="username"
                  className="verified-organization-form__field"
                  value={values.username}
                  onChange={handleChange}
                  requiredError={
                    !values.username &&
                    errors.username &&
                    touched.username &&
                    errors.username
                  }
                  error={
                    values.username &&
                    errors.username &&
                    touched.username &&
                    errors.username
                  }
                />
                <InputTextField
                  label={translate("Контактный номер", "app.contactNumber")}
                  className="verified-organization-form__field"
                  value={values.phone_number}
                  onChange={(e) => {
                    if (
                      e.target.value.match(ONLY_DIGITS) ||
                      e.target.value.match(PHONE_NUMBER)
                    ) {
                      setFieldValue("phone_number", e.target.value);
                    }
                  }}
                  requiredError={
                    !values.phone_number &&
                    errors.phone_number &&
                    touched.phone_number &&
                    errors.phone_number
                  }
                  error={
                    values.phone_number &&
                    errors.phone_number &&
                    touched.phone_number &&
                    errors.phone_number
                  }
                />
                <InputTextField
                  label={translate("Email", "profile.email")}
                  name="email"
                  className="verified-organization-form__field"
                  value={values.email}
                  onChange={handleChange}
                  requiredError={
                    !values.email &&
                    errors.email &&
                    touched.email &&
                    errors.email
                  }
                  error={
                    values.email &&
                    errors.email &&
                    touched.email &&
                    errors.email
                  }
                />
              </div>
              <Button
                type="submit"
                label={translate("Отправить запрос", "org.sendRequest")}
                disabled={loading}
                loading={loading}
                className="verified-organization-form__btn"
              />
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default VerificationView;
