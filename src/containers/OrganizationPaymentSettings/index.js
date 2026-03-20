import React, { useState } from "react";
import Main from "./views/Main";
import { canGoBack, snakeToCamel } from "../../common/helpers";
import { useHistory } from "react-router-dom";
import PaymentSystemConnectionForm from "./views/PaymentSystemConnectionForm";
import { connectPaymentSystem } from "../../store/services/organizationServices";
import Notify from "../../components/Notification";
import useOrgPaymentSystems from "./useOrgPaymentSystems";
import GeneralSettings from "./views/GeneralSettings";
import PaymentSystemSettings from "./views/PaymentSystemSettings";
import RequestSent from "./views/RequestSent";
import "./index.scss";

const OrganizationPaymentSettings = ({ orgID }) => {
  const history = useHistory();
  const { data: orgPaymentSystems } = useOrgPaymentSystems(orgID);
  const [selectedPaymentSystem, setSelectedPaymentSystem] = useState(null);

  const VIEWS = Object.freeze({
    main: "main",
    payment_system_connection: "payment_system_connection",
    payment_system_settings: "payment_system_settings",
    general_settings: "general_settings",
    request_sent: "request_sent",
  });

  const [view, setView] = useState(VIEWS.main);

  const nextView = (view) => () => {
    setView(view);
  };

  const handlePaymentSystemConnection = async (
    { paymentSystemId, username, phoneNumber, email },
    { setErrors }
  ) => {
    try {
      const res = await connectPaymentSystem(orgID, {
        payment_system_id: paymentSystemId,
        username,
        phone_number: phoneNumber,
        email: email,
      });
      if (res.status === 406) {
        const errors = res.data?.errors;
        const errorKeys = errors ? Object.keys(errors) : null;

        if (errorKeys?.length) {
          return setErrors(
            errorKeys.reduce((acc, errorKey) => {
              acc[snakeToCamel(errorKey)] = errors[errorKey][0];
              return acc;
            }, {})
          );
        }
      }
      setView(VIEWS.request_sent);
    } catch (e) {
      Notify.error({
        text: e.message,
      });
      console.error(e);
    }
  };

  return (
    <div className="organization-payment-settings">
      {view === VIEWS.main && (
        <Main
          onBack={() =>
            canGoBack(history)
              ? history.goBack()
              : history.push(`/organizations/${orgID}/edit-main`)
          }
          onConnect={nextView(VIEWS.payment_system_connection)}
          onSettings={
            !!orgPaymentSystems?.length && nextView(VIEWS.general_settings)
          }
        />
      )}
      {view === VIEWS.payment_system_connection && (
        <PaymentSystemConnectionForm
          orgID={orgID}
          onBack={nextView(VIEWS.main)}
          onSubmit={handlePaymentSystemConnection}
        />
      )}
      {view === VIEWS.general_settings && (
        <GeneralSettings
          onBack={nextView(VIEWS.main)}
          orgID={orgID}
          onPaymentSystemSelect={(PS) => {
            setSelectedPaymentSystem(PS);
            setView(VIEWS.payment_system_settings);
          }}
        />
      )}
      {view === VIEWS.payment_system_settings && (
        <PaymentSystemSettings
          orgPaymentSystems={orgPaymentSystems}
          paymentSystem={selectedPaymentSystem}
          onBack={nextView(VIEWS.general_settings)}
          orgID={orgID}
        />
      )}
      {view === VIEWS.request_sent && (
        <RequestSent
          onBack={nextView(VIEWS.main)}
          onOk={nextView(VIEWS.main)}
        />
      )}
    </div>
  );
};

export default OrganizationPaymentSettings;
