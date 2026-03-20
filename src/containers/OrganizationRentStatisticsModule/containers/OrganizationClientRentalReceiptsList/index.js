import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {DEFAULT_LIMIT, RECEIPT_FOR} from "../../../../common/constants";
import {getOrganizationClientReceipts} from "../../../../store/services/receiptServices";
import Notify from "../../../../components/Notification";
import {translate} from "../../../../locales/locales";
import {getUserStatisticRentTotals} from "../../../../store/actions/statisticActions";
import SavingsBlock from "../../../../components/UI/SavingsBlock";
import TimeIntervalSelect from "../../../../components/TimeIntervalSelect";
import DownloadExcelButton from "../../../../components/DownloadExcelButton";
import Preloader from "../../../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import ReceiptCard from "../../../../components/Cards/ReceiptCard";
import "./index.scss"

const OrganizationClientRentalReceiptsList = ({search, orgID}) => {
  const dispatch = useDispatch()
  const stats = useSelector(state => state.statisticStore.userStatisticRentTotals)

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const [receiptsLoading, setReceiptsLoading] = useState(true);
  const [receipts, setReceipts] = useState(null);


  const receiptsPagination = useRef({
    page: 1,
    limit: DEFAULT_LIMIT,
  })

  const queryParams = useMemo(() => {
    return {
      search,
      start,
      end
    }
  }, [search, start, end])

  const getReceipts = useCallback(async (queryParams) => {
    try {
      return await getOrganizationClientReceipts(orgID, queryParams)
    } catch (e) {
      console.error(e.message)
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      return null
    }
  }, [orgID]);

  const getNextReceipts = () => {
    receiptsPagination.current.page += 1
    getReceipts({
      ...queryParams,
      ...receiptsPagination.current
    }).then(res => {
      if (res?.success) {
        setReceipts(prevState => ({
          ...prevState,
          ...res.data,
          list: prevState?.list ?
            prevState.list.concat(res.data.list)
            : res.data.list
        }))
      }
    })
  }

  useEffect(() => {
    void dispatch(getUserStatisticRentTotals({...queryParams, organization: orgID}))

    setReceiptsLoading(true)
    receiptsPagination.current.page = 1

    getReceipts({
      ...queryParams,
      ...receiptsPagination.current
    }).then(res => {
      if (res?.success) {
        setReceipts(res.data)
      }
    }).finally(() => setReceiptsLoading(false))
  }, [queryParams, orgID, dispatch, getReceipts]);

  const hasMore = receipts ? receipts.total_pages !== receiptsPagination.current.page : true


  return (
    <div className="organization-client-rental-receipts-list">
      <div className="organization-client-rental-receipts-list__top">
        <div className="container">
          <SavingsBlock
            total={stats && stats.total_spent}
            savings={stats && stats.total_savings}
            currency={stats && stats.currency}
            className="organization-client-rental-receipts-list__savings-block"
          />
          <div className="organization-client-rental-receipts-list__actions">
            <TimeIntervalSelect
              start={start}
              end={end}
              onChange={({start, end}) => {
                setStart(start)
                setEnd(end)
              }}
              className="organization-client-rental-receipts-list__date-selection-interval"
            />
            <DownloadExcelButton/>
          </div>
        </div>
      </div>

      {receiptsLoading ? <Preloader/> : (
        <InfiniteScroll next={getNextReceipts} hasMore={hasMore} loader={<Preloader/>}
                        dataLength={receipts?.list.length ?? 0} className="container">
          {receipts && receipts.list.map(receipt => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              className="organization-client-rental-receipts-list__list-item"
              to={`/receipts/${receipt.id}?purchase_type=${receipt.purchase_type}&receipt_for=${RECEIPT_FOR.client}`}
            />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default OrganizationClientRentalReceiptsList;