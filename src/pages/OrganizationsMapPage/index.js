import React from 'react';
import OrganizationsMapModule from "../../containers/OrganizationsMapModule";

const OrganizationsMapPage = ({history, match}) => {
  const {serviceID} = match.params
  return <OrganizationsMapModule
    serviceID={serviceID}
    onBack={() => history.goBack()}
  />
};



export default OrganizationsMapPage;