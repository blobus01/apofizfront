import React, { useCallback, useEffect, useState } from "react";
import { notifyQueryResult } from "../../../../common/helpers";
import {
  checkUserOfEvent,
  getOrganizationEvents,
} from "../../../../store/services/eventServices";
import { DEFAULT_LIMIT, QR_PREFIX } from "../../../../common/constants";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../../components/Preloader";
import { useDispatch } from "react-redux";
import { setViews } from "../../../../store/actions/commonActions";
import { VIEW_TYPES } from "../../../../components/GlobalLayer";
import Notify from "../../../../components/Notification";
import { translate } from "../../../../locales/locales";
import { WIDE_BUTTON_VARIANTS } from "../../../../components/UI/WideButton";
import { useHistory } from "react-router-dom";
import EventPostRowCard from "../../../../components/Cards/EventPostRowCard";

const Events = ({ orgID, search }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [events, setEvents] = useState({
    total_pages: 0,
    total_count: 0,
    list: [],
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const getEvents = useCallback(
    async (params) => {
      return notifyQueryResult(
        getOrganizationEvents({
          ...params,
          limit: DEFAULT_LIMIT,
          organization: orgID,
        })
      );
    },
    [orgID]
  );

  const getNextEvents = async () => {
    const res = await getEvents({
      page: page + 1,
      search,
    });
    if (res && res.success) {
      setEvents((prevState) => ({
        ...res.data,
        list: prevState.list.concat(res.data.list),
      }));
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleUserSubmit = async (userID, event) => {
    if (userID) {
      const payload = {
        client: Number(userID.replace(QR_PREFIX, "")),
        item: event.id,
      };
      const res = await notifyQueryResult(checkUserOfEvent(payload));

      if (res && res.success) {
        if (res.data.has_transaction) {
          history.push(`/clients/${userID}/event-activation/${event.id}`);
          dispatch(setViews([]));
        } else {
          Notify.error({
            text: translate("Клиент не найден", "shop.clientNotFound"),
          });
        }
      }
    }
  };

  const handleClick = (event) => {
    const { permissions } = event.organization;
    const canOpenList =
      !!permissions &&
      permissions.can_check_attendance &&
      permissions.can_edit_organization &&
      permissions.can_edit_partner &&
      permissions.can_sale &&
      permissions.can_see_stats &&
      permissions.can_send_message;

    dispatch(
      setViews({
        type: VIEW_TYPES.qr_scan,
        onScanError: () => null,
        onScan: (userID) => handleUserSubmit(userID, event),
        onInputSubmit: (userID) => handleUserSubmit(userID, event),
        button: canOpenList
          ? {
              variant: WIDE_BUTTON_VARIANTS.ACCEPT,
              children: translate("Открыть список", "events.openList"),
              onClick: () => {
                dispatch(setViews([]));
                history.push(
                  `/organizations/${orgID}/events/${event.id}/statistics?title=${event.name}`
                );
              },
            }
          : null,
      })
    );
  };

  useEffect(() => {
    setEvents({
      total_pages: 0,
      total_count: 0,
      list: [],
    });
    setLoading(true);
    getEvents({ page: 1, search })
      .then((res) => res && res.success && setEvents(res.data))
      .finally(() => {
        setPage(1);
        setLoading(false);
      });
  }, [getEvents, search]);

  return (
    <InfiniteScroll
      next={getNextEvents}
      hasMore={events.list.length !== events.total_count}
      dataLength={events.list.length}
      loader={<Preloader />}
      className="container"
    >
      {loading && <Preloader />}
      {events.list.map((event) => {
        return (
          <EventPostRowCard
            event={event}
            onClick={(e) => {
              e.preventDefault();
              handleClick(event);
            }}
            style={{
              marginBottom: 20,
            }}
            key={event.id}
          />
        );
      })}
    </InfiniteScroll>
  );
};

export default Events;
