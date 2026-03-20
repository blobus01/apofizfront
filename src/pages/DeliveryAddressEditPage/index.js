import React, {useEffect, useState} from 'react';
import AddressForm from "@components/Forms/AddressForm";
import useDialog from "@ui/Dialog/useDialog";
import {translate} from "@locales/locales";
import {notifyQueryResult} from "@common/helpers";
import {deleteDeliveryAddress, getDeliveryAddress, updateDeliveryAddress} from "@store/services/userServices";
import Preloader from "@components/Preloader";

const DeliveryAddressEditPage = ({history, match}) => {
  const {id} = match.params
  const [isDeleting, setIsDeleting] = useState(false);
  const {confirm} = useDialog()

  const [address, setAddress] = useState(null);

  const handleSubmit = async values => {
    const {location, ...payload} = values
    const res = await notifyQueryResult(updateDeliveryAddress(id, {
      ...payload,
      latitude: location?.latitude,
      longitude: location?.longitude,
    }))

    if (res?.success) {
      history.goBack()
    }
  }

  const handleDelete = async () => {
    try {
      await confirm({
        title: translate('Адрес по умолчанию', 'shop.defaultAddress'),
        description: translate('Назначить данный адрес по умолчанию, вы всегда сможете сменить на другой\n\nВы уверенны ?', 'dialog.deliveryAddressDeletionDesc'),
        confirmTitle: translate('Да', 'app.yes')
      })

      setIsDeleting(true)

      const res = await notifyQueryResult(deleteDeliveryAddress(id), {
        successMsg: translate('Адрес удалён', 'notify.addressDeleted')
      })

      if (res?.success) {
        history.goBack()
      } else {
        setIsDeleting(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    notifyQueryResult(getDeliveryAddress(id))
      .then(res => res?.success ?
        setAddress(res.data) :
        history.goBack()
      )
  }, [history, id]);

  if (!address) return <Preloader style={{marginTop: '1rem'}}/>

  const {full_location, ...initialValues} = address

  return (
    <div>
      <AddressForm
        onSubmit={handleSubmit}
        onBack={() => history.goBack()} onDelete={handleDelete}
        isDeleting={isDeleting}
        initialValues={{
          ...initialValues,
          location: full_location
        }}
      />
    </div>
  );
};

export default DeliveryAddressEditPage;