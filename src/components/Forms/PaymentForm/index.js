import React, {useState} from 'react';
import {useFormik} from "formik";
import PaymentSystemSelection from "./views/PaymentSystemSelection";
import {useHistory} from "react-router-dom";
import "./index.scss"

const PaymentForm = ({orgID, onSubmit, onEmptySelection}) => {
  const history = useHistory()
  const VIEWS = Object.freeze({
    payment_system_selection: 'payment_system_selection',

  })
  const [view] = useState(VIEWS.payment_system_selection);

  const formik = useFormik({
    initialValues: {
      paymentSystem: null
    },
    onSubmit
  })

  return (
    <form className="payment-form" onSubmit={formik.handleSubmit}>
      {view === VIEWS.payment_system_selection && <PaymentSystemSelection
        orgID={orgID}
        onBack={() => history.goBack()}
        onSelect={paymentSystemID => {
          if (formik.isSubmitting) return
          formik.setFieldValue('paymentSystem', paymentSystemID)
          void formik.submitForm()
        }}
        isSubmitting={formik.isSubmitting}
        onEmptySelection={onEmptySelection}
      />}
    </form>
  );
};

export default PaymentForm;