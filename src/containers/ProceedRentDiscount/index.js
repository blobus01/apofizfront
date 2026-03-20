import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProceedDiscountForm from "../../components/Forms/ProceedDiscountForm";
import { ButtonSpaceBetween } from "../../components/UI/Buttons";
import { translate } from "../../locales/locales";
import { completeRentDscTransaction } from "../../store/actions/discountActions";
import { useHistory } from "react-router-dom";
import { RECEIPT_FOR } from "../../common/constants";
import moment from "moment/moment";

const ProceedRentDiscount = ({ onBack, onSuccessSubmit }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const preprocessTransaction = useSelector(
    (state) => state.receiptStore.preprocessTransaction
  );

  const handleSubmit = async (values, coupons_ids) => {
    if (preprocessTransaction) {
      const { transaction_id, cashback } = preprocessTransaction;
      const { amount, manualPercent, percent, sourceCard } = values;

      const payload = {
        transaction_id,
        original_amount: Number(amount),
        discount_percent: 0,
        source_card: null,
        utc_offset_minutes: moment().utcOffset(),
        coupons_ids,
      };

      const cashbackCards = cashback ? cashback.map((card) => card.id) : [];
      const isUsedCashbackCard = cashbackCards.includes(Number(sourceCard));

      if (sourceCard && !!parseInt(percent)) {
        payload.source_card = Number(sourceCard);
        payload.discount_percent = parseInt(percent);
      }

      if (!isUsedCashbackCard && !!parseInt(manualPercent)) {
        payload.source_card = null;
        payload.discount_percent = parseInt(manualPercent);
      }

      if (Number(values.cashback)) {
        payload.from_cashback = Number(values.cashback);
      }

      const res = await dispatch(completeRentDscTransaction(payload));
      if (res && res.success) {
        onSuccessSubmit(res);
        return history.replace(
          `/receipts/rent/${transaction_id}?receipt_for=${RECEIPT_FOR.organization}&print=1`
        );
      }
      return res;
    }
  };

  useEffect(() => {
    if (!preprocessTransaction) {
      onBack();
    }
  }, [preprocessTransaction, onBack]);

  const organization = preprocessTransaction.organization;

  return (
    <ProceedDiscountForm
      preprocessData={preprocessTransaction}
      organization={organization}
      onBack={onBack}
      onSubmit={handleSubmit}
      renderSubmitButton={({ isSubmitting, total }) => (
        <ButtonSpaceBetween
          type="submit"
          label1={translate("Оплатить", "app.pay")}
          label2={total}
          disabled={isSubmitting}
          className="proceed-discount-form__submit"
        />
      )}
    />
  );
};

export default ProceedRentDiscount;
