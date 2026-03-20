import React, {useMemo} from 'react';
import ReceiptDetailModule from "../../containers/ReceiptDetailModule";
import qs from "qs";
import {PURCHASE_TYPES, RECEIPT_FOR} from "../../common/constants";
import RentReceiptDetailModule from "../../containers/RentReceiptDetailModule";

const ReceiptDetailPage = ({location, match, ...rest}) => {
  const {org, purchase_type, print, receipt_for} = qs.parse(location.search.replace('?', ''))
  const {id} = match.params

  const receiptFor = useMemo(() => {
    if (!receipt_for) return undefined
    if (receipt_for in RECEIPT_FOR){
      return receipt_for
    }
    return undefined
  }, [receipt_for]);

  if (purchase_type === PURCHASE_TYPES.rent) {
    return <RentReceiptDetailModule
      id={id}
      receiptFor={receiptFor ?? RECEIPT_FOR.client}
      printMode={!!print}
    />
  }

  return <ReceiptDetailModule
    orgID={org}
    receiptID={id}
    {...rest}
  />
}

export default ReceiptDetailPage