import * as React from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { AuthHeader } from "../../../pages/LoginPage";
import Button from "../../UI/Button";
import PhoneInputField from "../../UI/PhoneNumberField";
import ReCAPTCHA from "react-google-recaptcha";
import { BackButton } from "../../UI/BackButton";
import { translate } from "../../../locales/locales";
import { useIntl } from "react-intl";
import config from "../../../config";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { ENVIRONMENTS } from "../../../common/constants";
import { Link } from "react-router-dom";

import "./index.scss";
import MobileTopHeader from "@components/MobileTopHeader";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";

const VALIDATION_SCHEMA = Yup.object({
  phoneNumber: Yup.string()
    .min(4)
    .required(translate("Введите номер телефона", "hint.enterPhoneNumber")),
  captchaToken:
    config.ENVIRONMENT === ENVIRONMENTS.PROD
      ? Yup.string()
          .required(translate("Пройдите reCAPTCHA", "hint.passRecaptcha"))
          .nullable()
      : null,
});

const AuthForm = ({ onSubmit, setStep, userLocation, path, title, locale }) => {
  const intl = useIntl();
  const captchaRef = useRef();

  const history = useHistory();

  const location = useLocation();

  console.log(location, "LOCATION");

  const storeLocale = useSelector((state) => state.userStore.locale);

  return (
    <>
      {location?.state?.fromDisconnect === true && (
        <MobileTopHeader onBack={() => history.goBack()} />
      )}
      <Formik
        enableReinitialize
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={onSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={{
          phoneNumber: "",
          countryCode: (userLocation && userLocation.countryCode) || "kg",
          captchaToken: null,
        }}
      >
        {({ values, errors, handleSubmit, setFieldValue, isSubmitting }) => (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="container">
              {setStep && <BackButton onClick={setStep} />}
              <AuthHeader title={title} showAppName={path === "/auth"} />
              <PhoneInputField
                name="phone_number"
                label={intl.formatMessage({
                  id: "app.phoneNumber",
                  defaultMessage: "Номер телефона",
                })}
                className="auth-form__phone"
                countryCode={values.countryCode}
                value={values.phoneNumber}
                onChange={(phone) => setFieldValue("phoneNumber", phone)}
              />
              {(errors.phoneNumber || errors.captchaToken) && (
                <p className="auth-form__error-field">
                  {errors.phoneNumber || errors.captchaToken}
                </p>
              )}
              {config.ENVIRONMENT === ENVIRONMENTS.PROD && (
                <ReCAPTCHA
                  sitekey={config.SITE_KEY}
                  onChange={(value) => setFieldValue("captchaToken", value)}
                  className="auth-form__recaptcha"
                  hl={locale || storeLocale}
                  ref={captchaRef}
                />
              )}
              <Button
                type="submit"
                label={translate("Далее", "app.next")}
                disabled={isSubmitting}
                onSubmit={handleSubmit}
                className="auth-form__button"
              />
              <Link to="/faq" className="auth-form__faq f-16 f-500">
                {translate("Служба поддержки и заботы ?", "faq.supportAndCare")}
              </Link>
            </div>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthForm;
