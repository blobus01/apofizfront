import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import classNames from "classnames";
import { translate } from "@locales/locales";
import { InputTextField } from "@components/UI/InputTextField";
import "./ApiIntegrationForm.scss";
import BorderedTextarea from "@components/UI/BorderedTextarea";
import ApiFormInput from "@components/ApiFormInput/ApiFormInput";
import TextEditModal from "@containers/AssistantAnswer/TextEditModal";
import SelectField from "@components/UI/SelectField";

const REQUEST_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const initialValues = {
  api_key: "",
  path: "",
  ai_name: "",
  description: "",
  method: "POST",
  body: "",
};

const validate = (values) => {
  const errors = {};
  const trimmedPath = String(values.path || "").trim();
  const trimmedAiName = String(values.ai_name || "").trim();
  const trimmedBody = String(values.body || "").trim();

  if (!trimmedAiName) {
    errors.ai_name = translate(
      "Введите имя стороннего AI",
      "connectAi.errorAiName",
    );
  }

  if (trimmedPath) {
    const isValidUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(trimmedPath);

    if (!isValidUrl) {
      errors.path = translate(
        "Введите корректную ссылку API",
        "connectAi.errorPathInvalid",
      );
    }
  }

  if (["POST", "PUT", "PATCH"].includes(values.method) && trimmedBody) {
    try {
      JSON.parse(trimmedBody);
    } catch {
      errors.body = translate(
        "Body должен быть валидным JSON",
        "connectAi.errorBodyInvalid",
      );
    }
  }

  return errors;
};
const FormObserver = ({ isValid, dirty, onValidityChange }) => {
  useEffect(() => {
    onValidityChange?.(isValid && dirty);
  }, [isValid, dirty, onValidityChange]);

  return null;
};

