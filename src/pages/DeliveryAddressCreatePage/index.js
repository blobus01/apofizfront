import React from 'react';
import AddressForm from "@components/Forms/AddressForm";
import {notifyQueryResult} from "@common/helpers";
import {createDeliveryAddresses} from "@store/services/userServices";

const DeliveryAddressCreatePage = ({history}) => {
  const handleSubmit = async values => {
    const {location, ...payload} = values
    await notifyQueryResult(createDeliveryAddresses({
      ...payload,
      latitude: location?.latitude,
      longitude: location?.longitude,
    }))
    history.goBack()
  }

  return (
    <div>
      <AddressForm onSubmit={handleSubmit} onBack={() => history.goBack()}/>
    </div>
  );
};

export default DeliveryAddressCreatePage;