import * as React from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { Formik } from "formik";
import { AuthHeader } from "../../../pages/LoginPage";
import { PasswordField } from "../../UI/PasswordField";
import Button from "../../UI/Button";
import { BackButton } from "../../UI/BackButton";
import { ERROR_MESSAGES } from "../../../common/messages";
import { Link } from "react-router-dom";
import { translate } from "../../../locales/locales";
import "./index.scss";

const VALIDATION_SCHEMA = Yup.object({
  password: Yup.string()
    .min(6, ERROR_MESSAGES.password_min)
    .required(ERROR_MESSAGES.password_empty),
});

const LoginForm = ({ onSubmit, setStep, title, type, onForgotPassword }) => (
  <Formik
    enableReinitialize
    validationSchema={VALIDATION_SCHEMA}
    onSubmit={(values, formikBag) => onSubmit(values, formikBag)}
    initialValues={{
      password: "",
    }}
  >
    {({
      values,
      errors,
      touched,
      isSubmitting,
      handleSubmit,
      handleChange,
      setFieldValue,
    }) => (
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="container">
          <BackButton
            type="button"
            className="login-form__back-btn"
            onClick={setStep}
          />
          <AuthHeader
            title={title || translate("Введите пароль", "hint.enterPassword")}
          />
          <PasswordField
            value={values.password}
            onChange={handleChange}
            onClear={() => setFieldValue("password", "")}
            error={errors.password && touched.password && errors.password}
            className="login-form__password"
          />
          {type !== "new_password" &&
            type !== "without_recovery" &&
            (typeof onForgotPassword !== "function" ? (
              <Link to="/forgot" className="login-form__forgot-link f-15">
                {translate("Забыли пароль?", "auth.forgotPassword")}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onForgotPassword}
                className="login-form__forgot-button f-15"
              >
                {translate("Забыли пароль?", "auth.forgotPassword")}
              </button>
            ))}
          <Button
            type="submit"
            className="login-form__button"
            label={
              type === "new_password"
                ? translate("Создать", "app.create")
                : translate("Далее", "app.next")
            }
            onSubmit={handleSubmit}
            disabled={isSubmitting}
          />
        </div>
      </form>
    )}
  </Formik>
);

LoginForm.propTypes = {
  title: PropTypes.any,
  setStep: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["new_password", "without_recovery"]),
};

export default LoginForm;
