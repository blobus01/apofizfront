import React, {useCallback, useEffect, useRef, useState} from 'react';
import {notifyQueryResult} from "../../common/helpers";
import {activateTicket, getClientTicketsOfEvent} from "../../store/services/eventServices";
import Notify from "../../components/Notification";
import {translate} from "../../locales/locales";
import Preloader from "../../components/Preloader";
import ClientCard from "../../components/Cards/ClientCard";
import MobileTopHeader from "../../components/MobileTopHeader";
import EventActivationCard from "../../components/Cards/EventActivationCard";
import {Layer} from "../../components/Layer";
import ActivatedTicketView from "../../containers/ActivatedTicketView";
import InfiniteScroll from "react-infinite-scroll-component";
import {DEFAULT_LIMIT} from "../../common/constants";
import "./index.scss"

const ClientEventActivationPage = ({match, history}) => {
  const {id, eventID} = match.params
  const ACTIVATION_ANIMATION_DURATION = 2600
  const limit = DEFAULT_LIMIT

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    total_count: 0,
    total_pages: 0,
    list: {
      client: null,
      tickets: [],
    },
  });
  const [activatingTickets, setActivatingTickets] = useState([]);
  const [animatingTickets, setAnimatingTickets] = useState([]);
  const [layer, setLayer] = useState({
    isOpen: false,
    state: null
  });
  const [hasMore, setHasMore] = useState(true);
  const page = useRef(1)

  const handleTicketActivation = async id => {
    setActivatingTickets(prevState => [...prevState, id])
    setAnimatingTickets(prevState => [...prevState, id])

    const res = await notifyQueryResult(activateTicket({
      ticket: id,
    }))

    if (res && res.success) {
      setTimeout(() => {
        setAnimatingTickets(prevState =>
          prevState.filter(ticketID => ticketID !== id)
        )
        updateTicket(id, {is_active: true})
        Notify.success({
          text: res.message
        })
      }, ACTIVATION_ANIMATION_DURATION)
    }

    setActivatingTickets(prevState =>
      prevState.filter(ticketID => ticketID !== id)
    )
  }

  const updateTicket = (id, payload = {}) => {
    setData(prevState => {
      return {
        ...prevState,
        list: {
          ...prevState.list,
          tickets: prevState.list.tickets.map(ticket => {
            if (ticket.id === id) {
              return {...ticket, ...payload}
            }
            return ticket
          })
        }
      }
    })
  }

  const fetchData = useCallback(async (params = {}) => {
    return await notifyQueryResult(getClientTicketsOfEvent({
      ...params,
      client: id,
      item: eventID,
      limit,
    }))
  }, [id, eventID, limit]);

  useEffect(() => {
    fetchData({page: page.current})
      .then(res => {
        if (res && res.success) {
          const tickets = res.data.list.tickets
          if (tickets.length > 0) {
            setLoading(false)
            setData(res.data)
          } else {
            Notify.error({
              text: translate('Клиент не найден', 'shop.clientNotFound')
            })
            history.goBack()
          }
        } else {
          history.goBack()
        }
      })
    page.current += 1
  }, [fetchData, history]);


  const fetchNext = async () => {
    if (page.current > data.total_pages) {
      return setHasMore(false)
    }
    const res = await fetchData({page: page.current})
    if (res && res.success) {
      const nextData = res.data
      page.current += 1
      return setData(prevData => {
        return {
          ...nextData,
          list: {
            ...nextData.list,
            tickets: prevData.list.tickets.concat(nextData.list.tickets)
          }
        }
      })
    }
  }

  const client = data.list.client
  const tickets = data.list.tickets

  if (loading) return <Preloader/>

  return (
    <div className="client-event-activation-page">
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={client?.full_name}
        className="client-event-activation-page__header"
      />
      <div className="container">
        {client && (
          <ClientCard
            client={client}
            className="client-event-activation-page__client"
          />
        )}
      </div>

      <div className="container">
        <InfiniteScroll next={fetchNext} hasMore={hasMore} loader={<Preloader/>} dataLength={tickets.length}>
          {tickets.map(ticket => {
            const id = ticket.id
            return (
              <EventActivationCard
                data={ticket}
                onActivate={handleTicketActivation}
                onActiveButtonClick={() => setLayer({isOpen: true, state: ticket})}
                isSubmitting={activatingTickets.includes(id)}
                isPlayingAnimation={animatingTickets.includes(id)}
                className="client-event-activation-page__ticket"
                key={id}
              />
            )
          })}
        </InfiniteScroll>
      </div>

      <Layer
        isOpen={layer.isOpen}
        noTransition
      >
        {layer.isOpen && (
          <ActivatedTicketView
            transactionID={layer.state.id}
            title={layer.state?.item?.name}
            onOk={() => setLayer({isOpen: false})}
          />
        )}
      </Layer>
    </div>
  );
};

export default ClientEventActivationPage;