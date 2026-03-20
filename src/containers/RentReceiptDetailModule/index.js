import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {RECEIPT_FOR, RECEIPT_STATUSES} from '@common/constants';
import {getRentReceiptDetail, setRentReceiptDetail} from '@store/actions/receiptActions';
import Notify from "../../components/Notification";
import {acceptOnlineBookingReceipt, rejectOnlineBookingReceipt} from '@store/services/receiptServices';
import {canGoBack} from '@common/helpers';
import {translate} from '@locales/locales';
import MobileTopHeader from "../../components/MobileTopHeader";
import {PrintIcon} from '@ui/Icons';
import Preloader from "../../components/Preloader";
import RentReceiptDetail from "../../components/RentReceiptDetail";
import usePrint from '@hooks/usePrint'
import ReceiptToPrint from '@components/ReceiptToPrint'

import "./index.scss"

const RentReceiptDetailModule = ({id, printMode, receiptFor}) => {
  const dispatch = useDispatch()

  const history = useHistory()

  const isPrintMode = printMode;

  const {loading, data: receiptDetail} = useSelector(state => state.receiptStore.rentReceiptDetail)

  const print = usePrint()

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getRentReceiptDetail(id)).then(res => {
      if (!res.success) {
        Notify.error({
          text: res.message
        })
      }
    })

    return () => {
      dispatch(setRentReceiptDetail(null))
    }
  }, [dispatch, id]);


  const handleAccept = async () => {
    setIsSubmitting(true)
    const res = await acceptOnlineBookingReceipt(id)
    if (!res.success) {
      Notify.error({
        text: res.message
      })
    }

    dispatch(setRentReceiptDetail({
      status: RECEIPT_STATUSES.accepted
    }))
    setIsSubmitting(false)
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    const res = await rejectOnlineBookingReceipt(id)
    if (!res.success) {
      Notify.error({
        text: res.message
      })
    }
    dispatch(setRentReceiptDetail({
      status: RECEIPT_STATUSES.rejected
    }))
    setIsSubmitting(false)
  }

  const handlePrint = () => {
    print(<ReceiptToPrint
      data={receiptDetail}
    />)
  }

  const handleBack = () => {
    history.goBack()
  }

  const handleSubmit = () => {
    const id = receiptDetail?.organization?.id
    if (id) {
      canGoBack(history) ? history.goBack() : history.push(`/organizations/${id}`)
    }
  }

  let title = receiptDetail && translate(`Чек ${receiptDetail.id}`, "receipts.billNumber", {
    id: receiptDetail.id
  })

  if (isPrintMode) {
    title = translate('Печать чека', 'receipts.print')
  }

  const canPrint = receiptDetail &&
    receiptDetail.status !== RECEIPT_STATUSES.in_progress &&
    receiptFor === RECEIPT_FOR.organization

  return (
    <div className="rent-receipt-detail-module">
      <MobileTopHeader
        onBack={isPrintMode ? undefined : handleBack}
        title={title}
        nextLabel={translate('Готово', 'app.ready')}
        renderRight={() => canPrint && !isPrintMode && (
          <button onClick={handlePrint}>
            <PrintIcon/>
          </button>
        )}
        onNext={isPrintMode ? handleSubmit : undefined}
      />
      {!receiptDetail || loading ? <Preloader /> : (
        <div className="rent-receipt-detail-module__content">
          <div className="rent-receipt-detail-module__container container">
            <RentReceiptDetail
              receiptDetail={receiptDetail}
              onAccept={handleAccept}
              onReject={handleReject}
              onPrint={isPrintMode ? handlePrint : undefined}
              receiptFor={receiptFor}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );

};

export default RentReceiptDetailModule