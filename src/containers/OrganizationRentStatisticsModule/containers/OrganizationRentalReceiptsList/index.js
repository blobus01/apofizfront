import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import SavingsBlock from "../../../../components/UI/SavingsBlock";
import {getOrganizationRentSaleTotals} from "../../../../store/actions/statisticActions";
import {translate} from "../../../../locales/locales";
import {DEFAULT_LIMIT, RECEIPT_FOR} from "../../../../common/constants";
import DownloadExcelButton from "../../../../components/DownloadExcelButton";
import {
  getOrganizationRentSaleTransactions,
  getRentTransactionsExcelFile,
} from "../../../../store/services/receiptServices";
import Notify from "../../../../components/Notification";
import Preloader from "../../../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import ReceiptCard from "../../../../components/Cards/ReceiptCard";
import TimeIntervalSelect from "../../../../components/TimeIntervalSelect";
import ExcelTransactionsDownloader from "../../../ExcelTransactionsDownloader";
import "./index.scss"

const OrganizationRentalReceiptsList = ({orgID, search = ''}) => {
  const dispatch = useDispatch()
  const stats = useSelector(state => state.statisticStore.organizationRentSaleTotals)

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [receipts, setReceipts] = useState(null);
  const [receiptsLoading, setReceiptsLoading] = useState(true);

  const receiptsQueryParams = useRef({
    page: 1,
    limit: DEFAULT_LIMIT,
    search,
    start,
    end
  })

  const getReceipts = useCallback(async (queryParams) => {
    try {
      return await getOrganizationRentSaleTransactions(orgID, queryParams)
    } catch (e) {
      console.error(e.message)
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      return null
    }
  }, [orgID]);

  const getNextReceipts = useCallback(() => {
    receiptsQueryParams.current.page += 1
    getReceipts(receiptsQueryParams.current).then(res => {
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
  }, [getReceipts])

  const handleExcelTransactionsDownload = () => {
    return getRentTransactionsExcelFile(orgID, {
      start_time: start,
      end_time: end,
    })
  }

  useEffect(() => {
    dispatch(getOrganizationRentSaleTotals(orgID, {
      start,
      end,
      search
    }))
    setReceiptsLoading(true)
    receiptsQueryParams.current = {
      ...receiptsQueryParams.current,
      page: 1,
      start,
      end,
      search,
    }
    getReceipts(receiptsQueryParams.current)
      .then(res => {
        if (res?.success) {
          setReceipts(res.data)
        }
      }).finally(() => setReceiptsLoading(false))
  }, [orgID, start, end, search, dispatch, getReceipts]);

  const hasMore = receipts ? receipts.total_pages !== receiptsQueryParams.current.page : true

  return (
    <div className="organization-rental-receipts-list">
      <div className="organization-rental-receipts-list__top">
        <div className="container">
          <SavingsBlock
            total={stats && stats.total_spent}
            savings={stats && stats.total_savings}
            currency={stats && stats.currency}
            className="organization-rental-receipts-list__savings-block"
          />
          <div className="organization-rental-receipts-list__actions">
            <TimeIntervalSelect
              start={start}
              end={end}
              onChange={({start, end}) => {
                setStart(start)
                setEnd(end)
              }}
              className="organization-rental-receipts-list__date-selection-interval"
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

      <div className="organization-rental-receipts-list__list">
        {receiptsLoading ? <Preloader/> : (
          <InfiniteScroll next={getNextReceipts} hasMore={hasMore} loader={<Preloader/>}
                          dataLength={receipts?.list.length ?? 0} className="container">
            {receipts && receipts.list.map(receipt => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                className="organization-rental-receipts-list__list-item"
                to={`/receipts/${receipt.id}?purchase_type=${receipt.purchase_type}&receipt_for=${RECEIPT_FOR.organization}`}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default OrganizationRentalReceiptsList;