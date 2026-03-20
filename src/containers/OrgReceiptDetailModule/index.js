import React, { Component } from "react";
import { connect } from "react-redux";
import MobileTopHeader from "../../components/MobileTopHeader";
import ReceiptDetail from "../../components/ReceiptDetail";
import Preloader from "../../components/Preloader";
import {
  getReceiptSaleDetail,
  setReceiptSaleDetail,
} from "../../store/actions/receiptActions";
import { canGoBack, notifyQueryResult } from "../../common/helpers";
import { RECEIPT_FOR, RECEIPT_STATUSES } from "../../common/constants";
import { setOrgClient } from "../../store/actions/organizationActions";
import {
  acceptOnlineReceipt,
  rejectOnlineReceipt,
} from "../../store/services/receiptServices";
import { putCartDetail } from "../../store/actions/cartActions";
import "./index.scss";

function copyObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

class OrgReceiptDetailModule extends Component {
  constructor(props) {
    super(props);
    this.mounted = true;
    this.receiptID = this.props.receiptID;
    this.orgID = this.props.orgID;
    this.state = {
      loading: true,
      isProcessing: false,
      localReceiptSaleDetail:
        props.receiptSaleDetail && props.receiptSaleDetail.id === this.receiptID
          ? props.receiptSaleDetail
          : null,
      isReceiptChanged: false,
    };
  }

  componentDidMount() {
    this.props
      .getReceiptSaleDetail(this.receiptID)
      .then(
        (receipt) =>
          this.mounted &&
          this.setState((prevState) => ({
            ...prevState,
            localReceiptSaleDetail: copyObject(receipt.data),
          }))
      )
      .finally(
        () =>
          this.mounted &&
          this.state.loading &&
          this.setState((prevState) => ({ ...prevState, loading: false }))
      );
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  updateReceiptCart = async (cartId, cartItems) => {
    return await this.props.putCartDetail(cartId, cartItems);
  };

  onAccept = async (localReceipt) => {
    this.setProcessing(true);
    try {
      // if products count changed updated cart items of the receipt
      let updateRes;
      if (this.state.isReceiptChanged) {
        const newItems = localReceipt.cart.items.map(
          ({ item, count, size }) => ({
            item: item.id,
            count,
            size: size?.id,
          })
        );

        updateRes = await notifyQueryResult(
          this.updateReceiptCart(localReceipt.cart.id, newItems)
        );
      }

      if (updateRes === undefined || updateRes.success) {
        // accept logic
        const res = await acceptOnlineReceipt(localReceipt.id);
        if (res && res.success) {
          this.setState((prevState) => {
            const newReceiptDetail = copyObject(
              prevState.localReceiptSaleDetail
            );
            newReceiptDetail.status = RECEIPT_STATUSES.accepted;
            return {
              ...prevState,
              localReceiptSaleDetail: newReceiptDetail,
            };
          });
        }
      }
    } catch (e) {}

    this.setProcessing(false);
  };

  onReject = (receipt) => {
    this.setProcessing(true);
    rejectOnlineReceipt(receipt.id)
      .then(
        (res) =>
          res &&
          res.success &&
          this.props.setReceiptSaleDetail({
            ...receipt,
            status: RECEIPT_STATUSES.rejected,
          })
      )
      .finally(() => this.setProcessing(false));
  };

  handleCartUpdate = (cart) => {
    const { localReceiptSaleDetail } = this.state;

    if (localReceiptSaleDetail && cart) {
      const { original_price, discounted_price } = cart.totals;
      const newLocalReceipt = copyObject(localReceiptSaleDetail);

      newLocalReceipt.cart = cart;
      newLocalReceipt.original_amount = original_price;
      newLocalReceipt.savings = original_price - discounted_price;
      newLocalReceipt.final_amount = discounted_price;

      this.setState((prevState) => ({
        ...prevState,
        localReceiptSaleDetail: newLocalReceipt,
        isReceiptChanged: true,
      }));
    }
  };

  setProcessing = (value) => {
    this.setState((prevState) => ({ ...prevState, isProcessing: value }));
  };

  render() {
    const { loading, isProcessing, localReceiptSaleDetail: data } = this.state;
    const { history } = this.props;
    return (
      <div className="org-receipt-detail-module">
        <MobileTopHeader
          onBack={() =>
            canGoBack(history)
              ? history.goBack()
              : history.push(`/organizations/${this.orgID}/receipts`)
          }
          title={`Чек ${this.receiptID}`}
        />
        <div className="container">
          {loading ? (
            <Preloader />
          ) : data ? (
            <ReceiptDetail
              receipt={data}
              organizationID={this.orgID}
              processedBy={data}
              organization={data.organization}
              client={data.client}
              type={RECEIPT_FOR.organization}
              onClientClick={() => {
                this.props.setOrgClient(data.client);
                history.push(
                  `/organizations/${this.orgID}/client/${data.client.id}?src=client`
                );
              }}
              onAccept={() => this.onAccept(data)}
              onReject={() => this.onReject(data)}
              onUpdateCart={this.handleCartUpdate}
              isProcessing={isProcessing}
              onProductUpdate={() =>
                this.props.getReceiptSaleDetail(this.receiptID)
              }
              className="org-receipt-detail-module__receipt"
            />
          ) : (
            <div>Empty</div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  receiptSaleDetail: state.receiptStore.receiptSaleDetail,
});

const mapDispatchToProps = (dispatch) => ({
  getReceiptSaleDetail: (receiptID) =>
    dispatch(getReceiptSaleDetail(receiptID)),
  setReceiptSaleDetail: (receipt) => dispatch(setReceiptSaleDetail(receipt)),
  setOrgClient: (client) => dispatch(setOrgClient(client)),
  putCartDetail: (cartId, items) => dispatch(putCartDetail(cartId, items)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrgReceiptDetailModule);
