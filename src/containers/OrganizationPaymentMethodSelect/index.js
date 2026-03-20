import React, { useEffect, useState } from "react";
import MobileTopHeader from "../../components/MobileTopHeader";
import { translate } from "../../locales/locales";
import { getOrganizationPaymentSystems } from "../../store/services/organizationServices";
import Notify from "../../components/Notification";
import Preloader from "../../components/Preloader";
import { CategoryOption } from "../../components/CategoryOption";
import useDialog from "../../components/UI/Dialog/useDialog";
import { useHistory } from "react-router-dom";
import OptionLoader from "../../components/OptionLoader";
import "./index.scss";

import paymentSystemIcon from "../../assets/images/payment_system_icon.svg";
import paymentSystemIconInvoice from "../../assets/images/payment_system_icon_invoice.svg";
import maalyIcon from "../../assets/images/maalyPay.svg";
import { useLocalStorage } from "@hooks/useStorage";
import {
  useLocation,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";

const OrganizationPaymentMethodSelect = ({
  orgID,
  onCashPayment,
  onPaymentSystemSelect,
  submittingPaymentSystem,
  onlinePaymentEnabled,
  onBack,
}) => {
  const history = useHistory();

  const [loading, setLoading] = useState(onlinePaymentEnabled);
  const [paymentSystems, setPaymentSystems] = useState([]);

  const { confirm } = useDialog();
  const location = useLocation();

  const { id } = useParams();

  const paymentIcons = {
    CASH: paymentSystemIcon,
    INVOICE: paymentSystemIconInvoice,
    ONLINE: paymentSystemIcon,
    CRYPTO: paymentSystemIcon,
    MAALY: maalyIcon,
  };

  const getIcon = (PS) => {
    console.log("PSSSS", PS);
    const code = PS.code?.toUpperCase();
    console.log(code);

    return PS.name === "MaalyPay в AED"
      ? paymentIcons["MAALY"]
      : paymentSystemIcon;
  };

  console.log(paymentSystems);

  useEffect(() => {
    if (onlinePaymentEnabled) {
      getOrganizationPaymentSystems(orgID)
        .then((res) => {
          setPaymentSystems(res.data);
        })
        .catch((e) =>
          Notify.error({
            text: e.message,
          })
        )
        .finally(() => setLoading(false));
    }
  }, [orgID, onlinePaymentEnabled]);

  useEffect(() => {
    if (location.state === "maalyPay") {
      onPaymentSystemSelect(6);
    }
  }, [location.state, id]);

  return (
    <div className="organization-payment-method-select">
      {location.state === "maalyPay" ? (
        <div className="maaly-pay-window">
          <div className="maaly-pay-window__content">
            <div className="maaly-pay-window__loader">
              <Preloader />
            </div>

            <h2 className="maaly-pay-window__title">
              {translate("Переходим к оплате", "payment.redirectingTitle")}
            </h2>

            <p className="maaly-pay-window__subtitle">
              {translate(
                "Пожалуйста, подождите. Мы перенаправляем вас на страницу оплаты.",
                "payment.redirectingDesc"
              )}
            </p>
          </div>
        </div>
      ) : (
        <>
          <MobileTopHeader
            onBack={onBack}
            title={translate("Выбор оплаты", "payment.paymentSelection")}
            className="organization-payment-method-select__header"
          />

          <div className="container containerMax">
            {/* Оплата наличными */}
            <CategoryOption
              label={translate("Оплата наличными", "payment.cashPayment")}
              icon={{ file: paymentIcons.CASH }}
              onClick={!submittingPaymentSystem ? onCashPayment : undefined}
              className="organization-payment-method-select__option"
            />

            {loading && <Preloader />}

            {/* Оплата онлайн (если ещё не подключена) */}
            {!onlinePaymentEnabled && (
              <CategoryOption
                label={translate("Оплата онлайн", "app.paymentOnline")}
                icon={{ file: getIcon({ code: "ONLINE" }) }} // ✅ фикс
                onClick={async () => {
                  try {
                    await confirm({
                      title: translate(
                        "Подключить оплату онлайн",
                        "dialog.connectOnlinePaymentTitle"
                      ),
                      description: translate(
                        "Вам доступна возможность подключить онлайн оплату для совершения сделок и принятия оплат через платежные сервисы в настройках вашей организации",
                        "dialog.connectOnlinePaymentDesc"
                      ),
                      confirmTitle: translate("Подключить", "app.connect"),
                    });
                    history.push(`/organizations/${orgID}/payment/settings`);
                  } catch (e) {}
                }}
                className="organization-payment-method-select__option organization-payment-method-select__option--disabled"
              />
            )}

            {/* Системы онлайн оплаты */}
            {paymentSystems.map((PS) =>
              PS.is_active ? (
                <CategoryOption
                  key={PS.id}
                  label={PS.name}
                  icon={{ file: getIcon(PS) }} // ✅ правильный формат
                  onClick={() =>
                    !submittingPaymentSystem && onPaymentSystemSelect(PS.id)
                  }
                  className="organization-payment-method-select__option"
                  renderRight={
                    submittingPaymentSystem === PS.id &&
                    (() => <OptionLoader />)
                  }
                />
              ) : null
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrganizationPaymentMethodSelect;
