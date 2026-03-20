import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {DEFAULT_LIMIT, RECEIPT_FOR} from "../../../common/constants";
import {getRentDetailSaleReceipts, getRentDetailTransactionsExcelFile} from "../../../store/services/receiptServices";
import Notify from "../../../components/Notification";
import {translate} from "../../../locales/locales";
import SavingsBlock from "../../../components/UI/SavingsBlock";
import DownloadExcelButton from "../../../components/DownloadExcelButton";
import Preloader from "../../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import ReceiptCard from "../../../components/Cards/ReceiptCard";
import {getRentDetailSaleTotals} from "../../../store/actions/statisticActions";
import TimeIntervalSelect from "../../../components/TimeIntervalSelect";
import ExcelTransactionsDownloader from "../../ExcelTransactionsDownloader";
import "./index.scss"

const RentDetailReceipts = ({search, rentID}) => {
  const dispatch = useDispatch()
  const stats = useSelector(state => state.statisticStore.rentDetailSaleTotals)

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
      return await getRentDetailSaleReceipts(rentID, queryParams)
    } catch (e) {
      console.error(e.message)
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      return null
    }
  }, [rentID]);


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
    void dispatch(getRentDetailSaleTotals(rentID, queryParams))

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
  }, [queryParams, rentID, dispatch, getReceipts]);

  const hasMore = receipts ? receipts.total_pages !== receiptsPagination.current.page : true

  const handleExcelTransactionsDownload = () => {
    return getRentDetailTransactionsExcelFile(rentID, {
      start_time: start,
      end_time: end,
    })
  }

  return (
    <div className="rent-detail-receipts">
      <div className="rent-detail-receipts__top">
        <div className="container">
          <SavingsBlock
            total={stats && stats.total_spent}
            savings={stats && stats.total_savings}
            currency={stats && stats.currency}
            className="rent-detail-receipts__savings-block"
          />
          <div className="rent-detail-receipts__actions">
            <TimeIntervalSelect
              start={start}
              end={end}
              onChange={({start, end}) => {
                setStart(start)
                setEnd(end)
              }}
              className="rent-detail-receipts__date-selection-interval"
            />
            <ExcelTransactionsDownloader
              onDownload={handleExcelTransactionsDownload}
              render={({download, isDownloading}) => (
                <DownloadExcelButton onClick={download} loading={isDownloading}/>
              )}
            />
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
              className="rent-detail-receipts__list-item"
              to={`/receipts/${receipt.id}?purchase_type=${receipt.purchase_type}&receipt_for=${RECEIPT_FOR.organization}`}
            />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default RentDetailReceipts;