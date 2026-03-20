import React, { useEffect, useMemo, useState } from "react";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import { InfoTitle } from "@ui/InfoTitle";
import { notifyQueryResult } from "@common/helpers";
import { getAiTariffs, purchaseAi } from "@store/services/aiServices";
import Preloader from "@components/Preloader";
import classNames from "classnames";
import Avatar from "@ui/Avatar";
import ToggleSwitch from "@ui/ToggleSwitch";
import { ButtonWithContent } from "@ui/Buttons";
import { prettyFloatMoney } from "@common/utils";
import moment from "moment/moment";
import { Layer } from "@components/Layer";
import BaseButton from "@ui/BaseButton";
import DetailInfo from "./DetailInfo";
import classes from "./index.module.scss";

const AssistantTariffSelectionPage = ({ history, match }) => {
  const { assistantID: id, id: orgID } = match.params;
  const [loading, setLoading] = useState(true);
  const [tariffs, setTariffs] = useState({
    assistant: null,
    plans: [],
  });
  const { assistant, plans } = tariffs;
  const [selectedIDs, setSelectedIDs] = useState(assistant?.plans ?? []);

  const selectedPlans = useMemo(() => {
    return plans.filter((plan) => selectedIDs.includes(plan.id));
  }, [plans, selectedIDs]);

  const [isDetailInfoOpen, setIsDetailInfoOpen] = useState(false);

  const bestPlan = selectedPlans.find((plan) => plan.is_best_choice);

  const isPlanSelected = (planID) => selectedIDs.includes(planID);

  const isAssistantActive = assistant?.is_assistant_active ?? false;

  const getLeftDays = (until) => {
    if (!until) return null;

    const futureDate = moment(until);
    const currentDate = moment();
    return futureDate.diff(currentDate, "days");
  };

  useEffect(() => {
    if (tariffs.assistant?.plans?.length) {
      setSelectedIDs(tariffs.assistant.plans);
    }
  }, [tariffs]);

  const locale = localStorage.getItem("locale") || "en";

  useEffect(() => {
    notifyQueryResult(getAiTariffs(id, locale)).then((result) => {
      if (result?.success) {
        setTariffs(result.data);
        setLoading(false);
        console.log("RESULTS", result);
      }
    });
  }, [id]);

  const handleSubmit = async () => {
    if (selectedPlans.length) {
      const res = await notifyQueryResult(
        purchaseAi({
          assistant: Number(id),
          plans: selectedIDs,
          duration_days: 33,
          utc_offset_minutes: moment().utcOffset(),
        }),
      );
      if (res?.success) {
        history.replace(
          `/register/payment-select?transaction=${res.data.transaction_id}&organizationId=${orgID}`,
          // `/organizations/${orgID}/receipts/${res.data.transaction_id}/payment`,
        );
      }
    }
  };

  if (loading) return <Preloader style={{ marginTop: "1rem" }} />;

  return (
    <div className={classes.root}>
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={translate("Выбор тарифа", "org.aiAssistant.tariffSelection")}
        style={{
          marginBottom: "15px",
          boxShadow: "0 0 4px rgba(0, 0, 0, 0.25)",
          borderRadius: " 0 0 16px 16px",
        }}
      />
      <div className="container containerMax">
        <InfoTitle
          title={translate("Примечание:", "printer.note")}
          style={{ marginBottom: 6 }}
        />
        <p
          style={{ marginBottom: 12, fontStyle: "italic", lineHeight: "16px" }}
          className="f-14"
        >
          {translate(
            "Ваш новый сотрудник AI ассистент и это его функции и обязанности которые можно оплачивать. Главное этот сотрудник не спит, не болеет и всегда готов ответить на все запросы Ваших клиентов.",
            "org.aiAssistant.tariffSelectionDescription",
          )}
        </p>

        <div className={classes.assistant}>
          {assistant.image && (
            <Avatar src={assistant.image?.small} size={48} alt="assistant0" />
          )}
          <div>
            <p className={classNames(classes.assistantLabel, "f-14")}>
              {translate("Ассистент Консультант", "org.aiAssistant.consultant")}
            </p>
            <p className={classes.assistantName}>{assistant.name}</p>
          </div>
        </div>

        <h2 className={classes.h2}>
          {translate(
            "НАСТРОЙКИ ЗАРПЛАТЫ AI АССИСТЕНТА",
            "org.aiAssistant.salarySettings",
          )}
        </h2>

        <div className={classes.items}>
          {plans.map((plan) => (
            <PlanPart
              key={plan.id}
              plan={plan}
              checked={isPlanSelected(plan.id)}
              onChange={() => {
                if (isPlanSelected(plan.id)) {
                  setSelectedIDs(
                    selectedIDs.filter((id) => {
                      const bestChoicePlan = plans.find(
                        (plan) => plan.is_best_choice,
                      );
                      return id !== plan.id && bestChoicePlan.id !== id;
                    }),
                  );
                } else {
                  if (plan.is_best_choice) {
                    return setSelectedIDs(plans.map((plan) => plan.id));
                  }
                  setSelectedIDs([...selectedIDs, plan.id]);
                }
              }}
            />
          ))}
        </div>

        <BaseButton
          className={classes.textButton}
          onClick={() => setIsDetailInfoOpen(true)}
        >
          {translate("Подробно о функциях?", "shop.newLearnMore")}
        </BaseButton>

        {!isAssistantActive ? (
          <ButtonWithContent
            radiusOrg={true}
            position={true}
            label={translate(
              "Оплатить 30 дней +3 подарок",
              "org.aiAssistant.payForDays",
            )}
            className={classes.payBtn}
            onClick={handleSubmit}
          >
            <div className={classes.payBtnPrice}>
              {bestPlan ? (
                <>
                  {prettyFloatMoney(bestPlan.price, false, bestPlan.currency)}
                </>
              ) : (
                <>
                  {prettyFloatMoney(
                    selectedPlans.reduce((sum, plan) => sum + plan.price, 0),
                    false,
                    selectedPlans[0]?.currency,
                  )}
                </>
              )}
            </div>
          </ButtonWithContent>
        ) : (
          <ButtonWithContent
            radiusOrg={true}
            position={true}
            label={translate(
              "Осталось {days} дней - Оплатить",
              "org.aiAssistant.payForNextDays",
              {
                days: getLeftDays(assistant?.active_until),
              },
            )}
            className={classNames(classes.payBtn, classes.payBtn_repay)}
            onClick={handleSubmit}
          >
            <div className={classes.payBtnPrice}>
              {bestPlan ? (
                <>
                  {prettyFloatMoney(bestPlan.price, false, bestPlan.currency)}
                </>
              ) : (
                <>
                  {prettyFloatMoney(
                    selectedPlans.reduce((sum, plan) => sum + plan.price, 0),
                    false,
                    selectedPlans[0]?.currency,
                  )}
                </>
              )}
            </div>
          </ButtonWithContent>
        )}
      </div>

      <Layer isOpen={isDetailInfoOpen} noTransition>
        <DetailInfo
          tariffs={tariffs}
          onBack={() => setIsDetailInfoOpen(false)}
        />
      </Layer>
    </div>
  );
};

const PlanPart = ({ plan, onChange, checked = false }) => {
  const [telegramUsername, setTelegramUsername] = useState("");
  const [whatsAppPhone, setWhatsAppPhone] = useState("");

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");

    if (!digits.startsWith("996")) return "+996 ";

    let result = "+996";

    if (digits.length > 3) result += " " + digits.slice(3, 6);
    if (digits.length > 6) result += " " + digits.slice(6, 9);
    if (digits.length > 9) result += " " + digits.slice(9, 12);

    return result;
  };

  return (
    <>
      <div className={classes.item}>
        <div className={classes.itemText}>
          <p className={classes.itemTop}>
            <span className={classes.itemName}>
              {plan.name}{" "}
              {/* {plan.additional_name && (
                <span className={classes.itemAdditionalName}>
                  {plan.additional_name}
                </span>
              )} */}
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
        <ToggleSwitch onChange={onChange} checked={checked} />
      </div>
    </>
  );
};

export default AssistantTariffSelectionPage;
