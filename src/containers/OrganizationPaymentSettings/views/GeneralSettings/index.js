import React, { useEffect, useState } from "react";
import useOrgPaymentSystems from "../../useOrgPaymentSystems";
import Preloader from "../../../../components/Preloader";
import { CategoryOption } from "../../../../components/CategoryOption";
import paymentSystemIcon from "../../../../assets/images/payment_system_icon.svg";
import { translate } from "../../../../locales/locales";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import RowToggle from "../../../../components/UI/RowToggle";
import {
  getPaymentSystemsActivationInfo,
  updatePaymentSystems,
} from "../../../../store/services/organizationServices";
import Notify from "../../../../components/Notification";
import { camelObjectToUnderscore } from "../../../../common/helpers";

import maalyPay from "../../../../assets/images/maalyPay.svg";

const GeneralSettings = ({ orgID, onBack, onPaymentSystemSelect }) => {
  const { data: orgPaymentSystems, loading } = useOrgPaymentSystems(orgID);
  const [isSettingLoading, setIsSettingLoading] = useState(true);
  const [settings, setSettings] = useState({
    paymentSystemsActivated: true,
    paymentWithConfirmation: true,
  });
  const [updatingSettings, setUpdatingSettings] = useState([]);

  const MaalyId = orgPaymentSystems
    ? orgPaymentSystems.filter((ps) => ps.name === "MaalyPay в AED")
    : null;

  console.log(MaalyId);

  const handleSettingChange = async (e) => {
    const { name, checked } = e.target;
    if (updatingSettings.includes(name)) return;

    setUpdatingSettings((prevState) => [...prevState, name]);

    try {
      const newSettings = (prevState) => ({
        ...prevState,
        [name]: checked,
      });
      await updatePaymentSystems(
        orgID,
        camelObjectToUnderscore(newSettings(settings))
      );
      setSettings(newSettings);
    } catch (e) {
      Notify.error({
        text: e.message,
      });
      console.error(e);
    } finally {
      setUpdatingSettings((prevState) =>
        prevState.filter((setting) => setting !== name)
      );
    }
  };

  useEffect(() => {
    getPaymentSystemsActivationInfo(orgID)
      .then((res) => {
        setSettings({
          paymentSystemsActivated: res.data.payment_systems_activated,
          paymentWithConfirmation: res.data.payment_with_confirmation,
        });
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => setIsSettingLoading(false));
  }, [orgID]);

  return (
    <div className="">
      <MobileTopHeader
        title={translate(
          "Выбор платежных систем",
          "payment.paymentSystemSelection"
        )}
        onBack={onBack}
        className="organization-payment-settings__general-view-header"
      />
      {loading && <Preloader />}
      <div
        className="container"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        {orgPaymentSystems &&
          orgPaymentSystems.map((PS) => {
            return (
              <CategoryOption
                label={PS.name}
                icon={{
                  file:
                    PS.name === "MaalyPay в AED" ? maalyPay : paymentSystemIcon,
                }}
                onClick={() => {
                  onPaymentSystemSelect(PS);
                }}
                className="organization-payment-settings__option organization-payment-settings__general-view-option"
                key={PS.id}
              />
            );
          })}

        <h3 className="organization-payment-settings__uppercase-title f-500 f-14">
          {translate(
            "Общие настройки платежных систем",
            "payment.generalSettings.title"
          )}
        </h3>
        {isSettingLoading ? (
          <Preloader />
        ) : (
          <>
            <RowToggle
              name="paymentSystemsActivated"
              label={translate(
                "Принимать онлайн оплаты",
                "payment.acceptOnlinePayments"
              )}
              checked={settings.paymentSystemsActivated}
              className="organization-payment-settings__row-toggle"
              onChange={handleSettingChange}
            />
            <p className="organization-payment-settings__general-view-p">
              {translate(
                "Если данная настройка выключена, то все платежные системы не будут доступны для клиентов",
                "payment.generalSettings.p1"
              )}
            </p>
            <RowToggle
              name="paymentWithConfirmation"
              label={translate(
                "Оплаты с подтверждением",
                "payment.paymentsWithConfirmation"
              )}
              checked={settings.paymentWithConfirmation}
              className="organization-payment-settings__row-toggle"
              onChange={handleSettingChange}
            />

            {settings.paymentWithConfirmation ? (
              <>
                <p className="organization-payment-settings__general-view-p">
                  {translate(
                    "Данная настройка включена по умолчанию, организациям с подключенными платежными системами.",
                    "payment.generalSettings.p2"
                  )}
                </p>
                <p className="organization-payment-settings__general-view-p">
                  {translate(
                    "Если Ваша организация принимает платежи после подтверждения товара или услуги что они в наличие и доступны клиенту, это несет минимальный риск возврата и отмены платежа, что в свою очередь не влечет дополнительных расходов за возврат средств через платежную систему клиенту.",
                    "payment.generalSettings.p3"
                  )}
                </p>

                <h4 className="organization-payment-settings__general-view-warning-title f-14 f-500">
                  {translate("Внимание", "app.warning")} !
                </h4>
                <p className="organization-payment-settings__general-view-p">
                  {translate(
                    "Выключив данную настройку вы берете полную ответственность за возврат оплаты клиентам и должны самостоятельно об этом уведомитель своих клиентов",
                    "payment.generalSettings.p4"
                  )}
                </p>
              </>
            ) : (
              <>
                <p className="organization-payment-settings__general-view-p">
                  {translate(
                    "Ресурс не несет ответственности за возврат сделок оплаченных без подтверждения товара или услуги на стороне поставщика товаров или услуг данной организации.",
                    "payment.generalSettings.p5"
                  )}
                </p>

                <h4 className="organization-payment-settings__general-view-warning-title f-14 f-500">
                  {translate("Внимание", "app.warning")} !
                </h4>
                <p className="organization-payment-settings__general-view-p">
                  {translate(
                    "Клиент будет информирован об этом условии при покупки товара или услуги во время оплаты онлайн",
                    "payment.generalSettings.p6"
                  )}
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GeneralSettings;
