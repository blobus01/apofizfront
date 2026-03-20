import React, { useState } from "react";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import { translate } from "../../../../locales/locales";
import RowToggle from "../../../../components/UI/RowToggle";
import Notify from "../../../../components/Notification";
import { togglePaymentSystem } from "../../../../store/services/organizationServices";

import maalyPay from "../../../../assets/images/maalyPay.svg";
import { CategoryOption } from "@components/CategoryOption";
import WideButton, { WIDE_BUTTON_VARIANTS } from "@components/UI/WideButton";
import { EyeShow } from "@pages/MaalyPayPage/icons";
import { QuestionIcon } from "@components/UI/Icons";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { setPreOrganization } from "@store/actions/discountActions";

import "./index.scss";

import axios from "axios-api";

const PaymentSystemSettings = ({
  paymentSystem,
  orgID,
  onBack,
  orgPaymentSystems,
}) => {
  const { is_active, name, id } = paymentSystem;

  const [acceptOnlinePayments, setAcceptOnlinePayments] = useState(is_active);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const orgDetail = useSelector((state) => state.orgDetail.detail.data);
  const user = useSelector((state) => state.userStore.user);

  const [showApiKey, setShowApiKey] = useState(false);

  const maalyConfig = orgDetail.maaly_pay_config;

  const [merchantId, setMerchantId] = useState(maalyConfig?.merchant_id || "");
  const [apiKey, setApiKey] = useState(maalyConfig?.api_key || "");

  const isDisabled = merchantId.trim() === "" || apiKey.trim() === "";
  const MaalyId = orgPaymentSystems
    ? orgPaymentSystems.filter((ps) => ps.name === "MaalyPay в AED")
    : null;

  const isChanged =
    merchantId !== maalyConfig?.merchant_id || apiKey !== maalyConfig?.api_key;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `/organizations/${orgDetail.id}/payment_systems/confirmation/`,
        {
          api_key: apiKey,
          merchant_id: merchantId,
          payment_system_id: MaalyId[0].id,
        }
      );

      const responseSuc = await axios.post(`/transactions/preprocess/`, {
        organization: orgDetail.id,
        client: user.id,
      });

      console.log("SUCCESS RESPONSE", responseSuc);

      Notify.success({
        text: translate(
          "Maaly Pay успешно подключён",
          "message.maalySuccessConnect"
        ),
      });

      setTimeout(() => {
        dispatch(
          setPreOrganization({
            id: orgDetail.id,
            image: orgDetail.image,
            title: orgDetail.title,
            types: orgDetail.types,
            currency: orgDetail.currency,
            online_payment_activated: orgDetail.online_payment_activated,
          })
        );

        history.push(`/proceed-discount/${id}`, "maalyPay");
      }, 500);
    } catch (error) {
      console.log("ERROR", error);

      Notify.error({
        text:
          error?.response?.data?.message ||
          translate(
            "Ошибка подключения Maaly Pay. Проверьте данные.",
            "message.maalyErrorConnect"
          ),
      });
    }
  };

  const dispatch = useDispatch();
  const history = useHistory();

  const handleSettingChange = async (e) => {
    if (isUpdatingSettings) return;
    try {
      setIsUpdatingSettings(true);
      const checked = e.target.checked;
      await togglePaymentSystem(orgID, id, checked);
      setAcceptOnlinePayments(checked);
    } catch (e) {
      Notify.error({
        text: e.message,
      });
      console.error(e);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleClick = () => {
    window.open(
      "https://maalyportal.com/merchant/register?ref=foxPxLa4YKd3Ja1K",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handelSavePayment = async () => {
    try {
      const response = await axios.post(
        `/organizations/${orgDetail.id}/payment_systems/confirmation/`,
        {
          api_key: apiKey,
          merchant_id: merchantId,
          payment_system_id: MaalyId[0].id,
        }
      );

      Notify.success({
        text: translate(
          "Данные MaalyPay успешно обновлены",
          "message.maalySuccessSaveData"
        ),
      });
    } catch (error) {
      Notify.error({
        text:
          error?.response?.data?.message ||
          translate(
            "Ошибка при обновление данных Maaly Pay",
            "message.maalyErrorSaveData"
          ),
      });
    }
  };

  return (
    <div className="organization-payment-settings__payment-system-settings">
      <MobileTopHeader
        title={name}
        onBack={onBack}
        className="organization-payment-settings__payment-system-settings-header"
        onNext={() => {
          handelSavePayment();
        }}
        nextLabel={
          name === "MaalyPay в AED" ? translate("Сохранить", "app.save") : ""
        }
        disabled={!isChanged}
      />
      <div
        className="container"
        style={{ margin: "0 auto", maxWidth: "600px" }}
      >
        <h3 className="organization-payment-settings__uppercase-title organization-payment-settings__payment-system-settings-title  f-500 f-14">
          {translate(
            "настройки платежной системы",
            "payment.paymentSystemSettings"
          )}
        </h3>
        <RowToggle
          label={translate(
            "Принимать онлайн оплаты",
            "payment.acceptOnlinePayments"
          )}
          checked={acceptOnlinePayments}
          name="acceptOnlinePayments"
          className="organization-payment-settings__row-toggle"
          onChange={handleSettingChange}
        />
        <p className="organization-payment-settings__payment-system-settings-p f-14">
          {translate(
            "Если данная настройка выключена, то оплата данной платежной системы не будет доступна для клиентов при оплате",
            "payment.paymentSystemSettings.p1"
          )}
        </p>

        {name === "MaalyPay в AED" ? (
          <div className="" style={{ marginTop: 10 }}>
            <CategoryOption
              label={translate(
                "Авторизоваться Maaly Pay",
                "app.maalyPayRegister"
              )}
              icon={{ file: maalyPay }}
              onClick={handleClick}
              className="maaly-pay__register-btn"
            />
            <form className="maaly-pay__from">
              <div className="maaly-pay__input">
                <p
                  className="maaly-pay__input-title"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Merchant ID Maaly Pay</span>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      history.push(`/organizations/${id}/payment/reference`)
                    }
                  >
                    <QuestionIcon />
                  </span>
                </p>

                <input
                  type="text"
                  placeholder={translate(
                    "Укажите Merchant ID Maaly Pay",
                    "register.maalyMerchant"
                  )}
                  value={merchantId}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, "");
                    setMerchantId(onlyNums);
                  }}
                  inputMode="numeric"
                />
              </div>

              {/* API Key */}
              <div className="maaly-pay__input">
                <p
                  className="maaly-pay__input-title"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Maaly Pay API Key</span>
                </p>

                <div className="maaly-pay__password-wrapper">
                  <input
                    type={showApiKey ? "text" : "password"}
                    placeholder={translate(
                      "Укажите Maaly Pay API Key",
                      "register.maalyApi"
                    )}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                    }}
                  />

                  <span
                    className="maaly-pay__password-eye"
                    onClick={() => setShowApiKey((prev) => !prev)}
                  >
                    <EyeShow />
                  </span>
                </div>
              </div>

              {/* Кнопка */}
              <WideButton
                variant={WIDE_BUTTON_VARIANTS.ACCEPT}
                disabled={isDisabled}
                className="maaly-pay__btn"
                style={{
                  margin: "15px 0 31px",
                  background: isDisabled ? "#c4c4c4" : "#007AFF", // 🔥 визуальное затемнение
                  pointerEvents: isDisabled ? "none" : "auto", // 🔥 блокируем клики
                }}
                onClick={handleSubmit}
              >
                {translate("Провести тестовый платеж", "app.maalyTestPay")}
              </WideButton>
            </form>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PaymentSystemSettings;
