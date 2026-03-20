import React, {useState} from 'react';
import {useFormik} from "formik";
import PaymentSystemSelection from "./views/PaymentSystemSelection";
import * as Yup from "yup";
import {ERROR_MESSAGES} from "../../../../common/messages";
import Main from "./views/Main";

const PaymentSystemConnectionForm = ({orgID, onBack, onSubmit}) => {
  const phoneRegExp = /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/
  const VALIDATION_SCHEMA = Yup.object().shape({
    username: Yup.string().required(ERROR_MESSAGES.fullname_empty()),
    email: Yup.string()
      .email(ERROR_MESSAGES.email_format)
      .required(ERROR_MESSAGES.email_empty),
    phoneNumber: Yup.string()
      .matches(phoneRegExp, ERROR_MESSAGES.phone_format)
      .required(ERROR_MESSAGES.phone_empty),
    paymentSystemId: Yup.number()
      .required()
  });
  const VIEWS = Object.freeze({
    selection: 'selection',
    main: 'main',
  })

  const [view, setView] = useState(VIEWS.selection);
  const [selectedPaymentSystem, setSelectedPaymentSystem] = useState(null);

  const formik = useFormik({
    initialValues: {
      paymentSystemId: null,
      username: '',
      phoneNumber: '+',
      email: '',
    },
    onSubmit,
    validationSchema: VALIDATION_SCHEMA
  })

  return (
    <form onSubmit={formik.handleSubmit}>
      {view === VIEWS.selection && (
        <PaymentSystemSelection
          orgID={orgID}
          onBack={onBack}
          onSelect={paymentSystem => {
            formik.setFieldValue('paymentSystemId', paymentSystem.id)
            setSelectedPaymentSystem(paymentSystem)
            setView(VIEWS.main)
          }}
        />
      )}
      {view === VIEWS.main && (
        <Main
          onChange={formik.handleChange}
          isSubmitting={formik.isSubmitting}
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          title={selectedPaymentSystem?.name}
          onBack={() => setView(VIEWS.selection)}
        />
      )}
    </form>
  );
};

export default PaymentSystemConnectionForm;