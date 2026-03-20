import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { Formik } from "formik";
import * as Yup from "yup";

import { InputTextField } from "../../UI/InputTextField";
import GenderSelect from "../../UI/GenderSelect";
import { PasswordField } from "../../UI/PasswordField";
import Button from "../../UI/Button";
import AvatarEdit, { cropAvatar } from "../../UI/AvatarEdit";
import Avatar from "../../UI/Avatar";
import MobileTopHeader from "../../MobileTopHeader";

// Ваши иконки (оставляю как в вашем коде)
import { NewUserIcon } from "@components/Cards/NotificationCard/icons";

import { ALLOWED_FORMATS } from "../../../common/constants";
import { ERROR_MESSAGES } from "../../../common/messages";
import { checkForValidFile } from "../../../common/helpers";
import { translate } from "../../../locales/locales";

import { ReactComponent as YourName } from "./svgs/YourName.svg";
import { ReactComponent as Gender } from "./svgs/Gender.svg";
import { ReactComponent as CreatePassword } from "./svgs/CreatePassword.svg";
import { ReactComponent as AddPhoto } from "./svgs/AddPhoto.svg";

import {
  setAuthChangeCode,
  uploadFile,
  setViews,
} from "@store/actions/commonActions";

import "./index.scss";

import { useDispatch } from "react-redux";

/* -------------------- CONFIG -------------------- */

const INITIAL_VALUES = {
  fullname: "",
  gender: null,
  avatar: null,
  croppedAvatar: null,
  editorRef: null,
  password: "",
};

const STEP_META = [
  {
    icon: <YourName />,
    title: translate("Как вас зовут?", "register.whatsYourName"),
    subtitle: translate("Введите ваше полное имя", "register.enterFullName"),
  },
  {
    icon: <Gender />,
    title: translate("Укажите ваш пол", "register.selectGender"),
    subtitle: translate(
      "Это поможет персонализировать сервис",
      "register.genderDescription",
    ),
  },
  {
    icon: <AddPhoto />,
    title: translate("Добавьте фото профиля", "register.addProfilePhoto"),
    subtitle: translate(
      "Это поможет подтвердить вашу личность",
      "register.photoDescription",
    ),
  },
  {
    icon: <CreatePassword />,
    title: translate("Создайте пароль", "register.createPassword"),
    subtitle: translate("Минимум 8 символов", "register.passwordHint"),
  },
];

const STEP_VALIDATION = [
  Yup.object({
    fullname: Yup.string().required(ERROR_MESSAGES.fullname),
  }),
  Yup.object({
    gender: Yup.string().required(ERROR_MESSAGES.gender_empty),
  }),
  Yup.object({
    avatar: Yup.mixed().required(ERROR_MESSAGES.avatar_required),
  }),
  Yup.object({
    password: Yup.string()
      .min(8, ERROR_MESSAGES.password_min)
      .required(ERROR_MESSAGES.password_empty),
  }),
];

/* -------------------- COMPONENT -------------------- */

