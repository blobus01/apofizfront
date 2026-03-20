import React, { Component } from "react";
import qs from "qs";
import moment from "moment";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import MobileTopHeader from "../../components/MobileTopHeader";
import { canGoBack } from "../../common/helpers";
import {
  deleteCart,
  deliverCourierRequest,
  deliverPickupRequest,
  onlinePaymentRequest,
} from "../../store/services/cartServices";
import DeliveryView, { DELIVERY_TYPES } from "../../containers/DeliveryView";
import { Layer } from "../../components/Layer";
import { getCartDetail, setCartDetail } from "../../store/actions/cartActions";
import Preloader from "../../components/Preloader";
import CartControl from "../../components/CartControl";
import SuccessImage from "../../assets/images/success_purchase.png";
import SuccessCourierImage from "../../assets/images/success_courier_delivery.png";
import RoundLink from "../../components/UI/RoundLink";
import { setViews } from "../../store/actions/commonActions";
import { checkoutCartAsEmployee } from "../../store/actions/receiptActions";
import { translate } from "../../locales/locales";
import { EmptyInfo } from "../../components/EmptyInfo";
import "./index.scss";

export const calculateTotalPrice = (cart) => {
  return cart.items.reduce((total, item) => {
    total += item.count * item.item.discounted_price;
    return total;
  }, 0);
};

class CartDetailPage extends Component {
  constructor(props) {
    super(props);
    this.mounted = true;
    this.cartID = props.match.params.id;
    const { to } = qs.parse(props.location.search.replace("?", ""));
    this.state = {
      deliveredBy: null,
      isCheckout: to === "checkout",
    };
  }

  componentDidMount() {
    this.props.getCartDetail(this.cartID);
  }

  render() {
    const { isCheckout, deliveredBy } = this.state;
    const { cartDetail, setViews, history } = this.props;
    const { data, loading } = cartDetail;

    return (
      <div className="cart-detail-page" style={{ marginBottom: "50px" }}>
        <MobileTopHeader
          title={data && data.organization.title}
          style={{
            background: "rgba(255, 255 ,255 , 0.9)",
            backdropFilter: "blur(4px)",
          }}
          onBack={() =>
            canGoBack(history) ? history.goBack() : history.push(`/carts`)
          }
        />
        <div className="container containerMax">
          <div className="cart-detail-page__content">
            {loading ? (
              <Preloader />
            ) : deliveredBy ? (
              this.renderDelivery(deliveredBy)
            ) : (
              this.renderCart(data, setViews)
            )}
          </div>
        </div>

        <Layer isOpen={isCheckout} noTransition>
          {data && (
            <DeliveryView
              cart={data}
              history={history}
              onSubmit={this.onCheckout}
              onEmployeeCheckout={this.onEmployeeCheckout}
              onBack={() =>
                this.setState((prevState) => ({
                  ...prevState,
                  isCheckout: false,
                }))
              }
            />
          )}
        </Layer>
      </div>
    );
  }

  renderCart = (cart) =>
    cart && (
      <CartControl
        data={cart}
        currency={cart.organization.currency}
        updateData={() => this.props.getCartDetail(this.cartID)}
        updateOnItemRemove={true}
        onCheckout={(updatedCart) => {
          this.props.setCartDetail(updatedCart);
          this.setState((prevState) => ({ ...prevState, isCheckout: true }));
        }}
        onLastItemRemove={() => {
          deleteCart(cart.id).then(
            (res) => res && res.success && this.props.history.push("/carts")
          );
        }}
      />
    );

  renderDelivery = (deliveredBy) => {
    return (
      <EmptyInfo
        label={() => (
          <>
            <RoundLink
              to="/profile"
              label="OK"
              className="cart-detail-page__delivery-btn"
            />
            <p className="f-16 f-500">
              {deliveredBy === DELIVERY_TYPES.courier.id
                ? translate(
                    "Заказ успешно оформлен оплата курьеру при доставке",
                    "shop.orderSuccessfullyArrangedCourier"
                  )
                : translate(
                    "Заказ успешно оформлен",
                    "shop.orderSuccessfullyArranged"
                  )}
            </p>
          </>
        )}
        image={
          deliveredBy === DELIVERY_TYPES.courier.id ||
          deliveredBy === DELIVERY_TYPES.online_payment
            ? SuccessCourierImage
            : SuccessImage
        }
        className="cart-detail-page__delivery"
      />
    );
  };

  onEmployeeCheckout = () => {
    if (this.props.cartDetail.data) {
      const { organization } = this.props.cartDetail.data;
      const payload = { utc_offset_minutes: moment().utcOffset() };
      this.props.checkoutCartAsEmployee(this.cartID, payload).then((res) => {
        res &&
          res.success &&
          this.props.history.replace(
            `/organizations/${organization.id}/receipts-sales/${res.data.id}?print=1`
          );
      });
    }
  };

  onCheckout = (values, formikBag) => {
    const { data } = this.props.cartDetail;
    if (data) {
      if (values.type === DELIVERY_TYPES.courier.id) {
        const payload = {
          address: values.address,
          apartment: values.apartment,
          intercom: values.intercom,
          entrance: values.entrance,
          floor: values.floor,
          phone: values.phone,
          comment: values.comment,
          longitude: values.location && values.location.lng,
          latitude: values.location && values.location.lat,
        };

        return deliverCourierRequest(data.id, payload).then((res) => {
          if (res && res.success) {
            return this.setState((prevState) => ({
              ...prevState,
              deliveredBy: values.type,
              isCheckout: false,
            }));
          }
          formikBag.setSubmitting(false);
        });
      }

      if (values.type === DELIVERY_TYPES.pickup.id) {
        return deliverPickupRequest(data.id).then((res) => {
          if (res && res.success) {
            return this.setState((prevState) => ({
              ...prevState,
              deliveredBy: values.type,
              isCheckout: false,
            }));
          }
          formikBag.setSubmitting(false);
        });
      }

      if (values.type === DELIVERY_TYPES.online_payment.id) {
        const payload = {
          address: values.address,
          apartment: values.apartment,
          intercom: values.intercom,
          entrance: values.entrance,
          floor: values.floor,
          phone: values.phone,
          comment: values.comment,
          longitude: values.location && values.location.lng,
          latitude: values.location && values.location.lat,
        };

        return onlinePaymentRequest(data.id, payload, {
          utc_offset_minutes: data.organization?.payment_with_confirmation
            ? null
            : moment().utcOffset(),
        }).then((res) => {
          if (res && res.success) {
            if (data.organization?.payment_with_confirmation) {
              return this.setState((prevState) => ({
                ...prevState,
                deliveredBy: values.type,
                isCheckout: false,
              }));
            } else {
              this.props.history.push(
                `/organizations/${data.organization?.id}/receipts/${res.data.transaction_id}/payment`
              );
            }
          }
          formikBag.setSubmitting(false);
        });
      }
    }
  };
}

const mapStateToProps = (state) => ({
  cartDetail: state.cartStore.cartDetail,
});

const mapDispatchToProps = (dispatch) => ({
  getCartDetail: (cartID) => dispatch(getCartDetail(cartID)),
  setCartDetail: (cart) => dispatch(setCartDetail(cart)),
  checkoutCartAsEmployee: (cartID, payload) =>
    dispatch(checkoutCartAsEmployee(cartID, payload)),
  setViews: (view) => dispatch(setViews(view)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CartDetailPage));
