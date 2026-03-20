import React from 'react';
import MobileTopHeader from "../../../../components/MobileTopHeader";
import {getBoughtTickets} from "../../../../store/services/eventServices";
import {notifyQueryResult} from "../../../../common/helpers";
import Preloader from "../../../../components/Preloader";
import EventActivationCard from "../../../../components/Cards/EventActivationCard";
import useInfiniteScrollQuery from "../../../../hooks/useInfiniteScrollQuery";
import InfiniteScroll from "react-infinite-scroll-component";

const BoughtTickets = ({ticket, onClick, onBack}) => {
  const fetchTickets = async params => {
    return notifyQueryResult(getBoughtTickets(params))
  }
  const {data: tickets, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => fetchTickets({...params, item: ticket.id}),
    [ticket.id]
  )

  return (
    <div className="organization-event-purchase-statistics-module__bought-tickets-layer">
      <MobileTopHeader
        title={ticket.name}
        onBack={onBack}
        className="organization-event-purchase-statistics-module__header"
      />
      <div className="container">
        <InfiniteScroll next={next} hasMore={hasMore} loader={<Preloader/>} dataLength={tickets.length}>
          {tickets.map(ticket => {
            return (
              <EventActivationCard
                data={ticket}
                onActivate={() => onClick(ticket)}
                onActiveButtonClick={() => onClick(ticket)}
                className="organization-event-purchase-statistics-module__event-activation-card"
                key={ticket.id}
              />
            )
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default BoughtTickets;