const ApiIntegrationFormConnectAi = ({
  initialData,
  onSubmit: handleSubmitForm,
  onValidityChange,
  formRef,
}) => {
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const trimmedBody = String(values.body || "").trim();
      const shouldUseBody = ["POST", "PUT", "PATCH"].includes(values.method);

      const payload = {
        api_key: values.api_key.trim(),
        path: values.path.trim(),
        ai_name: values.ai_name.trim(),
        description: values.description.trim(),
        method: values.method,
        body: shouldUseBody && trimmedBody ? JSON.parse(trimmedBody) : null,
      };

      console.log("SUBMIT PAYLOAD", payload);

      if (handleSubmitForm) {
        await handleSubmitForm(payload);
      }
    } catch (error) {
      console.error("SUBMIT ERROR", error);
    } finally {
      setSubmitting(false);
    }
  };
  const [isModal, setIsModal] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleModal = (fieldName) => {
    setActiveField(fieldName);
    setIsModal(true);
  };

  return (
    <div className="api-settings">
      <Formik
        key={JSON.stringify(initialData || {})}
        enableReinitialize
        initialValues={{
          api_key: initialData?.api_key || "",
          path: initialData?.path || "",
          ai_name: initialData?.ai_name || "",
          description: initialData?.description || "",
          method: initialData?.method || "POST",
          body:
            initialData?.body !== undefined && initialData?.body !== null
              ? JSON.stringify(initialData.body, null, 2)
              : "",
        }}
        validate={validate}
        validateOnMount
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isValid,
          dirty,
        }) => (
          <>
            <Form ref={formRef} className="api-settings__form">
              <FormObserver
                isValid={isValid}
                dirty={dirty}
                onValidityChange={onValidityChange}
              />

              <ApiFormInput
                id="ai_name"
                name="ai_name"
                label={translate("Имя стороннего AI", "connectAi.form3")}
                placeholder={translate("Название API", "connectAi.form3Hint")}
                value={values.ai_name}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.ai_name}
                error={errors.ai_name}
              />

              <ApiFormInput
                id="api_key"
                name="api_key"
                label={translate("Key API", "connectAi.form1")}
                placeholder={translate(
                  "Добавьте ключ API для интеграции",
                  "connectAi.errorApiKey",
                )}
                value={values.api_key}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.api_key}
                error={errors.api_key}
                keyApi={true}
              />

              <ApiFormInput
                id="path"
                name="path"
                label={translate("Путь API", "connectAi.form2")}
                placeholder={translate(
                  "Укажите линк адрес стороннего API https://",
                  "connectAi.form2Hint",
                )}
                value={values.path}
                onChange={handleChange}
                style={{ color: "#007AFF" }}
                onBlur={handleBlur}
                touched={touched.path}
                error={errors.path}
              />

              <div
                className={classNames(
                  "api-settings__textarea-field",
                  touched.description &&
                    errors.description &&
                    "api-settings__textarea-field_error",
                )}
              >
                <label
                  className="api-settings__textarea-label"
                  htmlFor="description"
                  style={{ color: !values.description ? "#ef3b2d" : "#6f7f92" }}
                >
                  {translate(
                    "Описание API что выполняет подробно",
                    "connectAi.form4",
                  )}
                </label>
                <div
                  className={classNames(
                    "api-settings__textarea-preview-box",
                    !values.description && "is-empty",
                  )}
                  onClick={() => handleModal("description")}
                >
                  {values.description ? (
                    <span className="api-settings__textarea-preview-text">
                      {values.description}
                    </span>
                  ) : (
                    <span className="api-settings__textarea-placeholder">
                      {translate(
                        "Опишите, что делает сторонний API, какие данные он принимает и что должен увидеть клиент в чате после обработки запроса.",
                        "connectAi.form4Hint",
                      )}
                    </span>
                  )}
                </div>

                {touched.description && errors.description && (
                  <div className="api-settings__error">
                    {errors.description}
                  </div>
                )}
              </div>

              <div
                className={classNames(
                  "api-settings__select-field",
                  touched.method &&
                    errors.method &&
                    "api-settings__select-field_error",
                )}
              >
                <label
                  className="api-settings__select-label"
                  htmlFor="method"
                  style={{ color: !values.method ? "#ef3b2d" : "#6f7f92" }}
                >
                  {translate("Метод запроса", "connectAi.form5")}
                </label>

                <div className="api-settings__select-wrapper">
                  <select
                    id="method"
                    name="method"
                    value={values.method}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={classNames(
                      "api-settings__select",
                      !values.method && "is-empty",
                    )}
                  >
                    {REQUEST_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                {touched.method && errors.method && (
                  <div className="api-settings__error">{errors.method}</div>
                )}
              </div>

              <div
                className={classNames(
                  "api-settings__textarea-field",
                  touched.body &&
                    errors.body &&
                    "api-settings__textarea-field_error",
                )}
              >
                <label
                  className="api-settings__textarea-label"
                  htmlFor="body"
                  style={{ color: !values.body ? "#ef3b2d" : "#6f7f92" }}
                >
                  {translate("Body запроса", "connectAi.form6")}
                </label>

                <div
                  className={classNames(
                    "api-settings__textarea-preview-box",
                    "api-settings__textarea-preview-box_body",
                    !values.body && "is-empty",
                    (values.method === "GET" || values.method === "DELETE") &&
                      "is-disabled",
                  )}
                  onClick={() => {
                    if (values.method === "GET" || values.method === "DELETE")
                      return;
                    handleModal("body");
                  }}
                >
                  {values.body ? (
                    <span className="api-settings__textarea-preview-text">
                      {values.body}
                    </span>
                  ) : (
                    <span className="api-settings__textarea-placeholder">
                      {translate(
                        "Добавьте описания body, нажмите для примера",
                        "connectAi.bodyPlace",
                      )}
                    </span>
                  )}
                </div>

                {(values.method === "GET" || values.method === "DELETE") && (
                  <div className="api-settings__hint">
                    {translate(
                      "Для выбранного метода body обычно не требуется.",
                      "connectAi.form6Hint",
                    )}
                  </div>
                )}

                {touched.body && errors.body && (
                  <div className="api-settings__error">{errors.body}</div>
                )}
              </div>

              {isModal && activeField && (
                <TextEditModal
                  name={activeField}
                  value={values[activeField]}
                  handleChange={handleChange}
                  onClose={setIsModal}
                  second={true}
                  title={
                    activeField === "description"
                      ? translate("Описание API", "connectAi.form4")
                      : translate("Body запроса", "connectAi.form6")
                  }
                  placeholder={
                    activeField === "description"
                      ? translate(
                          "Описание API что выполняет подробно",
                          "connectAi.form4",
                        )
                      : translate(
                          "Добавьте описания body",
                          "connectAi.bodyTextInModal",
                        )
                  }
                  debugContent={
                    activeField === "body"
                      ? JSON.stringify(values, null, 2)
                      : null
                  }
                />
              )}
            </Form>
          </>
        )}
      </Formik>
    </div>
  );
};

export default ApiIntegrationFormConnectAi;
