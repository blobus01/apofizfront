import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {notifyQueryResult} from "../../../../common/helpers";
import {getOrganizationPurchaseEventReceipts} from "../../../../store/services/eventServices";
import useInfiniteScrollQuery from "../../../../hooks/useInfiniteScrollQuery";
import ReceiptListControls from "../../../../components/ReceiptListControls";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../../components/Preloader";
import ReceiptList from "../../../../components/ReceiptList";
import {getUserEventPurchaseTotals} from "../../../../store/actions/statisticActions";

const Receipts = ({orgID, search}) => {
  const dispatch = useDispatch()
  const stats = useSelector(state => state.statisticStore.userEventPurchaseTotals)

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const fetchReceipts = async params => {
    return notifyQueryResult(getOrganizationPurchaseEventReceipts(params))
  }

  const {data: receipts, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => fetchReceipts({...params, organization: orgID, search, start, end}),
    [orgID, search, start, end],
  )

  const handleExcelTransactionsDownload = () => {}

  useEffect(() => {
    dispatch(getUserEventPurchaseTotals({organization: orgID, start, end}))
  }, [start, end, orgID, dispatch]);

  return (
    <div>
      <ReceiptListControls
        start={start}
        end={end}
        setStart={setStart}
        setEnd={setEnd}
        stats={stats}
        getExcelFile={handleExcelTransactionsDownload}
        className="container"
      />

      <InfiniteScroll
        next={next}
        hasMore={hasMore}
        loader={<Preloader/>}
        dataLength={receipts.length}
        className="container"
      >
        <ReceiptList
          data={receipts}
          generateProps={receipt => ({
            to: `/receipts/${receipt.id}`
          })}
        />
      </InfiniteScroll>
    </div>
  );
};

export default Receipts;