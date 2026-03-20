import React, { useEffect, useState } from "react";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import classNames from "classnames";
import { getFileExtension, notifyQueryResult } from "@common/helpers";
import {
  createAiQuestionAnswer,
  getAiQuestions,
  updateAiQuestionAnswer,
  uploadFileForAnswer,
} from "@store/services/aiServices";
import useInfiniteScrollQuery from "@hooks/useInfiniteScrollQuery";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "@components/Preloader";
import { Layer } from "@components/Layer";
import AssistantAnswer from "@containers/AssistantAnswer";
import classes from "./index.module.scss";
import {
  BaseOfProduct,
  ForFirstIcon,
  IconForAi,
  ImportanIcon,
  UploadFiles,
} from "./icons";
import ToggleSwitch from "@components/UI/ToggleSwitch";

import axios from "axios-api";
import { ButtonWithContent } from "@components/UI/Buttons";
import { useSelector } from "react-redux";
import { useOrganizationDetail } from "@hooks/queries/useOrganizationDetail";

const AIAssistantDetailInfoPage = ({ history, match }) => {
  const assistantID = match.params.assistant;
  const orgID = match.params.id;
  const [openedQuestion, setOpenedQuestion] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const fetchCatalogToggle = async () => {
      try {
        const response = await axios.get(
          `/organizations/${orgID}/catalog-toggle/`,
        );

        console.log("RESPONSE", response);
        setChecked(response.data.is_catalog);
      } catch (error) {
        console.log("ERROR", error);
      }
    };
    fetchCatalogToggle();
  }, [orgID]);

  const fetchQuestions = async (params) => {
    return notifyQueryResult(getAiQuestions(params));
  };

  const {
    data: questions,
    next,
    hasMore,
    refresh,
  } = useInfiniteScrollQuery(
    ({ params }) => fetchQuestions({ ...params, assistant_id: assistantID }),
    [assistantID],
  );

  const uploadFiles = async (files) => {
    const resArr = await Promise.allSettled(
      files.map((file) => {
        if (!(file instanceof File)) return Promise.resolve(file.id);

        const formData = new FormData();
        const fileExtension = getFileExtension(file.name);
        const fileName = file.name
          ?.split(".")[0]
          ?.slice(0, 99 - fileExtension.length);

        formData.append("file", file, `${fileName}.${fileExtension}`);
        formData.append("question_id", openedQuestion.id);

        return uploadFileForAnswer(formData, { timeout: 10000 }).then(
          (res) => res && res.success && res.data.id,
        );
      }),
    );

    return resArr
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);
  };

  const handleSubmit = async (values) => {
    const uploadedFiles = await uploadFiles(values.files);
    const payload = {
      assistant: assistantID,
      question: openedQuestion.id,
      text: values.text,
      files: uploadedFiles,
    };

    console.log(payload);

    const res = await notifyQueryResult(
      openedQuestion.answer === null
        ? createAiQuestionAnswer(payload)
        : updateAiQuestionAnswer(openedQuestion.answer.id, payload),
    );
    if (res?.success) {
      setOpenedQuestion(null);
      refresh();
    }
  };

  const handleToggle = async () => {
    const previousValue = checked;

    setChecked(!previousValue);

    try {
      const result = await axios.put(`/organizations/${orgID}/catalog-toggle/`);

      setChecked(result.data.is_catalog);
    } catch (error) {
      console.log(error);

      setChecked(previousValue);
    }
  };

  // product-subcategories-view__list

  const [aiTeach, setAiTeach] = useState(false);
  // const isEditMode = mode === "edit";
  const { id } = match.params;

  const { data: orgDetail } = useOrganizationDetail(id);

  console.log(orgDetail)

  useEffect(() => {
    const permissions = orgDetail?.permissions;

    if (!permissions) return;

    const hasAccess =
      permissions.is_owner ||
      permissions.can_edit_organization ||
      permissions.can_sale ||
      permissions.can_see_stats;

    if (!hasAccess) {
      history.replace(`/organizations/${orgID}`);
    }
  }, [orgDetail, history, orgID]);

  return (
    <div className={classes.root}>
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={translate(
          "Информация подробнее",
          "resumes.detailInfo.detailInfo",
        )}
        style={{ marginBottom: "1.2rem" }}
        onNext={() => history.goBack()}
        nextLabel={translate("Сохранить", "app.save")}
      />
      <div className="container containerMax">
        <h2
          className={classNames(classes.h2, "f-22 f-500")}
          style={{ fontSize: "22px" }}
        >
          {translate("Заполните информацию", "app.fillWithInformation")}
        </h2>

        <div style={{ marginTop: "14px" }}>
          {/* new */}
          <ButtonWithContent
            label={translate(
              "Обучение голосового Ассистента",
              "org.aiAssistant.learning2",
            )}
            radiusOrg={true}
            onClick={() => setAiTeach(true)}
            children={<IconForAi />}
          />

          <p style={{ fontSize: "14px", color: "#2c2d2e", marginTop: "10px" }}>
            {translate(
              "Настройки голосового Ai Асситента, выбор голоса, обучение стилистики и личных данных",
              "aiTeach.desc",
            )}
          </p>

          {/* сделать проверку на статус подписан он или нет */}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            margin: "20px 0",
          }}
        >
          <div className={classNames(classes.toggleSwitch)}>
            <h2 className={classNames(classes.toggleSwitchText)}>
              <BaseOfProduct />
              {translate("База товаров", "app.baseProduct")}
            </h2>
            <ToggleSwitch checked={checked} onChange={handleToggle} />
          </div>
          <p
            style={{
              color: "#333333",
              fontSize: "12px",
              marginBottom: "18px",
              fontSize: "13px",
            }}
          >
            {translate(
              "По умолчанию AI-ассистент использует ваши товары в ответах. Эту функцию можно отключить — тогда ссылки и информация о товарах показываться не будут.",
              "org.aiAssistant.newDesc2",
            )}
          </p>
        </div>

        <p
          style={{
            color: "#007AFF",
            display: "flex",
            alignItems: "center",
            gap: "2px",
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "9px",
          }}
        >
          <ForFirstIcon />
          {translate("Примечание:", "printer.note")}
        </p>
        <p className={classes.italic} style={{ margin: "20px 0" }}>
          <span style={{ color: "#333333", fontWeight: 500 }}>
            Общая форма:{" "}
          </span>
          {translate(
            "AI-ассистент уже знает информацию о вашей организации из описания организации, а также владеет данными о контактах и ссылках. Для простого обучения AI-ассистента на текстовых данных, фото и презентациях, а также по задачам для вашего ассистента, вы можете заполнить только эту форму, добавив в неё все данные, которые считаете важными для его работы.",
            "org.aiAssistant.newDesc1",
          )}
        </p>

        <InfiniteScroll
          next={next}
          hasMore={hasMore}
          loader={<Preloader />}
          dataLength={questions.length}
        >
          {questions.map((question) =>
            question.text === null ? (
              <div key={question.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <RoundButton
                    style={{ marginBottom: "0.75rem" }}
                    onClick={() => setOpenedQuestion(question)}
                  >
                    {question.is_filled
                      ? translate("Редактировать", "app.edit")
                      : translate(
                          "Заполните информацию",
                          "app.fillWithInformation",
                        )}
                  </RoundButton>
                  {question.id === 1 && (
                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        color: "#007AFF",
                        fontSize: "14px",
                      }}
                    >
                      {translate("Загрузка файлов", "ai.uploadFiles")}
                      <UploadFiles />
                    </p>
                  )}
                </div>

                <p className={classes.italic}>
                  {translate(
                    "Для более подробного обучения AI ассистента на текстовых данных, фото и презентациях, о вашем бизнесе необходимо предоставить следующую информацию:",
                    "org.aiAssistant.desc2",
                  )}
                </p>
              </div>
            ) : (
              <Detail
                label={question.text}
                question={question}
                canEdit={question.is_filled}
                onClick={() => {
                  setOpenedQuestion(question);
                }}
                style={{
                  marginBottom: "1.1rem",
                }}
                key={question.id}
              />
            ),
          )}
        </InfiniteScroll>
        <p className={classes.importantTextWrapper}>
          <span className={classes.importantTextRed}>
            <ImportanIcon />
            {translate("Важно", "usragr.section7.title")}:
          </span>

          <span className={classes.importantText}>
            {translate(
              "Большие файлы (таблицы, PDF с большим объёмом данных) не обрабатываются целиком для ответов.  Поэтому информацию нужно разбивать на короткие блоки. Объёмные материалы (презентации, таблицы, регистрационные документы и т. д.) передаются ссылками, что удобно и корректно для работы.",
              "ai.importanText",
            )}
          </span>
        </p>
      </div>

      <Layer isOpen={openedQuestion !== null || aiTeach !== false} noTransition>
        <AssistantAnswer
          aiTeach={aiTeach}
          setAiTeach={setAiTeach}
          question={openedQuestion}
          onBack={() => setOpenedQuestion(null)}
          onSubmit={handleSubmit}
        />
      </Layer>
    </div>
  );
};

const RoundButton = ({ className, ...props }) => {
  return (
    <button
      type="button"
      {...props}
      className={classNames(classes.roundBtn, className)}
    />
  );
};

const Detail = ({ label, onClick, canEdit, className, question, ...rest }) => {
  return (
    <div className={className} {...rest}>
      <p
        className={classNames(classes.detailInfoLabel)}
        style={{ marginBottom: "0.3rem" }}
      >
        {label}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <RoundButton onClick={onClick}>
          {canEdit
            ? translate("Редактировать", "app.edit")
            : translate("Заполните информацию", "app.fillWithInformation")}
        </RoundButton>
        {question.id === 9 && (
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "#007AFF",
              fontSize: "14px",
            }}
          >
            {translate("Загрузка файлов", "ai.uploadFiles")}
            <UploadFiles />
          </p>
        )}
      </div>
    </div>
  );
};

export default AIAssistantDetailInfoPage;
