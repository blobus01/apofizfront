import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import React, { useRef, useState } from "react";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import classNames from "classnames";

import "./index.scss";
import { NoteIcon } from "@components/UI/Icons";
import ToggleSwitch from "@components/UI/ToggleSwitch";
import { AiSwitch } from "./icons";
import ApiIntegrationFormConnectAi from "@components/ApiIntegrationFormConnectAi/ApiIntegrationFormConnectAi";

import axios from "axios-api";
import { useSelector } from "react-redux";

const ApiSettingsPage = () => {
  const history = useHistory();
  const { orgID } = useParams();

  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const formRef = useRef(null);

  const handleStatus = () => {
    setIsAiEnabled((prev) => !prev);
  };

  const handleHeaderSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const { id } = useSelector((state) => state.orgDetail.detail.data.assistant);

  console.log("STATE", id);

  return (
    <>
      <MobileTopHeader
        onBack={() => history.goBack()}
        renderRight={() => (
          <button
            type="button"
            onClick={handleHeaderSubmit}
            disabled={!isFormValid}
            className={classNames(
              "top-header__submit",
              (!isFormValid) && "is-disabled",
            )}
          >
            {translate("Добавить", "app.add")}
          </button>
        )}
        title={translate("Настройка API", "shop.aiSettings")}
      />

      <div className="container containerMax">
        <div className="api-settings">
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

          <ApiIntegrationFormConnectAi
            formRef={formRef}
            loading={false}
            onValidityChange={setIsFormValid}
            onSubmit={async (payload) => {
              const requestData = {
                api_key: payload.api_key,
                api_url: payload.path,
                api_name: payload.ai_name,
                api_description: payload.description,
                api_methods: payload.method ? [payload.method] : [],
                is_active: payload.isAiEnabled
              };

              try {
                setLoading(true);

                

                const response = await axios.post(
                  `/assistant/${id}/external-api-settings/`,
                  requestData,
                );

                console.log("READY PAYLOAD", requestData);
                console.log("SUCCESS", response.data);

                history.goBack();
              } catch (error) {
                console.error("FAILED TO SAVE API", error);
              } finally {
                setLoading(false);
              }
            }}
          />

          <p
            className="api-settings__note"
            style={{ paddingBottom: "100px", marginTop: "20px" }}
          >
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
        </div>
      </div>
    </>
  );
};

export default ApiSettingsPage;
