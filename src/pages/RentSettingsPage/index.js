import React from 'react';
import RentSettings from "../../containers/RentSettings";

const RentSettingsPage = ({match, history}) => {
  return (
    <div>
      <RentSettings
        rentID={match.params.id}
        onBack={() => history.push(`/organizations/${match.params.orgID}`)}
        onSubmit={() => history.push(`/organizations/${match.params.orgID}`)}
        showInfo
      />
    </div>
  );
};

export default RentSettingsPage;