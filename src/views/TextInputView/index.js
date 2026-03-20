import React, { useState } from "react";
import { Formik, validateYupSchema } from "formik";
import MobileTopHeader from "../../components/MobileTopHeader";
import TextareaField from "../../components/UI/TextareaField";
import "./index.scss";
import { translate } from "@locales/locales";
import axios from "axios-api";
import { useSelector } from "react-redux";

const TextInputView = ({ onBack, value, onSubmit }) => {
  const { data } = useSelector((state) => state.orgDetail.detail);
  const [loading, setLoading] = useState(false);

  const typeText = (fullText, setFieldValue, speed = 10) => {
    let index = 0;

    setFieldValue("text", ""); // очищаем поле перед анимацией

    const interval = setInterval(() => {
      index++;

      setFieldValue("text", fullText.slice(0, index));

      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, speed);
  };

  const handleGenerateText = async (text, setFieldValue) => {
    setLoading(true);
    try {
      const response = await axios.post(`/organization/create/description`, {
        name: data.title,
        description: text,
      });


      const fullText = response.data.result

      typeText(fullText, setFieldValue);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      onSubmit={(values) => {
        onSubmit(values.text);
        onBack(); // Close view
      }}
      initialValues={{ text: value || "" }}
    >
      {({ values, handleChange, handleSubmit, setFieldValue }) => (
        <form className="text-input-view" onSubmit={handleSubmit}>
          <MobileTopHeader
            title="Описание"
            onBack={onBack}
            onSubmit={() => {
              onSubmit(values.text);
              onBack(); // Close view
            }}
            submitLabel={"Готово"}
          />
          <div className="container containerMax">
            <div
              className="text-input-view__content"
              style={{ position: "relative" }}
            >
              <TextareaField
                placeholder={" "}
                name="text"
                hasPlaceholder={true}
                autofocus
                value={values.text}
                onChange={handleChange}
                minRows={10}
                className="text-input-view__textarea"
              />

              <div className="ai-create__generate-btn-wrap">
                <span
                  className={`ai-create__generate-btn-prompt`}
                  onClick={() => handleGenerateText(values.text, setFieldValue)}
                >
                  {loading ? (
                    <>
                      {translate("Генерация", "app.generation")}
                      <span className="ai-create__loader"></span>
                    </>
                  ) : (
                    <>{translate("Генерировать с Ai", "app.generateWithAi")}</>
                  )}
                </span>
              </div>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default TextInputView;
