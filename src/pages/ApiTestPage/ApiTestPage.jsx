import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import React, { useEffect, useRef, useState } from "react";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import "./index.scss";
import { AiSwitch } from "@pages/ApiSettingsPage/icons";
import ToggleSwitch from "@components/UI/ToggleSwitch";
import ApiIntegrationFormConnectAi from "@components/ApiIntegrationFormConnectAi/ApiIntegrationFormConnectAi";
import { NoteIcon } from "@components/UI/Icons";
import BorderedTextarea from "@components/UI/BorderedTextarea";
import axios from "axios-api";
import { ButtonWithContent } from "@components/UI/Buttons";
import { ConnectAiIcon } from "@pages/AIAssistantPage/icons";
import useDialog from "@components/UI/Dialog/useDialog";
import Preloader from "@components/Preloader";
import { useSelector } from "react-redux";

const ApiTestPage = () => {
  const history = useHistory();
  const { orgID } = useParams();
  const { confirm } = useDialog();

  const { id } = useParams();

  console.log("ID OF AI", id);

  const params = useSelector((state) => state.orgDetail.detail.data.assistant);

  const formRef = useRef(null);

  const [isFormValid, setIsFormValid] = useState(false);

  const [apiData, setApiData] = useState(null);
  const [isAiEnabled, setIsAiEnabled] = useState(apiData?.is_active);

  const [pageLoading, setPageLoading] = useState(true);

  const [testQuery, setTestQuery] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchApiSettings = async () => {
      try {
        setPageLoading(true);

        const response = await axios.get(
          `/assistant/external-api-settings/${id}/`,
        );
        const data = response.data;

        const mappedData = {
          api_key: data?.api_key || "",
          path: data?.api_url || "",
          ai_name: data?.api_name || "",
          description: data?.api_description || "",
          method: data?.api_methods?.[0] || "POST",
          body: data?.external_api_body || {},
          is_active: data?.is_active || false,
        };

        console.log("MAPPED DATA", mappedData);

        setApiData(mappedData);
        setIsAiEnabled(mappedData.is_active);
      } catch (error) {
        console.error("Failed to load API settings", error);
      } finally {
        setPageLoading(false);
      }
    };

    if (id) {
      fetchApiSettings();
    }
  }, [id]);

  //   const handleHeaderSubmit = () => {
  //     formRef.current?.requestSubmit();
  //   };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      await axios.delete(`/assistant/external-api-settings/${id}/`);

      setIsDeleteModalOpen(false);
      history.push(`/organizations/${orgID}/connectApi`);
    } catch (error) {
      console.error("FAILED TO DELETE API", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatus = async () => {
    const nextValue = !isAiEnabled;
    setIsAiEnabled(nextValue);
  };

  const handleTestRequest = async () => {
    if (!testQuery.trim()) return;

    // try {
    //   setTestLoading(true);
    //   setTestResponse("");

    //   const res = await axios.post(`/your-endpoint/${orgID}/test`, {
    //     query: testQuery.trim(),
    //   });

    //   setTestResponse(
    //     typeof res.data === "string"
    //       ? res.data
    //       : JSON.stringify(res.data, null, 2),
    //   );
    // } catch (error) {
    //   console.error("Test request failed", error);
    //   setTestResponse(
    //     translate(
    //       "Ошибка при выполнении тестового запроса",
    //       "connectAi.testError",
    //     ),
    //   );
    // } finally {
    //   setTestLoading(false);
    // }
  };

  const handleHeaderSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  if (pageLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
        className="container containerMax"
      >
        <Preloader />
      </div>
    );
  }

  return (
    <>
      <MobileTopHeader
        onBack={() => history.goBack()}
        onSubmit={handleHeaderSubmit}
        onClick={handleHeaderSubmit}
        submitLabel={translate("Сохранить", "app.save")}
        title={translate("Настройка API", "shop.aiSettings")}
      />

      <div className="container containerMax">
        <div className="api-settings" style={{ paddingBottom: "100px" }}>
          <div className="api-settings__toggle-switch">
            <h2 className="api-settings__toggle-text">
              <AiSwitch />
              {translate("Статус API ", "app.aiSettingsStatus")}
            </h2>
            <ToggleSwitch checked={isAiEnabled} onChange={handleStatus} />
          </div>

          <p className="api-settings__desc">
            {translate(
              "Вы можете отключить сторонние API для удобства ваших задач ",
              "connectAi.desc1",
            )}
          </p>

          <div className="api-settings__test-block">
            <div className="api-settings__test-header">
              <span className="api-settings__test-title">
                {translate("Тест запрос", "connectAi.testRequest")}
              </span>

              <button
                type="button"
                className="api-settings__test-btn"
                onClick={handleTestRequest}
                disabled={testLoading || !testQuery.trim()}
              >
                {testLoading
                  ? translate("Отправка...", "app.sending")
                  : translate("Отправить тест", "connectAi.sendTest")}
              </button>
            </div>

            <textarea
              name="testQuery"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder={translate(
                "Введите запрос для получения ответа и нажмите тест",
                "connectAi.testInputPlaceholder",
              )}
              className="api-settings__test-textarea"
            />
          </div>

          <div className="api-settings__test-block">
            <div className="api-settings__test-title api-settings__test-title_success">
              {translate("Тест ответ", "connectAi.testResponse")}
            </div>

            <div className="api-settings__response-box">
              {testResponse ||
                translate(
                  "Тут будет ответ после отправки теста",
                  "connectAi.testResponsePlaceholder",
                )}
            </div>
          </div>

          <ApiIntegrationFormConnectAi
            formRef={formRef}
            loading={false}
            initialData={apiData}
            onValidityChange={setIsFormValid}
            onSubmit={async (payload) => {
              const requestData = {
                api_key: payload.api_key,
                api_url: payload.path,
                api_name: payload.ai_name,
                api_description: payload.description,
                api_methods: payload.method ? [payload.method] : [],
                is_active: isAiEnabled,
              };

              try {
                const res = await axios.patch(
                  `/assistant/external-api-settings/${id}/`,
                  requestData,
                );

                console.log("SUCCESS", res.data);

                history.push(`/organizations/${orgID}/connectApi`);
              } catch (error) {
                console.error("FAILED TO SAVE API", error);
              }
            }}
          />

          <p className="api-settings__note" style={{ paddingBottom: "24px" }}>
            <span className="api-settings__note-title">
              <NoteIcon />
              {translate("Примечание", "printer.note")}
            </span>
            <span className="api-settings__note-text">
              {translate(
                "Вы можете подключить любой сторонний API, для выполнения любых задач связанных с Вашим бизнесом или деятельностью, все задачи которые связаны с обработкой любой информации.",
                "connectAi.desc2",
              )}
            </span>
          </p>

          <div
            className="api-settings__btn"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <div className="api-settings__btn-text">
              {" "}
              {translate("Удалить сторонний API", "app.deleteApi")}
            </div>
            <div className="api-settings__btn-icon">
              <ConnectAiIcon fill={"#FFF"} />
            </div>
          </div>
        </div>
      </div>
      {isDeleteModalOpen && (
        <div
          className="delete-modal__overlay"
          onClick={() => {
            if (!deleteLoading) setIsDeleteModalOpen(false);
          }}
        >
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal__content">
              <h3 className="delete-modal__title">
                {translate("Удалить API?", "connectAi.deleteTitle")}
              </h3>

              <p className="delete-modal__text">
                {translate(
                  "Вы действительно хотите удалить сторонний API, вы всегда сможете добавить его сново",
                  "connectAi.deleteDesc",
                )}
              </p>
            </div>

            <div className="delete-modal__actions">
              <button
                type="button"
                className="delete-modal__btn delete-modal__btn_cancel"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
              >
                {translate("Отмена", "app.cancellation")}
              </button>

              <button
                type="button"
                className="delete-modal__btn delete-modal__btn_delete"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? translate("Удаление...", "app.deleting")
                  : translate("Удалить", "app.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiTestPage;