const ProfileForm = ({ onSubmit, setStep: setGlobalStep }) => {
  const [step, setStep] = useState(0);

  // 1. Создаем стейт для URL превью на верхнем уровне (здесь можно использовать хуки)
  const [previewUrl, setPreviewUrl] = useState(null);

  const isLastStep = step === STEP_META.length - 1;
  const dispatch = useDispatch();

  // 2. useEffect для очистки памяти, когда компонент удаляется (находится на верхнем уровне)
  useEffect(() => {
    return () => {
      if (
        previewUrl &&
        typeof previewUrl === "string" &&
        previewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleNext = async (validateForm, setTouched) => {
    const errors = await validateForm();
    const currentSchema = STEP_VALIDATION[step];
    const currentFields = Object.keys(currentSchema.fields);

    const hasErrorsOnCurrentStep = currentFields.some((field) => errors[field]);

    if (!hasErrorsOnCurrentStep) {
      setStep((s) => s + 1);
    } else {
      const touchedFields = {};
      currentFields.forEach((field) => (touchedFields[field] = true));
      setTouched(touchedFields);
    }
  };

  const isStepInvalid = (values, errors) => {
    if (step === 0) return !values.fullname || !!errors.fullname;
    if (step === 1) return !values.gender || !!errors.gender;
    if (step === 2) return !values.avatar; // Проверяем наличие файла
    if (step === 3) return !values.password || !!errors.password;
    return false;
  };

  const handleFinalSubmit = (values, formikBag) => {
    if (values.editorRef) {
      const croppedAvatar = cropAvatar(values.editorRef);
      onSubmit({ ...values, croppedAvatar }, formikBag);
    } else {
      onSubmit(values, formikBag);
    }
  };

  const handleAvatarChange = (file, setFieldValue) => {
    dispatch(
      setViews({
        type: "image_crop",
        onSave: (images) => {
          if (images && images.length > 0) {
            const original = images[0].original;
            const cropped = images[0].file;

            setFieldValue("avatar", original);
            setFieldValue("croppedAvatar", cropped);

            setPreviewUrl(original); // используем готовый src
          }

          dispatch(setViews([]));
        },
        cropConfig: { aspect: 1 },
        uploads: [file],
        selectableAspectRatio: false,
      }),
    );
  };

  return (
    <Formik
      initialValues={INITIAL_VALUES}
      validationSchema={STEP_VALIDATION[step]}
      onSubmit={handleFinalSubmit}
    >
      {({
        values,
        handleChange,
        handleSubmit,
        setFieldValue,
        errors,
        touched,
        validateForm,
        setTouched,
        isSubmitting,
      }) => {
        // 3. Вычисляем актуальный src: либо локальное превью, либо строка с бэкенда
        const activeSrc =
          previewUrl ||
          (typeof values.avatar === "string" ? values.avatar : null);

        // for new changes

        return (
          <form className="profile-form" onSubmit={handleSubmit}>
            <MobileTopHeader
              title={translate("Профиль", "app.profile")}
              onBack={() => (step === 0 ? setGlobalStep(0) : setStep(step - 1))}
            />

            <div className="container">
              <div className="profile-form__progress">
                {STEP_META.map((_, index) => (
                  <div
                    key={index}
                    className={classnames(
                      "profile-form__progress-step",
                      index <= step && "active",
                    )}
                  />
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: "70vh",
                }}
              >
                {/* PROGRESS BAR */}

                {/* STEP HEADER */}
                <div className="profile-form__step-header">
                  <div className="profile-form__step-icon">
                    {STEP_META[step].icon}
                  </div>
                  <h2 className="profile-form__step-title">
                    {STEP_META[step].title}
                  </h2>
                  <p className="profile-form__step-subtitle">
                    {STEP_META[step].subtitle}
                  </p>
                </div>

                {/* STEP CONTENT */}
                <div className="profile-form__step-content">
                  {/* ШАГ 0: ФИО */}
                  {step === 0 && (
                    <InputTextField
                      label={translate("ФИО", "profile.fullname")}
                      name="fullname"
                      value={values.fullname}
                      onChange={handleChange}
                      className={classnames(
                        "profile-form__fullname",
                        touched.fullname && !values.fullname && "empty",
                      )}
                      error={
                        errors.fullname && touched.fullname && errors.fullname
                      }
                    />
                  )}

                  {/* ШАГ 1: ПОЛ */}
                  {step === 1 && (
                    <GenderSelect
                      value={values.gender}
                      onChange={(gender) => setFieldValue("gender", gender)}
                      className="profile-form__gender"
                    />
                  )}

                  {/* ШАГ 2: АВАТАР */}
                  <div
                    style={{
                      display: step === 2 ? "block" : "none",
                      width: "100%",
                    }}
                  >
                    <div className="profile-form__avatar">
                      {/* Если есть activeSrc, показываем редактор. Иначе заглушку */}
                      {activeSrc ? (
                        <AvatarEdit
                          src={activeSrc}
                          setFieldValue={setFieldValue}
                        />
                      ) : (
                        <label htmlFor="avatar">
                          <Avatar
                            gender={values.gender}
                            className={classnames(
                              "profile-form__avatar-icon",
                              errors.avatar &&
                                touched.avatar &&
                                "profile-form__avatar-icon--bordered",
                            )}
                          />
                        </label>
                      )}
                    </div>

                    <div className="profile-form__avatar-control">
                      <label
                        htmlFor="avatar"
                        className={classnames(
                          "profile-form__avatar-label",
                          errors.avatar &&
                            touched.avatar &&
                            "profile-form__avatar-label-error",
                        )}
                      >
                        {translate("Добавить фото профиля", "profile.addPhoto")}
                      </label>
                      <input
                        type="file"
                        id="avatar"
                        className="profile-form__avatar-input"
                        accept={ALLOWED_FORMATS.join(",")}
                        onChange={(e) => {
                          const file = e.target.files[0];

                          const { isValid } = checkForValidFile(
                            file,
                            ALLOWED_FORMATS,
                          );

                          if (isValid && file) {
                            handleAvatarChange(file, setFieldValue, setViews);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* ШАГ 3: ПАРОЛЬ */}
                  {step === 3 && (
                    <PasswordField
                      label={translate("Пароль", "profile.password")}
                      value={values.password}
                      onChange={handleChange}
                      onClear={() => setFieldValue("password", "")}
                      className={classnames(
                        "profile-form__password",
                        touched.password && !values.password && "empty",
                      )}
                      error={
                        errors.password && touched.password && errors.password
                      }
                    />
                  )}
                </div>

                {/* BUTTONS */}
                <Button
                  label={
                    isLastStep
                      ? translate("Сохранить", "app.save")
                      : translate("Продолжить", "app.continue")
                  }
                  type="button"
                  className="profile-form__submit"
                  disabled={isSubmitting || isStepInvalid(values, errors)}
                  onClick={() => {
                    if (isLastStep) {
                      handleSubmit();
                    } else {
                      handleNext(validateForm, setTouched);
                    }
                  }}
                />
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export default ProfileForm;
