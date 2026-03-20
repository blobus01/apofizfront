import React from 'react';
import EventDetailStatisticsModule from "../../containers/EventDetailStatisticsModule";
import {canGoBack} from "../../common/helpers";

const EventDetailStatisticsPage = ({match, history}) => {
  const {id, orgID} = match.params
  const goBack = () => canGoBack(history) ?
    history.goBack() : history.push(`/organizations/${orgID}/events/statistics`)

  return (
    <EventDetailStatisticsModule
      id={id}
      orgID={orgID}
      onBack={goBack}
    />
  );
};

export default EventDetailStatisticsPage;