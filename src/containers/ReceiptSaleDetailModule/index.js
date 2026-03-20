import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import useDialog from "../../components/UI/Dialog/useDialog";
import React, { useCallback, useEffect, useState } from "react";
import qs from "qs";
import {
  getOrganizationTitle,
  setOrgClient,
} from "@store/actions/organizationActions";
import {
  getReceiptSaleDetail,
  setReceiptSaleDetail,
} from "@store/actions/receiptActions";
import {
  acceptOnlinePaymentReceipt,
  acceptOnlineReceipt,
  changeItemCountInReceipt,
  rejectOnlineReceipt,
} from "@store/services/receiptServices";
import {
  DELIVERY_STATUSES,
  DELIVERY_TYPES,
  PAYMENT_STATUSES,
  RECEIPT_FOR,
  RECEIPT_STATUSES,
} from "@common/constants";
import { translate } from "@locales/locales";
import { getMobileAppLink } from "@common/helpers";
import MobileTopHeader from "@components/MobileTopHeader";
import { PrintIcon } from "@ui/Icons";
import Preloader from "@components/Preloader";
import ReceiptDetail from "@components/ReceiptDetail";
import usePrint from "@hooks/usePrint";
import ReceiptToPrint from "@components/ReceiptToPrint";
import "./index.scss";

const ReceiptSaleDetailModule = (props) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const { orgID, receiptID } = props;
  const { confirm, alert } = useDialog();
  const [loading, setLoading] = useState(true);
  const [printView, setPrintView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canGoBack, setCanGoBack] = useState(true);
  const print = usePrint();

  const { receiptSaleDetail, orgTitle } = useSelector(
    (state) => ({
      receiptSaleDetail: state.receiptStore.receiptSaleDetail,
      orgTitle: state.organizationStore.orgTitle,
    }),
    shallowEqual
  );

  const organization = useSelector(
    (state) => state.receiptStore.receiptSaleDetail?.organization
  );

  console.log("ORG RECIPEIPTS DETAIL", receiptSaleDetail);

  const onInit = useCallback(async () => {
    try {
      const queryParams = qs.parse(location.search.replace("?", ""));
      const { print, can_go_back } = queryParams;

      if (print) {
        setPrintView(true);
      }
      if (can_go_back === "false") {
        setCanGoBack(false);
      }

      if (Object.keys(queryParams).length) {
        history.replace(location.pathname);
      }

      orgID && dispatch(getOrganizationTitle(orgID));

      await dispatch(getReceiptSaleDetail(receiptID));
    } finally {
      setLoading(false);
    }
  }, [dispatch, location.search, location.pathname, history, orgID, receiptID]);

  useEffect(() => {
    onInit().catch(console.error);
  }, [onInit]);

  const onAccept = async (receipt) => {
    try {
      setIsProcessing(true);
      const res = await changeItemCountInReceipt(receipt.cart.id, {
        items: receipt.cart.items.map((i) => ({
          item: i.item.id,
          count: i.count,
          size: i.size?.id,
        })),
      });
      if (res && res.success) {
        const response =
          receipt.delivery_type === DELIVERY_TYPES.online_payment
            ? await acceptOnlinePaymentReceipt(receipt.id)
            : await acceptOnlineReceipt(receipt.id);
        response &&
          response.success &&
          dispatch(
            setReceiptSaleDetail({
              ...receipt,
              status: RECEIPT_STATUSES.accepted,
            })
          );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const onReject = async (receipt) => {
    try {
      const { delivery_info } = receipt;
      const isTakenForDelivery = !!(
        delivery_info &&
        delivery_info.status ===
          DELIVERY_STATUSES.delivery_status_taken_for_delivery
      );

      if (isTakenForDelivery) {
        await alert({
          title: translate(
            "Чек, который принят к доставке не возможно удалить",
            "dialog.rejectAcceptedReceipt"
          ),
        });
      } else {
        await confirm({
          title: translate(
            "Вы уверены, что хотите отменить данный заказ?",
            "dialog.rejectOrder"
          ),
        });
        setIsProcessing(true);
        const res = await rejectOnlineReceipt(receipt.id);
        res &&
          res.success &&
          dispatch(
            setReceiptSaleDetail({
              ...receipt,
              status: RECEIPT_STATUSES.rejected,
              payment_status:
                receipt.payment_status === PAYMENT_STATUSES.accepted
                  ? PAYMENT_STATUSES.refunded
                  : receipt.payment_status,
            })
          );
      }
    } catch (e) {
    } finally {
      setIsProcessing(false);
    }
  };

  const onUpdateCart = (cart) => {
    dispatch(
      setReceiptSaleDetail({
        ...receiptSaleDetail,
        cart,
        savings: cart.totals.original_price - cart.totals.discounted_price,
        original_amount: cart.totals.original_price,
        final_amount: cart.totals.discounted_price,
      })
    );
  };

  const printReceipt = () => {
    print(<ReceiptToPrint data={receiptSaleDetail} />);
  };

  const mobileAppLink = getMobileAppLink();

  return (
    <div className="receipt-sale-detail-module">
      <MobileTopHeader
        onBack={canGoBack ? () => history.goBack() : undefined}
        title={
          receiptSaleDetail &&
          translate("Чек {id}", "receipts.billNumber", {
            id: receiptSaleDetail.id,
          })
        }
        renderRight={() =>
          printView ? (
            <a
              href={`/organizations/${orgID}`}
              className="receipt-sale-detail-module__ready f-16 f-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              {translate("Готово", "app.ready")}
            </a>
          ) : mobileAppLink ? (
            <a href={mobileAppLink} style={{ width: "24px", height: "24px" }}>
              <PrintIcon />
            </a>
          ) : (
            receiptSaleDetail &&
            receiptSaleDetail.status !== RECEIPT_STATUSES.in_progress && (
              <button
                onClick={() => printReceipt()}
                style={{ width: "24px", height: "24px" }}
              >
                <PrintIcon />
              </button>
            )
          )
        }
      />
      <div className="receipt-sale-detail-module__content">
        <div className="container" style={{ maxWidth: "600px" }}>
          {loading ? (
            <Preloader />
          ) : receiptSaleDetail ? (
            <ReceiptDetail
              organizationID={orgTitle && orgTitle.id}
              receipt={receiptSaleDetail}
              organization={receiptSaleDetail.organization}
              processedBy={receiptSaleDetail}
              client={receiptSaleDetail.client}
              type={RECEIPT_FOR.organization}
              onClientClick={() => {
                dispatch(setOrgClient(receiptSaleDetail.client));
                history.push(
                  `/organizations/${orgID}/client/${receiptSaleDetail.client.id}?src=client`
                );
              }}
              onAccept={() => onAccept(receiptSaleDetail)}
              onReject={() => onReject(receiptSaleDetail)}
              onPrint={() => printReceipt(receiptSaleDetail)}
              printView={printView && !mobileAppLink}
              isProcessing={isProcessing}
              onUpdateCart={onUpdateCart}
              className="receipt-sale-detail-module__receipt"
            />
          ) : (
            <div>Empty</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptSaleDetailModule;
