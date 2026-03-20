import React, {useEffect, useState} from 'react';
import MobileTopHeader from "@components/MobileTopHeader";
import {translate} from "@locales/locales";
import RowLink from "@ui/RowLink";
import AddAddressIcon from "@ui/Icons/AddAddressIcon";
import DeliveryAddress from "@pages/DeliveryAddressesPage/DeliveryAddress";
import MobileMenu from "@components/MobileMenu";
import RowButton, {ROW_BUTTON_TYPES} from "@ui/RowButton";
import {EditIcon, ShareIcon} from "@ui/Icons";
import RoundCheckmarkIcon from "@ui/Icons/RountCheckmarkIcon";
import useDialog from "@ui/Dialog/useDialog";
import {getDeliveryAddresses, makeAddressDefault as makeAddressDefaultQuery} from "@store/services/userServices";
import {getGoogleMapLink, notifyQueryResult} from "@common/helpers";
import Preloader from "@components/Preloader";
import {copyTextToClipboard} from "@common/utils";
import Notify from "@components/Notification";
import useSearchParam from "@hooks/useSearchParam";
import {setSelectedAddress} from "@store/actions/commonActions";
import {useDispatch} from "react-redux";
import classes from "./index.module.scss"

const DeliveryAddressesPage = ({history}) => {
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [addressWithOpenMenu, setAddressWithOpenMenu] = useState(null);

  const [mode] = useSearchParam('mode')
  const [cart] = useSearchParam('cart')

  const isSelectMode = mode === 'select'

  const {confirm, alert} = useDialog()

  const isAddressWithOpenMenuDefault = addresses.find(addr => addr.id === addressWithOpenMenu)?.by_default

  const shareAddress = async () => {
    const currentAddress = addresses.find(addr => addr.id === addressWithOpenMenu)

    if (currentAddress) {
      const message = getAddressMessage(currentAddress)
      const sharePayload = {
        text: message,
      };

      try {
        await navigator.share(sharePayload);
      } catch (e) {
        copyTextToClipboard(message, () => Notify.success({text: translate('Адрес скопирован', "dialog.addressCopied")}));
        console.error(e)
        setAddressWithOpenMenu(null)
      }
    }
  }

  const makeAddressDefault = async addressID => {
    try {
      await confirm({
        title: translate('Адрес по умолчанию', 'shop.addressByDefault'),
        description: translate('Назначить данный адрес по умолчанию, вы всегда сможете сменить на другой\n\nВы уверенны ?', 'dialog.makeAddressDefaultDesc'),
        confirmTitle: translate('Да', 'app.yes')
      })

      const res = await notifyQueryResult(makeAddressDefaultQuery(addressID), {
        successMsg: translate('Адрес по умолчанию изменён', 'notify.defaultAddressChanged')
      })

      res?.success && setAddresses(prevAddresses => prevAddresses
        .map(addr => {
          if (addr.id === addressID) return {...addr, by_default: true}

          if (addr.by_default) return {...addr, by_default: false}

          return addr
        })
        .sort((addrA, addrB) => addrB.by_default - addrA.by_default)
      )

    } catch (e) {
      console.error(e)
    }
  }

  const alertAboutDefaultAddress = async () => {
    alert({
      title: translate('Адрес по умолчанию', 'shop.addressByDefault'),
      description: translate('Данный адрес выбран по умолчанию, для смены на другой адрес, Вы можете добавить новый или выбрать из добавленных', 'dialog.defaultAddressDesc')
    })
  }

  const selectAddress = addr  => {
    dispatch(setSelectedAddress(addr))
    history.replace(`/carts/${cart}/?to=checkout`)
  }

  useEffect(() => {
    notifyQueryResult(getDeliveryAddresses())
      .then(res => {
        if (res?.success) {
          setAddresses(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, []);

  return (
    <div className={classes.root}>
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={translate("Адреса доставки", "app.deliveryAddresses")}
        className={classes.header}
      />
      <div className="container">
        <h4 className={classes.subtitle} style={{marginBottom: '0.4rem'}}>
          {translate('Ваши адреса', 'shop.yourAddresses')}
        </h4>
        <RowLink
          label={translate("Добавить новый адрес", "shop.addNewAddress")}
          to="/delivery-addresses/create"
          className={classes.addAddrBtn}
        >
          <AddAddressIcon/>
        </RowLink>
      </div>

      {loading && <Preloader/>}

      {addresses.map(address => {
        return (
          <DeliveryAddress
            address={address}
            onMenuOpen={() => setAddressWithOpenMenu(address.id)}
            onClick={isSelectMode ? () => selectAddress(address) : undefined}
          />
        )
      })}

      <MobileMenu
        isOpen={!!addressWithOpenMenu}
        onClose={() => setAddressWithOpenMenu(null)}
        onRequestClose={() => setAddressWithOpenMenu(null)}
        contentLabel={translate('Адрес доставки', 'shop.deliveryAddress')}
      >
        <RowButton
          type={ROW_BUTTON_TYPES.link}
          label={translate('Редактировать', 'app.toEdit')}
          showArrow={false}
          to={`/delivery-addresses/${addressWithOpenMenu}/edit`}
        >
          <EditIcon/>
        </RowButton>

        <RowButton
          type={ROW_BUTTON_TYPES.button}
          onClick={shareAddress}
          label={translate('Поделиться', 'app.share')}
          showArrow={false}
        >
          <ShareIcon/>
        </RowButton>

        <RowButton
          type={ROW_BUTTON_TYPES.button}
          onClick={() => {
            isAddressWithOpenMenuDefault ?
              void alertAboutDefaultAddress() :
              void makeAddressDefault(addressWithOpenMenu)

            setAddressWithOpenMenu(null)
          }}
          label={
            isAddressWithOpenMenuDefault ?
              translate('Адрес по умолчанию', 'shop.defaultAddress') :
              translate('Назначить по умолчанию', 'shop.assignByDefault')
          }
          showArrow={false}
        >
          <RoundCheckmarkIcon fill="#4285F4" width={24} height={24} style={{padding: 3}}/>
        </RowButton>
      </MobileMenu>
    </div>
  );
};

export default DeliveryAddressesPage;

const getAddressMessage = addr => {
  const fields = [
    [
      translate("Кв/Офис", "shop.apartment"),
      addr.apartment
    ],
    [
      translate("Домофон", "shop.intercom"),
      addr.intercom
    ],
    [
      translate("Подъезд", "shop.entrance"),
      addr.entrance,
    ],
    [
      translate("Этаж", "shop.floor"),
      addr.floor
    ],
    [
      translate("Телефон", "app.phone"),
      addr.phone
    ],
  ]

  if (addr.full_location) {
    const {latitude, longitude} = addr.full_location
    fields.push([
      'GEO',
      getGoogleMapLink(latitude, longitude),
    ])
  }

  fields.push([
    translate("Комментарий", "shop.comments"),
    addr.comment
  ])

  return addr.address + '\n\n' + fields.reduce((str, field) => {
    const fieldStr = field[1] ? `${field[0]}: ${field[1]}\n` : ''
    return str + fieldStr
  }, '')
}