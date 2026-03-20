import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as moment from "moment";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import Preloader from "../../components/Preloader";
import ReceiptCard from "../../components/Cards/ReceiptCard";
import SavingsBlock from "../../components/UI/SavingsBlock";
import {
  DATE_FORMAT_DD_MMMM_YYYY,
  DATE_FORMAT_YYYY_MM_DD,
  DEFAULT_LIMIT,
} from "../../common/constants";
import MobileMenu from "../../components/MobileMenu";
import MenuDatePicker from "../../components/MenuDatePicker";
import SwitchableTabLinks from "../../components/TabLinks/SwitchableTabLinks";
import OrgReceiptsUsers from "../../components/OrgReceiptsUsers";
import InfiniteScroll from "react-infinite-scroll-component";
import { translate } from "../../locales/locales";
import { getOrgGeneralStatistics } from "../../store/actions/statisticActions";
import {
  getOrgTransactionsReceipts,
  getOrgTransactionsUsers,
} from "../../store/actions/receiptActions";
import OrgReceiptsEmpty from "./empty";
import { debounce } from "../../common/utils";
import ExcelTransactionsDownloader from "../../containers/ExcelTransactionsDownloader";
import DownloadExcelButton from "../../components/DownloadExcelButton";
import ReceiptListSkeleton from "../../components/ReceiptListSkeleton";
import { getTransactionsExcelFile } from "../../store/services/receiptServices";
import "./index.scss";

