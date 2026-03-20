import React, {useState} from 'react';
import {translate} from "../../../../locales/locales";
import TimeIntervalSelect from "../../../../components/TimeIntervalSelect";
import {notifyQueryResult} from "../../../../common/helpers";
import {getClients} from "../../../../store/services/eventServices";
import Preloader from "../../../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import ClientActivationRowCard from "../../components/ClientActivationRowCard";
import useInfiniteScrollQuery from "../../../../hooks/useInfiniteScrollQuery";
import {useHistory} from "react-router-dom";

const Event = ({eventID, search}) => {
  const history = useHistory()

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const fetchClients = async (params) => {
    return notifyQueryResult(getClients(eventID, params))
  }

  const {data: clients, hasMore, next} = useInfiniteScrollQuery(
    ({params}) => fetchClients({
      ...params,
      search,
      start,
      end,
    }),
    [eventID, search, start, end],
  )

  return (
    <div className="event-detail-statistics-module__event-view">
      <div className="event-detail-statistics-module__top-container container">
        <p className="event-detail-statistics-module__time-select-label f-14 f-500">
          {translate('Выбор даты', 'app.dateSelection')}:
        </p>
        <TimeIntervalSelect
          start={start}
          end={end}
          onChange={({start, end}) => {
            setStart(start)
            setEnd(end)
          }}
        />
      </div>
      <InfiniteScroll
        next={next}
        hasMore={hasMore}
        dataLength={clients.length}
        loader={<Preloader/>}
        className="container"
      >
        {clients.map(client => {
          return (
            <ClientActivationRowCard
              key={client.id}
              client={client}
              onActivate={() => history.push(`/clients/${client.client.id}/event-activation/${eventID}`)}
              isActive={client.is_active}
              className="event-detail-statistics-module__event-view-client"
            />
          )
        })}
      </InfiniteScroll>
    </div>
  );
};

export default Event;