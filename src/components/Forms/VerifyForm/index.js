import * as React from "react";
import * as Yup from "yup";
import * as classnames from "classnames";
import { Formik } from "formik";
import { AuthHeader } from "../../../pages/LoginPage";
import { VerificationCodeInput } from "../../UI/VerificationCodeInput";
import Button from "../../UI/Button";
import { BackButton } from "../../UI/BackButton";
import { translate } from "../../../locales/locales";
import "./index.scss";

const VALIDATION_SCHEMA = Yup.object({
  code: Yup.array().required("Verification code is required"),
});

const CODE_LENGTH = 6;

const VerifyForm = ({
  onSubmit,
  onResend,
  onBack,
  showPhone,
  email,
  showOptionsSendVerifyCode,
  sentToMessage,
}) => (
  <Formik
    enableReinitialize
    validationSchema={VALIDATION_SCHEMA}
    onSubmit={(values, formikBag) => onSubmit(values, formikBag)}
    initialValues={{
      code: [],
      codeSent: false,
    }}
  >
    {({ values, handleSubmit, setFieldValue, isSubmitting }) => (
      <form
        className={classnames(
          "verify-form",
          (values.codeSent || showPhone) && "verify-form__code-sent"
        )}
        onSubmit={handleSubmit}
      >
        <div className="container">
          <BackButton onClick={onBack} />
          <AuthHeader
            title={translate("Код подтверждения", "auth.verifyCode")}
            logoDisabled={values.codeSent || showPhone}
            email={email}
          />
          {(values.codeSent || showPhone) && (
            <p className="verify-form__phone">{sentToMessage()}</p>
          )}

          <div className="verify-form__code-wrap">
            <VerificationCodeInput
              values={values.code}
              className="verify-form__code"
              onChange={(value) => setFieldValue("code", value.split(""))}
              onComplete={(value) => {
                setFieldValue("code", value.split(""));
                handleSubmit();
              }}
            />
          </div>
          {!values.codeSent && onResend ? (
            <p
              className="verify-form__resend"
              onClick={() => {
                setFieldValue("codeSent", true);
                onResend();
              }}
            >
              {translate("Отправить еще раз код", "auth.resendCode")}
            </p>
          ) : (
            <div className="verify-form__resend">
              <button type="button" onClick={showOptionsSendVerifyCode}>
                {translate(
                  "Не получили код подтверждения",
                  "auth.didNotReceiveConfirmCode"
                )}
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="verify-form__button"
            label={translate("Далее", "app.next")}
            onSubmit={handleSubmit}
            disabled={values.code.length !== CODE_LENGTH || isSubmitting}
          />
        </div>
      </form>
    )}
  </Formik>
);

export default VerifyForm;
