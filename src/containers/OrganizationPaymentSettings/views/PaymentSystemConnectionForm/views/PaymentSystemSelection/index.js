import React, { useEffect, useState } from "react";
import MobileTopHeader from "../../../../../../components/MobileTopHeader";
import { translate } from "../../../../../../locales/locales";
import { getPaymentSystemsForOrganizations } from "../../../../../../store/services/organizationServices";
import Notify from "../../../../../../components/Notification";
import Preloader from "../../../../../../components/Preloader";
import { CategoryOption } from "../../../../../../components/CategoryOption";
import paymentSystemIcon from "../../../../../../assets/images/payment_system_icon.svg";
import maalyPay from "../../../../../../assets/images/maalyPay.svg";
import zinaPay from '../../../../../../assets/images/zina-pay.png'
import useDialog from "../../../../../../components/UI/Dialog/useDialog";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { MaalyPay } from "./icons";

const PaymentSystemSelection = ({ orgID, onBack, onSelect }) => {
  const [paymentSystems, setPaymentSystems] = useState(null);
  const { alert } = useDialog();
  const history = useHistory();

  useEffect(() => {
    getPaymentSystemsForOrganizations({ organization_id: orgID })
      .then((res) => setPaymentSystems(res.data))
      .catch((e) => {
        Notify.error({
          text: e.message,
        });
        console.error(e);
      });
  }, [orgID]);


  const MaalyId = paymentSystems ? paymentSystems.filter((ps) => ps.name === "MaalyPay в AED") : null;


  return (
    <div className="organization-payment-settings__system-selection">
      <MobileTopHeader
        title={translate(
          "Выбор платежных систем",
          "payment.paymentSystemSelection"
        )}
        onBack={onBack}
        className="organization-payment-settings__system-selection-header"
      />
      <div
        className="container"
        style={{ margin: "0 auto", maxWidth: "600px" }}
      >
        {paymentSystems === null ? (
          <Preloader />
        ) : (
          paymentSystems.map((PS) => {
            return (
              <CategoryOption
                label={PS.name}
                icon={{ file: PS.name === "MaalyPay в AED" ? maalyPay : paymentSystemIcon }}
                onClick={() => {
                  if (PS.is_available) { // здесь наоборот я изменил для работы 
                    PS.name === "MaalyPay в AED" ? history.push(`/organizations/${orgID}/payment/${MaalyId[0].id}`) :  onSelect(PS); 
                  } else {
                    alert({
                      title: translate("Не доступно", "app.unavailable"),
                      description: translate(
                        "Данная платежная система пока не доступна в Вашем регионе",
                        "dialog.paymentSystemNotAvailable"
                      ),
                      confirmTitle: translate(
                        "Попробовать позже",
                        "dialog.paymentSystemNotAvailableConfirmationTitle"
                      ),
                    });
                  }
                }}
                className="organization-payment-settings__option"
                key={PS.id}
              />
            );
          })
        )}
        {/* {paymentSystems === null ? (
          ""
        ) : (
          <CategoryOption
            label={"Ziina Pay"}
            icon={{ file: zinaPay }}
            onClick={() => history.push(`/organizations/${orgID}/payment/${MaalyId[0].id}`, 'ziinaPay')}
            className="organization-payment-settings__option"
          />
        )} */}
      </div>
    </div>
  );
};

export default PaymentSystemSelection;
