import React, { useEffect, useRef, useState } from "react";
import MobileTopHeader from "../../../../MobileTopHeader";
import { translate } from "../../../../../locales/locales";
import { CategoryOption } from "../../../../CategoryOption";
import paymentSystemIcon from "../../../../../assets/images/payment_system_icon.svg";
import { notifyQueryResult } from "../../../../../common/helpers";
import { getOrganizationPaymentSystems } from "../../../../../store/services/organizationServices";
import Preloader from "../../../../Preloader";
import OptionLoader from "../../../../OptionLoader";

import maalyPayIcon from "../../../../../assets/images/maalyPay.svg";

const PaymentSystemSelection = ({
  orgID,
  onSelect,
  isSubmitting,
  onEmptySelection,
  onBack,
}) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);

  const onEmptySelectionCB = useRef(onEmptySelection);

  useEffect(() => {
    notifyQueryResult(getOrganizationPaymentSystems(orgID))
      .then((res) => {
        if (res && res.success) {
          if (res.data.length === 0) {
            onEmptySelectionCB.current && onEmptySelectionCB.current();
          }

          setOptions(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [orgID]);

  return (
    <div className="payment-form__payment-system-selection">
      <MobileTopHeader
        onBack={onBack}
        title={translate("Выбор оплаты", "payment.paymentSelection")}
        className="payment-form__payment-system-selection-header"
      />
      <div className="container containerMax">
        {loading && <Preloader />}
        {options.map((option) => (
          <CategoryOption
            label={option.name}
            icon={{
              file:
                option.name === "MaalyPay в AED"
                  ? maalyPayIcon
                  : paymentSystemIcon,
            }}
            onClick={() => {
              if (selected === null || !isSubmitting) {
                onSelect(option.id);
                setSelected(option.id);
              }
            }}
            className="payment-form__payment-system-selection-option"
            key={option.id}
            renderRight={
              selected === option.id && isSubmitting && (() => <OptionLoader />)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default PaymentSystemSelection;
