import React, {useEffect, useReducer} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {getUserStatisticRentTotals} from "../../../store/actions/statisticActions";
import SavingsBlock from "../../../components/UI/SavingsBlock";
import {translate} from "../../../locales/locales";
import * as moment from "moment";
import {DATE_FORMAT_DD_MMMM_YYYY} from "../../../common/constants";
import {reducer} from "../reducer";
import {CHANGE_TIME_INTERVAL, SET_HAS_MORE, SET_LOADING, SET_PAGE, TOGGLE_INTERVAL_MENU} from "../actionTypes";
import {getMyRentPurchasesOrganizations} from "../../../store/actions/organizationActions";
import {INITIAL_STATE} from "../initialState";
import MobileMenu from "../../../components/MobileMenu";
import MenuDatePicker from "../../../components/MenuDatePicker";
import EmptyRentStatisticsMessage from "../EmptyRentStatisticsMessage";
import PartnerCard from "../../../components/Cards/PartnerCard";
import Preloader from "../../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import "./index.scss"


const RentStatisticsOrders = () => {
  const dispatch = useDispatch()
  const stats = useSelector(state => state.statisticStore.userStatisticRentTotals)
  const locale = useSelector(state => state.userStore.locale)
  const myRentPurchasesOrganizations = useSelector(state => state.organizationStore.myRentPurchasesOrganizations)

  const [state, localDispatch] = useReducer(reducer, INITIAL_STATE)

  const {start, end, showIntervalMenu, page, limit, loading, hasMore} = state

  const toggleIntervalMenu = bool => {
    localDispatch({type: TOGGLE_INTERVAL_MENU, payload: bool})
  }

  const setPage = page => localDispatch({type: SET_PAGE, payload: page})

  const getNextRentPurchasesOrganizations = () => {
    setPage(page + 1)
  }

  useEffect(() => {
    dispatch(getUserStatisticRentTotals({start, end}))
  }, [start, end, dispatch]);

  useEffect(() => {
    dispatch(getMyRentPurchasesOrganizations({
      limit,
      page,
      start,
      end
    }, page !== 1)).then(res => {
      if (res.success) {
        if (page === 1) {
          localDispatch({type: SET_LOADING, payload: false})
        }
        if (res.data.total_pages === page) {
          localDispatch({type: SET_HAS_MORE, payload: false})
        }
      }
    })
  }, [dispatch, page, limit, start, end]);

  return (
    <div className="rent-statistics-orders">
      <div className="rent-statistics-orders__top" onClick={() => toggleIntervalMenu(true)}>
        <div className="container">
          <SavingsBlock
            total={stats && stats.total_spent}
            savings={stats && stats.total_savings}
            currency={stats && stats.currency}
            className="rent-statistics-orders__summary"
          />
          <div className="rent-statistics-orders__time-interval f-14 f-500">
            {(start && end)
              ? translate("с {start} - по {end}", "app.dateRange", {
                start: moment(start).locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY),
                end: moment(end).locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY)
              })
              : translate("За все время", "app.allTime")
            }
          </div>
        </div>
      </div>

      <div className="rent-statistics-orders__list">
        <div className="container">
          {(page === 1 && loading) ? (
            <Preloader/>
          ) : myRentPurchasesOrganizations && (
            <InfiniteScroll
              dataLength={Number(myRentPurchasesOrganizations.list.length) || 0}
              next={getNextRentPurchasesOrganizations}
              hasMore={hasMore}
              loader={<Preloader/>}
            >
              {myRentPurchasesOrganizations.list.map(partner => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  count={partner.unprocessed_transaction_count}
                  to={`/organizations/${partner.id}/rent/clint-statistics`}
                  className="rent-statistics-orders__item"
                />
              ))}
            </InfiniteScroll>
          )}
        </div>
        {(myRentPurchasesOrganizations === null || myRentPurchasesOrganizations.list.length === 0) && !loading && (
          <EmptyRentStatisticsMessage className="container"/>
        )}
      </div>

      <MobileMenu
        isOpen={showIntervalMenu}
        contentLabel={translate("Параметры даты", "app.dateOptions")}
        onRequestClose={() => toggleIntervalMenu(false)}
      >
        <MenuDatePicker
          start={start}
          end={end}
          locale={locale}
          onChange={range => {
            localDispatch({type: CHANGE_TIME_INTERVAL, payload: range})
            toggleIntervalMenu(false)
          }}
        />
      </MobileMenu>

    </div>
  );
};

export default RentStatisticsOrders;