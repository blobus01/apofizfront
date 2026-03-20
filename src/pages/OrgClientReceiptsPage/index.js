import React, { useCallback, useEffect, useMemo, useState } from "react";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { translate } from "../../locales/locales";
import OrgGeneralStatistics from "../../containers/OrgGeneralStatistics";
import CertainPeriodStatistics from "../../components/CertainPeriodStatistics";
import Preloader from "../../components/Preloader";
import EmptyBox from "../../components/EmptyBox";
import InfiniteScroll from "react-infinite-scroll-component";
import ReceiptCard from "../../components/Cards/ReceiptCard";
import MobileMenu from "../../components/MobileMenu";
import MenuDatePicker from "../../components/MenuDatePicker";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOrgTransactions } from "../../store/actions/receiptActions";
import { DEFAULT_LIMIT } from "../../common/constants";
import Notify from "../../components/Notification";

const OrgClientReceiptsPage = ({ history }) => {
  const dispatch = useDispatch();

  const { id: orgID, userID } = useParams();

  const userDetail = useSelector((state) => state.commonStore.userDetail);
  const orgTransactions = useSelector(
    (state) => state.receiptStore.orgTransactions
  );
  const locale = useSelector((state) => state.userStore.locale);

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [showMenu, setShowMenu] = useState();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const toggleMenu = () => setShowMenu((prevState) => !prevState);

  const hasMore = useMemo(() => {
    return !!(
      loading ||
      (orgTransactions && orgTransactions.total_pages >= page)
    );
  }, [orgTransactions, page, loading]);

  const orgGeneralStatisticsProps = useMemo(
    () => ({
      start,
      end,
      client: userID,
    }),
    [start, end, userID]
  );

  const getReceipts = useCallback(
    async (params, isNext) => {
      const res = await dispatch(
        getOrgTransactions(
          {
            organization: orgID,
            client: userID,
            limit: DEFAULT_LIMIT,
            ...params,
          },
          isNext
        )
      );

      if (res.success) {
        setPage((prevState) => ++prevState);
      } else {
        Notify.error({
          text: translate("Что-то пошло не так", "app.fail"),
        });
        console.error(res.error);
      }

      return res;
    },
    [dispatch, orgID, userID]
  );

  const getNext = () => {
    getReceipts(
      {
        page,
        start,
        end,
      },
      true
    );
  };

  // fetch on mount
  useEffect(() => {
    getReceipts({
      page: 1,
    }).finally(() => setLoading(false));
  }, [getReceipts]);

  return (
    <div className="org-receipts-user-page">
      <MobileSearchHeader
        onBack={() => history.goBack()}
        title={
          userDetail
            ? userDetail.full_name
            : translate("Пользователь", "app.user")
        }
        className="org-receipts-user-page__search-header"
      />

      <div className="org-receipts-user-page__content">
        <OrgGeneralStatistics
          orgID={orgID}
          requestParams={orgGeneralStatisticsProps}
          render={({ stats }) => (
            <CertainPeriodStatistics
              stats={stats}
              onClick={toggleMenu}
              start={start}
              end={end}
            />
          )}
        />

        <div className="org-receipts-user-page__list">
          <div className="container">
            {loading ? (
              <Preloader />
            ) : !orgTransactions ||
              (orgTransactions && !orgTransactions.total_count) ? (
              <EmptyBox
                title={translate(
                  "Проведенных скидок нет",
                  "org.noDiscountProvided"
                )}
              />
            ) : (
              <InfiniteScroll
                dataLength={Number(orgTransactions.list.length) || 0}
                next={() => getNext()}
                hasMore={hasMore}
                loader={
                  <Preloader
                    style={{ marginTop: "1rem", paddingBottom: "5rem" }}
                  />
                }
              >
                {orgTransactions.list.map((receipt) => (
                  <ReceiptCard
                    key={receipt.id}
                    receipt={receipt}
                    organization={orgID}
                    to={`/organizations/${orgID}/receipts/${receipt.id}`}
                    className="org-receipts-user-page__item"
                  />
                ))}
              </InfiniteScroll>
            )}
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={showMenu}
        contentLabel="Параметры даты"
        onRequestClose={toggleMenu}
      >
        <MenuDatePicker
          start={start}
          end={end}
          locale={locale}
          onChange={(range) => {
            setStart(range.start);
            setEnd(range.end);

            toggleMenu();

            setPage(1);
            setLoading(true);

            getReceipts({
              page: 1,
              start: range.start,
              end: range.end,
            }).finally(() => setLoading(false));
          }}
        />
      </MobileMenu>
    </div>
  );
};

export default OrgClientReceiptsPage;
