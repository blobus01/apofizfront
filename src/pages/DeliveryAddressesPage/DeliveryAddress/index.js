import React from "react";
import classNames from "classnames";
import {translate} from "@locales/locales";
import RoundCheckmarkIcon from "@ui/Icons/RountCheckmarkIcon";
import {MenuDots} from "@ui/Icons";
import {InputTextField} from "@ui/InputTextField";
import RowButton, {ROW_BUTTON_TYPES} from "@ui/RowButton";
import TextareaField from "@ui/TextareaField";
import {setViews} from "@store/actions/commonActions";
import {VIEW_TYPES} from "@components/GlobalLayer";
import {useDispatch} from "react-redux";
import DivButton from "@components/DivButton";

import localClasses from "./index.module.scss"
import externalClasses from "@views/AddressFormView/index.module.scss";

const classes = {
  ...externalClasses,
  ...localClasses,
}

const DeliveryAddress = ({address, onMenuOpen, onClick, ...rest}) => {
  const dispatch = useDispatch()
  const {full_location: location} = address

  const handleMapClick = e => {
    if (location) {
      dispatch(setViews({
        type: VIEW_TYPES.map,
        location: {
          latitude: location && location.latitude,
          longitude: location && location.longitude
        }
      }))
      onClick && e.stopPropagation()
    }
  }

  const content = (
    <div className="container">
      <div className={classNames('row', classes.top)}>
        <h5
          className={classNames(classes.title, address.by_default && classes.title_selected)}>
          {address.by_default ?
            translate('Адрес по умолчанию', 'shop.addressByDefault') :
            translate('Адрес доставки', 'shop.deliveryAddress')}

          {address.by_default && (
            <RoundCheckmarkIcon style={{marginLeft: '0.3em'}}/>
          )}
        </h5>

        {onMenuOpen && (
          <button type="button" onClick={e => {
            e.stopPropagation()
            onMenuOpen(e)
          }}>
            <MenuDots/>
          </button>
        )}
      </div>

      <InputTextField
        name="address"
        label={translate("Адрес", "org.organizationAddress")}
        value={address.address}
        className={classes.input}
        readonly
      />

      {(address.apartment || address.intercom || address.entrance || address.floor) && (
        <div className={classes.row}>
          {address.apartment && (
            <InputTextField
              name="apartment"
              label={translate("Кв/Офис", "shop.apartment")}
              value={address.apartment}
              className={classes.rowElement}
              readonly
            />
          )}

          {address.intercom && (
            <InputTextField
              name="intercom"
              label={translate("Домофон", "shop.intercom")}
              value={address.intercom}
              className={classes.rowElement}
              readonly
            />
          )}

          {address.entrance && (
            <InputTextField
              name="entrance"
              label={translate("Подъезд", "shop.entrance")}
              value={address.entrance}
              className={classes.rowElement}
              readonly
            />
          )}

          {address.floor && (
            <InputTextField
              name="floor"
              label={translate("Этаж", "shop.floor")}
              value={address.floor}
              className={classes.rowElement}
              readonly
            />
          )}
        </div>
      )}


      <InputTextField
        name="phone"
        label={translate("Телефон", "app.phone")}
        value={address.phone}
        required
        readonly
      />


      <div className={classNames(classes.map, classes.map_filled)}>
        <div className={classNames('f-14 f-400', classes.mapLabel)}>{translate("На карте", "app.onMap")}</div>
        <RowButton
          type={ROW_BUTTON_TYPES.button}
          label={!location ? translate("Не указан", "app.notSpecified") : translate("Посмотреть на карте", "app.showOnMap")}
          className={classNames(classes.mapBtn, location && classes.mapBtn_active)}
          showArrow={false}
          onClick={handleMapClick}
        >
        </RowButton>
      </div>

      <TextareaField
        placeholder={translate("Комментарий", "shop.comments")}
        name="comment"
        value={address.comment || translate('Нет данных', 'app.noData')}
        className={classNames(classes.comment)}
        readonly
      />
    </div>
  )

  if (onClick) return (
    <DivButton className={classes.root} onClick={onClick} {...rest}>
      {content}
    </DivButton>
  )

  return (
    <div className={classes.root} {...rest}>
      {content}
    </div>
  )
}

export default DeliveryAddress