const OrgReceiptsPage = ({ match, history }) => {
  const LINK_TABS = [
    {
      label: "Чеки",
      translation: "receipts.receipts",
      key: "receipts",
      onClick: () => {
        if (tabMode === "receipts") return;
        setRange({ start: null, end: null });
        setTabMode("receipts");
        resetParams();
      },
    },
    {
      label: "Покупатели",
      translation: "receipts.buyers",
      key: "buyers",
      onClick: () => {
        if (tabMode === "buyers") return;
        setTabMode("buyers");
        resetParams();
        dispatch(
          getOrgTransactionsUsers(params.organization, {
            ...params,
            page: 1,
            hasMore: true,
            organization: null,
          })
        );
      },
    },
  ];

  const dispatch = useDispatch();

  const { data, loading } = useSelector(
    (state) => state.receiptStore.orgTransactionsReceipts
  );

  const stats = useSelector(
    (state) => state.statisticStore.orgGeneralStatistics
  );
  const locale = useSelector((state) => state.userStore.locale);

  const [search, setSearch] = useState("");
  const [tabMode, setTabMode] = useState("receipts");
  const [showMenu, setShowMenu] = useState(false);
  const [isScroll, setIsScroll] = useState(false);
  const [range, setRange] = useState({
    start: null,
    end: null,
  });

  const [params, setParams] = useState({
    organization: match.params.id,
    page: 1,
    limit: DEFAULT_LIMIT,
    hasMore: true,
  });

  useEffect(() => {
    const { start, end } = range;
    dispatch(getOrgGeneralStatistics(match.params.id, { start, end }));
    dispatch(
      getOrgTransactionsReceipts({
        organization: match.params.id,
        page: 1,
        limit: DEFAULT_LIMIT,
        hasMore: true,
        start,
        end,
      })
    );
  }, [dispatch, range, match.params.id]);

  const resetParams = () => {
    setSearch("");
    setParams((prev) => ({
      ...prev,
      page: 1,
      hasMore: true,
    }));
  };

  const getNext = async (totalPages) => {
    if (params.page < totalPages) {
      const nextPage = params.page + 1;
      setIsScroll(true);
      await dispatch(
        getOrgTransactionsReceipts(
          { ...params, page: nextPage, search: search.length > 1 && search },
          true
        )
      );
      setIsScroll(false);
      return setParams((state) => ({
        ...state,
        hasMore: true,
        page: nextPage,
      }));
    }

    setParams((prev) => ({ ...prev, hasMore: false }));
  };

  const searchBy = useCallback(
    (value, mode) => {
      if (mode === "receipts") {
        dispatch(
          getOrgTransactionsReceipts({
            organization: match.params.id,
            page: 1,
            hasMore: true,
            limit: DEFAULT_LIMIT,
            search: value,
            end: range.end,
            start: range.start,
          })
        );
      }

      if (mode === "buyers") {
        dispatch(
          getOrgTransactionsUsers(match.params.id, {
            page: 1,
            hasMore: true,
            limit: DEFAULT_LIMIT,
            search: value,
            organization: null,
          })
        );
      }
    },
    [dispatch, match.params.id, range]
  );

  const doSearch = useMemo(() => {
    return debounce((value, mode) => {
      searchBy(value, mode);
    }, 400);
  }, [searchBy]);

  const onSearchChange = (e) => {
    const { value } = e.target;
    setSearch(value);

    if (value !== search && value.length > 1) {
      setParams((prev) => ({ ...prev, page: 1, hasMore: true }));
      doSearch(value, tabMode);
    }

    if (value.length === 1 && search.length === 2) {
      setParams((prev) => ({ ...prev, page: 1, hasMore: true }));

      doSearch("", tabMode);
    }
  };

  const onSearchCancel = () => {
    if (search !== "") {
      setParams((prev) => ({ ...prev, page: 1, hasMore: true }));
      setSearch("");
      searchBy("", tabMode);
    }
  };

  const handleExcelDownload = () => {
    return getTransactionsExcelFile(Number(params.organization), {
      start_time: range.start
        ? moment(range.start).format(DATE_FORMAT_YYYY_MM_DD)
        : undefined,
      end_time: range.end
        ? moment(range.end).format(DATE_FORMAT_YYYY_MM_DD)
        : undefined,
    });
  };

  const { start, end } = range;
  let fileName;

  if (start && end) {
    if (moment(start).days() === moment(end).days()) {
      fileName = `${moment(end).format(DATE_FORMAT_YYYY_MM_DD)}.xlsx`;
    } else {
      fileName = `${moment(start).format(DATE_FORMAT_YYYY_MM_DD)} - ${moment(
        end
      ).format(DATE_FORMAT_YYYY_MM_DD)}.xlsx`;
    }
  }

  return (
    <div className="org-receipts-page">
      <MobileSearchHeader
        onBack={() => history.goBack()}
        title={translate("Продажи и скидки", "org.salesAndDiscounts")}
        searchPlaceholder={
          tabMode === "receipts"
            ? translate("Поиск по номеру чека", "placeholder.searchByReceiptID")
            : translate("Поиск по ФИО", "placeholder.searchByEmployeeName")
        }
        searchValue={search}
        onSearchChange={onSearchChange}
        onSearchCancel={onSearchCancel}
      />
      <div className="container org-receipts-page__switch-tab org-receipts-page__switch-sticky sticky is-sticky">
        <SwitchableTabLinks links={LINK_TABS} activeLink={tabMode} />
      </div>

      <div className="org-receipts-page__content">
        {tabMode === "receipts" && (
          <>
            <div className="org-receipts-page__top">
              <div className="container">
                <SavingsBlock
                  total={stats && stats.total_spent}
                  savings={stats && stats.total_savings}
                  currency={stats && stats.currency}
                  className="org-receipts-page__summary"
                />
                <div className="row">
                  <div
                    onClick={() => setShowMenu(true)}
                    className="statistics-page__calendar org-receipts-page__calendar f-14 f-500"
                  >
                    {range.start && range.end
                      ? translate("с {start} - по {end}", "app.dateRange", {
                          start: moment(range.start)
                            .locale(locale)
                            .format(DATE_FORMAT_DD_MMMM_YYYY),
                          end: moment(range.end)
                            .locale(locale)
                            .format(DATE_FORMAT_DD_MMMM_YYYY),
                        })
                      : translate("За все время", "app.allTime")}
                  </div>
                  <ExcelTransactionsDownloader
                    onDownload={handleExcelDownload}
                    fileName={fileName}
                    render={({ download, isDownloading }) => (
                      <DownloadExcelButton
                        loading={isDownloading}
                        onClick={download}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="org-receipts-page__list">
              <div className="container">
                {params.page === 1 && loading && !isScroll ? (
                  <ReceiptListSkeleton />
                ) : !data || (data && !data.total_count) ? (
                  <OrgReceiptsEmpty
                    organization={params.organization}
                    searched={!!search}
                  />
                ) : (
                  <InfiniteScroll
                    dataLength={Number(data.list.length) || 0}
                    next={() => getNext(data.total_pages)}
                    hasMore={params.hasMore}
                    loader={null}
                  >
                    {data.list.map((receipt) => (
                      <ReceiptCard
                        key={receipt.id}
                        receipt={receipt}
                        organization={params.organization}
                        to={`/organizations/${params.organization}/receipts/${receipt.id}?purchase_type=${receipt.purchase_type}`}
                        className="org-receipts-page__item"
                      />
                    ))}
                    {isScroll && loading && <Preloader />}
                  </InfiniteScroll>
                )}
              </div>
            </div>

            <MobileMenu
              isOpen={showMenu}
              contentLabel={translate("Параметры даты", "app.dateOptions")}
              onRequestClose={() => setShowMenu(false)}
            >
              <MenuDatePicker
                locale={locale}
                start={range.start}
                end={range.end}
                onChange={async (range) => {
                  setShowMenu(false);
                  await setRange((prev) => ({
                    ...prev,
                    ...range,
                  }));
                  resetParams();
                }}
              />
            </MobileMenu>
          </>
        )}

        {tabMode === "buyers" && (
          <OrgReceiptsUsers
            params={params}
            setParams={setParams}
            search={search}
            className="org-receipts-page__users"
          />
        )}
      </div>
    </div>
  );
};

export default OrgReceiptsPage;
