import React, { useEffect, useState } from "react";
import { Layer } from "../../components/Layer";
import MobileTopHeader from "../../components/MobileTopHeader";
import { translate } from "../../locales/locales";
import { CategoryOption } from "../../components/CategoryOption";
import paymentSystemIcon from "../../assets/images/payment_system_icon.svg";
import { useHistory } from "react-router-dom";
import VisaAndMasterCardIcon from "../../components/UI/Icons/VisaAndMasterCardIcon";
import { getOrganizationPaymentSystems } from "../../store/services/organizationServices";
import { notifyQueryResult } from "../../common/helpers";
import Preloader from "../../components/Preloader";

const PaymentMethodsLayer = ({ orgID, onBack, ...rest }) => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [paymentSystems, setPaymentSystems] = useState([]);

  const isOnlinePaymentAvailable = paymentSystems.reduce(
    (val, PS) => PS.is_active || val,
    false,
  );
  const isVisaAvailable = paymentSystems.reduce((val, PS) => {
    return (PS.name.includes("FreedomPay") && PS.is_active) || val;
  }, false);

  useEffect(() => {
    notifyQueryResult(getOrganizationPaymentSystems(orgID), {
      notifyFailureRes: false,
    })
      .then((res) => {
        if (res && res.success) {
          setPaymentSystems(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [orgID]);

  return (
    <Layer
      className="organization-module__payment-methods-layer"
      noTransition
      {...rest}
    >
      <MobileTopHeader
        onBack={onBack}
        title={translate(
          "Доступные способы оплаты",
          "payment.availablePaymentMethods",
        )}
        className="organization-module__payment-methods-layer-header"
      />
      <div className="container containerMax">
        {loading ? (
          <Preloader />
        ) : (
          <>
            {paymentSystems.map((payment) => (
              <CategoryOption
                label={payment.name}
                icon={{ file: paymentSystemIcon }}
                onClick={() => history.push("/faq/offline-purchases")}
                className="organization-module__payment-methods-layer-option"
              />
            ))}

            {/* {isOnlinePaymentAvailable && (
              <CategoryOption
                label={translate('Оплата онлайн', 'app.paymentOnline')}
                icon={{file: paymentSystemIcon}}
                onClick={() => history.push('/faq/online-payment')}
                className="organization-module__payment-methods-layer-option"
              />
            )}

            {isVisaAvailable && (
              <CategoryOption
                label="Visa and Master Card KGS"
                icon={<VisaAndMasterCardIcon/>}
                onClick={() => history.push('/faq/freedom-pay')}
                className="organization-module__payment-methods-layer-option organization-module__payment-methods-layer-option--visa"
              />
            )} */}
          </>
        )}
      </div>
    </Layer>
  );
};

export default PaymentMethodsLayer;
