import React, {useCallback, useEffect, useState} from 'react';
import SavingsBlock from "../../../../components/UI/SavingsBlock";
import TimeIntervalSelect from "../../../../components/TimeIntervalSelect";
import {useDispatch, useSelector} from "react-redux";
import {getUserStatisticEventSaleTotals,} from "../../../../store/actions/statisticActions";
import PartnerList from "../../../../components/PartnerList";
import {notifyQueryResult} from "../../../../common/helpers";
import {getEventTicketSaleOrganizations} from "../../../../store/services/eventServices";
import {DEFAULT_LIMIT} from "../../../../common/constants";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../../components/Preloader";

const Sales = () => {
  const dispatch = useDispatch()
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const stats = useSelector(state => state.statisticStore.userStatisticEventSaleTotals)

  const [organizations, setOrganizations] = useState({
    total_count: 0,
    total_pages: 0,
    list: []
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const getSaleOrganizations = useCallback(async params => {
    return notifyQueryResult(getEventTicketSaleOrganizations({
      ...params,
      limit: DEFAULT_LIMIT
    }))
  }, []);

  const getNextSaleOrganizations = async () => {
    const res = await getSaleOrganizations({
      page: page + 1,
      start,
      end
    })
    if (res && res.success) {
      setOrganizations(prevOrganizations => ({
        ...res.data,
        list: prevOrganizations.list.concat(res.data.list)
      }))
      setPage(prevPage => prevPage + 1)
    }
  }

  useEffect(() => {
    dispatch(getUserStatisticEventSaleTotals({start, end}))
    getSaleOrganizations({page: 1, start, end})
      .then(res => setOrganizations(res.data))
      .finally(() => {
        setPage(1)
        setLoading(false)
      })
  }, [start, end, dispatch, getSaleOrganizations]);

  return (
    <div className="event-statistics-module__sales">
      <div className="event-statistics-module__top">
        <div className="container">
          <SavingsBlock
            total={stats && stats.total_spent}
            savings={stats && stats.total_savings}
            currency={stats && stats.currency}
            className="event-statistics-module__savings-block"
          />
          <div className="event-statistics-module__actions">
            <TimeIntervalSelect
              start={start}
              end={end}
              onChange={({start, end}) => {
                setStart(start)
                setEnd(end)
              }}
              className="event-statistics-module__sales-date-selection-interval"
            />
          </div>
        </div>
      </div>

      <div className="container">
        {loading && <Preloader />}
        <InfiniteScroll
          next={getNextSaleOrganizations}
          hasMore={organizations.list.length !== organizations.total_count}
          loader={<Preloader/>}
          dataLength={organizations.list.length}
        >
          <PartnerList
            partners={organizations.list}
            generateProps={partner => ({
              to: `/organizations/${partner.id}/events/statistics?title=${partner.title}`
            })}
          />
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Sales;