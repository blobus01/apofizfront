import React from "react";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import classNames from "classnames";
import classes from "../index.module.scss";
import { NoteIcon } from "@components/UI/Icons";

const DetailInfo = ({ tariffs, onBack }) => {
  const { assistant, plans } = tariffs;
  return (
    <div style={{ paddingBottom: "1.5rem" }}>
      <MobileTopHeader
        onBack={onBack}
        title={translate(
          "Подробно о функциях",
          "shop.detailInfoAboutFunctions",
        )}
        style={{
          marginBottom: 4,
        }}
      />
      <div className="container containerMax">
        <div className={classes.assistant} style={{ marginBottom: 14 }}>
          <div>
            <p className={classNames(classes.assistantLabel, "f-14")}>
              {translate("Ассистент Консультант", "org.aiAssistant.consultant")}
            </p>
            <p className={classes.assistantName}>{assistant.name}</p>
          </div>
        </div>
        <h2 className={classes.h2}>
          {translate(
            "ПОДРОБНО О ФУНКЦИЯХ И ОБЯЗАНОСТЯХ",
            "org.aiAssistant.functionSettings",
          ).toUpperCase()}
        </h2>
        <div className={classes.detailedPlanParts}>
          {plans.map((plan) => (
            <PlanPart plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PlanPart = ({ plan }) => {
  return (
    <div className={classes.detailedPlanPart}>
      <div className={classes.itemText}>
        <p className={classes.itemTop}>
          <span className={classes.itemName} style={{ fontWeight: 500 }}>
            {plan.name}
          </span>
        </p>

        <p className={classes.itemBottom}>
          <span className={classes.itemPrice}>
            {plan.price} {plan.currency}
          </span>
          {plan.is_best_choice && (
            <span className={classes.itemBestChoice}>
              {translate("Лучший выбор", "shop.bestChoice")}
            </span>
          )}
        </p>
      </div>
      <p
        style={{
          marginTop: "6px",
          fontStyle: "italic",
          lineHeight: "16px",
          whiteSpace: "pre-line",
        }}
        className="f-14"
      >
        {plan.description}
      </p>

      {plan.additional_name && (
        <>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              margin: "23px 0 16px",
              color: "#007AFF",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            <NoteIcon />
            {translate("Примечание", "printer.note")}
          </span>
          <span className={classes.itemAdditionalName}>
            {plan.additional_name}
          </span>
        </>
      )}
    </div>
  );
};

export default DetailInfo;
