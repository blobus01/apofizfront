import React, { useState } from "react";
import { NOTIFICATION_TYPES } from "./types";
import LoadingButton from "../../UI/LoadingButton";
import { translate } from "../../../locales/locales";
import {
  rejectProductPayment,
  rejectRentalPayment,
} from "../../../store/services/receiptServices";
import Notify from "../../Notification";
import { useHistory } from "react-router-dom";
import { notifyQueryResult } from "../../../common/helpers";
import {
  acceptResumeRequestFromOrganization,
  declineResumeRequestFromOrganization,
  acceptResumeRequestFromUser,
  declineResumeRequestFromUser,
} from "../../../store/services/resumeServices";

const NotificationCardControls = React.forwardRef(
  (props, notificationCardRef) => {
    const { notification, refreshNotifications } = props;
    const { type } = notification;

    let content;

    const hideNotificationCard = () => {
      if (notificationCardRef.current) {
        notificationCardRef.current.classList.add("hidden");
      }
    };

    const controlsProps = {
      hideNotificationCard,
      notification,
      refreshNotifications,
      ...props,
    };

    switch (type) {
      case NOTIFICATION_TYPES.accepted_rental_client:
        content = (
          <PaymentControls
            rejectPayment={rejectRentalPayment}
            {...controlsProps}
          />
        );
        break;
      case NOTIFICATION_TYPES.accepted_online_order_client:
        content = (
          <PaymentControls
            rejectPayment={rejectProductPayment}
            {...controlsProps}
          />
        );
        break;
      case NOTIFICATION_TYPES.requested_resume:
        content = <ResumeAcceptanceControls {...controlsProps} isFromUser />;
        break;
      case NOTIFICATION_TYPES.organization_requested_resume:
        content = <ResumeAcceptanceControls {...controlsProps} />;
        break;
      default:
        content = null;
    }

    return content ? (
      <div
        className="notification-card__controls-wrapper"
        onClick={(e) => e.preventDefault()}
      >
        {content}
      </div>
    ) : (
      content
    );
  }
);

const PaymentControls = ({
  notification,
  refreshNotifications,
  rejectPayment,
  hideNotificationCard,
}) => {
  const history = useHistory();
  const { extra_data, organization } = notification;
  const { transaction_id } = extra_data;

  const [currentAction, setCurrentAction] = useState(null);

  const handleBtnClick = async (e, action) => {
    if (action === "payment") {
      return history.push(
        `/organizations/${organization.id}/receipts/${transaction_id}/payment`
      );
    }

    if (typeof rejectPayment !== "function") return;

    setCurrentAction(action);

    const res = await rejectPayment(transaction_id);

    if (res.success) {
      setTimeout(() => {
        typeof refreshNotifications === "function" && refreshNotifications();
      }, 1000);
      hideNotificationCard();
    } else {
      Notify.error({
        text: res.error,
      });
    }
    setCurrentAction(null);
  };

  return (
    <div>
      <LoadingButton
        className="notification-card__actions__action notification-card__actions-submit f-14 f-500"
        onClick={(e) => handleBtnClick(e, "payment")}
        loading={currentAction === "payment"}
        loaderColor="#fff"
        disabled={currentAction}
      >
        {translate("Оплатить", "app.pay")}
      </LoadingButton>
      <LoadingButton
        className="notification-card__actions__action notification-card__actions-decline f-14 f-500"
        onClick={(e) => handleBtnClick(e, "rejection")}
        loading={currentAction === "rejection"}
        disabled={currentAction}
      >
        {translate("Отклонить", "app.reject")}
      </LoadingButton>
    </div>
  );
};

const ACCEPTANCE_ACTIONS = Object.freeze({
  accept: "accept",
  reject: "reject",
});

const ResumeAcceptanceControls = ({
  notification,
  refreshNotifications,
  hideNotificationCard,
  isFromUser = false,
}) => {
  const { extra_data } = notification;
  const { resume_request_id } = extra_data;

  const accept = () => {
    const payload = {
      resume_request_id,
    };
    return isFromUser
      ? acceptResumeRequestFromUser(payload)
      : acceptResumeRequestFromOrganization(payload);
  };

  const reject = () => {
    const payload = {
      resume_request_id,
    };
    return isFromUser
      ? declineResumeRequestFromUser(payload)
      : declineResumeRequestFromOrganization(payload);
  };

  const callAction = async (action) => {
    const res = await notifyQueryResult(
      action === ACCEPTANCE_ACTIONS.accept ? accept() : reject(),
      { notifySuccessRes: true }
    );

    if (res && res.success) {
      hideNotificationCard();
    }
    refreshNotifications();
  };

  return (
    <AcceptanceControls
      onAccept={() => callAction(ACCEPTANCE_ACTIONS.accept)}
      onReject={() => callAction(ACCEPTANCE_ACTIONS.reject)}
    />
  );
};

const AcceptanceControls = ({ onAccept, onReject }) => {
  const [currentAction, setCurrentAction] = useState(null);

  const handleAction = async (action) => {
    setCurrentAction(action);
    if (action === ACCEPTANCE_ACTIONS.accept) {
      await onAccept();
    } else {
      await onReject();
    }
  };

  return (
    <div>
      <LoadingButton
        className="notification-card__actions__action notification-card__actions-accept f-14 f-500"
        onClick={() => handleAction(ACCEPTANCE_ACTIONS.accept)}
        loading={currentAction === ACCEPTANCE_ACTIONS.accept}
        disabled={!!currentAction}
        loaderColor="#fff"
      >
        {translate("Принять", "app.accept")}
      </LoadingButton>
      <LoadingButton
        className="notification-card__actions__action notification-card__actions-decline f-14 f-500"
        onClick={() => handleAction(ACCEPTANCE_ACTIONS.reject)}
        loading={currentAction === ACCEPTANCE_ACTIONS.reject}
        disabled={!!currentAction}
      >
        {translate("Отклонить", "app.reject")}
      </LoadingButton>
    </div>
  );
};

export default NotificationCardControls;
