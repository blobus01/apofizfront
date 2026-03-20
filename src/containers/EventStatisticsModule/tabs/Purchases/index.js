import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import useInfiniteScrollQuery from "../../../../hooks/useInfiniteScrollQuery";
import {notifyQueryResult} from "../../../../common/helpers";
import {
  getEventTicketPurchaseOrganizations,
} from "../../../../store/services/eventServices";
import SavingsBlock from "../../../../components/UI/SavingsBlock";
import TimeIntervalSelect from "../../../../components/TimeIntervalSelect";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../../components/Preloader";
import PartnerList from "../../../../components/PartnerList";
import {getUserEventPurchaseTotals} from "../../../../store/actions/statisticActions";

const Purchases = () => {
  const dispatch = useDispatch()

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const stats = useSelector(state => state.statisticStore.userEventPurchaseTotals)

  const fetchOrganizations = async params => {
    return notifyQueryResult(getEventTicketPurchaseOrganizations(params))
  }

  const {data: organizations, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => fetchOrganizations({...params, start, end}),
    [start, end]
  )

  useEffect(() => {
    dispatch(getUserEventPurchaseTotals({start, end}))
  }, [start, end, dispatch]);


  return (
    <div className="event-statistics-module__purchases">
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

      <InfiniteScroll
        next={next}
        hasMore={hasMore}
        loader={<Preloader/>}
        dataLength={organizations.length}
        className="container"
      >
        <PartnerList
          partners={organizations}
          generateProps={partner => ({
            to: `/organizations/${partner.id}/events/statistics/purchases?title=${partner.title}`
          })}
        />
      </InfiniteScroll>
    </div>
  );
};

export default Purchases;