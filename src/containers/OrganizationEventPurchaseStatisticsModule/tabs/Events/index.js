import React, {useState} from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../../components/Preloader";
import useInfiniteScrollQuery from "../../../../hooks/useInfiniteScrollQuery";
import {notifyQueryResult} from "../../../../common/helpers";
import {getOrganizationPurchasedEvents} from "../../../../store/services/eventServices";
import {Layer} from "../../../../components/Layer";
import ActivatedTicketView from "../../../ActivatedTicketView";
import UnactivatedTicket from "../../layers/UnactivatedTicket";
import EventPostRowCard from "../../../../components/Cards/EventPostRowCard";
import BoughtTickets from "../../layers/BoughtTickets";

const Events = ({orgID, search}) => {
  const LAYERS = Object.freeze({
    activated_ticket: 'activated_ticket',
    unactivated_ticket: 'unactivated_ticket',
    bought_tickets: 'bought_tickets',
  })
  const [layer, _setLayer] = useState({
    current: null,
    state: {}
  });

  const setLayer = (current, state={}) => {
    _setLayer({
      current,
      state
    })
  }

  const clearLayer = () => setLayer(null)

  const getEvents = async params => {
    return notifyQueryResult(getOrganizationPurchasedEvents(params))
  }

  const {data: events, next, hasMore} = useInfiniteScrollQuery(
    ({params}) => getEvents({...params, organization: orgID, search}),
    [orgID, search]
  )

  const handleClick = (e, eventPost) => {
    e.preventDefault()
    setLayer(LAYERS.bought_tickets, eventPost)
  }

  const handleBoughtTicketClick = ticket => {
    if (ticket.is_active) {
      setLayer(LAYERS.activated_ticket, ticket)
    } else {
      setLayer(LAYERS.unactivated_ticket, ticket)
    }
  }

  return (
    <>
      <InfiniteScroll
        next={next}
        hasMore={hasMore}
        dataLength={events.length}
        loader={<Preloader/>}
        className="container"
      >

        {events.map((event, idx) => {
          const isActivated = idx % 2 === 0
          return (
            <EventPostRowCard
              event={event}
              isActivated={isActivated}
              className="organization-event-purchase-statistics-module__post-card"
              onClick={e => handleClick(e, {...event, is_activated: isActivated})}
              key={event.id}
            />
          )
        })}
      </InfiniteScroll>

      <Layer
        isOpen={!!layer.current}
        noTransition
      >
        {layer.current === LAYERS.activated_ticket && (
          <ActivatedTicketView transactionID={layer.state.id} onOk={clearLayer} title={layer.state?.item?.name}/>
        )}
        {layer.current === LAYERS.unactivated_ticket && (
          <UnactivatedTicket eventID={layer.state.id} onOk={clearLayer} title={layer.state?.item?.name}/>
        )}
        {layer.current === LAYERS.bought_tickets && (
          <BoughtTickets
            ticket={layer.state}
            onBack={clearLayer}
            onClick={handleBoughtTicketClick}
          />
        )}
      </Layer>
    </>
  );
};

export default Events;