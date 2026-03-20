import React from 'react';
import qs from "qs";
import EventSettings from "../../containers/EventSettings";
import {canGoBack} from "../../common/helpers";

const EventSettingsPage = ({history, location, match}) => {
  const {orgID, id} = match.params
  const {after_creation} = qs.parse(location.search.replace('?', ''))
  return (
    <EventSettings
      eventID={id}
      showIntroView={!!after_creation}
      onBack={() => canGoBack(history) ? history.goBack() : history.push(`/organizations/${orgID}/events/${id}/edit`)}
    />
  );
};

export default EventSettingsPage;