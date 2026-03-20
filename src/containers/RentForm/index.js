import React, {memo, useEffect} from 'react';
import * as Yup from "yup";
import {useFormik} from "formik";
import {DATE_FORMAT_DD_MM_YYYY_HH_MM, QR_PREFIX, RENT_PAYMENT_METHODS, RENT_TIME_TYPES} from "../../common/constants";
import RentOrderingView from "./containers/RentOrderingView";
import CongratsView from "./containers/CongratsView";
import {useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {setRentFormData} from "../../store/actions/rentActions";
import {setViews} from "../../store/actions/commonActions";
import {VIEW_TYPES} from "../../components/GlobalLayer";
import {preprocessBookingTransaction} from "../../store/services/receiptServices";
import {setPreprocessTransaction} from "../../store/actions/receiptActions";
import {removeSecondsAndMilliseconds} from "./helpers";
import {camelObjectToUnderscore} from "../../common/helpers";
import RentTimePicker from "./containers/RentTimePicker";
import moment from "moment";

const RENT_FORM_VIEWS = Object.freeze({
  ...RENT_TIME_TYPES,
  time_picker: 'time_picker',
  ordering: 'ordering',
  congrats: 'congrats',
  discount: 'discount',
})

const VALIDATION_SCHEMA = Yup.object().shape({
  startDate: Yup.date(),
  endDate: Yup.date(),
});

const RentForm = ({rent, initialValues = {}, onAddClient, onSubmit, onBack}) => {
  const {id, rental_period, organization} = rent
  const {
    rent_time_type: rentTimeType,
    start_date: rentalPeriodStartDate,
    start_time: rentalPeriodStartTime,
    end_date: rentalPeriodEndDate,
    end_time: rentalPeriodEndTime,
  } = rental_period

  const dispatch = useDispatch()
  const history = useHistory()

  const rentFormData = useSelector(state => state.rentStore.rentFormData[id])
  const storeData = rentFormData ? rentFormData : {}

  const canIssueCheck = rent.organization.permissions.is_owner || rent.organization.permissions.can_sale

  const formik = useFormik({
    validationSchema: VALIDATION_SCHEMA,
    initialValues: {
      view: RENT_FORM_VIEWS.time_picker,
      startTime: null,
      endTime: null,
      ...storeData,
      paymentMethod: canIssueCheck ? RENT_PAYMENT_METHODS.offline : RENT_PAYMENT_METHODS.online,
      ...initialValues
    },
    onSubmit: (values, formikHelpers) => {
      onSubmit(
        {
          ...values,
          startTime: removeSecondsAndMilliseconds(
            values.startTime.toISOString()
          ),
          endTime: removeSecondsAndMilliseconds(
            values.endTime.toISOString()
          ),
        },
        formikHelpers,
        res => {
          if (values.paymentMethod === RENT_PAYMENT_METHODS.online) {
            formikHelpers.setFieldValue('view', RENT_FORM_VIEWS.congrats)
          } else {
            res.data?.id && history.replace(`/receipts/rent/${res.data?.id}?print=1`)
          }
          dispatch(setRentFormData(id, null))
        }
      )
    }
  })

  const {values, setFieldValue, setValues, handleChange, handleSubmit, isSubmitting} = formik
  const {view, startTime, endTime} = values


  const handleTimePickerSubmit = (startTime, endTime) => {
    setValues({
      ...values,
      startTime,
      endTime,
      view: RENT_FORM_VIEWS.ordering,
    })
  }

  // TODO: move from the form to a parent
  const handleUserIDInput = async userID => {
    if (userID) {
      const payload = {
        client: userID.replace(QR_PREFIX, ''),
        organization: organization.id,
        startTime,
        endTime,
      };
      const res = await preprocessBookingTransaction(id, camelObjectToUnderscore(payload));
      if (res && res.success) {
        dispatch(setPreprocessTransaction({
          ...res.data,
          organization
        }));
        dispatch(setViews([]));
        onAddClient()
      }
    }
  }

  useEffect(() => {
    if (values.view === RENT_FORM_VIEWS.ordering) {
      dispatch(setRentFormData(id, values))
    }
  }, [dispatch, id, values]);

  useEffect(() => {
    return () => {
      if (view !== RENT_FORM_VIEWS.ordering) {
        dispatch(setRentFormData(id, null))
      }
    }
  }, [view, dispatch, id]);

  return (
    <form onSubmit={handleSubmit} style={{height: '100%', paddingBottom: '2em'}}>
      {view === RENT_FORM_VIEWS.time_picker && (
        <RentTimePicker
          rentID={rent.id}
          rentTimeType={rentTimeType}
          rentalPeriodStart={moment(rentalPeriodStartDate + ' ' + rentalPeriodStartTime, DATE_FORMAT_DD_MM_YYYY_HH_MM).toDate()}
          rentalPeriodEnd={moment(rentalPeriodEndDate + ' ' + rentalPeriodEndTime, DATE_FORMAT_DD_MM_YYYY_HH_MM).toDate()}
          onSubmit={handleTimePickerSubmit}
          defaultStartTime={startTime}
          defaultEndTime={endTime}
          defaultView={rentTimeType}
          onBack={onBack}
        />
      )}
      {view === RENT_FORM_VIEWS.ordering && (
        <RentOrderingView
          onBack={() => setFieldValue('view', RENT_FORM_VIEWS.time_picker)}
          rent={rent}
          startTime={startTime}
          endTime={endTime}
          rentTimeType={rentTimeType}
          paymentMethod={values.paymentMethod}
          onPaymentMethodChange={handleChange}
          onAddClient={() => {
            dispatch(setViews({
              type: VIEW_TYPES.qr_scan,
              onScan: userID => handleUserIDInput(userID),
              onInputSubmit: userID => handleUserIDInput(userID)
            }))
          }}
          isSubmitting={isSubmitting}
        />
      )}
      {view === RENT_FORM_VIEWS.congrats && (
        <CongratsView
          onOk={onBack}
        />
      )}
    </form>
  );
};

export default memo(RentForm);