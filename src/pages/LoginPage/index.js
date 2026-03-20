import * as React from "react";
import logo from "../../assets/images/logo.svg";
import { Link } from "react-router-dom";
import logoWithName from "../../assets/images/logo_with_text.svg";
import AuthForm from "../../components/Forms/AuthForm";
import VerifyForm from "../../components/Forms/VerifyForm";
import LoginForm from "../../components/Forms/LoginForm";
import ProfileForm from "../../components/Forms/ProfileForm";
import { updateProfile } from "../../store/actions/profileActions";
import {
  setTypeResendCode,
  uploadFile,
} from "../../store/actions/commonActions";
import { DEFINED_OSes, RESEND_TYPES } from "../../common/constants";
import Notify from "../../components/Notification";
import { LOCALES, translate } from "../../locales/locales";
import {
  authenticate,
  forgotPassword,
  getUserLocation,
  loginUser,
  resendCode,
  setPassword,
  setUserToken,
  verifyCode,
  clearPrevPath,
  setAppLanguage,
  detectUserRegion,
} from "../../store/actions/userActions";
import OptionsSendVerifyCode from "../../components/OptionsSendVerifyCode";
import { Layer } from "../../components/Layer";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import "./index.scss";
import { saveCurrentAccount } from "@common/utils";

