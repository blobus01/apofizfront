import React, { useEffect, useRef, useState } from "react";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import classes from "./index.module.scss";
import BorderedTextarea from "@ui/BorderedTextarea";
import { Formik } from "formik";
import { InfoTitle } from "@ui/InfoTitle";
import FileUploader from "@components/FileUploader";
import * as Yup from "yup";
import { AiChoiceVoice, ArrowRight, ImportantIcon } from "./icons";
import TextEditModal from "./TextEditModal";
import ChoiceVoices from "@components/ChoiceVoices/ChoiceVoices";
import axios from "axios-api";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import Notify from "@components/Notification";
import { PlayIcon } from "@components/ChoiceVoices/icons";
import VoiceAssistant from "@pages/CommentsPage/VoiceAssistant ";
import CallAnimation from "@pages/CommentsPage/CallAnimation";

const VALIDATION_SCHEMA = Yup.object({
  files: Yup.array(),
});

const AssistantAnswer = ({
  question,
  onSubmit,
  onBack,
  aiTeach,
  setAiTeach,
}) => {
  const isMain = question !== null ? question?.text === null : "";

  const [isModal, setIsModal] = useState(false);
  const [isTextModal, setIsTextModal] = useState(false);
  const [isGreetingModal, setIsGreetingModal] = useState(false);
  const [isModalVoices, setIsModalVoices] = useState(false);
  const [voices, setVoices] = useState([]);
  const [assistantData, setAssistantData] = useState([]);
  const [choiceVoice, setChoiceVoice] = useState({});
  const isVoiceSessionRef = useRef(false);
  const [dataForVoice, setDataForVoice] = useState({});

  const params = useParams();

  useEffect(() => {
    const fetchChatId = async () => {
      try {
        const { data } = await axios.get(
          `/organizations/assistant/chat/?assistant=7&user=26`,
        );

        setDataForVoice(data);
      } catch (error) {
        console.log("ERROR FROM ASSISTANT CREATE CHAT ID", error);
      }
    };
    fetchChatId();
  }, []);

  const fetchAssistantData = async () => {
    try {
      const response = await axios.get(
        `organizations/assistant/${params.assistant}/`,
      );
      setAssistantData(response.data);
    } catch (error) {
      console.log("ERROR FROM ASSISTANT DATA", error);
    }
  };

  useEffect(() => {
    fetchAssistantData();
  }, []);

  // const handleAi = async (values) => {
  //   const { greeting, text } = values;

  //   try {
  //     await axios.put(`/assistant/${params.assistant}/ai-prompt/`, {
  //       first_message: greeting,
  //       ai_prompt: text,
  //     });
  //     Notify.success({
  //       text: translate(
  //         "Данные AI ассистента успешно обновлены!",
  //         "aiSettings.updatedData",
  //       ),
  //     });
  //     setAiTeach(false);
  //   } catch (error) {
  //     console.log("ERROR SAVE AI", error);
  //   }
  // };

  const handleAiField = async (payload) => {
    try {
      await axios.put(`/assistant/${params.assistant}/ai-prompt/`, payload);

      Notify.success({
        text: translate(
          "Данные AI ассистента успешно обновлены!",
          "aiSettings.updatedData",
        ),
      });
    } catch (error) {
      console.log("ERROR SAVE AI FIELD", error);
    }
  };

  return aiTeach ? (
    <>
      <Formik
        initialValues={{
          text: assistantData?.ai_prompt || "",
          greeting: assistantData?.first_message || "",
        }}
        // onSubmit={handleAi}
        validationSchema={VALIDATION_SCHEMA}
        enableReinitialize
      >
        {({
          errors,
          values,
          isSubmitting,
          setFieldValue,
          handleSubmit,
          handleChange,
        }) => {
          const handleModal = () => {
            setIsModal(true);
          };

          const previewText =
            values.text?.length > 120
              ? values.text.slice(0, 120) + "..."
              : values.text;

          const previewTextGreeting =
            values.greeting?.length > 120
              ? values.greeting.slice(0, 120) + "..."
              : values.greeting;

          return (
            <form onSubmit={handleSubmit} className={classes.root}>
              <MobileTopHeader
                onBack={() => setAiTeach(false)}
                title={translate(
                  "Обучение Ai Ассистента",
                  "org.aiAssistant.learning",
                )}
                disabled={isSubmitting}
                nextLabel={translate("Готов", "app.ready")}
                onNext={() => setAiTeach(false)}
              />
              <div className="container containerMax">
                <h2
                  className={classes.title}
                  style={{ textAlign: "center", marginTop: "24px" }}
                >
                  {translate("Настройка личности Ai", "ai.personalSettings")}
                </h2>
                <p
                  className={classes.desc}
                  style={{ color: "#333333", margin: "19px 0 18px" }}
                >
                  {translate(
                    "Голос, личность, данные, логика общения Мы создаём для вас полностью персонализированного AI-ассистента на базе Apofiz Ai — не просто голос, а цифровую личность, которая умеет продавать, консультировать и вести диалог так, как это делает живой сотрудник.",
                    "org.aiAssistant.newDesc4",
                  )}
                </p>
                <BorderedTextarea
                  name="text"
                  value={previewText}
                  readOnly
                  onClick={() => setIsTextModal(true)}
                  isError={errors.text}
                  placeholder={translate(
                    "В данном поле опишите Персональность, Личные и бизнес-данные и сценарии работы",
                    "resumes.workExperience.descriptionAi",
                  )}
                  style={{ margin: "20px 0" }}
                />

                {assistantData?.ai_voice ? (
                  <div
                    key={assistantData?.voice_id}
                    className={`modal__item`}
                    onClick={() => setIsModalVoices(true)}
                  >
                    <div className="modal__item-wrapper-desc">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        type="button"
                      >
                        <VoiceAssistant
                          chatId={dataForVoice?.id}
                          right={0}
                          assistantID={dataForVoice?.assistant?.id}
                          noTimer={true}
                          isVoiceSessionRef={isVoiceSessionRef}
                        />
                      </button>
                      <div className="modal__item-info">
                        <h3 className="modal__item-title">
                          {assistantData?.voice_name}
                        </h3>
                        <p style={{ fontSize: "14px" }}>
                          {translate(
                            "Нажмите на звонок чтобы протестировать Ассистента",
                            "ai.notifyForCall",
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      className="modal__item-arrow"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowRight />
                    </button>
                  </div>
                ) : (
                  <button
                    className={classes.choiceVoiceWrapper}
                    onClick={() => setIsModalVoices(true)}
                    type="button"
                  >
                    <div className={classes.choiceLeft}>
                      <AiChoiceVoice />
                      {translate("Выбор голоса", "ai.choiceVoice")}
                    </div>
                    <ArrowRight />
                  </button>
                )}

                <BorderedTextarea
                  name="greeting"
                  value={previewTextGreeting}
                  readOnly
                  onClick={() => setIsGreetingModal(true)}
                  isError={errors.text}
                  placeholder={translate(
                    "Приветственное сообщение",
                    "ai.greetingMessage",
                  )}
                  style={{ margin: "20px 0" }}
                />

                <p
                  style={{
                    color: "#007AFF",
                    fontSize: "14px",
                    fontStyle: "italic",
                  }}
                >
                  {translate(
                    "Это приветственное сообщение, которое будет озвучивать ваш AI-ассистент при начале каждого диалога.",
                    "aiSettings.greeting",
                  )}
                </p>
              </div>

              {isTextModal && (
                <TextEditModal
                  name="text"
                  value={values.text}
                  handleChange={handleChange}
                  onClose={() => setIsTextModal(false)}
                  onSubmit={(value) =>
                    handleAiField({
                      ai_prompt: value,
                    })
                  }
                />
              )}

              {isGreetingModal && (
                <TextEditModal
                  name="greeting"
                  value={values.greeting}
                  handleChange={handleChange}
                  onClose={() => setIsGreetingModal(false)}
                  onSubmit={(value) =>
                    handleAiField({
                      first_message: value,
                    })
                  }
                />
              )}
            </form>
          );
        }}
      </Formik>
      {isModalVoices && (
        <ChoiceVoices
          voices={voices}
          setVoices={setVoices}
          isOpen={isModalVoices}
          assistantData={assistantData}
          onClose={() => setIsModalVoices(false)}
          onVoiceUpdated={fetchAssistantData}
        />
      )}
    </>
  ) : (
    <Formik
      initialValues={{
        text: question?.answer?.text ?? "",
        files: question?.answer?.files ?? [],
        question_id: question?.id,
      }}
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
      enableReinitialize
    >
      {({
        errors,
        values,
        isSubmitting,
        setFieldValue,
        handleSubmit,
        handleChange,
      }) => {
        const handleModal = () => {
          setIsModal(true);
        };

        const previewText =
          values.text?.length > 120
            ? values.text.slice(0, 120) + "..."
            : values.text;

        return (
          <form onSubmit={handleSubmit} className={classes.root}>
            <MobileTopHeader
              onBack={onBack}
              title={translate(
                "Информация подробнее",
                "resumes.detailInfo.detailInfo",
              )}
              onSubmit={() => {}}
              submitLabel={
                isSubmitting
                  ? translate("Сохранение", "app.saving")
                  : translate("Сохранить", "app.save")
              }
              disabled={isSubmitting}
            />
            <div className="container containerMax">
              <h2 className={classes.title}>
                {isMain
                  ? translate("Общая форма", "org.mainForm")
                  : translate("Форма организации", "org.form")}
              </h2>
              <p className={classes.desc} style={{ color: "#979797" }}>
                {isMain
                  ? translate(
                      "Для базового обучения AI-ассистента на текстах, фото и презентациях достаточно заполнить эту форму, добавив все данные, которые вы считаете важными для его работы.",
                      "org.aiAssistant.newDesc3",
                    )
                  : question.text}
              </p>
              <BorderedTextarea
                name="text"
                value={previewText}
                readOnly
                onClick={handleModal}
                isError={errors.text}
                placeholder={translate(
                  "В данном поле опишите подробнее",
                  "resumes.workExperience.description",
                )}
                style={{ margin: "20px 0" }}
              />

              {question.id !== 1 && question.id !== 9 ? (
                ""
              ) : (
                <div>
                  <InfoTitle
                    title={translate("Примечание:", "printer.note")}
                    style={{ marginBottom: "0.5rem" }}
                  />

                  <p className={classes.desc} style={{ marginBottom: 12 }}>
                    {translate(
                      "Добавление фото или документов помогает AI-ассистенту работать эффективнее...",
                      "org.ai.newNote",
                    )}
                  </p>

                  <p
                    style={{
                      color: "#FF0004",
                      display: "flex",
                      alignItems: "center",
                      fontStyle: "italic",
                      marginBottom: "15px",
                    }}
                    className={classes.importantInfo}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontWeight: 500,
                        fontStyle: "normal",
                        marginRight: "5px",
                      }}
                    >
                      <ImportantIcon />
                      {translate("Важно", "usragr.section7.title")}:
                    </span>
                    {translate("Максимальный размер файла — 10 MB.", "ai.max")}
                  </p>

                  <FileUploader
                    name="files"
                    value={values.files}
                    onChange={(newFiles) =>
                      setFieldValue("files", newFiles.concat(values.files))
                    }
                    onFileDelete={(fileName) =>
                      setFieldValue(
                        "files",
                        values.files.filter((file) => file.name !== fileName),
                      )
                    }
                  />
                </div>
              )}
            </div>

            {isModal && (
              <TextEditModal
                name="text"
                value={values.text}
                handleChange={handleChange}
                onClose={setIsModal}
                second={true}
                onSubmit={() => handleSubmit()}
              />
            )}
          </form>
        );
      }}
    </Formik>
  );
};

export default AssistantAnswer;
