import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import DiscountProceedForm from "../../components/Forms/DiscountProceedForm";
import {
  completeCashBoxTransaction,
  preprocessDiscount,
} from "../../store/actions/discountActions";
import OrganizationPaymentMethodSelect from "../../containers/OrganizationPaymentMethodSelect";
import {
  completeOfflineDscTransaction,
  initializePayment,
} from "../../store/services/receiptServices";
import Notify from "../../components/Notification";
import { translate } from "../../locales/locales";

class DiscountProceedPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createdTransaction: null,
      submittingPaymentSystem: null,
      discount_percent: null,
    };
  }

  componentDidMount() {
    if (!this.props.preOrganization) {
      this.props.history.push("/profile");
    }
  }

  onSubmit = async (values, coupons_ids, { setSubmitting }) => {
    const { data, amount, manualPercent, percent, sourceCard, cashback } =
      values;

    const payload = {
      transaction_id: data && data.transaction_id,
      original_amount: Number(amount),
      discount_percent: 0,
      source_card: null,
      utc_offset_minutes: moment().utcOffset(),
      coupons_ids,
    };

    const cashbackCards = data ? data.cashback.map((card) => card.id) : [];
    const isUsedCashbackCard = cashbackCards.includes(Number(sourceCard));

    if (sourceCard && !!parseInt(percent)) {
      payload.source_card = Number(sourceCard);
      payload.discount_percent = parseInt(percent);
    }

    if (!isUsedCashbackCard && !!parseInt(manualPercent)) {
      payload.source_card = null;
      payload.discount_percent = parseInt(manualPercent);
    }

    if (Number(cashback)) {
      payload.from_cashback = Number(cashback);
    }

    const res = await this.props.completeCashBoxTransaction(payload);

    if (res && res.success) {
      if (data && data.transaction_id) {
        return this.setState({
          createdTransaction: data.transaction_id,
          discount_percent: payload.discount_percent,
        });
      }
    }
    setSubmitting(false);
  };

  onPaymentSystemSelect = async (paymentSystemID) => {
    const { createdTransaction, submittingPaymentSystem } = this.state;

    console.log("onPaymentSystemSelect called", {
      paymentSystemID,
      createdTransaction,
      submittingPaymentSystem,
    });

    if (!createdTransaction) {
      console.warn("NO createdTransaction");
      return;
    }

    if (submittingPaymentSystem !== null) {
      console.warn("ALREADY submitting", submittingPaymentSystem);
      return;
    }

    try {
      const { createdTransaction } = this.state;
      if (createdTransaction) {
        this.setState({
          submittingPaymentSystem: paymentSystemID,
        });
        const res = await initializePayment(paymentSystemID, {
          transaction_id: createdTransaction,
        });
        window.location.assign(res.data.redirect_url);
      }
    } catch (e) {
      Notify.error({
        text: e.message,
      });
    } finally {
      this.setState({
        submittingPaymentSystem: paymentSystemID,
      });
    }
  };

  onCashPayment = async () => {
    try {
      const { history, preOrganization } = this.props;
      const { createdTransaction, discount_percent } = this.state;
      if (createdTransaction) {
        await completeOfflineDscTransaction(createdTransaction);
        if (!!discount_percent) {
          Notify.success({
            text: translate(
              "Скидка на {percent}% успешно проведена",
              "notify.discountProceedWith",
              { percent: discount_percent }
            ),
          });
        } else {
          Notify.success({
            text: translate(
              "Скидка успешно проведена",
              "notify.discountProceed"
            ),
          });
        }
        return history.replace(
          `/organizations/${preOrganization.id}/receipts-sales/${createdTransaction}?print=1&can_go_back=false`
        );
      }
    } catch (e) {
      Notify.error({
        text: e.message,
      });
    }
  };

  render() {
    const { preprocessDiscount, preOrganization, history } = this.props;
    if (!preOrganization) {
      return null;
    }

    return (
      <div className="discount-proceed-page">
        {this.state.createdTransaction ? (
          <OrganizationPaymentMethodSelect
            orgID={preOrganization.id}
            submittingPaymentSystem={this.state.submittingPaymentSystem}
            onPaymentSystemSelect={this.onPaymentSystemSelect}
            onCashPayment={this.onCashPayment}
            onlinePaymentEnabled={preOrganization.online_payment_activated}
            onBack={() => this.setState({ createdTransaction: null })}
          />
        ) : (
          <DiscountProceedForm
            preprocessDiscount={preprocessDiscount}
            preOrganization={preOrganization}
            createdTransaction={this.state.createdTransaction}
            onSubmit={this.onSubmit}
            onPaymentSystemSelect={this.onPaymentSystemSelect}
            submittingPaymentSystem={this.state.submittingPaymentSystem}
            history={history}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  preOrganization: state.discountStore.preOrganization,
});

const mapDispatchToProps = (dispatch) => ({
  preprocessDiscount: (userID) => dispatch(preprocessDiscount(userID)),
  completeCashBoxTransaction: (...args) =>
    dispatch(completeCashBoxTransaction(...args)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DiscountProceedPage);
