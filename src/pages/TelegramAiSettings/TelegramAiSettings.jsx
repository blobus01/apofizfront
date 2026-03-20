import { ALLOWED_FORMATS } from "@common/constants";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import { setViews, uploadFile } from "@store/actions/commonActions";
import { Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";

import "./index.scss";
import { InputTextField } from "@components/UI/InputTextField";
import * as Yup from "yup";
import { DefaultImage, TelegramIcon } from "./icons";
import ToggleSwitch from "@components/UI/ToggleSwitch";
import { NoteIcon } from "@components/UI/Icons";
import { ImportantIcon } from "@containers/AssistantAnswer/icons";
import axios from "axios-api";
import Preloader from "@components/Preloader";
import Notify from "@components/Notification";

const VALIDATION_SCHEMA = Yup.object().shape({
  nickname: Yup.string(),
  description: Yup.string(),
});

const TelegramAiSettings = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const initialValuesRef = useRef(null);
  const [initialValues, setInitialValues] = useState(null);
  const { orgID } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/messenger-bots/telegram/${orgID}/settings/`,
        );

        const data = response.data;

        console.log(data.photo_url);

        const preparedValues = {
          avatarUrl: data.photo_url || null, // URL с бэка
          is_ai_enabled: data.is_ai_enabled || null,
          nickname: data.username || "",
          description: data.description || "",
          croppedAvatar: null,
        };

        setInitialValues(preparedValues);
        initialValuesRef.current = preparedValues; // 🔥 СОХРАНЯЕМ ОДИН РАЗ
      } catch (error) {
        console.log("ERROR from tgAi", error);
      }
    };
    fetchData();
  }, []);

  const handleAvatarChange = (file, setFieldValue) => {
    console.log("FILE", file);

    dispatch(
      setViews({
        type: "image_crop",
        onSave: (images) => {
          console.log("IMAGES", images);

          if (images && images.length > 0) {
            setFieldValue("avatar", images[0].original);
            setFieldValue("croppedAvatar", images[0].original);
          }
          dispatch(setViews([]));
        },
        cropConfig: { aspect: 1 },
        uploads: [file],
        selectableAspectRatio: false,
      }),
    );
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    const initial = initialValuesRef.current;

    if (values.nickname !== initial.nickname) {
      formData.append("name", values.nickname);
    }

    if (values.description !== initial.description) {
      formData.append("description", values.description);
    }

    if (values.croppedAvatar) {
      const file = new File(
        [values.croppedAvatar], // Blob
        "avatar.jpg", // имя файла (обязательно!)
        { type: values.croppedAvatar.type || "image/jpeg" },
      );

      formData.append("photo", file);
    }

    if ([...formData.keys()].length === 0) {
      return history.push(`/organizations/${orgID}/assistant?mode=edit`);
    }

    try {
      await axios.post(`/messenger-bots/telegram/${orgID}/settings/`, formData);

      Notify.success({
        text: "Данные Telegram bot обновлены!",
      });
    } catch (error) {
      Notify.error({
        text: "Ошибка при отправке данных!",
      });
    }
    // history.push(`/organizations/${orgID}/assistant?mode=edit`);
  };

  const handleToggleAi = async (checked, setFieldValue) => {
    setFieldValue("is_ai_enabled", checked);

    try {
      await axios.patch(`/messenger-bots/telegram/${orgID}/`, {
        is_ai_enabled: checked,
      });
      Notify.success({
        text: "Статус Telegram Ai обновлен!",
      });
    } catch (e) {
      // откат
      setFieldValue("is_ai_enabled", !checked);
    }
  };

  if (!initialValues) {
    return <Preloader />; // или Loader
  }

  return (
    <>
      <Formik
        validationSchema={VALIDATION_SCHEMA}
        enableReinitialize
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, setFieldValue, handleSubmit }) => {
          const avatarSrc = values.avatar ? (
            URL.createObjectURL(values.avatar) // preview
          ) : (
            <DefaultImage />
          );

          return (
            <>
              <MobileTopHeader
                title={translate("Telegram Ai настройки", "shop.telegramAi")}
                onBack={() => history.goBack()}
                onSubmit={handleSubmit} // 🔥 ВАЖНО
                submitLabel={translate("Сохранить", "app.save")}
                onClick={handleSubmit}
                style={{
                  marginBottom: "15px",
                  boxShadow: "0 0 4px rgba(0, 0, 0, 0.25)",
                  borderRadius: " 0 0 16px 16px",
                }}
              />

              <form onSubmit={handleSubmit}>
                <div className="container containerMax">
                  <div className="telegram__switch-wrapper">
                    <div className="telegram__switch">
                      <h2 className="telegram__switch-text">
                        <TelegramIcon />
                        {translate("Статус Telegram Ai", "app.TelegramStatus")}
                      </h2>
                      <ToggleSwitch
                        checked={values.is_ai_enabled}
                        onChange={() =>
                          handleToggleAi(!values.is_ai_enabled, setFieldValue)
                        }
                      />
                    </div>

                    <p className="telegram__desc-text">
                      {translate(
                        "Вы можете отключить автоответы Telegram AI-ассистента и перейти в ручной режим. В активном режиме ассистент отвечает на все входящие сообщения.",
                        "desc.telegram1",
                      )}
                    </p>
                  </div>
                  <div className="telegram__avatar-preview">
                    {values.avatar ? (
                      <img
                        src={URL.createObjectURL(values.avatar)}
                        alt="avatar"
                        className="telegram__avatar-image"
                      />
                    ) : values.avatarUrl ? (
                      <img
                        src={values.avatarUrl}
                        alt="avatar"
                        className="telegram__avatar-image"
                      />
                    ) : (
                      <div className="telegram__avatar-placeholder">
                        <DefaultImage />
                      </div>
                    )}

                    <div className="telegram__avatar">
                      <input
                        type="file"
                        id="assistant-avatar"
                        name="avatar"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && ALLOWED_FORMATS.includes(file.type)) {
                            handleAvatarChange(file, setFieldValue);
                          }
                        }}
                      />

                      <label
                        htmlFor="assistant-avatar"
                        className="telegram__avatar-trigger"
                      >
                        {values.avatar
                          ? translate(
                              "Изменить фото ассистента",
                              "assistant.changePhoto",
                            )
                          : translate(
                              "Загрузить фото ассистента",
                              "assistant.uploadPhoto",
                            )}
                      </label>
                    </div>
                  </div>

                  <div className="telegram__form-wrapper">
                    <InputTextField
                      type="text"
                      name="nickname"
                      label={translate("Имя Telegram Ai", "from.nameTgAi")}
                      value={values.nickname}
                      onChange={handleChange}
                      className="telegram-ai__input"
                    />

                    {/* DESCRIPTION */}
                    <InputTextField
                      name="description"
                      label={translate("Описание Telegram Ai", "from.descTgAi")}
                      value={values.description}
                      onChange={handleChange}
                      className="telegram-ai__textarea"
                    />
                  </div>
                  {/* NICKNAME */}

                  <div className="telegram__note-wrapper">
                    <span className="telegram__note-icon">
                      <NoteIcon />
                      {translate("Примечание", "printer.note")}
                    </span>

                    <p className="telegram__note-text">
                      {translate(
                        "Telegram AI-ассистент автоматически обрабатывает входящие сообщения клиентов, консультирует по товарам и услугам, отправляет ссылки, каталоги и помогает закрывать продажи 24/7. В разделе настроек вы можете обучить ассистента под ваш бизнес: загрузить информацию о компании, товары и услуги, задать сценарии ответов, правила коммуникации и логику продаж. Чем точнее вы настроите ассистента, тем эффективнее он будет работать и конвертировать чаты в сделки.",
                        "telegram.noteText",
                      )}
                    </p>
                  </div>

                  <div className="telegram__important-wrapper">
                    <span className="telegram__important-icon">
                      <ImportantIcon />
                      {translate("Важно", "usragr.section7.title")}
                    </span>
                    <div className="telegram__important-text">
                      {translate(
                        "Если вы не отключите Telegram AI-ассистента, он будет постоянно отвечать на все сообщения пользователей автоматически. Вы можете выключить ассистента вверху экрана для вашего удобства.",
                        "telegram.importantDesc",
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </>
          );
        }}
      </Formik>
    </>
  );
};

export default TelegramAiSettings;