const LoginPage = (props) => {
  const dispatch = useDispatch();

  const { location, history } = props;
  const params = new URLSearchParams(location.search);
  const next = params.get("next");

  const locale = useSelector((state) => state.userStore.locale);
  const userLocation = useSelector((state) => state.userStore.userLocation);
  const typeResendCode = useSelector(
    (state) => state.commonStore.typeResendCode,
  );
  const prevPath = useSelector((state) => state.userStore.prevPath);

  const [state, setState] = useState({
    step: 0,
    phone: undefined,
    isShowOptionsSendVerifyCode: false,
  });

  const isGeneratingCodeToChangePasswordRef = useRef(false);

  let prettyLocation = null;

  if (userLocation) {
    const country =
      userLocation.country &&
      userLocation.country !== "Not found" &&
      userLocation.country;
    const city =
      userLocation.city &&
      userLocation.city !== "Not found" &&
      userLocation.city;
    prettyLocation = [country, city].filter((v) => !!v).join(", ") || null;
  }

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
      // send message or ask password
      dispatch(setUserToken(data.token));

      if (data.is_new_user && data.token) {
        return setStep(3, phone);
      }

      data.is_new_user && !data.token && setStep(1, phone);
      !data.is_new_user && setStep(2, phone);
      // Если сразу после phone авторизация (например, через соцсети), редиректим
      if (data.token && !data.is_new_user) {
        if (next && next !== "/auth") {
          const browserLang = (navigator.language || "en").split("-")[0];
          dispatch(
            setAppLanguage(
              browserLang === LOCALES.ru
                ? LOCALES.ru
                : browserLang === LOCALES.en
                  ? LOCALES.en
                  : browserLang === LOCALES.de
                    ? LOCALES.de
                    : browserLang === LOCALES.tr
                      ? LOCALES.tr
                      : browserLang === LOCALES.zh
                        ? LOCALES.zh
                        : LOCALES.en,
            ),
          );
          dispatch(detectUserRegion());
          history.replace(next);
          dispatch(clearPrevPath());
        } else if (prevPath && prevPath !== "/auth") {
          const browserLang = (navigator.language || "en").split("-")[0];
          dispatch(
            setAppLanguage(
              browserLang === LOCALES.ru
                ? LOCALES.ru
                : browserLang === LOCALES.en
                  ? LOCALES.en
                  : browserLang === LOCALES.de
                    ? LOCALES.de
                    : browserLang === LOCALES.tr
                      ? LOCALES.tr
                      : browserLang === LOCALES.zh
                        ? LOCALES.zh
                        : LOCALES.en,
            ),
          );
          dispatch(detectUserRegion());
          history.replace(prevPath);
          dispatch(clearPrevPath());
        } else {
          const browserLang = (navigator.language || "en").split("-")[0];
          dispatch(
            setAppLanguage(
              browserLang === LOCALES.ru
                ? LOCALES.ru
                : browserLang === LOCALES.en
                  ? LOCALES.en
                  : browserLang === LOCALES.de
                    ? LOCALES.de
                    : browserLang === LOCALES.tr
                      ? LOCALES.tr
                      : browserLang === LOCALES.zh
                        ? LOCALES.zh
                        : LOCALES.en,
            ),
          );
          dispatch(detectUserRegion());
          history.replace("/home/posts");
          dispatch(clearPrevPath());
        }
      }
    }
  };

  const onVerifyCode = async ({ code }) => {
    if (state.phone) {
      const res = await dispatch(verifyCode(state.phone, code.join("")));
      if (res && !res.error) {
        if (res.is_new_user && res.token) {
          return setStep(3);
        }
        // Если после кода сразу авторизация
        if (res.token && !res.is_new_user) {
          if (next && next !== "/auth") {
            const browserLang = (navigator.language || "en").split("-")[0];
            dispatch(
              setAppLanguage(
                browserLang === LOCALES.ru
                  ? LOCALES.ru
                  : browserLang === LOCALES.en
                    ? LOCALES.en
                    : browserLang === LOCALES.de
                      ? LOCALES.de
                      : browserLang === LOCALES.tr
                        ? LOCALES.tr
                        : browserLang === LOCALES.zh
                          ? LOCALES.zh
                          : LOCALES.en,
              ),
            );
            dispatch(detectUserRegion());
            history.replace(next);
            dispatch(clearPrevPath());
          } else if (prevPath && prevPath !== "/auth") {
            const browserLang = (navigator.language || "en").split("-")[0];
            dispatch(
              setAppLanguage(
                browserLang === LOCALES.ru
                  ? LOCALES.ru
                  : browserLang === LOCALES.en
                    ? LOCALES.en
                    : browserLang === LOCALES.de
                      ? LOCALES.de
                      : browserLang === LOCALES.tr
                        ? LOCALES.tr
                        : browserLang === LOCALES.zh
                          ? LOCALES.zh
                          : LOCALES.en,
              ),
            );
            dispatch(detectUserRegion());
            history.replace(prevPath);
            dispatch(clearPrevPath());
          } else {
            const browserLang = (navigator.language || "en").split("-")[0];
            dispatch(
              setAppLanguage(
                browserLang === LOCALES.ru
                  ? LOCALES.ru
                  : browserLang === LOCALES.en
                    ? LOCALES.en
                    : browserLang === LOCALES.de
                      ? LOCALES.de
                      : browserLang === LOCALES.tr
                        ? LOCALES.tr
                        : browserLang === LOCALES.zh
                          ? LOCALES.zh
                          : LOCALES.en,
              ),
            );
            dispatch(detectUserRegion());
            history.replace("/home/posts");
            dispatch(clearPrevPath());
          }
          return;
        }
        return setStep(2);
      }
    }
  };

  const onPasswordEnter = ({ password }, { setFieldError }) => {
    return state.phone
      ? dispatch(
          loginUser({
            phone_number: state.phone,
            password,
            operating_system: DEFINED_OSes.WEB,
            location: prettyLocation,
          }),
        ).then((res) => {
          if (res && res.is_wrong_psw) {
            setFieldError(
              "password",
              translate(
                'Неверный пароль. Повторите попытку или нажмите на ссылку "Забыли пароль?", чтобы сбросить его.',
                "hint.wrongPassword",
              ),
            );
          } else if (res && res.token) {
            saveCurrentAccount(res.user, res.token);
            console.log("RES", res)
            if (next && next !== "/auth") {
              const browserLang = (navigator.language || "en").split("-")[0];
              dispatch(
                setAppLanguage(
                  browserLang === LOCALES.ru
                    ? LOCALES.ru
                    : browserLang === LOCALES.en
                      ? LOCALES.en
                      : browserLang === LOCALES.de
                        ? LOCALES.de
                        : browserLang === LOCALES.tr
                          ? LOCALES.tr
                          : browserLang === LOCALES.zh
                            ? LOCALES.zh
                            : LOCALES.en,
                ),
              );
              dispatch(detectUserRegion());

              history.replace(next);
              dispatch(clearPrevPath());
            } else if (prevPath && prevPath !== "/auth") {
              const browserLang = (navigator.language || "en").split("-")[0];
              dispatch(
                setAppLanguage(
                  browserLang === LOCALES.ru
                    ? LOCALES.ru
                    : browserLang === LOCALES.en
                      ? LOCALES.en
                      : browserLang === LOCALES.de
                        ? LOCALES.de
                        : browserLang === LOCALES.tr
                          ? LOCALES.tr
                          : browserLang === LOCALES.zh
                            ? LOCALES.zh
                            : LOCALES.en,
                ),
              );
              dispatch(detectUserRegion());
              history.replace(prevPath);
              dispatch(clearPrevPath());
            } else {
              const browserLang = (navigator.language || "en").split("-")[0];
              dispatch(
                setAppLanguage(
                  browserLang === LOCALES.ru
                    ? LOCALES.ru
                    : browserLang === LOCALES.en
                      ? LOCALES.en
                      : browserLang === LOCALES.de
                        ? LOCALES.de
                        : browserLang === LOCALES.tr
                          ? LOCALES.tr
                          : browserLang === LOCALES.zh
                            ? LOCALES.zh
                            : LOCALES.en,
                ),
              );
              dispatch(detectUserRegion());
              history.replace("/home/posts");
              dispatch(clearPrevPath());
            }
          }
        })
      : null;
  };

  const onProfileSubmit = async (data, { setSubmitting, setFieldError }) => {
    try {
      const payload = {
        gender: data.gender,
        username: data.nickname,
        full_name: data.fullname,
        operating_system: DEFINED_OSes.WEB,
        location: prettyLocation,
      };

      if (data.croppedAvatar) {
        const res = await dispatch(uploadFile(data.croppedAvatar));
        res && res.id && (payload.avatar_id = res.id);
      } else {
        setFieldError(
          "avatar",
          translate("Не удалось обрезать фотографию", "hint.cantCropImage"),
        );
      }

      if (payload.avatar_id) {
        const res = await dispatch(updateProfile(payload));
        if (res && res.id) {
          const res2 = await dispatch(setPassword(data.password));
          if (res2 && res2.success) {
            Notify.success({
              text: translate(
                "Профиль успешно создан",
                "notify.profileCreateSuccess",
              ),
            });
            localStorage.setItem("has_empty_fields", "1");
            if (next && next !== "/auth") {
              const browserLang = (navigator.language || "en").split("-")[0];
              dispatch(
                setAppLanguage(
                  browserLang === LOCALES.ru
                    ? LOCALES.ru
                    : browserLang === LOCALES.en
                      ? LOCALES.en
                      : browserLang === LOCALES.de
                        ? LOCALES.de
                        : browserLang === LOCALES.tr
                          ? LOCALES.tr
                          : browserLang === LOCALES.zh
                            ? LOCALES.zh
                            : LOCALES.en,
                ),
              );
              dispatch(detectUserRegion());
              history.replace(next);
              dispatch(clearPrevPath());
            } else if (prevPath && prevPath !== "/auth") {
              const browserLang = (navigator.language || "en").split("-")[0];
              dispatch(
                setAppLanguage(
                  browserLang === LOCALES.ru
                    ? LOCALES.ru
                    : browserLang === LOCALES.en
                      ? LOCALES.en
                      : browserLang === LOCALES.de
                        ? LOCALES.de
                        : browserLang === LOCALES.tr
                          ? LOCALES.tr
                          : browserLang === LOCALES.zh
                            ? LOCALES.zh
                            : LOCALES.en,
                ),
              );
              dispatch(detectUserRegion());
              history.replace(prevPath);
              dispatch(clearPrevPath());
            } else {
              const browserLang = (navigator.language || "en").split("-")[0];
              dispatch(
                setAppLanguage(
                  browserLang === LOCALES.ru
                    ? LOCALES.ru
                    : browserLang === LOCALES.en
                      ? LOCALES.en
                      : browserLang === LOCALES.de
                        ? LOCALES.de
                        : browserLang === LOCALES.tr
                          ? LOCALES.tr
                          : browserLang === LOCALES.zh
                            ? LOCALES.zh
                            : LOCALES.en,
                ),
              );
              dispatch(detectUserRegion());
              history.replace("/home/posts");
              dispatch(clearPrevPath());
            }
            return;
          }
        }
      }
      setSubmitting(false);
    } catch (e) {}
  };

  const onResendCode = () => {
    state.phone && dispatch(resendCode(state.phone, RESEND_TYPES.registration));
  };

  const onChangeSentTo = (sent) => {
    dispatch(setTypeResendCode(sent));
  };

  const onForgotPassword = async () => {
    if (isGeneratingCodeToChangePasswordRef.current) return;

    isGeneratingCodeToChangePasswordRef.current = true;

    const res = await dispatch(forgotPassword(state.phone));

    if (res.error) {
      Notify.error({
        text: translate("Что-то пошло не так", "app.fail"),
      });
      console.error(res.error);
      isGeneratingCodeToChangePasswordRef.current = false;
    } else {
      history.push(`/forgot?phone=${state.phone}`);
    }
  };

  const sentToMessage = () => {
    if (typeResendCode && typeResendCode.type === "whatsapp_auth_type") {
      return (
        <>
          Отправлен на WhatsApp{" "}
          <span className="d-block">{typeResendCode.to}</span>
        </>
      );
    } else if (typeResendCode && typeResendCode.type === "email_auth_type") {
      return (
        <>
          Отправлено на Вашу почту{" "}
          <span className="d-block">{typeResendCode.to}</span>
        </>
      );
    } else {
      return (
        <>
          Отправлено SMS на<span className="d-block">{state.phone}</span>
        </>
      );
    }
  };

  return (
    <>
      <div className="login-page">
        {state.step === 0 && (
          <AuthForm
            onSubmit={onPhoneSubmit}
            userLocation={userLocation}
            locale={locale}
            path={location.pathname}
          />
        )}
        {state.step === 1 && (
          <VerifyForm
            onSubmit={onVerifyCode}
            onBack={() => setStep(0)}
            onResend={onResendCode}
            phone={state.phone}
            showOptionsSendVerifyCode={() =>
              setState({ ...state, isShowOptionsSendVerifyCode: true })
            }
            sentToMessage={sentToMessage}
          />
        )}
        {state.step === 2 && (
          <LoginForm
            onSubmit={onPasswordEnter}
            setStep={() => setStep(0)}
            onForgotPassword={onForgotPassword}
          />
        )}
        {state.step === 3 && (
          <ProfileForm
            onSubmit={onProfileSubmit}
            setStep={setStep}
            locale={locale}
          />
        )}
      </div>

      <Layer isOpen={state.isShowOptionsSendVerifyCode}>
        <OptionsSendVerifyCode
          phone={state.phone}
          onBack={() =>
            setState({ ...state, isShowOptionsSendVerifyCode: false })
          }
          onChangeSentTo={onChangeSentTo}
          isLogin={true}
        />
      </Layer>
    </>
  );
};

export default LoginPage;

export const AuthHeader = ({ title, showAppName, logoDisabled }) => (
  <React.Fragment>
    {title && <h1 className="login-page__title f-24 f-600">{title}</h1>}
    {!logoDisabled &&
      (showAppName ? (
        <div className="login-page__image">
          <div className="login-page__logo-txt">
            <Link to="/home" style={{ display: "inline-block" }}>
              <img src={logoWithName} alt="Apofiz Logo" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="login-page__image">
          <div className="login-page__logo">
            <Link to="/home" style={{ display: "inline-block" }}>
              <img src={logo} alt="Apofiz Logo" />
            </Link>
          </div>
        </div>
      ))}
  </React.Fragment>
);
