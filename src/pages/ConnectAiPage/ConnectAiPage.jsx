import MobileTopHeader from "@components/MobileTopHeader";
import { ButtonWithContent } from "@components/UI/Buttons";
import { translate } from "@locales/locales";
import { ConnectAiIcon } from "@pages/AIAssistantPage/icons";
import React, { useEffect, useState } from "react";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import { GeminiIcon } from "./icons";

import "./index.scss";
import { ArrowRight } from "@components/UI/Icons";
import axios from "axios-api";
import { useSelector } from "react-redux";

const ConnectAiPage = () => {
  const history = useHistory();
  const { orgID } = useParams();
  const [aiData, setAiData] = useState(null);
  const { id } = useSelector((state) => state.orgDetail.detail.data.assistant);

  console.log("STATE", id);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          `/assistant/${id}/external-api-settings/`,
        );

        setAiData(response.data.list);
      } catch (error) {}
    };

    getData();
  }, []);

  console.log("AI DATA", aiData);

  return (
    <>
      <MobileTopHeader
        onBack={() =>
          history.push(`/organizations/${orgID}/assistant?mode=edit`)
        }
        title={translate("Подключение сторонних API", "shop.connectAnotherAi")}
      />

      <div className="container containerMax">
        <div className="ai-wrapper">
          <ButtonWithContent
            label={translate("Добавить сторонний API", "app.addNewApi")}
            radiusOrg={true}
            onClick={() =>
              history.push(`/organizations/${orgID}/connectApi/settings`)
            }
            children={<ConnectAiIcon fill={"#FFF"} />}
          />

          <div className="ai-wrapper__list">
            {aiData?.map((ai) => (
              <div
                className="ai-wrapper__item"
                onClick={() =>
                  history.push(
                    `/organizations/${orgID}/connectApi/test/${ai.id}`,
                  )
                }
              >
                <div className="ai-wrapper__item-left">
                  <GeminiIcon />
                  <h3 className="ai-wrapper__item-title">{ai.api_name}</h3>
                </div>

                <div className="ai-wrapper__item-right">
                  <span
                    className="ai-wrapper__item-test"
                    onClick={(e) => {
                      e.stopPropagation();
                      history.push(
                        `/organizations/${orgID}/connectApi/test/${ai.id}`,
                      );
                    }}
                  >
                    {translate("Тест", "app.test")}
                  </span>

                  <ArrowRight />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ConnectAiPage;
