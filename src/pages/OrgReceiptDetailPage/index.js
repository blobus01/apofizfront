import React from 'react';
import OrgReceiptDetailModule from "../../containers/OrgReceiptDetailModule";
import qs from "qs";
import {PURCHASE_TYPES, RECEIPT_FOR} from "../../common/constants";
import RentReceiptDetailModule from "../../containers/RentReceiptDetailModule";

const OrgReceiptDetailPage = ({match, location, history, ...rest}) => {
  const {id: orgID, receiptID} = match.params
  const {purchase_type, print} = qs.parse(location.search.replace('?', ''))

  if (purchase_type === PURCHASE_TYPES.rent) {
    return <RentReceiptDetailModule id={receiptID} printMode={print} receiptFor={RECEIPT_FOR.organization} />
  }

  return <OrgReceiptDetailModule orgID={orgID} receiptID={receiptID} history={history} {...rest} />
}

export default OrgReceiptDetailPage;
