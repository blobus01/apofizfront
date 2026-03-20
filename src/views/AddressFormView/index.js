import React from 'react';
import {useFormikContext} from "formik";
import {InputTextField} from "@ui/InputTextField";
import {translate} from "@locales/locales";
import TextareaField from "@ui/TextareaField";
import RowButton, {ROW_BUTTON_TYPES} from "@ui/RowButton";
import {useIntl} from "react-intl";
import {setViews} from "@store/actions/commonActions";
import {VIEW_TYPES} from "@components/GlobalLayer";
import {useDispatch} from "react-redux";
import classes from "./index.module.scss"
import classNames from "classnames";
import PropTypes from "prop-types";

const FIELDS = Object.freeze({
  address: 'address',
  phone: 'phone',
  apartment: 'apartment',
  intercom: 'intercom',
  entrance: 'entrance',
  floor: 'floor',
  comment: 'comment',
})

const AddressFormView = ({onMapClick, fieldsInfo, ...rest}) => {
  const dispatch = useDispatch()
  const formik = useFormikContext()
  const intl = useIntl()
  const {values, handleChange, touched, errors, setFieldValue} = formik

  const handleMapClick = () => {
    dispatch(setViews({
      type: VIEW_TYPES.map,
      onChange: async location => {
        setFieldValue('location', {
          latitude: location && location.lat,
          longitude: location && location.lng
        })
      },
      location: {
        latitude: values.location && values.location.latitude,
        longitude: values.location && values.location.longitude
      }
    }))
  }

  return (
    <div {...rest}>
      <InputTextField
        name="address"
        label={translate("Адрес", "org.organizationAddress")}
        value={values.address}
        onChange={handleChange}
        error={errors.address && touched.address && errors.address}
        required
        className={classes.input}
      />

      <div className={classes.row}>
        <InputTextField
          name="apartment"
          label={translate("Кв/Офис", "shop.apartment")}
          value={values.apartment}
          onChange={handleChange}
          error={errors.apartment && touched.apartment && errors.apartment}
          className={classes.rowElement}
        />
        <InputTextField
          name="intercom"
          label={translate("Домофон", "shop.intercom")}
          value={values.intercom}
          onChange={handleChange}
          error={errors.intercom && touched.intercom && errors.intercom}
          className={classes.rowElement}
        />
        <InputTextField
          name="entrance"
          label={translate("Подъезд", "shop.entrance")}
          value={values.entrance}
          onChange={handleChange}
          error={errors.entrance && touched.entrance && errors.entrance}
          className={classes.rowElement}
        />
        <InputTextField
          name="floor"
          label={translate("Этаж", "shop.floor")}
          value={values.floor}
          onChange={handleChange}
          error={errors.floor && touched.floor && errors.floor}
          className={classes.rowElement}
        />
      </div>

      <InputTextField
        name="phone"
        type="tel"
        inputMode="numeric"
        label={translate("Телефон", "app.phone")}
        value={values.phone}
        onChange={handleChange}
        required
        error={errors.phone && touched.phone && errors.phone}
      />


      <div className={classNames(classes.map, values.location && classes.map_filled)}>
        {values.location &&
          <div className={classNames('f-14 f-400', classes.mapLabel)}>{translate("На карте", "app.onMap")}</div>}
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={!values.location ? translate("Указать на карте", "org.markOnMap") : translate('Посмотреть', 'app.see')}
          className={classes.mapBtn}
          onClick={() => onMapClick ?
            onMapClick(values, setFieldValue) : handleMapClick()
          }
          showArrow={false}
        >
        </RowButton>
      </div>

      <TextareaField
        placeholder={intl.formatMessage({id: "shop.comments", defaultMessage: "Комментарий"})}
        name="comment"
        value={values.comment ?? ''}
        onChange={handleChange}
        className="delivery-form__input"
        limit={150}
        error={errors.comment && touched.comment && errors.comment}
      />
    </div>
  );
};

const fieldsInfoObjectTypes = PropTypes.shape({
  name: PropTypes.string,
})

AddressFormView.propTypes = {
  fieldsInfo: PropTypes.shape(
    Object.keys(FIELDS)
      .reduce((shape, field) => {
        shape[field] = fieldsInfoObjectTypes
        return shape
      }, {})
  ),
}

AddressFormView.defaultProps = {
  fieldsInfo: {
    [FIELDS.address]: {name: 'address'},
    [FIELDS.phone]: {name: 'phone'},
    [FIELDS.apartment]: {name: 'apartment'},
    [FIELDS.intercom]: {name: 'intercom'},
    [FIELDS.entrance]: {name: 'entrance'},
    [FIELDS.floor]: {name: 'floor'},
    [FIELDS.comment]: {name: 'comment'},
  }
}

export default AddressFormView;