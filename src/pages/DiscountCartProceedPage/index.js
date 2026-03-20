import React from "react";
import moment from "moment";
import { connect } from "react-redux";
import { completeDscTransaction } from "../../store/actions/discountActions";
import ProceedDiscountForm from "../../components/Forms/ProceedDiscountForm";

class DiscountCartProceedPage extends React.Component {
  componentDidMount() {
    if (!this.props.preprocessTransaction) {
      this.props.history.push("/carts");
    }
  }

  onSubmit = async (values, coupons_ids, { setSubmitting }) => {
    const { history, preprocessTransaction } = this.props;
    if (preprocessTransaction) {
      const { transaction_id, cart_id, cashback, organization } =
        preprocessTransaction;
      const { amount, manualPercent, percent, sourceCard } = values;

      const payload = {
        transaction_id,
        original_amount: Number(amount),
        discount_percent: 0,
        source_card: null,
        utc_offset_minutes: moment().utcOffset(),
        coupons_ids,
      };

      if (cart_id) {
        payload.cart = cart_id;
      }

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

      const res = await this.props.completeDscTransaction(payload);
      if (res && res.success) {
        return history.push(
          `/organizations/${organization.id}/receipts-sales/${transaction_id}?print=1`
        );
      } else {
        setSubmitting(false);
      }
    }
  };

  render() {
    const { preprocessTransaction, history } = this.props;
    const { organization } = preprocessTransaction;
    if (!preprocessTransaction) {
      return null;
    }

    return (
      <div className="discount-cart-proceed-page">
        <ProceedDiscountForm
          preprocessData={preprocessTransaction}
          organization={organization}
          onSubmit={this.onSubmit}
          onBack={() =>
            organization
              ? history.push(`/organizations/${organization.id}`)
              : history.push("/profile")
          }
          history={history}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  preprocessTransaction: state.receiptStore.preprocessTransaction,
});

const mapDispatchToProps = (dispatch) => ({
  completeDscTransaction: (payload) =>
    dispatch(completeDscTransaction(payload)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DiscountCartProceedPage);
