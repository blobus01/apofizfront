import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { setOrgClient } from "../../store/actions/organizationActions";
import {
  getReceiptSaleDetail,
  setReceiptSaleDetail,
} from "../../store/actions/receiptActions";
import MobileTopHeader from "../../components/MobileTopHeader";
import ReceiptDetail from "../../components/ReceiptDetail";
import Preloader from "../../components/Preloader";
import { DELIVERY_STATUSES, RECEIPT_FOR } from "../../common/constants";
import { EmptyInfo } from "../../components/EmptyInfo";
import TakenImage from "../../assets/images/delivery_taken_for_delivery.png";
import CancelledImage from "../../assets/images/delivery_cancelled_for_delivery.png";
import Button from "../../components/UI/Button";
import { translate } from "../../locales/locales";
import useDialog from "../../components/UI/Dialog/useDialog";
import {
  acceptOrderForDelivery,
  rejectOrderForDelivery,
  setOrderAsDelivered,
} from "../../store/services/deliveryServices";
import "./index.scss";

const ReceiptCourierDetailPage = ({ history }) => {
  const mounted = useRef(true);
  const { confirm } = useDialog();
  const { receiptID, id } = useParams();
  const dispatch = useDispatch();

  const { receiptSaleDetail } = useSelector(
    (state) => state.receiptStore.receiptSaleDetail
  );

  console.log("ORG RECIPEIPTS DETAIL", receiptSaleDetail);

  const [state, setState] = useState({
    loading: true,
    temporaryStatus: null,
  });
  const { temporaryStatus, loading } = state;

  useEffect(() => {
    const getDetails = async () => {
      setState((prevState) => ({ ...prevState, loading: true }));
      await dispatch(getReceiptSaleDetail(receiptID));
      mounted.current && loading && setState({ ...state, loading: false });
    };
    getDetails();
    return () => {
      mounted.current = false;
    };
  }, []);

  const showMessage = (status) => {
    let image = null;
    let label = "";

    switch (status) {
      case DELIVERY_STATUSES.delivery_status_taken_for_delivery:
        image = TakenImage;
        label = () => (
          <div className="empty-info__title f-16 f-600">
            {translate(
              "Вы приняли заказ , клиент получил <i></i> Ваши контакты Хорошей вам доставки !",
              "delivery.infoSetDeliver",
              { i: () => <br /> }
            )}
          </div>
        );
        break;
      case DELIVERY_STATUSES.delivery_status_rejected_by_delivery_service:
        image = CancelledImage;
        label = () => (
          <div className="empty-info__title f-16 f-600">
            {translate(
              "Вы отменили заказ, клиент уведомлен <i></i> Заказ снова доступен к доставке!",
              "delivery.infoRejectDeliver",
              { i: () => <br /> }
            )}
          </div>
        );
        break;
      case DELIVERY_STATUSES.delivery_status_delivered:
        image = TakenImage;
        label = () => (
          <div className="empty-info__title f-16 f-600">
            {translate(
              "Поздравляем вы доставили заказ клиенту !!!",
              "delivery.congratulationDeliver"
            )}
          </div>
        );
        break;
      default:
        return;
    }

    return (
      <div className="receipt-courier-detail-page__temp">
        {status === DELIVERY_STATUSES.delivery_status_delivered && (
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="receipt-courier-detail-page__temp-success"
          >
            <path
              d="M40 8C22.32 8 8 22.32 8 40C8 57.68 22.32 72 40 72C57.68 72 72 57.68 72 40C72 22.32 57.68 8 40 8ZM37.54 58.64H32.18L19.22 40.48L24.584 35.48L34.86 45.08L55.424 21.356L60.784 25.116L37.54 58.64Z"
              fill="#27AE60"
            />
          </svg>
        )}

        <EmptyInfo
          className="receipt-courier-detail-page__temp-info"
          image={image}
          label={label}
        />
        <Button
          label={translate("Вернуться к заказам", "delivery.returnToOrders")}
          onClick={() => history.push("/delivery/available")}
          className="receipt-courier-detail-page__temp-button"
        />
      </div>
    );
  };

  return (
    <div className="receipt-courier-detail-page">
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={
          receiptSaleDetail &&
          translate("Чек {id}", "receipts.billNumber", {
            id: receiptSaleDetail.id,
          })
        }
      />
      <div className="receipt-courier-detail-page__content">
        <div className="container">
          {temporaryStatus ? (
            showMessage(temporaryStatus)
          ) : loading ? (
            <Preloader />
          ) : receiptSaleDetail ? (
            <ReceiptDetail
              receipt={receiptSaleDetail}
              organizationID={
                receiptSaleDetail.organization &&
                receiptSaleDetail.organization.id
              }
              organization={receiptSaleDetail.organization}
              processedBy={receiptSaleDetail}
              client={receiptSaleDetail.client}
              type={RECEIPT_FOR.courier}
              onAcceptOrderForDelivery={async () => {
                try {
                  await confirm({
                    title: "Доставить заказ",
                    description: translate(
                      "Вам нужно будет доставить заказ клиенту. Вы уверены?",
                      "dialog.deliver"
                    ),
                  });

                  const res = await acceptOrderForDelivery(
                    receiptSaleDetail.delivery_info.id
                  );
                  if (res && res.success) {
                    setState((prevState) => ({
                      ...prevState,
                      temporaryStatus:
                        DELIVERY_STATUSES.delivery_status_taken_for_delivery,
                    }));
                    dispatch(
                      setReceiptSaleDetail({
                        ...receiptSaleDetail,
                        delivery_info: {
                          ...receiptSaleDetail.delivery_info,
                          status:
                            DELIVERY_STATUSES.delivery_status_taken_for_delivery,
                        },
                      })
                    );
                  }
                } catch (e) {
                  // do nothing
                }
              }}
              onRejectOrderForDelivery={async () => {
                try {
                  await confirm({
                    title: "Отмена доставки",
                    description: translate(
                      "Вы отменяете заказ, Вы уверенны ?",
                      "dialog.rejectOrderDelivery"
                    ),
                  });

                  const res = await rejectOrderForDelivery(
                    receiptSaleDetail.delivery_info.id
                  );
                  if (res && res.success) {
                    setState((prevState) => ({
                      ...prevState,
                      temporaryStatus:
                        DELIVERY_STATUSES.delivery_status_rejected_by_delivery_service,
                    }));
                    dispatch(
                      setReceiptSaleDetail({
                        ...receiptSaleDetail,
                        delivery_info: {
                          ...receiptSaleDetail.delivery_info,
                          status:
                            DELIVERY_STATUSES.delivery_status_rejected_by_delivery_service,
                        },
                      })
                    );
                  }
                } catch (e) {
                  // do nothing
                }
              }}
              onDeliverOrderForDelivery={async () => {
                try {
                  await confirm({
                    title: "Заказ доставлен ?",
                    description: translate(
                      "Заказ доставлен, \nВы уверенны ?",
                      "dialog.orderDelivered"
                    ),
                  });

                  const res = await setOrderAsDelivered(
                    receiptSaleDetail.delivery_info.id
                  );
                  if (res && res.success) {
                    setState((prevState) => ({
                      ...prevState,
                      temporaryStatus:
                        DELIVERY_STATUSES.delivery_status_delivered,
                    }));
                    dispatch(
                      setReceiptSaleDetail({
                        ...receiptSaleDetail,
                        delivery_info: {
                          ...receiptSaleDetail.delivery_info,
                          status: DELIVERY_STATUSES.delivery_status_delivered,
                        },
                      })
                    );
                  }
                } catch (e) {
                  // do nothing
                }
              }}
              onClientClick={() => {
                dispatch(setOrgClient(receiptSaleDetail.client));
                history.push(
                  `/organizations/${receiptID}/client/${receiptSaleDetail.client.id}?src=client`
                );
              }}
              className="receipt-courier-detail-page__receipt"
            />
          ) : (
            <div>Empty</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptCourierDetailPage;
