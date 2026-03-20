import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { debounce } from "../../common/utils";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { canGoBack } from "../../common/helpers";
import Preloader from "../../components/Preloader";
import { useParams } from "react-router-dom";
import { getPostDetail } from "../../store/services/postServices";
import Notify from "../../components/Notification";
import SavingsBlock from "../../components/UI/SavingsBlock";
import TimeIntervalSelect from "../../components/TimeIntervalSelect";
import DownloadExcelButton from "../../components/DownloadExcelButton";
import InfiniteScroll from "react-infinite-scroll-component";
import ReceiptCard from "../../components/Cards/ReceiptCard";
import { DEFAULT_LIMIT, RECEIPT_FOR } from "../../common/constants";
import { useDispatch, useSelector } from "react-redux";
import { getUserRentDetailOrdersReceipts } from "../../store/services/receiptServices";
import { translate } from "../../locales/locales";
import { getUserStatisticRentTotals } from "../../store/actions/statisticActions";

import "./index.scss";

const UserRentDetailOrdersReceiptsPage = ({ history }) => {
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [rentDetail, setRentDetail] = useState(null);

  const stats = useSelector(
    (state) => state.statisticStore.userStatisticRentTotals
  );

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const [receiptsLoading, setReceiptsLoading] = useState(true);
  const [receipts, setReceipts] = useState(null);

  const queryParams = useMemo(() => {
    return {
      search,
      start,
      end,
    };
  }, [search, start, end]);

  const receiptsPagination = useRef({
    page: 1,
    limit: DEFAULT_LIMIT,
  });

  const { id: rentID } = useParams();

  const doSearch = useMemo(() => {
    return debounce((newSearch) => {
      setSearch(newSearch ?? "");
    }, 200);
  }, []);

  const handleSearch = (e) => {
    doSearch(e.target.value);
  };

  const getReceipts = useCallback(
    async (queryParams) => {
      try {
        return await getUserRentDetailOrdersReceipts(rentID, queryParams);
      } catch (e) {
        console.error(e.message);
        Notify.error({
          text: translate("Что-то пошло не так", "app.fail"),
        });
        return null;
      }
    },
    [rentID]
  );

  const getNextReceipts = () => {
    receiptsPagination.current.page += 1;
    getReceipts({
      ...queryParams,
      ...receiptsPagination.current,
    }).then((res) => {
      if (res?.success) {
        setReceipts((prevState) => ({
          ...prevState,
          ...res.data,
          list: prevState?.list
            ? prevState.list.concat(res.data.list)
            : res.data.list,
        }));
      }
    });
  };

  useEffect(() => {
    void dispatch(getUserStatisticRentTotals({ ...queryParams, item: rentID }));

    setReceiptsLoading(true);
    receiptsPagination.current.page = 1;

    getReceipts({
      ...queryParams,
      ...receiptsPagination.current,
    })
      .then((res) => {
        if (res?.success) {
          setReceipts(res.data);
        }
      })
      .finally(() => setReceiptsLoading(false));
  }, [queryParams, rentID, dispatch, getReceipts]);

  useEffect(() => {
    getPostDetail(rentID).then((res) => {
      if (res.success) {
        setRentDetail(res.data);
      } else {
        console.error(res.message);
      }
    });
  }, [rentID]);

  const hasMore = receipts
    ? receipts.total_pages !== receiptsPagination.current.page
    : true;

  if (!rentDetail) return <Preloader />;

  return (
    <div className="user-rent-detail-orders-receipts-page">
      <MobileSearchHeader
        onBack={() =>
          canGoBack(history)
            ? history.goBack()
            : history.push("/statistics/rent")
        }
        title={rentDetail.name}
        onSearchChange={handleSearch}
        onSearchCancel={() => setSearch("")}
        className="user-rent-detail-orders-receipts-page"
      />
      <div className="user-rent-detail-orders-receipts-page__top">
        <div className="container">
          <SavingsBlock
            total={stats && stats.total_spent}
            savings={stats && stats.total_savings}
            currency={stats && stats.currency}
            className="user-rent-detail-orders-receipts-page__savings-block"
          />
          <div className="user-rent-detail-orders-receipts-page__actions">
            <TimeIntervalSelect
              start={start}
              end={end}
              onChange={({ start, end }) => {
                setStart(start);
                setEnd(end);
              }}
              className="user-rent-detail-orders-receipts-page__date-selection-interval"
            />
            <DownloadExcelButton />
          </div>
        </div>
      </div>

      {receiptsLoading ? (
        <Preloader />
      ) : (
        <InfiniteScroll
          next={getNextReceipts}
          hasMore={hasMore}
          loader={<Preloader />}
          dataLength={receipts?.list.length ?? 0}
          className="user-rent-detail-orders-receipts-page__list container"
        >
          {receipts &&
            receipts.list.map((receipt) => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                className="user-rent-detail-orders-receipts-page__list-item"
                to={`/receipts/${receipt.id}?purchase_type=${receipt.purchase_type}&receipt_for=${RECEIPT_FOR.client}`}
              />
            ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default UserRentDetailOrdersReceiptsPage;
