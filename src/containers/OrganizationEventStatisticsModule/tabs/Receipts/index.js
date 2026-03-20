import React, {useEffect, useState} from 'react';
import {notifyQueryResult} from "../../../../common/helpers";
import {
  getOrganizationEventReceipts,
  getOrganizationEventSalesExcel
} from "../../../../store/services/eventServices";
import useInfiniteScrollQuery from "../../../../hooks/useInfiniteScrollQuery";
import ReceiptList from "../../../../components/ReceiptList";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../../components/Preloader";
import ReceiptListControls from "../../../../components/ReceiptListControls";
import {getUserStatisticEventSaleTotals} from "../../../../store/actions/statisticActions";
import {useDispatch, useSelector} from "react-redux";

const Receipts = ({orgID, search}) => {
  const dispatch = useDispatch()
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const stats = useSelector(state => state.statisticStore.userStatisticEventSaleTotals)

  const fetchReceipts = async (params) => {
    return notifyQueryResult(getOrganizationEventReceipts(params))
  }

  const {data, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => fetchReceipts({organization: orgID, search, start, end, ...params}),
    [search, start, end],
  )

  const getExcelFile = () => {
    return getOrganizationEventSalesExcel(orgID, {
      start_time: start,
      end_time: end,
    })
  }

  useEffect(() => {
    dispatch(getUserStatisticEventSaleTotals({organization: orgID, start, end}))
  }, [dispatch, orgID, start, end]);

  return (
    <div>
      <ReceiptListControls
        start={start}
        end={end}
        setStart={setStart}
        setEnd={setEnd}
        stats={stats}
        getExcelFile={getExcelFile}
        className="organization-event-statistics-module__receipt-list-controls container"
      />

      <InfiniteScroll
        next={next}
        hasMore={hasMore}
        dataLength={data.length}
        loader={<Preloader/>}
        className="container"
      >
        <ReceiptList
          data={data}
          generateProps={receipt => ({
            to: `/organizations/${orgID}/receipts/${receipt.id}?purchase_type=product`
          })}
        />
      </InfiniteScroll>
    </div>
  );
};

export default Receipts;