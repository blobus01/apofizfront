import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { authenticate, getUserLocation } from "../../store/actions/userActions";
import { setTypeResendCode } from "../../store/actions/commonActions";
import { DEFINED_OSes } from "../../common/constants";
import { translate } from "../../locales/locales";
import Notify from "../../components/Notification";
import AuthForm from "../../components/Forms/AuthForm";
import LoginForm from "../../components/Forms/LoginForm";
import classnames from "classnames";
import { useLocation } from "react-router-dom";
import { login } from "../../store/services/userServices";
import MobileTopHeader from "../../components/MobileTopHeader";
import { saveCurrentAccount } from "@common/utils";

const LoginView = (props) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { locale, onLoginSuccess, onLoginFailure, onBack } = props;

  const userLocation = useSelector((state) => state.userStore.userLocation);

  const [state, setState] = useState({
    step: 0,
    phone: undefined,
    isShowOptionsSendVerifyCode: false,
  });

  useEffect(() => {
    dispatch(getUserLocation());

    return () => {
      dispatch(setTypeResendCode(null));
    };
  }, [dispatch]);

  const setStep = (step, phone) => setState({ ...state, phone, step });

  const onPhoneSubmit = async ({ phoneNumber, captchaToken }) => {
    const phone = `+${phoneNumber}`;

    const { data } = await dispatch(
      authenticate({
        phone_number: phone,
        recaptcha: captchaToken,
      }),
    );

    if (data) {
      if (data.is_new_user === true) {
        return Notify.error({
          text: translate("Пользователь не найден", "notify.userNotFound"),
        });
      }

      data.is_new_user === false && setStep(1, phone);
    }
  };

  const onPasswordEnter = ({ password }, { setFieldError }) => {
    let location = null;
    if (userLocation) {
      const country =
        userLocation.country &&
        userLocation.country !== "Not found" &&
        userLocation.country;
      const city =
        userLocation.city &&
        userLocation.city !== "Not found" &&
        userLocation.city;
      location = [country, city].filter((v) => !!v).join(", ");
    }

    return state.phone
      ? login({
          phone_number: state.phone,
          password,
          operating_system: DEFINED_OSes.WEB,
          location,
        })
          .then((res) => {
            console.log("LOGIN RESPONSE", res);
            if (res && res.message === "Wrong credentials") {
              return setFieldError(
                "password",
                translate(
                  'Неверный пароль. Повторите попытку или нажмите на ссылку "Забыли пароль?", чтобы сбросить его.',
                  "hint.wrongPassword",
                ),
              );
            }
            saveCurrentAccount(res.user, res.token);
            onLoginSuccess(res);
          })
          .catch((e) => {
            Notify.error({ text: e.message });
            onLoginFailure(e);
          })
      : null;
  };

  return (
    <>
      <div className={classnames("login-page")}>
        {state.step === 0 && (
          <>
            <MobileTopHeader onBack={onBack} />
            <AuthForm
              onSubmit={onPhoneSubmit}
              userLocation={userLocation}
              locale={locale}
              path={location.pathname}
            />
          </>
        )}
        {state.step === 1 && (
          <LoginForm
            onSubmit={onPasswordEnter}
            setStep={() => setStep(0)}
            type={"without_recovery"}
          />
        )}
      </div>
    </>
  );
};

export default LoginView;
