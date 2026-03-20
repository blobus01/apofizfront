import React from 'react';
import * as Yup from "yup";
import {translate} from "@locales/locales";
import AddressFormView from "@views/AddressFormView";
import {Formik} from "formik";
import MobileTopHeader from "@components/MobileTopHeader";
import WideButton from "@ui/WideButton";
import classNames from "classnames";
import {ERROR_MESSAGES} from "@common/messages";
import classes from "./index.module.scss";

const FIELDS = Object.freeze({
  address: 'address',
  phone: 'phone',
  apartment: 'apartment',
  intercom: 'intercom',
  entrance: 'entrance',
  floor: 'floor',
  comment: 'comment',
  location: 'location',
})

const VALIDATION_SCHEMA = Yup.object({
  [FIELDS.address]: Yup.string().required(' '),
  [FIELDS.phone]: Yup.string().required(' ').max(50, ERROR_MESSAGES.max_message_limit),
  [FIELDS.apartment]: Yup.string(),
  [FIELDS.intercom]: Yup.string(),
  [FIELDS.entrance]: Yup.string(),
  [FIELDS.floor]: Yup.string(),
  [FIELDS.comment]: Yup.string().max(150),
})

const AddressForm = ({onSubmit, onBack, onDelete, isDeleting, initialValues={}}) => {
  return (
    <Formik
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
      initialValues={{
        address: initialValues.address ?? '',
        apartment: initialValues.apartment ?? '',
        intercom: initialValues.intercom ?? '',
        entrance: initialValues.entrance ?? '',
        floor: initialValues.floor ?? '',
        phone: initialValues.phone ?? '',
        comment: initialValues.comment ?? '',
        location: initialValues.location ?? null,
      }}
    >
      {({isSubmitting, handleSubmit}) => {
        return (
          <form onSubmit={handleSubmit} className={classes.root}>
            <MobileTopHeader
              onBack={onBack}
              title={translate('Адрес доставки', 'shop.deliveryAddress')}
              onSubmit={() => {
              }}
              isSubmitting={isSubmitting}
              style={{
                marginBottom: '2rem'
              }}
            />

            <AddressFormView className="container"/>

            {onDelete && (
              <div className={classNames(classes.controls, 'container')}>
                <WideButton onClick={onDelete} loading={isDeleting}>
                  {translate('Удалить адрес', 'shop.deleteAddress')}
                </WideButton>
              </div>
            )}

          </form>
        )
      }}
    </Formik>
  );
};

export default AddressForm;