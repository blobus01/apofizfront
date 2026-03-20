import React, {useMemo} from 'react';
import {useParams} from "react-router-dom";
import qs from "qs";
import RentReceiptDetailModule from "../../containers/RentReceiptDetailModule";
import {RECEIPT_FOR} from "../../common/constants";

const RentReceiptDetailPage = ({location}) => {
  const {id} = useParams()
  const query = qs.parse(location.search.replace('?', ''));

  const receiptFor = useMemo(() => {
    const {receipt_for} = qs.parse(location.search.replace('?', ''))

    if (!receipt_for) return undefined
    if (receipt_for in RECEIPT_FOR){
      return receipt_for
    }
    return undefined
  }, [location]);

  return <RentReceiptDetailModule id={id} printMode={!!(query && query.print)} receiptFor={receiptFor}/>
};

export default RentReceiptDetailPage;