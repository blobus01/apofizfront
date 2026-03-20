import React, {useCallback, useEffect, useState} from 'react';
import {RENT_PAYMENT_METHODS} from "../../common/constants";
import {camelObjectToUnderscore, canGoBack} from "../../common/helpers";
import {bookRent, bookRentOffline} from "../../store/services/rentServices";
import moment from "moment";
import Notify from "../../components/Notification";
import RentForm from "../RentForm";
import Preloader from "../../components/Preloader";
import {useHistory} from "react-router-dom";
import {getPostDetail} from "../../store/services/postServices";

const Rent = ({rentID, onAddClient, ...rest}) => {
  const history = useHistory()

  const [loading, setLoading] = useState(true);
  const [rentDetail, setRentDetail] = useState(null);

  const fetchRentDetail = useCallback(async () => {
    const res = await getPostDetail(rentID)

    if (res && res.success) {
      setLoading(false)
      setRentDetail(res.data)
    }
  }, [rentID]);

  useEffect(() => {
    void fetchRentDetail()
  }, [fetchRentDetail]);

  const handleSubmit = async (values, formikHelpers, onSuccess) => {
    const {organization: {id}} = rentDetail

    const payload = camelObjectToUnderscore({
      organization: id,
      startTime: values.startTime,
      endTime: values.endTime
    })

    const res = values.paymentMethod === RENT_PAYMENT_METHODS.offline ?
      await bookRentOffline(rentDetail.id, {...payload, utc_offset_minutes: moment().utcOffset()})
      :
      await bookRent(rentDetail.id, payload)

    if (!res.success) {
      Notify.error({text: res.message})
      return Promise.reject()
    }

    onSuccess(res)
    return res
  }

  const handleBack = () => {
    canGoBack(history) ?
      history.goBack()
      :
      rentDetail && history.push(`/organizations/${rentDetail.organization.id}`)
  }

  if (loading || !rentDetail) {
    return <Preloader/>
  }

  return (
    <RentForm
      rent={rentDetail}
      onAddClient={onAddClient}
      onSubmit={handleSubmit}
      onBack={handleBack}
      {...rest}
    />
  );
};

export default Rent;