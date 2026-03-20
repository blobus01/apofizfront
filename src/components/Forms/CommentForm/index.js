import React, { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import * as Yup from "yup";
import classnames from "classnames";
import { Formik } from "formik";
import Preloader from "../../Preloader";
import { translate } from "@locales/locales";
import classNames from "classnames";
import "./index.scss";
import { DisableCommentsIcon } from "@pages/MessengerChatPage";
import { VoiceIconPlay, VoiceIconStop } from "./icons";
import VoiceWave from "./animates/VoiceWave";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { useSpeechToText } from "@hooks/useSpeechToText";

const VALIDATION_SCHEMA = Yup.object({
  text: Yup.string().when("user_audio", {
    is: (audio) => !audio,
    then: (schema) =>
      schema.required("errors").min(1, "errors").matches(/\S/, "errors"),
    otherwise: (schema) => schema.notRequired(),
  }),
  user_audio: Yup.mixed().nullable(),
});

const TrashIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 6H5H21"
      stroke="#868D98"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
      stroke="#868D98"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CommentForm = ({
  editText = "",
  disabled,
  onSubmit,
  onChange,
  className,
  loading,
  replyComment,
  commentInput,
  isMenu,
  chat,
}) => {
  const [isVoice, setIsVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const location = useLocation();

  const isCommentsPostPage = location.pathname.includes("/comments/post/");

  const interimRef = useRef("");
  const setTextRef = useRef(null);
  const valuesRef = useRef({ text: "" });
  const stopVoiceRef = useRef(() => {});

  const { start, stop } = useSpeechToText({
    onResult: ({ interim, final }) => {
      if (!setTextRef.current) return;

      if (interim) {
        setTextRef.current(`${interimRef.current} ${interim}`.trim());
      }

      if (final) {
        interimRef.current = `${interimRef.current} ${final}`.trim();
        setTextRef.current(interimRef.current);

        stopVoiceRef.current(); // 🔥 выключаем voice-режим
      }
    },
  });

  useEffect(() => {
    if (isVoice) {
      interimRef.current = valuesRef.current.text || "";
      start();
    } else {
      stop();
    }
  }, [isVoice]);

  useEffect(() => {
    stopVoiceRef.current = () => {
      setIsVoice(false);
    };
  }, []);

  const handleRecordVoice = () => {
    setIsVoice((prev) => !prev);
  };

  useEffect(() => {
    console.log("isVoice:", isVoice);
  }, [isVoice]);

  const handleDeleteVoice = (setFieldValue) => {
    setFieldValue("user_audio", null);
    setFieldValue("text", "");
    setIsVoice(false);
    audioChunksRef.current = [];
  };

  return (
    <Formik
      initialValues={{
        text: editText,
        user_audio: null,
      }}
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={async (values, formikBag) => {
        stop(); // остановить STT
        setIsVoice(false); // выключить voice-режим
        interimRef.current = ""; // очистить голосовой буфер
        valuesRef.current = { text: "" };

        await onSubmit(values, formikBag);

        formikBag.resetForm(); // очистить полеееее
      }}
      enableReinitialize
    >
      {({
        values,
        errors,
        handleChange,
        handleSubmit,
        submitForm,
        setFieldValue,
        isSubmitting,
      }) => {
        valuesRef.current = values;

        setTextRef.current = (text) => {
          setFieldValue("text", text);
        };

        return chat?.is_blocked && chat?.blocked_by_me ? (
          <div className="blocked-wrap">
            <div className="border-icon">
              <DisableCommentsIcon fill="#D72C20" />
            </div>
            <p>Данный чат заблокирован, можно изменить в меню</p>
          </div>
        ) : chat?.is_blocked && !chat?.blocked_by_me ? (
          <div className="blocked-wrap">
            <div className="border-icon">
              <DisableCommentsIcon fill="#D72C20" />
            </div>
            <p>Данный чат заблокирован, другим пользователем</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={classNames("comment-form dfc", className)}>
              {isMenu && (
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 26 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ cursor: "pointer" }}
                >
                  <path
                    d="M12.9999 24.4284C19.3117 24.4284 24.4284 19.3117 24.4284 12.9999C24.4284 6.68803 19.3117 1.57129 12.9999 1.57129C6.68803 1.57129 1.57129 6.68803 1.57129 12.9999C1.57129 19.3117 6.68803 24.4284 12.9999 24.4284Z"
                    stroke="#868D98"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.9998 14.4284C13.7141 14.4284 14.4284 13.7141 14.4284 12.9999C14.4284 12.2856 13.7141 11.5713 12.9998 11.5713C12.2855 11.5713 11.5727 12.2856 11.5727 12.9999C11.5727 13.7141 12.2855 14.4284 12.9998 14.4284ZM7.28554 14.4284C7.99983 14.4284 8.71411 13.7141 8.71411 12.9999C8.71411 12.2856 7.99983 11.5713 7.28554 11.5713C6.57126 11.5713 5.8584 12.2856 5.8584 12.9999C5.8584 13.7141 6.57126 14.4284 7.28554 14.4284ZM18.7141 14.4284C19.4284 14.4284 20.1427 13.7141 20.1427 12.9999C20.1427 12.2856 19.4284 11.5713 18.7141 11.5713C17.9998 11.5713 17.287 12.2856 17.287 12.9999C17.287 13.7141 17.9998 14.4284 18.7141 14.4284Z"
                    fill="#868D98"
                  />
                </svg>
              )}

              <TextareaAutosize
                value={values.text}
                onChange={(e) => {
                  if (e.target.value.length > 0) {
                    e.target.value =
                      e.target.value[0].toUpperCase() +
                      e.target.value?.slice(1);
                  }
                  onChange && onChange(e);
                  handleChange(e);
                }}
                minRows={1.2}
                maxRows={7}
                maxLength={2000}
                placeholder={
                  replyComment
                    ? translate("Ответить", "app.reply")
                    : chat
                      ? translate("Отправить сообщение", "messages.sendMessage")
                      : translate("Сообщение", "app.commentChat")
                }
                name="text"
                // Блокируем, если идет запись или если аудио уже записано
                disabled={isVoice || !!values.user_audio}
                ref={commentInput}
                className="comment-form__field-message"
                style={
                  values.user_audio
                    ? { fontStyle: "italic", color: "#868D98" }
                    : {}
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    if (!e.repeat && !disabled) {
                      void submitForm();
                    }
                    e.preventDefault();
                  }
                }}
              />

              <div className="comment-form__icons-wrap">
                <div className="comment-form__voice">
                  <button
                    className={`voiceBtn ${isVoice ? "voiceBtn--active" : ""}`}
                    onClick={handleRecordVoice}
                    type="button"
                  >
                    {isVoice ? (
                      <>
                        <span className="voiceBtn__icon voiceBtn__icon--wave">
                          <VoiceWave />
                        </span>
                        <span className="voiceBtn__icon voiceBtn__icon--stop">
                          <VoiceIconStop />
                        </span>
                      </>
                    ) : (
                      <span className="voiceBtn__icon voiceBtn__icon--play">
                        <VoiceIconPlay />
                      </span>
                    )}
                  </button>
                </div>

                {!loading && !isSubmitting ? (
                  <button
                    type="submit"
                    className={classnames(
                      values.text.length > 0 &&
                        !errors.text &&
                        !editText &&
                        !disabled &&
                        !isVoice &&
                        "comment-form__btn-send--blue",
                      "comment-form__btn-send",
                    )}
                    disabled={disabled || isVoice}
                  >
                    {editText ? <EditCommentIcon /> : <CommentSendIcon />}
                  </button>
                ) : (
                  <Preloader />
                )}
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

// ... Иконки (CommentSendIcon, EditCommentIcon) оставляем без изменений ...
function CommentSendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="none"
      viewBox="0 0 32 32"
    >
      <path
        fill="#D7D8D9"
        stroke="#D7D8D9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 31c8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15C7.716 1 1 7.716 1 16c0 8.284 6.716 15 15 15z"
      ></path>
      <g clipPath="url(#clip0_31977_3394)">
        <path
          fill="#fff"
          d="M16.889 8.368a1.257 1.257 0 00-1.777 0l-4.744 4.74a1.258 1.258 0 101.78 1.78l2.595-2.596v9.67a1.258 1.258 0 002.515 0v-9.67l2.595 2.595a1.258 1.258 0 101.779-1.778l-4.743-4.741z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_31977_3394">
          <path fill="#fff" d="M0 0H24V24H0z" transform="translate(4 4)"></path>
        </clipPath>
      </defs>
    </svg>
  );
}

export const EditCommentIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="none"
      viewBox="0 0 32 32"
    >
      <path
        fill="#D7D8D9"
        stroke="#D7D8D9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 31c8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15C7.716 1 1 7.716 1 16c0 8.284 6.716 15 15 15z"
      ></path>
      <g clipPath="url(#clip0_31977_3739)">
        <path
          fill="#fff"
          d="M14.687 22.25l9.784-9.315c.168-.16.3-.35.392-.558a1.647 1.647 0 000-1.316 1.716 1.716 0 00-.392-.557 1.815 1.815 0 00-.586-.373 1.885 1.885 0 00-.69-.131c-.48 0-.94.181-1.278.504l-8.507 8.064-3.327-3.133a1.853 1.853 0 00-1.277-.504c-.48 0-.938.181-1.277.504-.339.322-.529.76-.529 1.215 0 .456.19.894.529 1.216l4.604 4.383c.167.16.366.288.585.375a1.878 1.878 0 001.384 0c.219-.087.418-.214.585-.375z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_31977_3739">
          <path fill="#fff" d="M0 0H24V24H0z" transform="translate(4 4)"></path>
        </clipPath>
      </defs>
    </svg>
  );
};

export default CommentForm;
