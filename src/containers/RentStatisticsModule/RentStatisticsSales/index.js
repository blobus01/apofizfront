import React, {useEffect, useReducer} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {getUserStatisticRentSaleTotals} from "../../../store/actions/statisticActions";
import SavingsBlock from "../../../components/UI/SavingsBlock";
import {translate} from "../../../locales/locales";
import * as moment from "moment/moment";
import {DATE_FORMAT_DD_MMMM_YYYY} from "../../../common/constants";
import {reducer} from "../reducer";
import MobileMenu from "../../../components/MobileMenu";
import MenuDatePicker from "../../../components/MenuDatePicker";
import {CHANGE_TIME_INTERVAL, SET_HAS_MORE, SET_LOADING, SET_PAGE, TOGGLE_INTERVAL_MENU} from "../actionTypes";
import {getMyAffiliatedRentOrganizations} from "../../../store/actions/organizationActions";
import Preloader from "../../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import PartnerCard from "../../../components/Cards/PartnerCard";
import {INITIAL_STATE} from "../initialState";
import EmptyRentStatisticsMessage from "../EmptyRentStatisticsMessage";
import "./index.scss"

const RentStatisticsSales = () => {
  const dispatch = useDispatch()
  const stats = useSelector(state => state.statisticStore.userStatisticRentSaleTotals)
  const locale = useSelector(state => state.userStore.locale)
  const myAffiliatedRentOrganizations = useSelector(state => state.organizationStore.myAffiliatedRentOrganizations)

  const [state, localDispatch] = useReducer(reducer, INITIAL_STATE)

  const {start, end, showIntervalMenu, page, limit, loading, hasMore} = state

  const toggleIntervalMenu = bool => {
    localDispatch({type: TOGGLE_INTERVAL_MENU, payload: bool})
  }

  const setPage = page => localDispatch({type: SET_PAGE, payload: page})

  const getNextAffiliatedRentOrganizations = () => {
    setPage(page + 1)
  }

  useEffect(() => {
    dispatch(getUserStatisticRentSaleTotals({start, end}))
  }, [start, end, dispatch]);

  useEffect(() => {
    dispatch(getMyAffiliatedRentOrganizations({
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
    <div className="rent-statistics-sales">
      <div className="rent-statistics-sales__top" onClick={() => toggleIntervalMenu()}>
        <div className="container">
          <SavingsBlock
            total={stats && stats.total_spent}
            savings={stats && stats.total_savings}
            currency={stats && stats.currency}
            className="rent-statistics-sales__summary"
          />
          <div className="rent-statistics-sales__time-interval f-14 f-500">
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

      <div className="rent-statistics-sales__list">
        <div className="container">
          {(page === 1 && loading) ? (
            <Preloader/>
          ) : myAffiliatedRentOrganizations && (
            <InfiniteScroll
              dataLength={Number(myAffiliatedRentOrganizations.list.length) || 0}
              next={getNextAffiliatedRentOrganizations}
              hasMore={hasMore}
              loader={<Preloader/>}
            >
              {myAffiliatedRentOrganizations.list.map(partner => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  count={partner.unprocessed_transaction_count}
                  to={`/organizations/${partner.id}/rent/statistics`}
                  className="rent-statistics-sales__item"
                />
              ))}
            </InfiniteScroll>
          )}
        </div>

        {(myAffiliatedRentOrganizations === null || myAffiliatedRentOrganizations.list.length === 0) && !loading && (
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

export default RentStatisticsSales;