import React, { useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { ALLOWED_FORMATS, GENDER } from "@common/constants";
import { translate } from "@locales/locales";
import { ERROR_MESSAGES } from "@common/messages";
import PhotoIcon from "@ui/Icons/PhotoIcon";
import classNames from "classnames";
import GenderSelect from "@ui/GenderSelect";
import { InputTextField } from "@ui/InputTextField";
import MobileTopHeader from "@components/MobileTopHeader";
import { InfoTitle } from "@ui/InfoTitle";
import classes from "./index.module.scss";
import { ButtonWithContent } from "@components/UI/Buttons";
import { notifyQueryResult } from "@common/helpers";
import { getAiTariffs } from "@store/services/aiServices";
import { setViews } from "@store/actions/commonActions";
import { useDispatch } from "react-redux";

const FIELDS = Object.freeze({
  avatar: "avatar",
  gender: "gender",
  name: "name",
  position: "position",
});

const VALIDATION_SCHEMA = Yup.object({
  [FIELDS.avatar]: Yup.mixed().required(
    translate("Фото AI Ассистента обязательно", "hint.assistantPhotoRequired"),
  ),
  [FIELDS.gender]: Yup.mixed().oneOf(Object.values(GENDER)).required(" "),
  [FIELDS.name]: Yup.string().required(ERROR_MESSAGES.required),
  [FIELDS.position]: Yup.string().required(ERROR_MESSAGES.required),
});

const AIAssistantForm = ({
  onSubmit,
  onBack,
  submitLabel,
  initialValues = {},
  children,
  ...rest
}) => {
  const dispatch = useDispatch();
  
  const handleAiAvatarChange = ({ file, setFieldValue }) => {
    dispatch(
      setViews({
        type: "image_crop",
        onSave: (images) => {
          if (images && images.length > 0) {
            setFieldValue(FIELDS.avatar, images[0].original);
            setFieldValue("croppedAvatar", images[0].file);
          }
          dispatch(setViews([]));
        },
        cropConfig: { aspect: 1 },
        uploads: [file], // теперь file есть
        selectableAspectRatio: false,
      }),
    );
  };

  return (
    <Formik
      initialValues={{
        [FIELDS.avatar]: initialValues.avatar ?? null,
        [FIELDS.gender]: initialValues.gender ?? GENDER.male,
        [FIELDS.name]: initialValues.name ?? "",
        [FIELDS.position]: initialValues.position ?? "",
      }}
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
    >
      {({
        handleSubmit,
        values,
        setFieldValue,
        handleChange,
        errors,
        touched,
        isSubmitting,
      }) => {
        let avatarSrc;
        if (values.avatar instanceof File) {
          avatarSrc = URL.createObjectURL(values.avatar);
        } else if (typeof values.avatar === "string") {
          avatarSrc = values.avatar;
        }
        return (
          <form onSubmit={handleSubmit} {...rest}>
            <MobileTopHeader
              onBack={onBack}
              title={translate("Информация", "app.information")}
              style={{
                marginBottom: "15px",
                boxShadow: "0 0 4px rgba(0, 0, 0, 0.25)",
                borderRadius: " 0 0 16px 16px",
              }}
              border
              onSubmit={() => {}}
              submitLabel={submitLabel}
              isSubmitting={isSubmitting}
            />

            <div className="container containerMax">
              <InfoTitle
                title={translate("Примечание:", "printer.note")}
                style={{
                  marginBottom: "0.5rem",
                }}
              />
              <p
                style={{
                  fontStyle: "italic",
                  marginBottom: "1.5rem",
                }}
              >
                {translate(
                  "Заполнив максимально все указанные ниже данные, Вы сможете обучить Вашего AI Ассистента отвечать на все запросы пользователей и клиентов. Ваш AI Ассистент может: оказывать поддержку клиентов, отвечать на вопросы, персонализировать взаимодействие для каждого пользователя, обрабатывать и анализировать данные, автоматизировать задачи, проводить обучение и тренинги, выполнять переводы, предоставлять рекомендации многое другое. Контакты, веб ресурсы и геолокация, будут взяты из профиля данной организации.",
                  "org.assistantSettingsDesc",
                )}
              </p>
              <div className={classes.fileInputBox}>
                {avatarSrc ? (
                  <label htmlFor={FIELDS.avatar} style={{ height: 60 }}>
                    <img
                      src={avatarSrc}
                      alt="assistant"
                      className={classes.photo}
                    />
                  </label>
                ) : (
                  <label
                    className={classNames(
                      classes.photoPlaceholder,
                      touched[FIELDS.avatar] &&
                        errors[FIELDS.avatar] &&
                        classes.photoPlaceholderError,
                    )}
                    htmlFor={FIELDS.avatar}
                  >
                    <PhotoIcon />
                  </label>
                )}
                <input
                  type="file"
                  id={FIELDS.avatar}
                  name={FIELDS.avatar}
                  // onChange={(e) => {
                  //   const [file] = e.target.files;
                  //   if (file) {
                  //     setFieldValue(FIELDS.avatar, file);
                  //   }
                  // }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    handleAiAvatarChange({ file, setFieldValue });
                  }}
                  accept={ALLOWED_FORMATS.join(",")}
                  className={classes.fileInput}
                />
                <div className={classes.fileInputBoxRight}>
                  <label
                    className={classNames(classes.fileInputLabel, "f-14 f-500")}
                    htmlFor={FIELDS.avatar}
                  >
                    {translate(
                      "Изменить фото ассистента",
                      "org.changeAssistantPhoto",
                    )}
                  </label>
                  {touched[FIELDS.avatar] && !!errors[FIELDS.avatar] && (
                    <span
                      className={classNames(classes.fileInputError, "f-12")}
                    >
                      {errors[FIELDS.avatar]}
                    </span>
                  )}
                </div>
              </div>
              <p className={classes.fieldDesc}>
                {translate(" AI Ассистента", "org.assistantGenderSelection")}
              </p>
              <GenderSelect
                value={values[FIELDS.gender]}
                onChange={(g) => setFieldValue(FIELDS.gender, g)}
                style={{
                  marginBottom: "1rem",
                }}
                required
              />
              <InputTextField
                name={FIELDS.name}
                value={values[FIELDS.name]}
                label={translate("Имя AI Ассистента", "org.assistantName")}
                onChange={handleChange}
                error={touched[FIELDS.name] && errors[FIELDS.name]}
                className={classes.textInput}
              />
              <InputTextField
                name={FIELDS.position}
                value={values[FIELDS.position]}
                label={translate(
                  "Должность AI Ассистента",
                  "org.assistantPosition",
                )}
                onChange={handleChange}
                error={touched[FIELDS.position] && errors[FIELDS.position]}
              />
              {children}

              {/* <ButtonWithContent
                label={translate(
                  "Оплатить 30 дней +3 подарок",
                  "org.aiAssistant.payForDays"
                )}
                className={classes.payBtn}
                // onClick={handleSubmit}
              >
                <div className={classes.payBtnPrice}></div>
              </ButtonWithContent> */}
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export default AIAssistantForm;
