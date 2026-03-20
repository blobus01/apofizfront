import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {notifyQueryResult} from "../../../../common/helpers";
import {getEventReceipts, getEventSalesExcel} from "../../../../store/services/eventServices";
import useInfiniteScrollQuery from "../../../../hooks/useInfiniteScrollQuery";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../../components/Preloader";
import ReceiptList from "../../../../components/ReceiptList";
import {getUserStatisticEventSaleTotals} from "../../../../store/actions/statisticActions";
import ReceiptListControls from "../../../../components/ReceiptListControls";

const Receipts = ({eventID, orgID, search}) => {
  const dispatch = useDispatch()
  const stats = useSelector(state => state.statisticStore.userStatisticEventSaleTotals)

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const fetchReceipts = async params => {
    return notifyQueryResult(getEventReceipts(eventID, params))
  }

  const handleExcelTransactionsDownload = () => {
    return getEventSalesExcel(eventID, {
      start_time: start,
      end_time: end,
    })
  }

  const {data: receipts, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => fetchReceipts({...params, search, start, end}),
    [eventID, search, start, end],
  )

  useEffect(() => {
    dispatch(getUserStatisticEventSaleTotals({start, end, item: eventID}))
  }, [dispatch, eventID, start, end]);

  return (
    <div className="event-detail-statistics-module__receipts-tab">
      <ReceiptListControls
        start={start}
        end={end}
        setStart={setStart}
        setEnd={setEnd}
        stats={stats}
        getExcelFile={handleExcelTransactionsDownload}
        className="event-detail-statistics-module__controls container"
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
            to: `/organizations/${orgID}/receipts/${receipt.id}`
          })}
        />
      </InfiniteScroll>
    </div>
  );
};

export default Receipts;