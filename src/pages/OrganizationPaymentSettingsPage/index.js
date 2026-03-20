import React from 'react';
import OrganizationPaymentSettings from "../../containers/OrganizationPaymentSettings";

const OrganizationPaymentSettingsPage = ({match}) => {
  const {id} = match.params
  return (
    <OrganizationPaymentSettings orgID={id}/>
  );
};

export default OrganizationPaymentSettingsPage;