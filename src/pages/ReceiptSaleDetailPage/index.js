import React from 'react';
import {useParams} from "react-router-dom";
import ReceiptSaleDetailModule from "../../containers/ReceiptSaleDetailModule";
import qs from "qs";
import {PURCHASE_TYPES, RECEIPT_FOR} from "../../common/constants";
import RentReceiptDetailModule from "../../containers/RentReceiptDetailModule";

const ReceiptSaleDetailPage = ({location, history}) => {
  const {orgID, receiptID} = useParams();
  const {purchase_type, print} = qs.parse(location.search.replace('?', ''))

  if (!purchase_type || purchase_type === PURCHASE_TYPES.product) {
    return <ReceiptSaleDetailModule orgID={orgID} receiptID={receiptID} />
  }

  if (purchase_type === PURCHASE_TYPES.rent) {
    return <RentReceiptDetailModule
      id={orgID}
      printMode={!!print}
      receiptFor={RECEIPT_FOR.organization}
    />
  }

  return history.goBack()
}

export default ReceiptSaleDetailPage;