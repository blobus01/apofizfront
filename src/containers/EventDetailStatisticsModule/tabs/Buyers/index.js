import React, {useEffect} from 'react';
import SavingsBlock from "../../../../components/UI/SavingsBlock";
import {useDispatch, useSelector} from "react-redux";
import useInfiniteScrollQuery from "../../../../hooks/useInfiniteScrollQuery";
import {notifyQueryResult} from "../../../../common/helpers";
import {getEventBuyers} from "../../../../store/services/eventServices";
import {getUserStatisticEventSaleTotals} from "../../../../store/actions/statisticActions";
import Preloader from "../../../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import {Link} from "react-router-dom";
import UserCard from "../../../../components/Cards/UserCard";

const Buyers = ({eventID, orgID, search}) => {
  const dispatch = useDispatch()
  const stats = useSelector(state => state.statisticStore.userStatisticEventSaleTotals)

  const fetchBuyers = async params => {
    return notifyQueryResult(getEventBuyers(eventID, orgID, params))
  }

  const {data: buyers, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => fetchBuyers({...params, search}),
    [eventID, orgID, search],
  )

  useEffect(() => {
    dispatch(getUserStatisticEventSaleTotals({item: eventID}))
  }, [dispatch, eventID]);

  return (
    <div>
      <div className="event-detail-statistics-module__top-container container">
        <SavingsBlock
          total={stats && stats.total_spent}
          savings={stats && stats.total_savings}
          currency={stats && stats.currency}
          className="event-detail-statistics-module__savings-block"
        />
      </div>
      <InfiniteScroll
        next={next}
        hasMore={hasMore}
        loader={<Preloader/>}
        dataLength={buyers.length}
        className="container"
      >
        {buyers.map(buyer => {
          return (
            <Link
              to={`/organizations/${orgID}/client/${buyer.id}?src=client`}
              key={buyer.id}
              className="row event-detail-statistics-module__user-card"
            >
              <UserCard
                avatar={buyer.avatar}
                fullname={buyer.full_name}
                description={buyer.username}
                withBorder
              />
            </Link>
          )
        })}
      </InfiniteScroll>
    </div>
  );
};

export default Buyers;